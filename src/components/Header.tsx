import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUser, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import MenuMant from "./MenuMant";
import Cart from "./Cart";
import { useCart } from "../context/CartContext";
import MiniCart from "./MiniCart";

export default function Header() {
    const { user, logout } = useAuth();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { itemCount } = useCart();
    const cartRef = useRef<HTMLDivElement>(null);
    const [showMiniCart, setShowMiniCart] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                setIsCartOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <header className="bg-amber-400 fixed top-0 left-0 w-full z-50 shadow-md">
            <div className="flex justify-between items-center px-4 py-2 md:px-8">
                {/* Logo y Nombre */}
                <div className="flex items-center">
                    <NavLink to="/">
                        <img
                            src="https://pdokbwzmygythqtjroje.supabase.co/storage/v1/object/public/imagenes/assets/icon.png"
                            alt="icon"
                            className="h-14 md:h-20 mr-3"
                        />
                    </NavLink>
                    <NavLink to="/" className="text-lg md:text-2xl text-amber-900 font-bold hover:text-amber-600 transition hidden sm:block">
                        Tiles Import & Export S.R.L.
                    </NavLink>
                </div>

                {/* Botón menú hamburguesa (móvil) */}
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="sm:hidden text-2xl text-amber-900 hover:text-amber-600 transition"
                >
                    <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} />
                </button>

                {/* Navegación (escritorio) */}
                <nav className="hidden sm:flex items-center space-x-6 font-medium text-amber-900 uppercase">
                    <NavLink to="/" className={({ isActive }) => isActive ? "text-amber-600 underline" : "hover:text-amber-600 transition"}>Inicio</NavLink>
                    <NavLink to="/sobreNosotros" className={({ isActive }) => isActive ? "text-amber-600 underline" : "hover:text-amber-600 transition"}>Sobre nosotros</NavLink>

                    {/* Iconos */}
                    <div className="relative" ref={cartRef}>
                        <button 
                            id="cart-button"
                            onClick={() => setIsCartOpen(!isCartOpen)}
                            onMouseEnter={() => setShowMiniCart(true)}
                            className="relative w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:text-amber-600 transition"
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                        {showMiniCart && !isCartOpen && (
                            <div onMouseLeave={() => setShowMiniCart(false)}>
                                <MiniCart onClose={() => setShowMiniCart(false)} />
                            </div>
                        )}
                        {isCartOpen && <Cart onClose={() => setIsCartOpen(false)} />}
                    </div>

                    {/* Menú de usuario */}
                    <div className="group relative">
                        <button className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:text-amber-600 transition ${user ? 'text-amber-200' : 'text-amber-900'}`}>
                            <FontAwesomeIcon icon={faUser} />
                        </button>
                        <div className="absolute right-0 w-44 bg-amber-400 shadow-lg py-2 text-gray-800 hidden group-hover:block z-10 rounded-lg">
                            {user ? (
                                <>
                                    <NavLink to="/profile" className="block px-4 py-2 font-bold uppercase hover:bg-amber-500">Perfil</NavLink>
                                    <NavLink to="/pedidos" className="block px-4 py-2 font-bold uppercase hover:bg-amber-500">Pedidos</NavLink>
                                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 font-bold uppercase hover:bg-amber-500 hover:cursor-pointer">Cerrar Sesión</button>
                                </>
                            ) : (
                                <>
                                    <NavLink to="/login" className="block px-4 py-2 font-bold uppercase hover:bg-amber-500">Iniciar sesión</NavLink>
                                    <NavLink to="/register" className="block px-4 py-2 font-bold uppercase hover:bg-amber-500">Registrarse</NavLink>
                                </>
                            )}
                        </div>
                    </div>
                </nav>
            </div>

            {/* Menú desplegable (móvil) */}
            {isMenuOpen && (
                <nav className="sm:hidden bg-amber-300 py-4 px-6 space-y-4 font-medium text-amber-900 uppercase">
                    <NavLink to="/" className={({ isActive }) => isActive ? "block text-amber-600 underline" : "block hover:text-amber-600 transition"} onClick={() => setIsMenuOpen(false)}>Inicio</NavLink>
                    <NavLink to="/sobreNosotros" className={({ isActive }) => isActive ? "block text-amber-600 underline" : "block hover:text-amber-600 transition"} onClick={() => setIsMenuOpen(false)}>Sobre nosotros</NavLink>
                    {user ? (
                        <>
                            <NavLink to="/profile" className="block hover:text-amber-600 transition" onClick={() => setIsMenuOpen(false)}>Perfil</NavLink>
                            <NavLink to="/pedidos" className="block hover:text-amber-600 transition" onClick={() => setIsMenuOpen(false)}>Pedidos</NavLink>
                            <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left hover:cursor-pointer hover:text-amber-600  hover:cursor-pointertransition">Cerrar Sesión</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="block hover:text-amber-600 transition" onClick={() => setIsMenuOpen(false)}>Iniciar sesión</NavLink>
                            <NavLink to="/register" className="block hover:text-amber-600 transition" onClick={() => setIsMenuOpen(false)}>Registrarse</NavLink>
                        </>
                    )}
                </nav>
            )}

            {/* Menú mantenimientos */}
            {user && <MenuMant />}
        </header>
    );
}
