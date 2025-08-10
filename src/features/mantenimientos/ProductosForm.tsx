import { useEffect, useState } from "react";
import type { Producto, Categoria, Estilo, Material } from "../../types/index";
import { crearProducto, fetchProductos, uploadImage, actualizarProducto } from "../../api/productos";
import { PencilIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../services/supabase";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faBox, 
    faTag, 
    faPalette, 
    faRuler, 
    faDollarSign, 
    faWarehouse, 
    faImage, 
    faPercent, 
    faCubes, 
    faRulerCombined, 
    faCalculator, 
    faCheckCircle, 
    faLayerGroup, 
    faShieldAlt, 
    faPaintBrush,
    faHome,
    faBath,
    faPalette as faDecoracion,
    faUtensils,
    faSeedling,
    faStar,
    faGem
} from '@fortawesome/free-solid-svg-icons';

export default function ProductosForm() {
    const [selectedProductType, setSelectedProductType] = useState<string>("");
    const [formData, setFormData] = useState<Partial<Producto>>({
        nombre_producto: "",
        descripcion: "",
        precio: 0,
        stock_actual: 0,
        imagen: "",
        descuento: 0,
        metros_por_caja: 0,
        disponibilidad: true,
        formato: "",
        id_categoria: 0,
        id_estilo: 0,
        id_materiales: 0,
        piezas_por_caja: 0,
        superficie: '',
        durabilidad: 0,
        colorDom: ''
    });

    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [estilos, setEstilos] = useState<Estilo[]>([]);
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Tipos de productos disponibles
    const productTypes = [
        {
            id: "revestimientos",
            name: "Revestimientos",
            description: "Cerámica, porcelanato, gres, mosaicos y piedra natural",
            icon: faHome,
            color: "from-blue-500 to-indigo-500",
            bgColor: "from-blue-50 to-indigo-50",
            borderColor: "border-blue-200"
        },
        {
            id: "banos-cocina",
            name: "Baños y Cocina",
            description: "Sanitarios, lavamanos, grifería y accesorios",
            icon: faBath,
            color: "from-teal-500 to-cyan-500",
            bgColor: "from-teal-50 to-cyan-50",
            borderColor: "border-teal-200"
        },
        {
            id: "decoracion",
            name: "Decoración",
            description: "Jarrones, figuras, lámparas y elementos ornamentales",
            icon: faDecoracion,
            color: "from-purple-500 to-pink-500",
            bgColor: "from-purple-50 to-pink-50",
            borderColor: "border-purple-200"
        },
        {
            id: "vajillas",
            name: "Vajillas y Utensilios",
            description: "Platos, tazas, bandejas y accesorios para mesa",
            icon: faUtensils,
            color: "from-amber-500 to-orange-500",
            bgColor: "from-amber-50 to-orange-50",
            borderColor: "border-amber-200"
        },
        {
            id: "jardin",
            name: "Jardín y Exterior",
            description: "Macetas, jardineras y elementos para espacios exteriores",
            icon: faSeedling,
            color: "from-green-500 to-emerald-500",
            bgColor: "from-green-50 to-emerald-50",
            borderColor: "border-green-200"
        },
        {
            id: "estilos",
            name: "Artículos por Estilo",
            description: "Clásico, moderno, minimalista, rústico, vintage e industrial",
            icon: faStar,
            color: "from-yellow-500 to-amber-500",
            bgColor: "from-yellow-50 to-amber-50",
            borderColor: "border-yellow-200"
        },
        {
            id: "materiales",
            name: "Productos por Material",
            description: "Cerámica, porcelanato, gres, vidrio, piedra, madera, metal",
            icon: faGem,
            color: "from-gray-500 to-slate-500",
            bgColor: "from-gray-50 to-slate-50",
            borderColor: "border-gray-200"
        }
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [productosData, categoriasData, estilosData, materialesData] = await Promise.all([
                    fetchProductos(),
                    supabase.from("categorias").select("*"),
                    supabase.from("estilos").select("*"),
                    supabase.from("materiales").select("*")
                ]);

                setProductos(productosData);
                setCategorias(categoriasData.data || []);
                setEstilos(estilosData.data || []);
                setMateriales(materialesData.data || []);
            } catch (error) {
                console.error("❌ Error al cargar datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue = type === 'number' ? Number(value) : value;
        
        setFormData(prev => {
            const updatedData = {
                ...prev,
                [name]: newValue
            };

            // Calcular metros por caja solo para revestimientos cuando cambie piezas_por_caja o formato
            if (selectedProductType === "revestimientos" && (name === 'piezas_por_caja' || name === 'formato')) {
                const piezas = name === 'piezas_por_caja' ? Number(newValue) : prev.piezas_por_caja;
                const formato = name === 'formato' ? newValue : prev.formato;
                
                if (piezas && formato && typeof formato === 'string') {
                    // Convertir el formato (ej: "30x30") a dimensiones en metros
                    const [largo, ancho] = formato.split('x').map(Number);
                    if (!isNaN(largo) && !isNaN(ancho)) {
                        const metrosPorPieza = (largo * ancho) / 10000; // Convertir cm² a m²
                        updatedData.metros_por_caja = Number((metrosPorPieza * piezas).toFixed(2));
                    }
                }
            }

            console.log(formData)
            return updatedData;
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);

            const imageUrl = await uploadImage(file);
            setFormData(prev => ({
                ...prev,
                imagen: imageUrl
            }));
        } catch (error) {
            console.error("Error al subir la imagen:", error);
            alert("Error al subir la imagen. Por favor, intente nuevamente.");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (isEditing && formData.id_producto) {
                await actualizarProducto(formData as Producto);
                alert("Producto actualizado exitosamente");
            } else {
                await crearProducto(formData as Producto);
                alert("Producto registrado exitosamente");
            }
            const data = await fetchProductos();
            setProductos(data);
            resetForm();
        } catch (err) {
            alert(isEditing ? "Error al actualizar el producto." : "Error en el registro del producto.");
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            nombre_producto: "",
            descripcion: "",
            precio: 0,
            stock_actual: 0,
            imagen: "",
            descuento: 0,
            metros_por_caja: 0,
            disponibilidad: true,
            formato: "",
            id_categoria: 0,
            id_estilo: 0,
            id_materiales: 0,
            piezas_por_caja: 0,
            superficie: "",
            durabilidad: 0,
            colorDom: ''
        });
        setImagePreview(null);
        setIsEditing(false);
        setSelectedProductType("");
    };

    const handleEdit = (producto: Producto) => {
        setFormData(producto);
        setImagePreview(producto.imagen || null);
        setIsEditing(true);
        
        // Determinar el tipo de producto basado en la categoría
        const categoria = categorias.find(cat => cat.id_categoria === producto.id_categoria);
        if (categoria) {
            const categoriaName = categoria.nombre_categoria.toLowerCase();
            if (categoriaName.includes('revestimiento') || categoriaName.includes('cerámica') || categoriaName.includes('porcelanato')) {
                setSelectedProductType('revestimientos');
            } else if (categoriaName.includes('baño') || categoriaName.includes('cocina') || categoriaName.includes('sanitario')) {
                setSelectedProductType('banos-cocina');
            } else if (categoriaName.includes('decoración') || categoriaName.includes('decorativo')) {
                setSelectedProductType('decoracion');
            } else if (categoriaName.includes('vajilla') || categoriaName.includes('utensilio')) {
                setSelectedProductType('vajillas');
            } else if (categoriaName.includes('jardín') || categoriaName.includes('exterior')) {
                setSelectedProductType('jardin');
            } else if (categoriaName.includes('estilo')) {
                setSelectedProductType('estilos');
            } else if (categoriaName.includes('material')) {
                setSelectedProductType('materiales');
            }
        }
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faBox} className="mr-3 text-amber-500" />
                        {isEditing ? "Editar Producto" : "Nuevo Producto"}
                    </h2>
                    
                    {/* Selector de tipo de producto */}
                    {!selectedProductType && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center">
                                ¿Qué tipo de producto deseas agregar?
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {productTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setSelectedProductType(type.id)}
                                        className={`p-6 rounded-xl border-2 border-dashed hover:border-solid transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg ${type.borderColor} ${type.bgColor} hover:bg-white`}
                                    >
                                        <div className="text-center">
                                            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${type.color} text-white mb-4`}>
                                                <FontAwesomeIcon icon={type.icon} className="text-2xl" />
                                            </div>
                                            <h4 className="font-bold text-lg text-gray-800 mb-2">{type.name}</h4>
                                            <p className="text-sm text-gray-600">{type.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Botón para cambiar tipo de producto */}
                    {selectedProductType && (
                        <div className="mb-6">
                            <button
                                type="button"
                                onClick={() => setSelectedProductType("")}
                                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <FontAwesomeIcon icon={faBox} className="mr-2" />
                                Cambiar tipo de producto
                            </button>
                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                    <strong>Tipo seleccionado:</strong> {productTypes.find(t => t.id === selectedProductType)?.name}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Formulario del producto */}
                    {selectedProductType && (
                        <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Información básica */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200">
                            <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faTag} className="mr-2" />
                                Información Básica
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faBox} className="mr-2 text-amber-500" />
                                        Nombre del Producto
                                    </label>
                                    <input
                                        type="text"
                                        name="nombre_producto"
                                        value={formData.nombre_producto}
                                        onChange={handleChange}
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                                        placeholder="Ingrese el nombre del producto"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-amber-500" />
                                            Categoría
                                        </label>
                                        <select
                                            name="id_categoria"
                                            value={formData.id_categoria}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                                        >
                                            <option value={0}>Seleccionar categoría</option>
                                            {categorias.map((categoria) => (
                                                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                                    {categoria.nombre_categoria}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FontAwesomeIcon icon={faPalette} className="mr-2 text-amber-500" />
                                            Estilo
                                        </label>
                                        <select
                                            name="id_estilo"
                                            value={formData.id_estilo}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                                        >
                                            <option value={0}>Seleccionar estilo</option>
                                            {estilos.map((estilo) => (
                                                <option key={estilo.id_estilo} value={estilo.id_estilo}>
                                                    {estilo.nombre_estilo}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FontAwesomeIcon icon={faRuler} className="mr-2 text-amber-500" />
                                            Material
                                        </label>
                                        <select
                                            name="id_materiales"
                                            value={formData.id_materiales}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                                        >
                                            <option value={0}>Seleccionar material</option>
                                            {materiales.map((material) => (
                                                <option key={material.id_materiales} value={material.id_materiales}>
                                                    {material.nombre_materiales}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faTag} className="mr-2 text-amber-500" />
                                        Descripción
                                    </label>
                                    <textarea
                                        name="descripcion"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                                        placeholder="Describe las características del producto..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Precios y Stock */}
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faDollarSign} className="mr-2" />
                                Precios y Stock
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faDollarSign} className="mr-2 text-green-500" />
                                        Precio (RD$)
                                    </label>
                                    <input
                                        type="number"
                                        name="precio"
                                        value={formData.precio}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <FontAwesomeIcon icon={faWarehouse} className="mr-2 text-green-500" />
                                        Stock Actual
                                    </label>
                                    <input
                                        type="number"
                                        name="stock_actual"
                                        value={formData.stock_actual}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 hover:border-green-300"
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Imagen */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                                <FontAwesomeIcon icon={faImage} className="mr-2" />
                                Imagen del Producto
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            disabled={uploading}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-blue-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                    </div>
                                    {uploading && (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                    )}
                                </div>
                                {imagePreview && (
                                    <div className="mt-4">
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            className="h-40 w-40 object-cover rounded-lg shadow-md border-2 border-blue-200"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Especificaciones técnicas - Solo para revestimientos */}
                        {selectedProductType === "revestimientos" && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faRulerCombined} className="mr-2" />
                                    Especificaciones Técnicas (Revestimientos)
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faPercent} className="mr-2 text-purple-500" />
                                                Descuento (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="descuento"
                                                value={formData.descuento}
                                                onChange={handleChange}
                                                min="0"
                                                max="100"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faCubes} className="mr-2 text-purple-500" />
                                                Piezas por Caja
                                            </label>
                                            <input
                                                type="number"
                                                name="piezas_por_caja"
                                                value={formData.piezas_por_caja}
                                                onChange={handleChange}
                                                required
                                                min="1"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faRulerCombined} className="mr-2 text-purple-500" />
                                                Formato (cm)
                                            </label>
                                            <input
                                                type="text"
                                                name="formato"
                                                value={formData.formato}
                                                onChange={handleChange}
                                                required
                                                placeholder="Ej: 30x30"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                                            />
                                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                                                <FontAwesomeIcon icon={faRuler} className="mr-1" />
                                                Ingrese el formato en centímetros (ej: 30x30)
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faCalculator} className="mr-2 text-purple-500" />
                                                Metros por Caja
                                            </label>
                                            <input
                                                type="number"
                                                name="metros_por_caja"
                                                value={formData.metros_por_caja}
                                                onChange={handleChange}
                                                required
                                                min="0"
                                                step="0.01"
                                                readOnly
                                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                                            />
                                            <p className="text-xs text-gray-500 mt-2 flex items-center">
                                                <FontAwesomeIcon icon={faCalculator} className="mr-1" />
                                                Calculado automáticamente según el formato y piezas por caja
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Especificaciones para otros tipos de productos */}
                        {selectedProductType !== "revestimientos" && (
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faRulerCombined} className="mr-2" />
                                    Especificaciones Adicionales
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faPercent} className="mr-2 text-purple-500" />
                                                Descuento (%)
                                            </label>
                                            <input
                                                type="number"
                                                name="descuento"
                                                value={formData.descuento}
                                                onChange={handleChange}
                                                min="0"
                                                max="100"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faCubes} className="mr-2 text-purple-500" />
                                                Cantidad por Unidad
                                            </label>
                                            <input
                                                type="number"
                                                name="piezas_por_caja"
                                                value={formData.piezas_por_caja}
                                                onChange={handleChange}
                                                min="1"
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                                                placeholder="1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FontAwesomeIcon icon={faRulerCombined} className="mr-2 text-purple-500" />
                                            Dimensiones o Especificaciones
                                        </label>
                                        <input
                                            type="text"
                                            name="formato"
                                            value={formData.formato}
                                            onChange={handleChange}
                                            placeholder="Ej: Diámetro 30cm, Altura 25cm, etc."
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300"
                                        />
                                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                                            <FontAwesomeIcon icon={faRuler} className="mr-1" />
                                            Ingrese las dimensiones o especificaciones del producto
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Características adicionales - Solo para revestimientos */}
                        {selectedProductType === "revestimientos" && (
                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                                    Características Técnicas (Revestimientos)
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-teal-500" />
                                                Disponibilidad
                                            </label>
                                            <select
                                                name="disponibilidad"
                                                value={formData.disponibilidad ? "true" : "false"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, disponibilidad: e.target.value === "true" }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-300"
                                            >
                                                <option value="true">Disponible</option>
                                                <option value="false">No Disponible</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faLayerGroup} className="mr-2 text-teal-500" />
                                                Superficie
                                            </label>
                                                                                    <select
                                            name="superficie"
                                            value={formData.superficie}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-300"
                                        >
                                                <option value="">Seleccionar Superficie</option>
                                                <option value="Mate">Mate</option>
                                                <option value="Brillante">Brillante</option>
                                                <option value="Semi-brillante">Semi-brillante</option>
                                                <option value="Texturizada">Texturizada</option>
                                                <option value="Lisa">Lisa</option>
                                                <option value="Rústica">Rústica</option>
                                                <option value="Pulida">Pulida</option>
                                                <option value="Antideslizante">Antideslizante</option>
                                                <option value="Decorativa">Decorativa</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-teal-500" />
                                                Durabilidad (PEI)
                                            </label>
                                            <select
                                                name="durabilidad"
                                                value={formData.durabilidad}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-300"
                                            >
                                                <option value={0}>Seleccionar Durabilidad</option>
                                                <option value={1}>Baja - PEI 1</option>
                                                <option value={2}>Ligera - PEI 2</option>
                                                <option value={3}>Moderada - PEI 3</option>
                                                <option value={4}>Alta - PEI 4</option>
                                                <option value={5}>Muy Alta - PEI 5</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faPaintBrush} className="mr-2 text-teal-500" />
                                                Color Dominante
                                            </label>
                                            <select
                                                name="colorDom"
                                                value={formData.colorDom}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-300"
                                            >
                                                <option value="">Seleccionar Color</option>
                                                <option value="Blanco">Blanco</option>
                                                <option value="Negro">Negro</option>
                                                <option value="Gris">Gris</option>
                                                <option value="Beige">Beige</option>
                                                <option value="Marrón">Marrón</option>
                                                <option value="Rojo">Rojo</option>
                                                <option value="Azul">Azul</option>
                                                <option value="Verde">Verde</option>
                                                <option value="Amarillo">Amarillo</option>
                                                <option value="Naranja">Naranja</option>
                                                <option value="Púrpura">Púrpura</option>
                                                <option value="Rosa">Rosa</option>
                                                <option value="Multicolor">Multicolor</option>
                                                <option value="Natural">Natural</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Características básicas para otros tipos de productos */}
                        {selectedProductType !== "revestimientos" && (
                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
                                <h3 className="text-lg font-semibold text-teal-800 mb-4 flex items-center">
                                    <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
                                    Características Básicas
                                </h3>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-teal-500" />
                                                Disponibilidad
                                            </label>
                                            <select
                                                name="disponibilidad"
                                                value={formData.disponibilidad ? "true" : "false"}
                                                onChange={(e) => setFormData(prev => ({ ...prev, disponibilidad: e.target.value === "true" }))}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-300"
                                            >
                                                <option value="true">Disponible</option>
                                                <option value="false">No Disponible</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                                <FontAwesomeIcon icon={faPaintBrush} className="mr-2 text-teal-500" />
                                                Color Dominante
                                            </label>
                                            <select
                                                name="colorDom"
                                                value={formData.colorDom}
                                                onChange={handleChange}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 hover:border-teal-300"
                                            >
                                                <option value="">Seleccionar Color</option>
                                                <option value="Blanco">Blanco</option>
                                                <option value="Negro">Negro</option>
                                                <option value="Gris">Gris</option>
                                                <option value="Beige">Beige</option>
                                                <option value="Marrón">Marrón</option>
                                                <option value="Rojo">Rojo</option>
                                                <option value="Azul">Azul</option>
                                                <option value="Verde">Verde</option>
                                                <option value="Amarillo">Amarillo</option>
                                                <option value="Naranja">Naranja</option>
                                                <option value="Púrpura">Púrpura</option>
                                                <option value="Rosa">Rosa</option>
                                                <option value="Multicolor">Multicolor</option>
                                                <option value="Natural">Natural</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Botones del formulario */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                {isEditing ? "Actualizar Producto" : "Guardar Producto"}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gradient-to-r from-gray-400 to-gray-500 text-white py-4 px-6 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                                >
                                    Cancelar Edición
                                </button>
                            )}
                        </div>
                    </form>
                    )}
                </div>

                {/* Lista de Productos */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800 flex items-center">
                        <FontAwesomeIcon icon={faBox} className="mr-3 text-amber-500" />
                        Productos Registrados
                    </h2>
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Cargando productos...</p>
                        </div>
                    ) : productos.length === 0 ? (
                        <div className="text-center py-12">
                            <FontAwesomeIcon icon={faBox} className="text-6xl text-gray-300 mb-4" />
                            <p className="text-gray-500 text-lg">No hay productos registrados</p>
                            <p className="text-gray-400 text-sm mt-2">Comienza agregando tu primer producto</p>
                        </div>
                    ) : (
                        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                            <div className="space-y-6">
                                {productos.map((producto) => (
                                    <div key={producto.id_producto} className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-6">
                                                    {producto.imagen && (
                                                        <div className="relative">
                                                            <img
                                                                src={producto.imagen}
                                                                alt={producto.nombre_producto}
                                                                className="w-24 h-24 object-cover rounded-xl shadow-md border-2 border-gray-100"
                                                            />
                                                            <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                                                ${producto.precio}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <h3 className="font-bold text-xl text-gray-800">{producto.nombre_producto}</h3>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                                producto.disponibilidad 
                                                                    ? "bg-green-100 text-green-800 border border-green-200" 
                                                                    : "bg-red-100 text-red-800 border border-red-200"
                                                            }`}>
                                                                <FontAwesomeIcon 
                                                                    icon={producto.disponibilidad ? faCheckCircle : faCheckCircle} 
                                                                    className={`mr-1 ${producto.disponibilidad ? 'text-green-600' : 'text-red-600'}`} 
                                                                />
                                                                {producto.disponibilidad ? "Disponible" : "No Disponible"}
                                                            </span>
                                                        </div>
                                                        
                                                        <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">{producto.descripcion}</p>
                                                        
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                            <div className="text-center">
                                                                <div className="text-2xl font-bold text-amber-600">{producto.stock_actual}</div>
                                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Stock</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-lg font-semibold text-gray-700">{producto.formato}</div>
                                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Formato</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-lg font-semibold text-gray-700">{producto.piezas_por_caja}</div>
                                                                <div className="text-xs text-gray-500 uppercase tracking-wide">Piezas/Caja</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-lg font-semibold text-gray-700">{producto.metros_por_caja}m²</div>
                                                                <div className="text-xs text-gray-500 uppercase tracking-wide">m²/Caja</div>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full border border-amber-200">
                                                                <FontAwesomeIcon icon={faRulerCombined} className="mr-1" />
                                                                {producto.formato}
                                                            </span>
                                                            {producto.superficie && (
                                                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full border border-blue-200">
                                                                    <FontAwesomeIcon icon={faLayerGroup} className="mr-1" />
                                                                    {producto.superficie}
                                                                </span>
                                                            )}
                                                            {producto.durabilidad > 0 && (
                                                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-purple-800 bg-purple-100 rounded-full border border-purple-200">
                                                                    <FontAwesomeIcon icon={faShieldAlt} className="mr-1" />
                                                                    PEI {producto.durabilidad}
                                                                </span>
                                                            )}
                                                            {producto.colorDom && (
                                                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-100 rounded-full border border-teal-200">
                                                                    <FontAwesomeIcon icon={faPaintBrush} className="mr-1" />
                                                                    {producto.colorDom}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleEdit(producto)} 
                                                className="ml-6 p-3 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all duration-200 border border-transparent hover:border-amber-200"
                                                title="Editar producto"
                                            >
                                                <PencilIcon className="w-6 h-6" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}