import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MenuMant from "./MenuMant";
import Cart from "./Cart";
import { useCart } from "../context/CartContext";
import MiniCart from './MiniCart';

export default function Header() {
    const { user, logout } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { itemCount } = useCart();
    const cartRef = useRef<HTMLDivElement>(null);
    const [showMiniCart, setShowMiniCart] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                setIsCartOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div className="h-30 bg-amber-400 grid grid-cols-2 place-content-between fixed top-0 left-0 w-full z-50">
            {/* Logo y Nombre */}
            <div className="flex items-center">
                <NavLink to="/">
                    <img
                        src="/src/assets/images/icon.png"
                        alt="icon"
                        className="h-20 ml-4 px-5"
                    />
                </NavLink>

                <NavLink
                    to="/"
                    className="text-2xl ml-4 text-amber-900 font-bold hover:text-amber-600 transition"
                >
                    <h1>Tiles Import & Export S.R.L.</h1>
                </NavLink>
            </div>
            {/* Enlaces + Iconos */}
            <nav className="flex items-center font-medium text-amber-900 uppercase place-content-end h-30">
                <div className="flex items-center justify-end font-bold">
                    <NavLink
                        to="/"
                        className={({ isActive }) =>
                            isActive
                                ? "text-amber-600 underline mr-6"
                                : "mr-6 hover:text-amber-600 transition"
                        }
                    >
                        Inicio
                    </NavLink>
                    <NavLink
                        to="/sobreNosotros"
                        className={({ isActive }) =>
                            isActive
                                ? "text-amber-600 underline mr-6"
                                : "mr-6 hover:text-amber-600 transition"
                        }
                    >
                        Sobre nosotros
                    </NavLink>
                </div>
                {/* Iconos */}
                <div className="flex items-center justify-end mr-4 relative">
                    <div ref={cartRef} className="relative">
                        <button 
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            onMouseEnter={() => setShowMiniCart(true)}
                            className="w-12 h-12 flex items-center justify-center text-2xl text-amber-900 rounded-lg hover:text-amber-600 transition relative"
                            id="cart-button"
                        >
                            <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {showMiniCart && !isCartOpen && (
                            <div 
                                onMouseLeave={() => setShowMiniCart(false)}
                            >
                                <MiniCart onClose={() => setShowMiniCart(false)} />
                            </div>
                        )}
                        {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} />}
                    </div>

                    {/* Icono de usuario con menú */}
                    <div className="group relative">
                        <button className={`w-12 h-12 flex items-center justify-center text-2xl rounded-lg hover:text-amber-600 transition ${
                            user ? 'text-amber-200' : 'text-amber-900'
                        }`}>
                            <FontAwesomeIcon icon={faUser} size="lg" />
                        </button>

                        {/* Menú desplegable */}
                        <div className="absolute right-0 w-52 bg-amber-400 shadow-lg py-2 text-gray-800 hidden group-hover:block z-10">
                            {user ? (
                                <div>
                                    <NavLink
                                        to="/profile"
                                        className="block px-4 py-2 text-amber-900 font-bold uppercase hover:bg-amber-500"
                                    >
                                        Perfil
                                    </NavLink>
                                    <NavLink
                                        to="/pedidos"
                                        className="block px-4 py-2 text-amber-900 font-bold uppercase hover:bg-amber-500"
                                    >
                                        Pedidos
                                    </NavLink>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-amber-900 font-bold uppercase hover:bg-amber-500"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <NavLink
                                        to="/login"
                                        className="block px-4 py-2 text-amber-900 font-bold uppercase hover:bg-amber-500"
                                    >
                                        Iniciar sesión
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        className="block px-4 py-2 text-amber-900 font-bold uppercase hover:bg-amber-500"
                                    >
                                        Registrarse
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            {/* Menu mantenimientos */}
            {user && (
                <div className="w-full">
                    <MenuMant />
                </div>
            )}
        </div>
    );
}
