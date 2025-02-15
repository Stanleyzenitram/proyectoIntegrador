import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { PencilIcon } from "@heroicons/react/24/solid";

interface Categoria {
    id_categoria?: number;
    nombre_categoria: string;
    descripcion: string;
}

export default function CategoriaForm() {
    const [formData, setFormData] = useState<Categoria>({
        nombre_categoria: "",
        descripcion: "",
    });
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    useEffect(() => {
        fetchCategorias();
    }, []);

    const fetchCategorias = async () => {
        const { data, error } = await supabase.from("categorias").select("*");
        if (error) {
            console.error("❌ Error obteniendo categorías:", error.message);
        } else {
            setCategorias(data || []);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditing && formData.id_categoria) {
            const { error } = await supabase
                .from("categorias")
                .update({
                    nombre_categoria: formData.nombre_categoria,
                    descripcion: formData.descripcion,
                })
                .eq("id_categoria", formData.id_categoria);

            if (error) {
                console.error("❌ Error actualizando categoría:", error.message);
                alert("Error actualizando categoría");
            } else {
                alert("Categoría actualizada correctamente");
                setIsEditing(false);
                fetchCategorias();
            }
        } else {
            const { error } = await supabase.from("categorias").insert([
                {
                    nombre_categoria: formData.nombre_categoria,
                    descripcion: formData.descripcion,
                },
            ]);

            if (error) {
                console.error("❌ Error insertando categoría:", error.message);
                alert("Error insertando categoría");
            } else {
                alert("Categoría insertada correctamente");
                fetchCategorias();
            }
        }

        setFormData({ nombre_categoria: "", descripcion: "" });
    };

    const handleEdit = (categoria: Categoria) => {
        setFormData(categoria);
        setIsEditing(true);
    };

    return (
        <div className="flex space-x-4 p-4">
            {/* Formulario */}
            <div className="w-1/2 p-4 border rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Categoría" : "Registrar Categoría"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="nombre_categoria"
                        placeholder="Nombre"
                        value={formData.nombre_categoria}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    <textarea
                        name="descripcion"
                        placeholder="Descripción"
                        value={formData.descripcion}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="bg-orange-500 text-white p-2 rounded w-full"
                    >
                        {isEditing ? "Actualizar" : "Guardar"}
                    </button>
                </form>
            </div>

            {/* Lista de Categorías */}
            <div className="w-1/2 p-4 border rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Categorías Registradas</h2>
                <ul>
                    {categorias.map((categoria) => (
                        <li key={categoria.id_categoria} className="flex justify-between items-center p-2 border-b">
                            <div>
                                <p className="font-semibold">{categoria.nombre_categoria}</p>
                                <p className="text-sm text-gray-600">{categoria.descripcion}</p>
                            </div>
                            <button onClick={() => handleEdit(categoria)} className="text-blue-500">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
