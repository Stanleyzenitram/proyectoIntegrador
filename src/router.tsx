import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/useAuth";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Provedor from "./pages/Proveedores";
import Estilo from "./pages/Estilos";
import Estilos from "./pages/Estilos";
import Empleados from "./pages/Empleados";

export default function AppRouter() {
    const { user } = useAuth();

    return (

            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} index/>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<Estilo />} />
                    <Route path="/sobreNosotros" element={<Estilos/>} />
                    <Route path="/proveedores" element={<Provedor />} />
                    <Route path="/empleados" element={<Empleados />} />

                    {/* Rutas protegidas */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    </Route>
                        
                </Route>
            </Routes>

    );
}
