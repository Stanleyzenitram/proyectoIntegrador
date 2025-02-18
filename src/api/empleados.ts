import { supabase } from "../services/supabase";
import type { Empleado } from "../types/index";

/**
 * Registra un usuario en Supabase Auth y lo vincula con la tabla `usuarios(empleados)`.
 */
export const crearEmpleado = async (empleado: Empleado) => {
    try {
        console.log("🔍 Verificando si el correo ya existe en auth.users...");
        const { data: existingAuthUser, error: authError } = await supabase
            .from("auth.users")
            .select("id")
            .eq("email", empleado.email);

        if (authError) {
            console.error("❌ Error al verificar en auth.users:", authError.message);
            throw authError;
        }

        if (existingAuthUser.length > 0) {
            console.warn("⚠️ El correo ya existe en auth.users:", empleado.email);
            throw new Error("El correo ya está registrado en el sistema.");
        }

        console.log("🔍 Verificando si el correo ya existe en la tabla usuarios...");
        const { data: existingUser, error: fetchError } = await supabase
            .from("usuarios")
            .select("uuid")
            .eq("correo", empleado.email);

        if (fetchError) {
            console.error("❌ Error al verificar en usuarios:", fetchError.message);
            throw fetchError;
        }

        if (existingUser.length > 0) {
            console.warn("⚠️ El correo ya existe en empleados:", empleado.email);
            throw new Error("El correo ya está registrado en empleados.");
        }

        console.log("✅ Creando usuario en auth.signUp...");
        const { data, error } = await supabase.auth.signUp({
            email: empleado.email,
            password: empleado.password,
        });

        if (error) {
            console.error("❌ Error en auth.signUp:", error.message);
            throw error;
        }

        if (!data.user) {
            console.error("❌ No se pudo crear el usuario en Auth.");
            throw new Error("No se pudo crear el usuario en Auth.");
        }

        const userId = data.user.id;
        console.log("✅ Usuario creado en Auth con UUID:", userId);

        console.log("📝 Insertando usuario en la tabla usuarios...");
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

        if (empleadoError) {
            console.error("❌ Error al insertar en usuarios:", empleadoError.message);
            throw empleadoError;
        }

        console.log("✅ Usuario registrado correctamente en empleados.");
        return data.user;
    } catch (err) {
        console.error("🚨 Error en el registro:", err.message || err);
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
