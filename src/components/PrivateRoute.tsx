import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

export default function PrivateRoute() {
    const { user } = useAuth();
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setIsAuthenticated(!!session);
            } catch (err) {
                console.error('Error checking auth:', err);
                setIsAuthenticated(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, []);

    if (isChecking) {
        return <div>Cargando...</div>; // O tu componente de loading
    }

    if (!isAuthenticated) {
        console.log('PrivateRoute: Redirigiendo a login');
        return <Navigate to="/login" replace />;
    }

    console.log('PrivateRoute: Permitiendo acceso a', location.pathname);
    return <Outlet />;
}
