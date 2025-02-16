    import { useState, useEffect } from "react";
    import { supabase } from "../../services/supabase";
    import { PencilIcon } from "@heroicons/react/24/solid";
    import { Categoria } from "../../types";
    import { Estilo } from "../../types";
    import { Material } from "../../types";

    interface Producto {
        id_producto?: number;
        nombre_producto: string; // NO SE PUEDE MOVER AL INDEX PORQUE SE LE FALTAN LOS ID DE LOS FORAIN KEY 
        id_categoria: number;
        id_estilo: number; 
        id_material: number; 
        descripcion: string;
        precio: number;
        stock_actual: number;
        descuento: number;
        estado: boolean;
        imagen?: string | null;
        categoria?: { nombre_categoria: string };
        estilo?: { nombre_estilo: string }; 
        material?: { nombre_materiales: string }; // Relación con la tabla de materiales
    }


    export default function ProductoForm() {
        const [formData, setFormData] = useState<Producto>({
            nombre_producto: "",
            id_categoria: 0,
            id_estilo: 0,
            id_material: 0,
            descripcion: "",
            precio: 0,
            stock_actual: 0,
            descuento: 0,
            estado: true,
            imagen: null,
        });
        const [productos, setProductos] = useState<Producto[]>([]);
        const [categorias, setCategorias] = useState<Categoria[]>([]);
        const [isEditing, setIsEditing] = useState(false);
        const [estilos, setEstilos] = useState<Estilo[]>([]);
        const [materiales, setMateriales] = useState<Material[]>([]);


        useEffect(() => {
            fetchProductos();
            fetchCategorias();
            fetchEstilos();
            fetchMateriales();
        }, []);
        
const fetchEstilos = async () => {
    const { data, error } = await supabase.from("estilos").select("*");
    if (error) {
        console.error("❌ Error obteniendo estilos:", error.message);
    } else {
        setEstilos(data || []);
    }
};

const fetchMateriales = async () => {
    const { data, error } = await supabase.from("materiales").select("*");
    if (error) {
        console.error("❌ Error obteniendo materiales:", error.message);
    } else {
        setMateriales(data || []);
    }
};

const fetchProductos = async () => {
    const { data, error } = await supabase
        .from("productos")
        .select(`
            *,
            categoria:categorias(nombre_categoria),
            estilo:estilos(nombre_estilo), 
            material:materiales(nombre_materiales)
        `);

    if (error) {
        console.error("❌ Error obteniendo productos:", error.message);
    } else {
        console.log("✅ Productos obtenidos:", data); // Verifica si llegan los datos correctos
        setProductos(data || []);
    }
};


        const fetchCategorias = async () => {
            const { data, error } = await supabase.from("categorias").select("*");

            if (error) {
                console.error("❌ Error obteniendo categorías:", error.message);
            } else {
                setCategorias(data || []);
            }
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setFormData({
                ...formData,
                [name]: name === "id_categoria" ? parseInt(value) : value,
            });
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0] || null;
            if (file) {
                setFormData({ ...formData, imagen: file.name });
                uploadImage(file);
            }
        };
        const uploadImage = async (file: File) => {
            const fileExt = file.name.split(".").pop(); // Obtener extensión
            const fileName = `${Date.now()}.${fileExt}`; // Generar nombre único
            const filePath = `productos/${fileName}`; // Ruta dentro de Supabase
        
            try {
                console.log("📤 Subiendo imagen a:", filePath);
        
                // Subir la imagen a Supabase Storage
                const { data, error } = await supabase.storage
                    .from("imagenes") // Asegúrate de que "imagenes" es el bucket correcto
                    .upload(filePath, file, { cacheControl: "3600", upsert: false });
        
                if (error) {
                    console.error("❌ Error subiendo imagen:", error.message);
                    alert("Error al subir la imagen: " + error.message);
                    return;
                }
        
                if (!data) {
                    console.error("❌ No se recibió respuesta de Supabase Storage.");
                    alert("Error inesperado al subir la imagen.");
                    return;
                }
        
                console.log("✅ Imagen subida con éxito:", data.path);
        
                // Obtener la URL pública del archivo cargado
                const { data: publicUrlData } = supabase.storage.from("imagenes").getPublicUrl(filePath);
        
                if (publicUrlData?.publicUrl) {
                    console.log("🔗 URL pública obtenida:", publicUrlData.publicUrl);
                    setFormData((prev) => ({ ...prev, imagen: publicUrlData.publicUrl }));
                } else {
                    console.error("❌ No se pudo obtener la URL pública de la imagen.");
                    alert("No se pudo obtener la URL de la imagen.");
                }
            } catch (err) {
                console.error("❌ Error en la carga de la imagen:", err);
                alert("Hubo un problema al subir la imagen.");
            }
        };
        
        
        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            // Validación de los valores
            if (!formData.nombre_producto || !formData.descripcion || formData.precio <= 0 || formData.precio > 999999 || formData.stock_actual < 0 || formData.stock_actual > 100000 || formData.id_categoria === 0) {
                alert("Por favor, complete todos los campos obligatorios correctamente.");
                return;
            }

            try {
                if (isEditing && formData.id_producto) {
                    const { error } = await supabase
                    .from("productos")
                    .update({
                        nombre_producto: formData.nombre_producto,
                        id_categoria: formData.id_categoria,
                        id_estilo: formData.id_estilo, // Agregar id_estilo
                        id_material: formData.id_material, // Agregar id_material
                        descripcion: formData.descripcion,
                        precio: formData.precio,
                        stock_actual: formData.stock_actual,
                        descuento: formData.descuento,
                        estado: formData.estado,
                        imagen: formData.imagen,
                    })
                    .eq("id_producto", formData.id_producto);
                

                    if (error) {
                        console.error("❌ Error actualizando producto:", error.message);
                        alert(`Error actualizando producto: ${error.message}`);
                    } else {
                        alert("Producto actualizado correctamente");
                        setIsEditing(false);
                        fetchProductos();
                    }
                } else {
                    const { data, error } = await supabase.from("productos").insert([{
                        nombre_producto: formData.nombre_producto,
                        id_categoria: formData.id_categoria,
                        id_estilo: formData.id_estilo, // Agregar id_estilo
                        id_material: formData.id_material, // Agregar id_material
                        descripcion: formData.descripcion,
                        precio: formData.precio,
                        stock_actual: formData.stock_actual,
                        descuento: formData.descuento,
                        estado: formData.estado,
                        imagen: formData.imagen,
                    }]);
                    
                    if (error) {
                        console.error("Error insertando producto:", error.message);
                        alert(`Error insertando producto: ${error.message}`);
                    } else {
                        alert("Producto insertado correctamente");
                        fetchProductos();
                    }
                }
            } catch (err) {
                console.error("❌Error en la solicitud:", err);
                alert(`Error en la solicitud: ${err}`);
            }

            // Reset the form data
            setFormData({
                nombre_producto: "",
                id_categoria: 0,
                id_estilo: 0,
                id_material: 0,
                descripcion: "",
                precio: 0,
                stock_actual: 0,
                descuento: 0,
                estado: true,
                imagen: "",
            });
        };

        const handleEdit = (producto: Producto) => {
            setFormData(producto);
            setIsEditing(true);
        };

        return (
            <div className="flex space-x-4 p-4">
                {/* Formulario */}
                <div className="w-1/2 p-4 border rounded-lg shadow-lg overflow-y: scroll;">
                    <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Producto" : "Registrar Producto"}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="nombre_producto" 
                            placeholder="Nombre"
                            value={formData.nombre_producto} 
                            onChange={handleChange}
                            required
                            className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                        />
                        <select
                            name="id_categoria"
                            value={formData.id_categoria}
                            onChange={handleChange}
                            className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                            required
                        >
                            <option value={0} disabled>Seleccionar categoría</option>
                            {categorias.map((categoria) => (
                                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                                    {categoria.nombre_categoria}
                                </option>
                            ))}
                        </select>
                        <select
    name="id_estilo"
    value={formData.id_estilo}
    onChange={handleChange}
    className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
    required
>
    <option value={0} disabled>Seleccionar estilo</option>
    {estilos.map((estilo) => (
        <option key={estilo.id_estilo} value={estilo.id_estilo}>
            {estilo.nombre_estilo}
        </option>
    ))}
</select>

<select
    name="id_material"
    value={formData.id_material}
    onChange={handleChange}
    className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
    required
>
    <option value={0} disabled>Seleccionar material</option>
    {materiales.map((material) => (
        <option key={material.id_materiales} value={material.id_materiales}>
            {material.nombre_materiales}
        </option>
    ))}
</select>

                        <textarea
                            name="descripcion"
                            placeholder="Descripción"
                            value={formData.descripcion}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                        />

                        <input
                            type="number"
                            name="precio"
                            placeholder="Precio"
                            value={formData.precio || ""}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                        />

                        <input
                            type="number"
                            name="stock_actual"
                            placeholder="Stock Actual"
                            value={formData.stock_actual || ""}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                        />

                        <input
                            type="number"
                            name="descuento"
                            placeholder="Descuento"
                            value={formData.descuento || ""}
                            onChange={handleChange}
                            className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                        />

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                        />

                        {/* Mostrar la imagen si ya está cargada */}
                        {formData.imagen && (
                <div className="my-2">
                    <img src={formData.imagen} alt="Imagen del producto" className="w-24 h-24 object-cover" />
                        </div>
    )}
                        

                        <button type="submit" className="bg-orange-500 text-white p-2 rounded w-full">
                            {isEditing ? "Actualizar" : "Guardar"}
                        </button>
                    </form>
                </div>

        
    <div className="w-1/2 p-4 border rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Productos Registrados</h2>
        <div className="max-h-96 overflow-y-auto"> 
            <ul>
                {productos.map((producto) => (
                    <li key={producto.id_producto} className="flex justify-between items-center p-2 border-b">
                        <div>
                            <p className="font-semibold">{producto.nombre_producto}</p>
                            <p className="text-sm text-gray-600">{producto.descripcion}</p>
                            <p className="text-xs text-gray-500">Categoría: {producto.categoria?.nombre_categoria || "N/A"}</p>
                            <p className="text-xs text-gray-500">Estilo: {producto.estilo?.nombre_estilo || "N/A"}</p>
                            <p className="text-xs text-gray-500">Material: {producto.material?.nombre_materiales || "N/A"}</p>

                            {producto.imagen && (
                                <img src={producto.imagen} alt={producto.nombre_producto} className="w-16 h-16 object-cover rounded" />
                            )}
                        </div>
                        <button onClick={() => handleEdit(producto)} className="text-blue-500">
                            <PencilIcon className="w-5 h-5" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    </div>
            </div>
        );
    }