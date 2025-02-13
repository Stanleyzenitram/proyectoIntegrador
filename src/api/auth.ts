import  {supabase}  from "../services/supabase";
import type { Client } from "../types/index";

/**
 * Registra un usuario en Supabase Auth y lo vincula con la tabla `clientes`.
 */
export const signUp = async (client: Client) => {
    try {
        // Crear usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: client.email,
            password: client.password
        });

        if (error) throw error;
        if (!data.user) throw new Error("No se pudo crear el usuario");

        const userId = data.user.id; // UUID generado por Supabase

        // Insertar en la tabla `clientes`
        const { error: clienteError } = await supabase
            .from("clientes")
            .insert([{ 
                uuid: userId, 
                nombre: client.name,
                apellido: client.lastName,
                email: client.email,
                telefono: client.phoneNumber,
                direccion: client.addressDetails,
                tipo_cliente: client.idType,
                rnc: client.idNumber.toString(),
                fecha_registro: new Date()
            }]);

        if (clienteError) throw clienteError;

        return data.user;
    } catch (err) {
        console.error("Error en el registro:", err);
        throw err;
    }
};
