import { useEffect, useState } from "react";
import type { Empleado } from "../../types/index";
import { crearEmpleado, fetchEmpleados } from "../../api/empleados";
import { PencilIcon } from "@heroicons/react/24/solid";
import { supabase } from "../../services/supabase";

export default function EmpleadosForm() {
    const [formData, setFormData] = useState<Empleado>({
        name: "",
        lastName: "",
        cedula: "",
        email: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        rol: "",
    });

    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await fetchEmpleados();
                // Mapear los datos de la base de datos al formato del frontend
                const mappedData = data.map(empleado => ({
                    id_usuario: empleado.id_usuario,
                    name: empleado.nombre,
                    lastName: empleado.apellido,
                    cedula: empleado.cedula,
                    email: empleado.correo,
                    phoneNumber: empleado.telefono,
                    rol: empleado.rol,
                    password: "",
                    confirmPassword: ""
                }));
                setEmpleados(mappedData);
            } catch (error) {
                console.error("❌ Error al cargar empleados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);
    
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Only validate passwords when creating a new employee
        if (!isEditing && formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            if (isEditing && formData.id_usuario) {
                // Actualizar empleado existente
                const { error } = await supabase
                    .from("usuarios")
                    .update({
                        nombre: formData.name,
                        apellido: formData.lastName,
                        telefono: formData.phoneNumber,
                        rol: formData.rol,
                        cedula: formData.cedula,
                    })
                    .eq("id_usuario", formData.id_usuario);

                if (error) {
                    throw new Error("Error al actualizar el empleado");
                }
                alert("Empleado actualizado correctamente");
            } else {
                // Crear nuevo empleado
                await crearEmpleado(formData);
                alert("Registro exitoso, confirme su correo electrónico antes de iniciar sesion.");
            }

            // Refresh the list after successful operation
            const data = await fetchEmpleados();
            const mappedData = data.map(empleado => ({
                id_usuario: empleado.id_usuario,
                name: empleado.nombre,
                lastName: empleado.apellido,
                cedula: empleado.cedula,
                email: empleado.correo,
                phoneNumber: empleado.telefono,
                rol: empleado.rol,
                password: "",
                confirmPassword: ""
            }));
            setEmpleados(mappedData);
            
            // Reset form
            setFormData({
                name: "",
                lastName: "",
                cedula: "",
                email: "",
                password: "",
                confirmPassword: "",
                phoneNumber: "",
                rol: "",
            });
            setIsEditing(false);
        } catch (err: any) {
            alert(err.message || "Error en el registro.");
            console.error(err);
        }
    };

    const handleEdit = (empleado: Empleado) => {
        setFormData({
            id_usuario: empleado.id_usuario,
            name: empleado.name || "",
            lastName: empleado.lastName || "",
            cedula: empleado.cedula || "",
            email: empleado.email || "",
            password: "",
            confirmPassword: "",
            phoneNumber: empleado.phoneNumber || "",
            rol: empleado.rol || "",
        });
        setIsEditing(true);
    };
    
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">
                        {isEditing ? "Editar Empleado" : "Registrar Empleado"}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula</label>
                            <input
                                type="text"
                                name="cedula"
                                value={formData.cedula}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                disabled={isEditing}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required={!isEditing}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required={!isEditing}
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                            <select
                                name="rol"
                                value={formData.rol}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            >
                                <option value="">Selecciona un rol</option>
                                <option value="admin">Administrador</option>
                                <option value="user">Usuario</option>
                                <option value="mantenimiento">Mantenimiento</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors duration-200 font-medium"
                        >
                            {isEditing ? "Actualizar" : "Guardar"}
                        </button>
                    </form>
                </div>

                {/* Lista de Empleados */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Empleados Registrados</h2>
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto"></div>
                        </div>
                    ) : empleados.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No hay empleados registrados</p>
                    ) : (
                        <div className="space-y-4">
                            {empleados.map((empleado) => (
                                <div key={empleado.id_usuario} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-800">{empleado.name} {empleado.lastName}</h3>
                                            <p className="text-sm text-gray-600 mt-1">{empleado.phoneNumber}</p>
                                            <p className="text-sm text-gray-600">{empleado.email}</p>
                                            <p className="text-sm text-gray-500 mt-1">Cédula: {empleado.cedula}</p>
                                            <span className="inline-block px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full mt-2">
                                                {empleado.rol}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleEdit(empleado)} 
                                            className="text-amber-500 hover:text-amber-600 transition-colors duration-200"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
