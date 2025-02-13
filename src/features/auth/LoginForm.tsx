import { faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function LoginForm() {
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
                        name=""
                        id=""
                        className="border-b border-amber-900 my-2 text-amber-900"
                        placeholder="Correo electrónico"
                    />

                    <input
                        type="password"
                        name=""
                        id=""
                        className="border-b border-amber-900 my-2 text-amber-900"
                        placeholder="Contraseña"
                    />

                    <button
                        type="submit"
                        className="bg-amber-400 text-amber-900 font-medium text-2xl py-2 rounded-lg uppercase
                        hover:bg-amber-500 hover: cursor-pointer
                        ">ingresar</button>
                </form>

                {/*   PENDIENTE, TERMINAR LOGIN XD  */}
            </div>

            <div className="flex flex-col items-center mx-auto">
                <h2>¿AÚN NO ERES CLIENTE?</h2>
            </div>
        </>
    );
}
