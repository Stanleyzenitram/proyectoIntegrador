import { useEffect, useState } from "react";
import type { Producto, Categoria, Estilo, Material } from "../../types/index";
import { crearProducto, fetchProductos, uploadImage, actualizarProducto } from "../../api/productos";
import { PencilIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../services/supabase";

export default function ProductosForm() {
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

            // Calcular metros por caja cuando cambie piezas_por_caja o formato
            if (name === 'piezas_por_caja' || name === 'formato') {
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
    };

    const handleEdit = (producto: Producto) => {
        setFormData(producto);
        setImagePreview(producto.imagen || null);
        setIsEditing(true);
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        {isEditing ? "Editar Producto" : "Registrar Producto"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Producto</label>
                            <input
                                type="text"
                                name="nombre_producto"
                                value={formData.nombre_producto}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    name="id_categoria"
                                    value={formData.id_categoria}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estilo</label>
                                <select
                                    name="id_estilo"
                                    value={formData.id_estilo}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                                <select
                                    name="id_materiales"
                                    value={formData.id_materiales}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                            <textarea
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                                <input
                                    type="number"
                                    name="precio"
                                    value={formData.precio}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual</label>
                                <input
                                    type="number"
                                    name="stock_actual"
                                    value={formData.stock_actual}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Producto</label>
                            <div className="mt-1 flex items-center space-x-4">
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        disabled={uploading}
                                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                    />
                                </div>
                                {uploading && (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-amber-500"></div>
                                )}
                            </div>
                            {imagePreview && (
                                <div className="mt-2">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="h-32 w-32 object-cover rounded-lg"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Descuento (%)</label>
                                <input
                                    type="number"
                                    name="descuento"
                                    value={formData.descuento}
                                    onChange={handleChange}
                                    min="0"
                                    max="100"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Piezas por Caja</label>
                                <input
                                    type="number"
                                    name="piezas_por_caja"
                                    value={formData.piezas_por_caja}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                                <input
                                    type="text"
                                    name="formato"
                                    value={formData.formato}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej: 30x30"
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Ingrese el formato en centímetros (ej: 30x30)</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Metros por Caja</label>
                            <input
                                type="number"
                                name="metros_por_caja"
                                value={formData.metros_por_caja}
                                onChange={handleChange}
                                required
                                min="0"
                                step="0.01"
                                readOnly
                                className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Calculado automáticamente según el formato y piezas por caja</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</label>
                            <select
                                name="disponibilidad"
                                value={formData.disponibilidad ? "true" : "false"}
                                onChange={(e) => setFormData(prev => ({ ...prev, disponibilidad: e.target.value === "true" }))}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value="true">Disponible</option>
                                <option value="false">No Disponible</option>
                            </select>
                        </div>
                            {/* Superficie */}
                            <select
                                name="superficie"
                                value={formData.superficie}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value="">Seleccionar Superficie</option>
                                <option value="Planas">Planas</option>
                                <option value="Texturizadas">Texturizadas</option>
                                <option value="Esmaltadas">Esmaltadas</option>
                                <option value="No Esmaltadas">No Esmaltadas</option>
                            </select>
                            {/* Durabilidad */}
                            <select
                                name="durabilidad"
                                value={formData.durabilidad}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value={0}>Seleccionar Durabilidad</option>
                                <option value={1}>Baja - PEI 1</option>
                                <option value={2}>Ligera - PEI 2</option>
                                <option value={3}>Moderada - PEI 3</option>
                                <option value={4}>Alta - PEI 4</option>
                                <option value={5}>Muy Alta - PEI 5</option>
                            </select>
                            {/*Color Dom  */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Color dominante</label>
                                <input
                                    type="text"
                                    name="colorDom"
                                    value={formData.colorDom}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>



                            {/* Boton form */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="flex-1 bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
                            >
                                {isEditing ? "Actualizar" : "Guardar"}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Lista de Productos */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Productos Registrados</h2>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                        </div>
                    ) : productos.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay productos registrados</p>
                    ) : (
                        <div className="max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
                            <div className="space-y-4">
                                {productos.map((producto) => (
                                    <div key={producto.id_producto} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4">
                                                    {producto.imagen && (
                                                        <img
                                                            src={producto.imagen}
                                                            alt={producto.nombre_producto}
                                                            className="w-20 h-20 object-cover rounded-lg"
                                                        />
                                                    )}
                                                    <div>
                                                        <h3 className="font-semibold text-lg text-gray-800">{producto.nombre_producto}</h3>
                                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{producto.descripcion}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            <span className="text-sm font-medium text-amber-600">${producto.precio}</span>
                                                            <span className="text-sm text-gray-500">Stock: {producto.stock_actual}</span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">
                                                                {producto.formato}
                                                            </span>
                                                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                                                producto.disponibilidad 
                                                                    ? "text-green-800 bg-green-100" 
                                                                    : "text-red-800 bg-red-100"
                                                            }`}>
                                                                {producto.disponibilidad ? "Disponible" : "No Disponible"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleEdit(producto)} 
                                                className="text-amber-500 hover:text-amber-600 transition-colors duration-200 ml-4"
                                            >
                                                <PencilIcon className="w-5 h-5" />
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