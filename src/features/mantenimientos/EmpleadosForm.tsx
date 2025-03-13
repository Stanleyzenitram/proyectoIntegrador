import { useEffect, useState } from "react";
import type { Empleado } from "../../types/index";
import { crearEmpleado, fetchEmpleados } from "../../api/empleados";
import { PencilIcon } from "@heroicons/react/24/solid";

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


    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await fetchEmpleados();
                setEmpleados(data);
            } catch (error) {
                console.error("❌ Error al cargar proveedores:", error);
            }
        };

        fetchData();
    }, []);
    
    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) => {
        console.log("Cambiando", e.target.value);
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        try {
            await crearEmpleado(formData);
            alert(
                "Registro exitoso, confirme su correo electrónico antes de iniciar sesion."
            ); 
        } catch (err) {
            alert("Error en el registro.");
            console.error(err);
        }
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
    };

    const handleEdit = (empleado: Empleado) => {
        setFormData({
            name: empleado.nombre || "",
            lastName: empleado.apellido || "",
            cedula: empleado.cedula || "",
            email: empleado.correo || "",
            password: "", // No mostramos la contraseña existente por seguridad
            confirmPassword: "", // No mostramos la contraseña existente por seguridad
            phoneNumber: empleado.telefono || "",
            rol: empleado.rol || "",
        });
        setIsEditing(true);
    };
    
    console.log(empleados);
    return (
        <div className="flex space-x-4 p-4 pt-40">
            {/* Formulario */}
            <div className="w-1/2 p-4 border rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4 uppercase">
                    {isEditing ? "Editar Empleado" : "Registrar Empleado"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre */}
                    <input
                        type="text"
                        name="name"
                        placeholder="Nombre"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    {/* Apellido */}
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Apellido"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />

                    {/* Cédula */}
                    <input
                        type="text"
                        name="cedula"
                        placeholder="Cédula"
                        value={formData.cedula}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    {/* Correo */}
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo Electrónico"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isEditing}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    {/* Contraseña */}
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    {/* Confirmar Contraseña */}
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmar Contraseña"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    {/* Teléfono */}
                    <input
                        type="tel"
                        name="phoneNumber"
                        placeholder="Teléfono"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    />
                    {/* Rol */}
                    <select
                        name="rol"
                        value={formData.rol}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border-b-2 border-gray-400 focus:border-amber-500 focus:outline-none"
                    >
                        <option value="">Selecciona un rol</option>
                        <option value="admin">Administrador</option>
                        <option value="user">Usuario</option>
                    </select>

                    <button
                        type="submit"
                        className="bg-orange-500 text-white p-2 rounded w-full hover:bg-orange-600 cursor-pointer"
                    >
                        {isEditing ? "Actualizar" : "Guardar"}
                    </button>
                </form>
            </div>

             {/* Lista de Empleados */}
             <div className="w-1/2 p-4 border rounded-lg shadow-lg">
                <h2 className="text-xl font-bold mb-4">Empleados Registrados</h2>
                <ul>
                    {empleados.map((empleado) => (
                        <li key={empleado.id_usuario} className="flex justify-between items-center p-2 border-b">
                            <div>
                                <p className="font-semibold">{empleado.nombre}</p>
                                <p className="text-sm text-gray-600">{empleado.apellido} - {empleado.telefono}</p>
                                <p className="text-sm text-gray-600">{empleado.correo}</p>
                            </div>
                            <button onClick={() => handleEdit(empleado)} className="text-blue-500 hover:text-blue-700 cursor-pointer">
                                <PencilIcon className="w-5 h-5" />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
