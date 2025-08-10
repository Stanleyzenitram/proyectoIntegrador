import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUser, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth, useUserRole } from "../hooks/useAuth";
import MenuMant from "./MenuMant";
import ClienteMenu from "./ClienteMenu";
import Cart from "./Cart";
import { useCart } from "../context/CartContext";
import MiniCart from "./MiniCart";

export default function Header() {
    const { user, logout } = useAuth();
    const { userRole } = useUserRole();
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { itemCount } = useCart();
    const cartRef = useRef<HTMLDivElement>(null);
    const [showMiniCart, setShowMiniCart] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isModalLocked, setIsModalLocked] = useState(false);
    const miniCartRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
                setIsCartOpen(false);
                setIsModalLocked(false);
            }
            if (showMiniCart && miniCartRef.current && !miniCartRef.current.contains(event.target as Node)) {
                setShowMiniCart(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMiniCart]);

    const handleModalOpen = (modalType: 'cart' | 'menu' | 'user') => {
        if (isModalLocked) return;
        
        setIsModalLocked(true);
        switch (modalType) {
            case 'cart':
                setIsCartOpen(true);
                break;
            case 'menu':
                setIsMenuOpen(true);
                break;
            case 'user':
                // Aquí puedes agregar la lógica para el menú de usuario si lo necesitas
                break;
        }
    };

    const handleModalClose = (modalType: 'cart' | 'menu' | 'user') => {
        switch (modalType) {
            case 'cart':
                setIsCartOpen(false);
                break;
            case 'menu':
                setIsMenuOpen(false);
                break;
            case 'user':
                // Aquí puedes agregar la lógica para el menú de usuario si lo necesitas
                break;
        }
        setIsModalLocked(false);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleMouseEnter = () => {
        if (!isModalLocked && !isCartOpen) {
            setShowMiniCart(true);
        }
    };

    const handleMouseLeave = (event: React.MouseEvent) => {
        const relatedTarget = event.relatedTarget as HTMLElement;
        if (!miniCartRef.current?.contains(relatedTarget)) {
            setShowMiniCart(false);
        }
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
                    onClick={() => handleModalOpen('menu')}
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
                            onClick={() => handleModalOpen('cart')}
                            onMouseEnter={handleMouseEnter}
                            className="relative w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:text-amber-600 transition"
                        >
                            <FontAwesomeIcon icon={faShoppingCart} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                        {showMiniCart && !isCartOpen && !isModalLocked && (
                            <div 
                                ref={miniCartRef}
                                onMouseLeave={handleMouseLeave}
                                className="absolute right-0 mt-2"
                            >
                                <MiniCart onClose={() => setShowMiniCart(false)} />
                            </div>
                        )}
                        {isCartOpen && <Cart onClose={() => handleModalClose('cart')} />}
                    </div>

                    {/* Menú de usuario */}
                    <div className="group relative">
                        <button 
                            onClick={() => handleModalOpen('user')}
                            className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:text-amber-600 transition ${user ? 'text-amber-200' : 'text-amber-900'}`}
                        >
                            <FontAwesomeIcon icon={faUser} />
                        </button>
                        <div className="absolute right-0 w-44 bg-amber-400 shadow-lg py-2 text-gray-800 hidden group-hover:block z-10 rounded-lg">
                            {user ? (
                                <>
                                    {/* Enlace al perfil del usuario */}
                                    <NavLink to="/profile" className="block px-4 py-2 font-bold uppercase hover:bg-amber-500">Perfil</NavLink>
                                    {/* Enlace al historial de pedidos */}
                                    <NavLink to="/pedidos" className="block px-4 py-2 font-bold uppercase hover:bg-amber-500">Pedidos</NavLink>
                                    {/* Botón para cerrar sesión */}
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
                    <NavLink to="/" className={({ isActive }) => isActive ? "block text-amber-600 underline" : "block hover:text-amber-600 transition"} onClick={() => handleModalClose('menu')}>Inicio</NavLink>
                    <NavLink to="/sobreNosotros" className={({ isActive }) => isActive ? "block text-amber-600 underline" : "block hover:text-amber-600 transition"} onClick={() => handleModalClose('menu')}>Sobre nosotros</NavLink>
                    {user ? (
                        <>
                            <NavLink to="/profile" className="block hover:text-amber-600 transition" onClick={() => handleModalClose('menu')}>Perfil</NavLink>
                            <NavLink to="/pedidos" className="block hover:text-amber-600 transition" onClick={() => handleModalClose('menu')}>Pedidos</NavLink>
                            <button onClick={() => { handleLogout(); handleModalClose('menu'); }} className="w-full text-left hover:cursor-pointer hover:text-amber-600 transition">Cerrar Sesión</button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className="block hover:text-amber-600 transition" onClick={() => handleModalClose('menu')}>Iniciar sesión</NavLink>
                            <NavLink to="/register" className="block hover:text-amber-600 transition" onClick={() => handleModalClose('menu')}>Registrarse</NavLink>
                        </>
                    )}
                </nav>
            )}

            {/* Menú mantenimientos */}
            {user && <MenuMant />}
            
            {/* Menú cliente normal - solo para usuarios no admin */}
            {user && userRole !== 'admin' && <ClienteMenu />}
        </header>
    );
}
