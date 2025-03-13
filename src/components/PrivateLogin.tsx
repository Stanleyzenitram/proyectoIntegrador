import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateLogin() {
    const { user } = useAuth(); // Obtiene el usuario autenticado
    
    return user ? <Navigate to="/" replace /> : <Outlet />;

}
