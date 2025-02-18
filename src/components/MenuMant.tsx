import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { NavLink } from "react-router-dom";
import { supabase } from "../services/supabase"; // Ajusta la ruta según tu proyecto

export default function MenuMant() {
    const { user } = useAuth();
    const [rol, setRol] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setRol(null); // Si no hay usuario, limpiar el rol
                setLoading(false);
                return;
            }   

            try {
                const { data, error } = await supabase
                    .from("usuarios")
                    .select("rol")
                    .eq("uuid", user.id)
                    .single();

                if (error) throw error;

                setRol(data?.rol || null);
            } catch (err) {
                console.error("Error al obtener el rol del usuario:", err);
                setRol(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]); // Se ejecuta cuando `user` cambia

    if (loading) return null; // No renderiza nada mientras carga

    return rol === "admin" ? (
        <div className="flex flex-row mb-5 justify-start bg-amber-400 place-items-center border text-center w-screen h-10">
            {/* Mantenimientos con menú desplegable */}
            <div className="relative group w-fit mx-5">
                <p className="text-white font-bold text-lg cursor-pointer">Mantenimientos</p>
                <div className="absolute left-0 w-45 bg-white shadow-lg rounded-lg py-2 hidden group-hover:block z-10">
                    <NavLink to="/productos" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Productos</NavLink>
                    <NavLink to="/proveedores" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Proveedores</NavLink>
                    <NavLink to="/materiales" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Materiales</NavLink>
                    <NavLink to="/estilos" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Estilos</NavLink>
                    <NavLink to="/categorias" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Categorías</NavLink>
                </div>
            </div>

            {/* Inventario */}
            <div className="relative group mx-5">
                <p className="text-white font-bold text-lg cursor-pointer">Inventario</p>
                <div className="absolute left-0 mt-1 w-40 bg-white shadow-lg rounded-lg py-2 hidden group-hover:block z-10">
                    <NavLink to="/stock" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Stock</NavLink>
                    <NavLink to="/proveedores" className="block px-4 py-2 text-gray-800 hover:bg-gray-200">Proveedores</NavLink>
                </div>
            </div>

            {/* Reportes */}
            <p className="text-white font-bold text-lg cursor-pointer mx-5">Reportes</p>
        </div>
    ) : null;
}
