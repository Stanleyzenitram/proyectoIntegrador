import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isRelevanciaOpen, setIsRelevanciaOpen] = useState(false);
    const relevanciaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (relevanciaRef.current && !relevanciaRef.current.contains(event.target as Node)) {
                setIsRelevanciaOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <Link to="/" className="text-2xl font-bold text-amber-600">
                        Venta Cerámicas
                    </Link>

                    {user && (
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/pedidos"
                                className="text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                Mis Pedidos
                            </Link>
                            
                            {/* Menú de Relevancia */}
                            <div className="relative" ref={relevanciaRef}>
                                <button
                                    onClick={() => setIsRelevanciaOpen(!isRelevanciaOpen)}
                                    className="flex items-center text-gray-600 hover:text-amber-600 transition-colors"
                                >
                                    Relevancia
                                    <ChevronDownIcon className="w-4 h-4 ml-1" />
                                </button>
                                
                                {isRelevanciaOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-64 bg-white shadow-lg rounded-md border border-gray-200 z-50">
                                        <div className="py-2">
                                            <Link
                                                to="/relevancia/busqueda"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                                onClick={() => setIsRelevanciaOpen(false)}
                                            >
                                                🔍 Búsqueda y Filtros
                                            </Link>
                                            <Link
                                                to="/relevancia/recomendaciones"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                                onClick={() => setIsRelevanciaOpen(false)}
                                            >
                                                ⭐ Recomendaciones
                                            </Link>
                                            <Link
                                                to="/relevancia/historial"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                                onClick={() => setIsRelevanciaOpen(false)}
                                            >
                                                📋 Historial de Interacciones
                                            </Link>
                                            <Link
                                                to="/relevancia/metricas"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                                onClick={() => setIsRelevanciaOpen(false)}
                                            >
                                                📊 Métricas y Reportes
                                            </Link>
                                            <Link
                                                to="/relevancia/configuracion"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 hover:text-amber-600"
                                                onClick={() => setIsRelevanciaOpen(false)}
                                            >
                                                ⚙️ Configuración
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <Link
                                to="/profile"
                                className="text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                Mi Perfil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    )}

                    {!user && (
                        <div className="flex items-center space-x-4">
                            <Link
                                to="/login"
                                className="text-gray-600 hover:text-amber-600 transition-colors"
                            >
                                Iniciar Sesión
                            </Link>
                            <Link
                                to="/register"
                                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
                            >
                                Registrarse
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 