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
import  PasswordReset  from './components/PasswordReset';
import UpdatePassword from './components/UpdatePassword';
import SobreNosotrosPage from "./pages/sobreNosotros";
import EditProfile from "./pages/EditProfile";




export default function AppRouter() {
    const { user } = useAuth();

    return (
        <Routes>
                          <Route path="/update-password" element={<UpdatePassword />} /> 
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} index/>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<Register />} />
                <Route path="/SobreNosotros" element={<SobreNosotrosPage />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                

                {/* Rutas protegidas */}
                <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/edit-profile" element={<EditProfile />} />
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
