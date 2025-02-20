import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/useAuth";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";

import Estilos from "./pages/Estilos";
import Empleados from "./pages/Empleados";
import Clientes from "./pages/Clientes";
import Proveedores from "./pages/Proveedores";
import Productos from "./pages/Productos";
import Checkout from "./pages/Checkout";
import SobreNosotrosPage from "./pages/sobreNosotros";


export default function AppRouter() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} index/>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/SobreNosotros" element={<SobreNosotrosPage />} />
                {/* Rutas protegidas */}
                <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/checkout" element={<Checkout />} />
                    
                    {/* Mantenimientos */}
                    <Route path="/empleados" element={<Empleados />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/proveedores" element={<Proveedores />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/estilos" element={<Estilos />} />
                    

                    {/* Inventario */}
            
                    {/* Reportes */}
      
      
                </Route>
            </Route>
        </Routes>
    );
}
