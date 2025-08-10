import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faBars, 
    faTimes, 
    faHome, 
    faUser, 
    faShoppingBag, 
    faHeart, 
    faChat,
    faStar
} from "@fortawesome/free-solid-svg-icons";

export default function ClienteMenu() {
    const { user } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Solo mostrar si hay un usuario logueado
    if (!user) return null;

    return (
        <div className="bg-amber-500 w-full h-12 flex justify-between items-center px-4 sm:px-8 shadow-md">
            {/* Botón hamburguesa */}
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-amber-900 text-2xl focus:outline-none sm:hidden hover:text-amber-700 transition-colors"
            >
                <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
            </button>

            {/* Menú desplegable (móvil) */}
            {isMenuOpen && (
                <nav className="absolute top-12 left-0 w-full bg-amber-100 shadow-lg z-20 sm:hidden animate-slide-down border-b-2 border-amber-300">
                    <div className="py-4 space-y-4 text-center text-amber-900 font-semibold uppercase">
                        <NavLink 
                            to="/" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="flex items-center justify-center px-4 py-2 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faHome} className="mr-2" />
                            Inicio
                        </NavLink>
                        
                        <NavLink 
                            to="/profile" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="flex items-center justify-center px-4 py-2 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faUser} className="mr-2" />
                            Mi Perfil
                        </NavLink>
                        
                        <NavLink 
                            to="/pedidos" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="flex items-center justify-center px-4 py-2 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                            Mis Pedidos
                        </NavLink>
                        
                        <NavLink 
                            to="/preferencias" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="flex items-center justify-center px-4 py-2 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faHeart} className="mr-2" />
                            Mis Preferencias
                        </NavLink>
                        
                        <NavLink 
                            to="/recomendaciones" 
                            onClick={() => setIsMenuOpen(false)} 
                            className="flex items-center justify-center px-4 py-2 hover:bg-amber-200 rounded-lg transition-colors"
                        >
                            <FontAwesomeIcon icon={faStar} className="mr-2" />
                            Recomendaciones
                        </NavLink>
                    </div>
                </nav>
            )}

            {/* Menú de escritorio */}
            <nav className="hidden sm:flex space-x-8 font-semibold text-amber-900 uppercase">
                <NavLink 
                    to="/" 
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isActive ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-400 hover:text-amber-900'
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faHome} className="mr-2" />
                    Inicio
                </NavLink>
                
                <NavLink 
                    to="/profile" 
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isActive ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-400 hover:text-amber-900'
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faUser} className="mr-2" />
                    Mi Perfil
                </NavLink>
                
                <NavLink 
                    to="/pedidos" 
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isActive ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-400 hover:text-amber-900'
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faShoppingBag} className="mr-2" />
                    Mis Pedidos
                </NavLink>
                
                <NavLink 
                    to="/preferencias" 
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isActive ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-400 hover:text-amber-900'
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faHeart} className="mr-2" />
                    Mis Preferencias
                </NavLink>
                
                <NavLink 
                    to="/recomendaciones" 
                    className={({ isActive }) =>
                        `flex items-center px-4 py-2 rounded-lg transition-colors ${
                            isActive ? 'bg-amber-600 text-white shadow-md' : 'text-amber-900 hover:bg-amber-400 hover:text-amber-900'
                        }`
                    }
                >
                    <FontAwesomeIcon icon={faStar} className="mr-2" />
                    Recomendaciones
                </NavLink>
            </nav>
        </div>
    );
}
