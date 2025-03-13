import { useState, useEffect } from "react";
import { supabase } from "../../services/supabase";
import { PencilIcon } from "@heroicons/react/24/solid";
import { Proveedor } from "../../types";

export default function ProveedorForm() {
    const [formData, setFormData] = useState<Proveedor>({
        nombre_proveedor: "",
        contacto: "",
        telefono: "",
        correo: "",
        direccion: "",
    });
    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        const { data, error } = await supabase.from("proveedores").select("*");
        if (error) {
            console.error("❌ Error obteniendo proveedores:", error.message);
        } else {
            setProveedores(data || []);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isEditing && formData.id_proveedor) {
            const { error } = await supabase
                .from("proveedores")
                .update({
                    nombre_proveedor: formData.nombre_proveedor,
                    contacto: formData.contacto,
                    telefono: formData.telefono,
                    correo: formData.correo,
                    direccion: formData.direccion,
                })
                .eq("id_proveedor", formData.id_proveedor);

            if (error) {
                console.error("❌ Error actualizando proveedor:", error.message);
                alert("Error actualizando proveedor");
            } else {
                alert("Proveedor actualizado correctamente");
                setIsEditing(false);
                fetchProveedores();
            }
        } else {
            const { error } = await supabase.from("proveedores").insert([
                {
                    nombre_proveedor: formData.nombre_proveedor,
                    contacto: formData.contacto,
                    telefono: formData.telefono,
                    correo: formData.correo,
                    direccion: formData.direccion,
                },
            ]);

            if (error) {
                console.error("❌ Error insertando proveedor:", error.message);
                alert("Error insertando proveedor");
            } else {
                alert("Proveedor insertado correctamente");
                fetchProveedores();
            }
        }

        setFormData({
            nombre_proveedor: "",
            contacto: "",
            telefono: "",
            correo: "",
            direccion: "",
        });
    };

    const handleEdit = (proveedor: Proveedor) => {
        setFormData(proveedor);
        setIsEditing(true);
    };

    return (
        <div className="flex space-x-4 p-4">
            {/* Formulario */}
            <div className="w-1/2 p-4 border rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Proveedor" : "Registrar Proveedor"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="text"
                        name="nombre_proveedor"
                        placeholder="Nombre"
                        value={formData.nombre_proveedor}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        name="contacto"
                        placeholder="Contacto"
                        value={formData.contacto}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                        type="email"
                        name="correo"
                        placeholder="Correo Electrónico"
                        value={formData.correo}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    <input
                        type="text"
                        name="direccion"
                        placeholder="Dirección"
                        value={formData.direccion}
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

            {/* Lista de Proveedores */}
            <div className="w-1/2 p-4 border rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Proveedores Registrados</h2>
                <ul>
                    {proveedores.map((proveedor) => (
                        <li key={proveedor.id_proveedor} className="flex justify-between items-center p-2 border-b">
                            <div>
                                <p className="font-semibold">{proveedor.nombre_proveedor}</p>
                                <p className="text-sm text-gray-600">{proveedor.contacto} - {proveedor.telefono}</p>
                            </div>
                            <button onClick={() => handleEdit(proveedor)} className="text-blue-500">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}



