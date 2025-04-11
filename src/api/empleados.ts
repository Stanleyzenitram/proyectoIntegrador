import { supabase } from "../services/supabase";
import type { Empleado } from "../types/index";

/**
 * Registra un usuario en Supabase Auth y lo vincula con la tabla `usuarios`.
 */
export const crearEmpleado = async (empleado: Empleado) => {
    try {
        console.log("✅ Creando usuario en Auth...");
        const { data, error } = await supabase.auth.signUp({
            email: empleado.email,
            password: empleado.password,
            options: {
                data: {
                    name: empleado.name,
                    lastName: empleado.lastName,
                    phoneNumber: empleado.phoneNumber,
                    rol: empleado.rol,
                    cedula: empleado.cedula
                }
            }
        });

        if (error) {
            console.error("❌ Error en auth.signUp:", error.message);
            throw new Error("El correo ya está registrado o hubo un problema con Auth.");
        }

        if (!data.user) {
            throw new Error("No se pudo obtener el UUID del usuario.");
        }

        const userId = data.user.id;
        console.log("✅ Usuario creado en Auth con UUID:", userId);

        // Esperar un momento para asegurar que el usuario de auth esté completamente creado
        await new Promise(resolve => setTimeout(resolve, 1000));

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
            // Si hay error al insertar, intentamos eliminar el usuario de auth
            await supabase.auth.admin.deleteUser(userId);
            throw new Error("Hubo un problema al registrar el empleado.");
        }

        console.log("✅ Usuario registrado correctamente en empleados.");
        return data.user;
    } catch (err: any) {
        console.error("🚨 Error en el registro:", err.message || err);
        throw err;
    }
};

/**
 * Obtiene la lista de empleados desde la base de datos.
 */
export const fetchEmpleados = async () => {
    try {
        const { data, error } = await supabase.from("usuarios").select("*");

        if (error) {
            console.error("❌ Error al obtener empleados:", error.message);
            throw new Error("No se pudo obtener la lista de empleados.");
        }

        return data || [];
    } catch (err: any) {
        console.error("🚨 Error en fetchEmpleados:", err.message || err);
        throw err;
    }
};
