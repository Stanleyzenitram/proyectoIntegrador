import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { useAuth } from "../hooks/useAuth"; // Hook para obtener el usuario autenticado
import { useNavigate } from "react-router-dom";

export default function Profile() {
    const { user } = useAuth(); // Obtener el usuario autenticado
    const [userData, setUserData] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) navigate("/login"); // Si no hay sesión, redirige
    }, [user, navigate]);

    useEffect(() => {
        if (!user) return; // No ejecutar la consulta si no hay usuario autenticado

        const fetchUserData = async () => {
            const { data, error } = await supabase
                .from("clientes")
                .select("*")
                .eq("uuid", user.id) // Supabase asigna el `id` del usuario aquí
                .single();

            if (error) {
                console.error("Error obteniendo datos del usuario:", error);
            } else {
                setUserData(data);
            }
        };

        fetchUserData();
    }, [user]); // Ejecutar solo cuando `user` cambie

    if (!user) return <p>No estás autenticado</p>;

    return (
        <div className="bg-gray-100 h-screen flex justify-center items-center">
            <h2>Perfil de Usuario</h2>
            {userData ? (
                <div>
                    <pre>{JSON.stringify(userData, null, 2)}</pre>
                </div>
                
            ) : (
                <p> Cargando datos...</p>
            )}
        </div>
    );
}
