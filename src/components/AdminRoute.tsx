import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function AdminRoute() {
    const { user } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    
    useEffect(() => {
        const checkUserRole = async () => {
            if (!user) {
                setIsAdmin(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("usuarios")
                    .select("rol")
                    .eq("uuid", user.id)
                    .single();

                if (error) {
                    console.error("Error al obtener el rol:", error);
                    setIsAdmin(false);
                    return;
                }

                setIsAdmin(data?.rol === "admin");
            } catch (err) {
                console.error("Error al verificar el rol:", err);
                setIsAdmin(false);
            }
        };

        checkUserRole();
    }, [user]);

    if (isAdmin === null) {
        return <div>Cargando...</div>;
    }

    return isAdmin ? <Navigate to="/inventario" replace /> : <Outlet />;
} 