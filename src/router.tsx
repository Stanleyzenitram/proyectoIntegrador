import { BrowserRouter, Routes, Route, Navigate  } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Layout from "./layouts/Layout";
import Register from "./pages/Register";

import { useAuth } from "./hooks/useAuth";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Provedor from "./pages/Proveedores";

export default function AppRouter() {
    const { user } = useAuth();

    return (

            <Routes>
                <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} index/>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/sobreNosotros" element={<Provedor/>} />

                    {/* Rutas protegidas */}
                    <Route element={<PrivateRoute />}>
                        <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
                    </Route>
                        
                </Route>
            </Routes>

    );
}
