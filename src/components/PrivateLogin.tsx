import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { isAdmin } from "../utils/userUtils";

export default function PrivateLogin() {
    const { user } = useAuth();
    const [isAdminUser, setIsAdminUser] = useState<boolean | null>(null);
    
    useEffect(() => {
        const checkUserRole = async () => {
            if (!user) {
                setIsAdminUser(false);
                return;
            }

            try {
                const adminStatus = await isAdmin(user.id);
                setIsAdminUser(adminStatus);
            } catch (err) {
                console.error("Error al verificar el rol:", err);
                setIsAdminUser(false);
            }
        };

        checkUserRole();
    }, [user]);

    if (isAdminUser === null) {
        return <div>Cargando...</div>;
    }

    return user ? <Navigate to={isAdminUser ? "/inventario" : "/"} replace /> : <Outlet />;
}
