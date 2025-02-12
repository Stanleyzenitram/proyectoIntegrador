import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart, faUser } from "@fortawesome/free-solid-svg-icons";
import { NavLink } from "react-router-dom";

export default function Header() {
    return (
        <div className="h-30 bg-amber-400 grid grid-cols-2 place-content-between">
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
                    Tiles Import & Export S.R.L.
                </NavLink>
            </div>
            {/* Enlaces + Iconos */}
            <nav className="flex  items-center font-medium text-amber-900 uppercase place-content-end h-30">
                <div className="flex items-center justify-end font-bold">
                    <NavLink
                        to="/"
                        className= {({isActive}) => isActive? "text-amber-600 underline mr-6" :  "mr-6 hover:text-amber-600 transition"}
                    >
                        Inicio
                    </NavLink>
                    <NavLink
                        to="/sobreNosotros"
                        className= {({isActive}) => isActive? "text-amber-600 underline mr-6" :  "mr-6 hover:text-amber-600 transition"}
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
                        <button className="w-12 h-12 flex items-center justify-center text-2xl text-amber-900 rounded-lg hover:text-amber-600 transition">
                            <FontAwesomeIcon icon={faUser} size="lg" />
                        </button>

                        {/* Menú desplegable */}
                        <div className="absolute right-0 w-52 bg-amber-400 shadow-lg rounded-lg py-2 text-gray-800 hidden group-hover:block z-10">
                            <NavLink
                                to="/login"
                                className="block px-4 py-2 hover:bg-gray-200"
                            >
                                Iniciar sesión
                            </NavLink>
                            <NavLink
                                to="#"
                                className="block px-4 py-2 hover:bg-gray-200"
                            >
                                Registrarse
                            </NavLink>
                            <NavLink
                                to="#"
                                className="block px-4 py-2 hover:bg-gray-200"
                            >
                                Cerrar sesión
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}
