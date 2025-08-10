import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { supabase } from "../services/supabase";

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    return context;
}

export function useUserRole() {
    const { user } = useAuth();
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUserRole = async () => {
            if (!user) {
                setUserRole(null);
                setLoading(false);
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
                    setUserRole(null);
                } else {
                    setUserRole(data?.rol || null);
                }
            } catch (err) {
                console.error("Error al verificar el rol:", err);
                setUserRole(null);
            } finally {
                setLoading(false);
            }
        };

        checkUserRole();
    }, [user]);

    return { userRole, loading };
}
