import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute() {
    const { user } = useAuth(); // Obtiene el usuario autenticado
    
    return user ? <Outlet /> : <Navigate to="/" replace />;

}
