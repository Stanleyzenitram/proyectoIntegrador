import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

export default function Menu() {
    const { user, logout } = useAuth();
    return (
        <div className="absolute right-0 w-[800px] bg-white shadow-lg py-8 hidden group-hover:block z-10">
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
                        onClick={() => logout()}
                        className="block w-full text-left px-4 py-2 text-amber-900 font-bold uppercase hover:bg-amber-500"
                    >
                        Cerrar Sesion
                    </button>
                </div>
            ) : (
                <div className="flex justify-between p-8 gap-12">
                    {/* Sección de Inicio de Sesión */}
                    <div className="flex flex-col items-center gap-2.5 p-5 bg-gray-100 rounded-lg shadow-lg w-80">
                        <h2 className="uppercase text-amber-900 font-medium text-2xl">
                            Iniciar sesion
                        </h2>
                        <div className="bg-gray-300 w-40 h-40 rounded-full flex justify-center items-center p-3">
                            <FontAwesomeIcon
                                icon={faUser}
                                size="6x"
                                className="text-amber-900"
                            />
                        </div>
                        <NavLink
                            to="/login"
                            className="bg-amber-400 text-amber-900 font-medium text-2xl py-2 rounded-lg uppercase
                            hover:bg-amber-500 hover:cursor-pointer w-full text-center"
                        >
                            Iniciar sesión
                        </NavLink>
                    </div>

                    {/* Sección de Registro */}
                    <div className="flex flex-col items-start justify-center w-80">
                        <h2 className="text-amber-900 font-medium text-2xl uppercase">
                            ¿AÚN NO ERES CLIENTE?
                        </h2>
                        <p className="text-amber-900 font-light text-sm text-left text-wrap mt-4">
                            ¿Es esta su primera experiencia de compra con nosotros? Le
                            pediremos que por favor proporcione cierta información para
                            que el pedido sea lo más seguro y fácil posible.
                        </p>
                        <NavLink
                            to="/register"
                            className="bg-amber-400 text-amber-900 font-medium text-2xl py-2 mt-8 rounded-lg uppercase
                            hover:bg-amber-500 hover:cursor-pointer px-5 self-start"
                        >
                            Registrarse
                        </NavLink>
                    </div>
                </div>
            )}
        </div>
    );
}
