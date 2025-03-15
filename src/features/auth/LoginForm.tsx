import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { signIn } from "../../api/auth";
import { useNavigate, Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginForm() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [data, setData] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.MouseEvent<HTMLInputElement, MouseEvent>
    ) => {
        e.preventDefault();
        console.log(data);

        try {
            // Llamar a la API para iniciar sesión
            await signIn(data.email, data.password);
            alert("Inicio de sesión exitoso");
            navigate("/profile");
        } catch (error) {
            alert("Credenciales incorrectas");
            console.error("Error en el inicio de sesión:", error);
        }
    };
    return (
        <div className="flex flex-col md:flex-row justify-center items-center min-h-screen bg-gray-100 p-4">
            <div className="flex gap-2.5 flex-col items-center mx-auto shadow-lg p-5 bg-gray-100 rounded-lg w-full max-w-md">
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
                {/* Formulario */}
                <form className="flex flex-col gap-3.5 w-full">
                    <input
                        type="text"
                        name="email"
                        className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none p-2"
                        placeholder="Correo electrónico"
                        value={data.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none p-2"
                        placeholder="Contraseña"
                        value={data.password}
                        onChange={handleChange}
                    />

                    <input
                        type="submit"
                        className="bg-amber-400 text-amber-900 font-medium text-2xl py-2 rounded-lg uppercase
                        hover:bg-amber-500 hover: cursor-pointer"
                        value="Iniciar sesión"
                        onClick={handleSubmit}
                    />

                    <div className="text-center mt-4">
                        <Link to="/reset-password" className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none">
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </form>
            </div>

            <div className="flex flex-col items-start mx-auto mt-10 md:mt-0 md:ml-10 w-full max-w-md">
                <h2 className="text-amber-900 font-medium text-2xl uppercase">
                    ¿AÚN NO ERES CLIENTE?
                </h2>
                <p className="text-amber-900 font-light text-sm text-left text-wrap max-w-sm mt-2">
                    ¿Es esta su primera experiencia de compra con nosotros? Le
                    pediremos que por favor proporcione cierta información para
                    que el pedido sea lo más seguro y fácil posible.
                </p>
                <button
                    className="bg-amber-400 text-amber-900 font-medium text-2xl py-2 mt-10 rounded-lg uppercase
                    hover:bg-amber-500 hover: cursor-pointer p-5 w-full"
                >
                    <NavLink to="/register">Registrarse</NavLink>
                </button>
            </div>
        </div>
    );
}