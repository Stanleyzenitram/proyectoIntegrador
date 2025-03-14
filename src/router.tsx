import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/Home";
import LoginPage from "./pages/Login";
import Layout from "./layouts/Layout";
import { useAuth } from "./hooks/useAuth";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import Register from "./pages/Register";
import { ChatPage } from "./pages/ChatPage";
import Pedidos from "./pages/Pedidos";
import PedidosMant from "./pages/PedidosMant";
import HistorialPedido from "./pages/HistorialPedido";

import Estilos from "./pages/Estilos";
import Empleados from "./pages/Empleados";
import Clientes from "./pages/Clientes";
import Proveedor from "./pages/Proveedores";
import Productos from "./pages/Productos";
import Checkout from "./pages/Checkout";
import PasswordReset from "./components/PasswordReset";
import UpdatePassword from "./components/UpdatePassword";
import SobreNosotrosPage from "./pages/sobreNosotros";
import Payment from "./pages/Payment";
import PrivateLogin from "./components/PrivateLogin";
import Inventario from "./features/mantenimientos/Inventario";
import CompraProductos from "./features/mantenimientos/CompraProductos";
import ListaProveedores from "./features/mantenimientos/ListaProveedores";
import ReporteCompras from "./features/reportes/ReporteCompras";
import Factura from "./pages/Factura";

export default function AppRouter() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} index />

                <Route path="/register" element={<Register />} />
                <Route path="/SobreNosotros" element={<SobreNosotrosPage />} />
                <Route path="/reset-password" element={<PasswordReset />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/payment" element={<Payment />} />

                {/* Rutas protegidas */}

                <Route element={<PrivateLogin />}>
                    <Route path="/login" element={<LoginPage />} />
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/factura/:id" element={<Factura />} />
                    <Route path="/pedidos" element={<Pedidos />} />
                    <Route path="/pedido/:id/historial" element={<HistorialPedido />} />

                    {/* Mantenimientos */}
                    <Route path="/empleados" element={<Empleados />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/proveedores" element={<Proveedor />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/estilos" element={<Estilos />} />
                    <Route path="/pedidos-mant" element={<PedidosMant />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/compras" element={<CompraProductos />} />
                    <Route
                        path="/proveedores-lista"
                        element={<ListaProveedores />}
                    />

                    <Route path="/stock" element={<Inventario />} />

                    {/* Inventario */}

                    {/* Reportes */}
                    <Route
                        path="/reportes/compras"
                        element={<ReporteCompras />}
                    />
                </Route>
            </Route>
        </Routes>
    );
}
