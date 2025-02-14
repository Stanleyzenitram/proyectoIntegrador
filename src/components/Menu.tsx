import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";


export default function Menu() {
    const { user } = useAuth();
    const { logout } = useAuth();
    return (
        <div className="absolute right-0 w-52 bg-amber-400 shadow-lg rounded-lg py-2 text-gray-800 hidden group-hover:block z-10">
            {user ? (
                <div>
                    <NavLink
                        to="/profile"
                        className="block px-4 py-2 hover:bg-gray-200"
                    >
                        Perfil
                    </NavLink>
                    <NavLink
                        to="/pedidos"
                        className="block px-4 py-2 hover:bg-gray-200"
                    >
                        Pedidos
                    </NavLink>
                    <NavLink
                        to="/"
                        className="block px-4 py-2 hover:bg-gray-200"
                    >
                        <button
                        className="w-full text-left uppercase hover:bg-gray-200 cursor-pointer"
                            onClick={() => logout()}
                        >Cerrar sesion</button>
                    </NavLink>
                </div>
            ) : (
                <div>
                    <NavLink
                        to="/login"
                        className="block px-4 py-2 hover:bg-gray-200"
                    >
                        Iniciar sesión
                    </NavLink>
                    <NavLink
                        to="/register"
                        className="block px-4 py-2 hover:bg-gray-200"
                    >
                        Registrarse
                    </NavLink>
                </div>
            )}
        </div>
    );
}
