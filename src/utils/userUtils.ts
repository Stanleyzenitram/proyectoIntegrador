import { supabase } from "../services/supabase";

export interface UserType {
    type: 'employee' | 'client' | 'unknown';
    role?: string;
    data?: any;
}

/**
 * Determina el tipo de usuario y su rol basado en su UUID
 * @param userId - El UUID del usuario autenticado
 * @returns Promise<UserType> - El tipo de usuario y su información
 */
export const getUserType = async (userId: string): Promise<UserType> => {
    try {
        // Primero verificar si es un empleado (tabla usuarios)
        const { data: empleadoData, error: empleadoError } = await supabase
            .from("usuarios")
            .select("rol, nombre, apellido, correo")
            .eq("uuid", userId)
            .single();

        if (empleadoData) {
            return {
                type: 'employee',
                role: empleadoData.rol,
                data: empleadoData
            };
        }

        // Si no es empleado, verificar si es un cliente (tabla clientes)
        const { data: clienteData, error: clienteError } = await supabase
            .from("clientes")
            .select("uuid, nombre, apellido, email")
            .eq("uuid", userId)
            .single();

        if (clienteData) {
            return {
                type: 'client',
                role: 'client',
                data: clienteData
            };
        }

        // Si no se encuentra en ninguna tabla
        return {
            type: 'unknown',
            role: undefined,
            data: null
        };

    } catch (error) {
        console.error("Error al determinar el tipo de usuario:", error);
        return {
            type: 'unknown',
            role: undefined,
            data: null
        };
    }
};

/**
 * Verifica si un usuario es administrador
 * @param userId - El UUID del usuario autenticado
 * @returns Promise<boolean> - true si es admin, false en caso contrario
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
    const userType = await getUserType(userId);
    return userType.type === 'employee' && userType.role === 'admin';
};

/**
 * Verifica si un usuario es empleado (admin o mantenimiento)
 * @param userId - El UUID del usuario autenticado
 * @returns Promise<boolean> - true si es empleado, false en caso contrario
 */
export const isEmployee = async (userId: string): Promise<boolean> => {
    const userType = await getUserType(userId);
    return userType.type === 'employee';
};

/**
 * Verifica si un usuario es cliente
 * @param userId - El UUID del usuario autenticado
 * @returns Promise<boolean> - true si es cliente, false en caso contrario
 */
export const isClient = async (userId: string): Promise<boolean> => {
    const userType = await getUserType(userId);
    return userType.type === 'client';
}; 