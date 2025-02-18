import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/useAuth";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";

import Estilo from "./pages/Estilos";
import Estilos from "./pages/Estilos";
import Empleados from "./pages/Empleados";

import Producto from "./pages/Productos";
import Checkout from "./pages/Checkout";

export default function AppRouter() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} index/>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/empleados" element={<Empleados />} />
                <Route path="/productos" element={<Producto/>} />
                <Route path="/sobreNosotros" element={<Estilos/>} />

                {/* Rutas protegidas */}
                <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/checkout" element={<Checkout />} />
                </Route>
            </Route>
        </Routes>
    );
}
