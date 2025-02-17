import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { Estilo } from "../../types";
import { Categoria } from "../../types";
import { Material } from "../../types";

// cotrolaores ----------------------------------------------------------------------------------------------------------------
export default function GestionProductos() {
    
    const [formDataEstilo, setFormDataEstilo] = useState<Estilo>({ nombre_estilo: "", descripcion: "" });
    const [formDataMaterial, setFormDataMaterial] = useState<Material>({ nombre_materiales: "", uso_materiales: "" });
    const [formDataCategoria, setFormDataCategoria] = useState<Categoria>({ nombre_categoria: "", descripcion: "" });

    // Listas de datos
    const [estilos, setEstilos] = useState<Estilo[]>([]);
    const [materiales, setMateriales] = useState<Material[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    // Estados de edición
    const [isEditingEstilo, setIsEditingEstilo] = useState(false);
    const [isEditingMaterial, setIsEditingMaterial] = useState(false);
    const [isEditingCategoria, setIsEditingCategoria] = useState(false);

    useEffect(() => {
        fetchEstilos();
        fetchMateriales();
        fetchCategorias();
    }, []);

    // Fetch data para ----------------------------------------------------------------------------------------
    const fetchEstilos = async () => {
        const { data } = await supabase.from("estilos").select("*");
        console.log("Estilos cargados: ", data); // Depuración de los campos ---------------------------------------------
        setEstilos(data || []);
    };

    const fetchMateriales = async () => {
        const { data } = await supabase.from("materiales").select("*");
        console.log("Materiales cargados: ", data); 
        setMateriales(data || []);
    };

    const fetchCategorias = async () => {
        const { data } = await supabase.from("categorias").select("*");
        console.log("Categorías cargadas: ", data); // Depuración
        setCategorias(data || []);
    };

    // Función para manejar cambios en formularios
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, setState: any) => {
        setState((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // Función genérica para manejar el submit
    const handleSubmit = async (
        e: React.FormEvent<HTMLFormElement>,
        table: string,
        formData: any,
        setFormData: any,
        isEditing: boolean,
        setIsEditing: any,
        idField: string,
        fetchFunction: () => void
    ) => {
        e.preventDefault();

        if (isEditing && formData[idField]) {
            await supabase.from(table).update(formData).eq(idField, formData[idField]);
            alert("✅ Actualización exitosa");
            setIsEditing(false);
        } else {
            await supabase.from(table).insert([formData]);
            alert("✅ Registro exitoso");
        }

        fetchFunction();
        setFormData({ nombre: "", descripcion: "" });
    };

    // Función para manejar la edición
    const handleEdit = (item: any, setFormData: any, setIsEditing: any) => {
        setFormData(item);
        setIsEditing(true);
    };

    return (
        <div className="grid grid-cols-3 gap-6 p-6">
            
            {/* Sección de Estilos */}
            <div className="border rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-bold mb-4">{isEditingEstilo ? "✏️ Editar Estilo" : "➕ Registrar Estilo"}</h2>
                <form onSubmit={(e) => handleSubmit(e, "estilos", formDataEstilo, setFormDataEstilo, isEditingEstilo, setIsEditingEstilo, "id_estilo", fetchEstilos)} className="space-y-4">
                    <input type="text" name="nombre_estilo" placeholder="Nombre" value={formDataEstilo.nombre_estilo} onChange={(e) => handleChange(e, setFormDataEstilo)} required className="w-full p-2 border rounded" />
                    <textarea name="descripcion" placeholder="Descripción" value={formDataEstilo.descripcion} onChange={(e) => handleChange(e, setFormDataEstilo)} required className="w-full p-2 border rounded" />
                    <button type="submit" className="bg-orange-500 text-white p-2 rounded w-full">{isEditingEstilo ? "Actualizar" : "Guardar"}</button>
                </form>
                <ul className="max-h-40 overflow-y-auto mt-4">
                    {estilos.map((estilo) => (
                        <li key={estilo.id_estilo} onClick={() => handleEdit(estilo, setFormDataEstilo, setIsEditingEstilo)} className="p-2 border rounded cursor-pointer hover:bg-gray-100 flex justify-between">
                            <div>
                                <p className="font-semibold">{estilo.nombre_estilo}</p>
                                <p className="text-sm text-gray-600">{estilo.descripcion}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sección de Materiales */}
            <div className="border rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-bold mb-4">{isEditingMaterial ? "✏️ Editar Material" : "➕ Registrar Material"}</h2>
                <form onSubmit={(e) => handleSubmit(e, "materiales", formDataMaterial, setFormDataMaterial, isEditingMaterial, setIsEditingMaterial, "id_materiales", fetchMateriales)} className="space-y-4">
                    <input type="text" name="nombre_materiales" placeholder="Nombre" value={formDataMaterial.nombre_materiales} onChange={(e) => handleChange(e, setFormDataMaterial)} required className="w-full p-2 border rounded" />
                    <textarea name="uso_materiales" placeholder="Uso" value={formDataMaterial.uso_materiales} onChange={(e) => handleChange(e, setFormDataMaterial)} required className="w-full p-2 border rounded" />
                    <button type="submit" className="bg-orange-500 text-white p-2 rounded w-full">{isEditingMaterial ? "Actualizar" : "Guardar"}</button>
                </form>
                <ul className="max-h-40 overflow-y-auto mt-4">
                    {materiales.map((material) => (
                        <li key={material.id_materiales} onClick={() => handleEdit(material, setFormDataMaterial, setIsEditingMaterial)} className="p-2 border rounded cursor-pointer hover:bg-gray-100 flex justify-between">
                            <div>
                                <p className="font-semibold">{material.nombre_materiales}</p>
                                <p className="text-sm text-gray-600">{material.uso_materiales}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sección de Categorías */}
            <div className="border rounded-lg shadow-lg p-4">
                <h2 className="text-xl font-bold mb-4">{isEditingCategoria ? "✏️ Editar Categoría" : "➕ Registrar Categoría"}</h2>
                <form onSubmit={(e) => handleSubmit(e, "categorias", formDataCategoria, setFormDataCategoria, isEditingCategoria, setIsEditingCategoria, "id_categoria", fetchCategorias)} className="space-y-4">
                    <input type="text" name="nombre_categoria" placeholder="Nombre" value={formDataCategoria.nombre_categoria} onChange={(e) => handleChange(e, setFormDataCategoria)} required className="w-full p-2 border rounded" />
                    <textarea name="descripcion" placeholder="Descripción" value={formDataCategoria.descripcion} onChange={(e) => handleChange(e, setFormDataCategoria)} required className="w-full p-2 border rounded" />
                    <button type="submit" className="bg-orange-500 text-white p-2 rounded w-full">{isEditingCategoria ? "Actualizar" : "Guardar"}</button>
                </form>
                <ul className="max-h-40 overflow-y-auto mt-4">
                    {categorias.map((categoria) => (
                        <li key={categoria.id_categoria} onClick={() => handleEdit(categoria, setFormDataCategoria, setIsEditingCategoria)} className="p-2 border rounded cursor-pointer hover:bg-gray-100 flex justify-between">
                            <div>
                                <p className="font-semibold">{categoria.nombre_categoria}</p>
                                <p className="text-sm text-gray-600">{categoria.descripcion}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
