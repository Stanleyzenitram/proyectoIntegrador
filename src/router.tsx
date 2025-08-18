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
import PedidosInt from "./pages/PedidosInt";
import PedidosMant from "./pages/PedidosMant";
import HistorialPedido from "./pages/HistorialPedido";
import EditProfile from "./pages/EditProfile";
import AdminRoute from "./components/AdminRoute";

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
import ProveedoresForm from "./features/mantenimientos/ProveedoresForm";
import ReporteCompras from "./features/reportes/ReporteCompras";
import Factura from "./pages/Factura";
import ReporteProductos from "./features/reportes/ReporteProductos";
import ReportePedidos from "./features/reportes/ReportePedidos";
import ReporteClientes from "./features/reportes/ReporteClientes";
import ReporteEmpleados from "./features/reportes/ReporteEmpleados";
import EstiloMaterialForm from "./features/mantenimientos/EstilosForm";
import Preferencias from "./pages/Preferencias";
import ConfiguracionSistema from "./features/mantenimientos/ConfiguracionSistema";
import AdminPreferenciasUso from "./features/mantenimientos/AdminPreferenciasUso";
import TestRecomendaciones from "./test/TestRecomendaciones";

export default function AppRouter() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/update-password" element={<UpdatePassword />} />
            <Route element={<Layout />}>
                {/* Ruta principal accesible para todos */}
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
                    <Route path="/edit-profile" element={<EditProfile />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/factura/:id" element={<Factura />} />
                    <Route path="/pedidos" element={<PedidosInt />} />
                    <Route path="/pedido/:id/historial" element={<HistorialPedido />} />
                    
                    {/* Funcionalidades del cliente */}
                    <Route path="/preferencias" element={<Preferencias />} />

                    {/* Mantenimientos */}
                    <Route path="/empleados" element={<Empleados />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/proveedores" element={<Proveedor />} />
                    <Route path="/proveedores-form" element={<ProveedoresForm />} />
                    <Route path="/productos" element={<Productos />} />
                    <Route path="/materiales" element={<EstiloMaterialForm />} />
                    <Route path="/estilos" element={<Estilos />} />
                    <Route path="/pedidos-mant" element={<PedidosMant />} />
                    <Route path="/inventario" element={<Inventario />} />
                    <Route path="/compras" element={<CompraProductos />} />
                    <Route path="/configuracion-sistema" element={<ConfiguracionSistema />} />
                    <Route path="/admin-preferencias-uso" element={<AdminPreferenciasUso />} />
                    <Route path="/test-recomendaciones" element={<TestRecomendaciones />} />
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
                    <Route
                        path="/reportes/pedidos"
                        element={<ReportePedidos />}
                    />
                    <Route
                        path="/reportes/productos"
                        element={<ReporteProductos />}
                    />
                    <Route
                        path="/reportes/clientes"
                        element={<ReporteClientes />}
                    />
                    <Route
                        path="/reportes/empleados"
                        element={<ReporteEmpleados />}
                    />
                </Route>
            </Route>
        </Routes>
    );
}
