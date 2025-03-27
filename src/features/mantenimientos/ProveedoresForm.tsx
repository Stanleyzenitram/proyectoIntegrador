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
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        {isEditing ? "Editar Proveedor" : "Registrar Proveedor"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Proveedor</label>
                            <input
                                type="text"
                                name="nombre_proveedor"
                                value={formData.nombre_proveedor}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
                            <input
                                type="text"
                                name="contacto"
                                value={formData.contacto}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                name="correo"
                                value={formData.correo}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                            <input
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors"
                        >
                            {isEditing ? "Actualizar Proveedor" : "Registrar Proveedor"}
                        </button>
                    </form>
                </div>

                {/* Lista de Proveedores */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Proveedores Registrados</h2>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {proveedores.map((proveedor) => (
                            <div
                                key={proveedor.id_proveedor}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                                onClick={() => handleEdit(proveedor)}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-800">{proveedor.nombre_proveedor}</h3>
                                        <p className="text-sm text-gray-600">Contacto: {proveedor.contacto}</p>
                                        <p className="text-sm text-gray-600">Tel: {proveedor.telefono}</p>
                                        <p className="text-sm text-gray-600">Email: {proveedor.correo}</p>
                                        <p className="text-sm text-gray-600">Dirección: {proveedor.direccion}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(proveedor);
                                        }}
                                        className="text-amber-600 hover:text-amber-700"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}



