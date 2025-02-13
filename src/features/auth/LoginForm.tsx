import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { signIn } from "../../api/auth";
import type { Client } from "../../types/index";
import { useNavigate } from "react-router-dom";

export default function LoginForm() {
    
    const navigate = useNavigate();

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
            navigate("/");
        } catch (error) {
            alert("Credenciales incorrectas");
            console.error("Error en el inicio de sesión:", error);
        }
    };
    return (
        <>
            <div className="flex gap-2.5 flex-col items-center mx-auto">
                <h2 className="uppercase text-amber-900 font-medium text-2xl">
                    Iniciar sesion
                </h2>
                <div className="bg-gray-300 w-40 h-40 rounded-full flex justify-center items-center p-3">
                    <FontAwesomeIcon
                        icon={faUser}
                        size="6x"
                        className="text-amber-900 fo"
                    />
                </div>
                {/* Formulario */}
                <form className="flex flex-col gap-3.5 w-80">
                    <input
                        type="text"
                        name="email"
                        className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none"
                        placeholder="Correo electrónico"
                        value={data.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        className="border-b border-amber-900 my-2 text-amber-900 focus:outline-none"
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
                </form>

                {/*   PENDIENTE, TERMINAR LOGIN XD  */}
            </div>

            <div className="flex flex-col items-center mx-auto">
                <h2>¿AÚN NO ERES CLIENTE?</h2>
            </div>
        </>
    );
}
