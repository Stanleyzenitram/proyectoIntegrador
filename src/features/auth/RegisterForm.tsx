import { useState } from "react";
import InputForm from "../../components/InputForm";
import { useNavigate } from "react-router-dom";
import { signUp } from "../../api/auth";
import type { Client } from "../../types/index";

export default function RegisterForm() {
    const [client, setClient] = useState<Client>({
        name: "",
        lastName: "",
        phoneNumber: "",
        sector: "",
        postalCode: 0,
        addressDetails: "",
        idType: "",
        idNumber: 0,
        email: "",
        password: "",
        confirmPassword: "",
    });

    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setClient((prevClient) => ({
            ...prevClient,
            [name]: type === "number" ? (value === "" ? "" : +value) : value,
        }));
    };

    // Validaciones
    const passwordConfirmation = () => client.password === client.confirmPassword;
    const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isValidPassword = (password: string) => password.length >= 6;
    const areAllFieldsFilled = (client: Client) => 
        Object.values(client).every(value => value !== "" && value !== 0);

    // Enviar datos
    const handleSubmit = async (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!areAllFieldsFilled(client)) {
            setError("Por favor, complete todos los campos.");
            setLoading(false);
            return;
        }
        if (!isValidEmail(client.email)) {
            setError("Correo electrónico inválido.");
            setLoading(false);
            return;
        }
        if (!isValidPassword(client.password)) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            setLoading(false);
            return;
        }
        if (!passwordConfirmation()) {
            setError("Las contraseñas no coinciden.");
            setLoading(false);
            return;
        }

        try {
            await signUp(client);
            alert("Registro exitoso, confirme su correo electrónico antes de iniciar sesion.");
            navigate("/login");
        } catch (err) {
            setError("Error en el registro.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-screen w-full max-w-7xl mx-auto">
            {/* Sección Datos Personales */}
            <div className="w-full lg:w-1/2 p-6 md:p-10 lg:pl-20">
                <div className="max-w-md mx-auto">
                    <h2 className="uppercase text-amber-900 font-medium text-xl md:text-2xl mb-4">
                        Creando una nueva cuenta
                    </h2>
                    <h3 className="uppercase text-amber-900 font-light text-lg md:text-2xl mb-8">
                        Datos personales
                    </h3>

                    <form className="flex flex-col gap-4">
                        <InputForm name="name" type="text" placeholder="Nombre" value={client.name} onChange={handleChange} />
                        <InputForm name="lastName" type="text" placeholder="Apellido" value={client.lastName} onChange={handleChange} />
                        <InputForm name="phoneNumber" type="tel" placeholder="Teléfono" value={client.phoneNumber} onChange={handleChange} />
                        <InputForm name="sector" type="text" placeholder="Sector" value={client.sector} onChange={handleChange} />
                        <InputForm name="postalCode" type="number" placeholder="Código Postal" value={client.postalCode || ""} onChange={handleChange} />
                        <InputForm name="addressDetails" type="text" placeholder="Detalles de dirección" value={client.addressDetails} onChange={handleChange} />
                        <InputForm name="idType" type="text" placeholder="Tipo de documento" value={client.idType} onChange={handleChange} />
                        <InputForm name="idNumber" type="number" placeholder="Número de documento" value={client.idNumber || ""} onChange={handleChange} />
                    </form>
                </div>
            </div>

            {/* Sección Datos de Login */}
            <div className="w-full lg:w-1/2 bg-gray-200 p-6 md:p-10 lg:px-20">
                <div className="max-w-md mx-auto">
                    <h3 className="uppercase text-amber-900 font-medium text-xl md:text-2xl mb-4">
                        Ingrese sus datos de inicio de sesión
                    </h3>
                    <p className="text-amber-900 font-light text-sm md:text-base mb-8">
                        Ingrese su correo electrónico y elija una contraseña para crear una cuenta.
                    </p>

                    <form className="flex flex-col gap-4">
                        <InputForm name="email" type="email" placeholder="Email" value={client.email} onChange={handleChange} />
                        <InputForm name="password" type="password" placeholder="Contraseña" value={client.password} onChange={handleChange} />
                        <InputForm name="confirmPassword" type="password" placeholder="Confirmar contraseña" value={client.confirmPassword} onChange={handleChange} />
                        
                        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                        <input
                            type="submit"
                            className="bg-amber-400 text-amber-900 font-light text-lg md:text-xl p-3 rounded-lg uppercase hover:bg-amber-500 cursor-pointer transition-colors duration-200"
                            value={loading ? "Registrando..." : "Registrarse"}
                            onClick={handleSubmit}
                            disabled={loading}
                        />
                    </form>
                </div>
            </div>
        </div>
    );
}