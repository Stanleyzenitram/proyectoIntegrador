import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { NavLink } from "react-router-dom";
import { supabase } from "../services/supabase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FileText } from 'lucide-react';

export default function MenuMant() {
    const { user } = useAuth();
    const [rol, setRol] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) {
                setRol(null);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from("usuarios")
                    .select("rol")
                    .eq("uuid", user.id)
                    .single();

                if (error) throw error;
                setRol(data?.rol || null);
            } catch (err) {
                console.error("Error al obtener el rol del usuario:", err);
                setRol(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUserRole();
    }, [user]);

    if (loading || (rol !== "admin" && rol !== "mantenimiento")) return null;

    return (
        <div className="bg-amber-400 w-full h-12 flex justify-between items-center px-4 sm:px-8">
            {/* Botón hamburguesa */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white text-2xl focus:outline-none sm:hidden"
            >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>

            {/* Menú desplegable (móvil) */}
            {isMenuOpen && (
                <nav className="absolute top-12 left-0 w-full bg-white shadow-md z-20 sm:hidden animate-slide-down">
                    <div className="py-4 space-y-4 text-center text-amber-900 font-semibold uppercase">
                        <details className="group">
                            <summary className="cursor-pointer px-4 py-2 hover:bg-amber-100 rounded">Mantenimientos</summary>
                            <div className="space-y-2">
                                                        <NavLink to="/empleados" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Empleados</NavLink>
                        <NavLink to="/productos" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Productos</NavLink>
                        <NavLink to="/proveedores-form" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Proveedores</NavLink>
                        <NavLink to="/materiales" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Materiales</NavLink>
                        <NavLink to="/productos-relacionados" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Productos Relacionados</NavLink>
                            </div>
                        </details>

                        <details className="group">
                            <summary className="cursor-pointer px-4 py-2 hover:bg-amber-100 rounded">Inventario</summary>
                            <div className="space-y-2">
                                <NavLink to="/stock" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Stock</NavLink>
                                <NavLink to="/compras" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Compras</NavLink>
                                <NavLink to="/pedidos-mant" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 hover:bg-gray-200">Pedidos</NavLink>
                            </div>
                        </details>

                        {rol === "admin" && (
                            <details className="group">
                                <summary className="cursor-pointer px-4 py-2 hover:bg-amber-100 rounded">Reportes</summary>
                                <div className="space-y-2">
                                    <NavLink 
                                        to="/reportes/compras" 
                                        onClick={() => setIsMenuOpen(false)} 
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Reporte de Compras
                                    </NavLink>
                                    <NavLink 
                                        to="/reportes/pedidos" 
                                        onClick={() => setIsMenuOpen(false)} 
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Reporte de Pedidos
                                    </NavLink>
                                    <NavLink 
                                        to="/reportes/productos" 
                                        onClick={() => setIsMenuOpen(false)} 
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Reporte de Productos
                                    </NavLink>
                                    <NavLink 
                                        to="/reportes/clientes" 
                                        onClick={() => setIsMenuOpen(false)} 
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Reporte de Clientes
                                    </NavLink>
                                    <NavLink 
                                        to="/reportes/empleados" 
                                        onClick={() => setIsMenuOpen(false)} 
                                        className={({ isActive }) =>
                                            `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                                isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                            }`
                                        }
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Reporte de Empleados
                                    </NavLink>
                                </div>
                            </details>
                        )}
                    </div>
                </nav>
            )}

            {/* Menú de escritorio */}
            <nav className="hidden sm:flex space-x-8 font-semibold text-white uppercase">
                <div className="relative group">
                    <p className="cursor-pointer">Mantenimientos</p>
                    <div className="absolute left-0 w-48 bg-white text-amber-900 rounded-lg shadow-lg py-2 hidden group-hover:block z-20">
                        <NavLink to="/empleados" className="block px-4 py-2 hover:bg-gray-200">Empleados</NavLink>
                        <NavLink to="/productos" className="block px-4 py-2 hover:bg-gray-200">Productos</NavLink>
                        <NavLink to="/proveedores-form" className="block px-4 py-2 hover:bg-gray-200">Proveedores</NavLink>
                        <NavLink to="/materiales" className="block px-4 py-2 hover:bg-gray-200">Materiales</NavLink>
                        <NavLink to="/productos-relacionados" className="block px-4 py-2 hover:bg-gray-200">Productos Relacionados</NavLink>
                    </div>
                </div>

                <div className="relative group">
                    <p className="cursor-pointer">Inventario</p>
                    <div className="absolute left-0 w-40 bg-white text-amber-900 rounded-lg shadow-lg py-2 hidden group-hover:block z-20">
                        <NavLink to="/stock" className="block px-4 py-2 hover:bg-gray-200">Stock</NavLink>
                        <NavLink to="/compras" className="block px-4 py-2 hover:bg-gray-200">Compras</NavLink>
                        <NavLink to="/pedidos-mant" className="block px-4 py-2 hover:bg-gray-200">Pedidos</NavLink>
                    </div>
                </div>

                {rol === "admin" && (
                    <div className="relative group">
                        <p className="cursor-pointer">Reportes</p>
                        <div className="absolute left-0 w-40 bg-white text-amber-900 rounded-lg shadow-lg py-2 hidden group-hover:block z-20">
                            <NavLink 
                                to="/reportes/compras" 
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                        isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Reporte de Compras
                            </NavLink>
                            <NavLink 
                                to="/reportes/pedidos" 
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                        isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Reporte de Pedidos
                            </NavLink>
                            <NavLink 
                                to="/reportes/productos" 
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                        isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Reporte de Productos
                            </NavLink>
                            <NavLink 
                                to="/reportes/clientes" 
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                        isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Reporte de Clientes
                            </NavLink>
                            <NavLink 
                                to="/reportes/empleados" 
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2 rounded-lg transition-colors ${
                                        isActive ? 'bg-amber-100 text-amber-700' : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                            >
                                <FileText className="w-5 h-5 mr-2" />
                                Reporte de Empleados
                            </NavLink>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
}
