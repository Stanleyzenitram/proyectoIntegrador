import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";
import Menu from "./Menu";
import { useAuth } from "../hooks/useAuth";

export default function Header() {
    const { user } = useAuth();
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
                    className="text-2xl ml-4  text-amber-900 font-light hover:text-amber-600 transition"
                >
                    <h1>Tiles Import & Export S.R.L.</h1>
                </NavLink>
            </div>
            {/* Enlaces + Iconos */}
            <nav className="flex  items-center font-medium text-amber-900 uppercase place-content-end h-30">
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
                    <button className="w-12 h-12 flex items-center justify-center text-2xl text-amber-900 rounded-lg hover:text-amber-600 transition">
                        <FontAwesomeIcon icon={faShoppingCart} size="lg" />
                    </button>

                    {/* Icono de usuario con menú */}
                    <div className="group relative">
                        {user ? (
                            <button className="w-12 h-12 flex items-center justify-center text-2xl text-amber-200 rounded-lg hover:text-amber-600 transition">
                                <FontAwesomeIcon icon={faUser} size="lg" />
                            </button>
                        ) : (
                            <button className="w-12 h-12 flex items-center justify-center text-2xl text-amber-900 rounded-lg hover:text-amber-600 transition">
                                <FontAwesomeIcon icon={faUser} size="lg" />
                            </button>
                        )}

                        {/* Menú desplegable */}
                        <Menu />
                    </div>
                </div>
            </nav>
        </div>
    );
}
