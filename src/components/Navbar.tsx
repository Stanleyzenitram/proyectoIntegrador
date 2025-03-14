import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Navbar = () => {
    const { user, logout } = useAuth();

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