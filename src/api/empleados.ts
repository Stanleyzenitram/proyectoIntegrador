import { supabase } from "../services/supabase";
import type { Empleado } from "../types/index";

/**
 * Registra un usuario en Supabase Auth y lo vincula con la tabla `usuarios(empleados)`.
 */
export const crearEmpleado = async (empleado: Empleado) => {
    try {
        // Crear usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({
            email: empleado.email,
            password: empleado.password,
        });

        if (error) throw error;
        if (!data.user) throw new Error("No se pudo crear el usuario");

        const userId = data.user.id; // UUID generado por Supabase

        // Insertar en la tabla `usuarios(empleados)`
        const { error: empleadoError } = await supabase
            .from("usuarios")
            .insert([
                {
                    uuid: userId,
                    nombre: empleado.name,
                    apellido: empleado.lastName,
                    correo: empleado.email,
                    telefono: empleado.phoneNumber,
                    rol: empleado.rol,
                    estado: true,
                    cedula: empleado.cedula,
                },
            ]);

        if (empleadoError) throw empleadoError;
        return data.user;
    } catch (err) {
        console.error("Error en el registro:", err);
        throw err;
    }
};

export const fetchEmpleados = async () => {
    const { data, error } = await supabase.from("usuarios").select("*");

    if (error) {
        console.error("Error al obtener empleados:", error);
        throw error;
    }

    return data || [];
};

