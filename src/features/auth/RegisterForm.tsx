import { useState } from "react";
import InputForm from "../../components/InputForm";
import { useNavigate } from "react-router-dom";
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

    const handleChange = (
        e:
            | React.ChangeEvent<HTMLInputElement>
            | React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        setClient((prevClient) => ({
            ...prevClient,
            [name]: type === "number" ? (value === "" ? "" : +value) : value,
        }));
    };

    //validations//////////////////////////////////////////////////////////////////////////////////////////////////
    const passwordConfirmation = () => {
        return client.password === client.confirmPassword;
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    
    const isValidPassword = (password: string) => {
        return password.length >= 6;
    };
    
    const areAllFieldsFilled = (client: Client) => {
        return Object.values(client).every(value => value !== "" && value !== 0);
    };
    
    //submit//////////////////////////////////////////////////////////////////////////////////////////////////
    const handleSubmit = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
        e.preventDefault();
    
        if (!areAllFieldsFilled(client)) {
            alert("Por favor, complete todos los campos antes de registrarse.");
            return;
        }
    
        if (!isValidEmail(client.email)) {
            alert("Por favor, ingrese un correo electrónico válido.");
            return;
        }
    
        if (!isValidPassword(client.password)) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
    
        if (!passwordConfirmation()) {
            alert("Las contraseñas no coinciden.");
            return;
        }
    
        console.log("Registro exitoso");
    };
    

    console.log(client);
    return (
        <>
            <div className="flex gap-2.5 relative h-full w-full flex-col py-20 pl-20 items-start mx-auto">
                <h2 className="uppercase text-amber-900 font-medium text-2xl">
                    Creando una nueva cuenta
                </h2>
                <h3 className="uppercase text-amber-900 font-light text-2xl mb-8">
                    Datos personales
                </h3>

                <form className="flex flex-col w-80">
                    {/*Nombre */}
                    <InputForm
                        name="name"
                        type="text"
                        placeholder="Nombre"
                        value={client.name}
                        onChange={handleChange}
                    />
                    {/*Apellido */}
                    <InputForm
                        name="lastName"
                        type="text"
                        placeholder="Apellido"
                        value={client.lastName}
                        onChange={handleChange}
                    />
                    {/*Telefono */}
                    <InputForm
                        name="phoneNumber"
                        type="number"
                        placeholder="Telefono"
                        value={client.phoneNumber}
                        onChange={handleChange}
                    />
                    {/*Sector */}
                    <InputForm
                        name="sector"
                        type="text"
                        placeholder="Sector"
                        value={client.sector}
                        onChange={handleChange}
                    />
                    {/*Codigo Postal */}
                    <InputForm
                        name="postalCode"
                        type="number"
                        placeholder="Codigo Postal"
                        value={client.postalCode || ""}
                        onChange={handleChange}
                    />
                    {/*Detalles de la direccion */}
                    <InputForm
                        name="addressDetails"
                        type="text"
                        placeholder="Detalles de la direccion"
                        value={client.addressDetails}
                        onChange={handleChange}
                    />
                    {/*Tipo de documento */}
                    <InputForm
                        name="idType"
                        type="text"
                        placeholder="Tipo de documento"
                        value={client.idType}
                        onChange={handleChange}
                    />
                    {/*Numero de documento */}
                    <InputForm
                        name="idNumber"
                        type="number"
                        placeholder="Numero de documento"
                        value={client.idNumber || ""}
                        onChange={handleChange}
                    />
                </form>
            </div>

            <div className="bg-gray-200 py-20 relative h-full w-full flex flex-col mx-auto items-start px-15">
                <h3 className="uppercase text-amber-900 font-medium text-2xl ">
                    ingrese sus datos de inicio de sesion
                </h3>
                <p className="text-amber-900 font-light mb-8">
                    Ingrese su dirección de correo electrónico y elija una
                    contraseña para crear una cuenta.
                </p>

                <form className="flex justify-start items-start  flex-col w-80">
                    {/*Email */}
                    <InputForm
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={client.email}
                        onChange={handleChange}
                    />
                    {/*Contraseña */}
                    <InputForm
                        name="password"
                        type="password"
                        placeholder="Contraseña"
                        value={client.password}
                        onChange={handleChange}
                    />
                    {/*Confirmar contraseña */}
                    <InputForm
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirmar contraseña"
                        value={client.confirmPassword}
                        onChange={handleChange}
                    />

                    <input
                        type="submit"
                        className="bg-amber-400 text-amber-900 font-medium text-2xl p-3 px-4 rounded-lg uppercase
                        hover:bg-amber-500 hover: cursor-pointer"
                        value="Registrarse"
                        onClick={handleSubmit}
                    />
                </form>
            </div>
        </>
    );
}
