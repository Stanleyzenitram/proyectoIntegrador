import { supabase } from '../services/supabase';

/**
 * Verifica si la tabla de notificaciones existe
 * @returns true si la tabla existe, false en caso contrario
 */
export const verificarTablaNotificaciones = async () => {
    try {
        const { error } = await supabase
            .from('notificaciones')
            .select('id')
            .limit(1);
        
        if (error && error.message.includes('does not exist')) {
            console.error('La tabla notificaciones no existe:', error);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error al verificar la tabla:', error);
        return false;
    }
};

/**
 * Obtiene las notificaciones de un usuario
 * @param idUsuario - ID del usuario (número entero)
 * @param limit - Límite de notificaciones a obtener (por defecto 20)
 * @returns Lista de notificaciones
 */
export const obtenerNotificaciones = async (idUsuario: number, limit = 20) => {
    try {
        // Verificar si la tabla existe
        const tablaExiste = await verificarTablaNotificaciones();
        if (!tablaExiste) {
            return { data: [], error: 'La tabla de notificaciones no está configurada.' };
        }
        
        const { data, error } = await supabase
            .from('notificaciones')
            .select('*')
            .eq('id_usuario', idUsuario)
            .order('fecha', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        
        return { data, error: null };
    } catch (error: any) {
        console.error('Error al obtener notificaciones:', error);
        return { data: null, error: error.message || 'Error al obtener notificaciones' };
    }
};

/**
 * Marca una notificación como leída
 * @param idNotificacion - ID de la notificación
 * @returns Resultado de la operación
 */
export const marcarNotificacionComoLeida = async (idNotificacion: number) => {
    try {
        // Verificar si la tabla existe
        const tablaExiste = await verificarTablaNotificaciones();
        if (!tablaExiste) {
            return { success: false, data: null, error: 'La tabla de notificaciones no está configurada.' };
        }
        
        const { data, error } = await supabase
            .from('notificaciones')
            .update({ leido: true })
            .eq('id', idNotificacion)
            .select();
        
        if (error) throw error;
        
        return { success: true, data, error: null };
    } catch (error: any) {
        console.error('Error al marcar notificación como leída:', error);
        return { success: false, data: null, error: error.message || 'Error al marcar notificación como leída' };
    }
};

/**
 * Marca todas las notificaciones de un usuario como leídas
 * @param idUsuario - ID del usuario (número entero)
 * @returns Resultado de la operación
 */
export const marcarTodasComoLeidas = async (idUsuario: number) => {
    try {
        // Verificar si la tabla existe
        const tablaExiste = await verificarTablaNotificaciones();
        if (!tablaExiste) {
            return { success: false, data: null, error: 'La tabla de notificaciones no está configurada.' };
        }
        
        const { data, error } = await supabase
            .from('notificaciones')
            .update({ leido: true })
            .eq('id_usuario', idUsuario)
            .eq('leido', false)
            .select();
        
        if (error) throw error;
        
        return { success: true, data, error: null };
    } catch (error: any) {
        console.error('Error al marcar todas las notificaciones como leídas:', error);
        return { success: false, data: null, error: error.message || 'Error al marcar todas las notificaciones como leídas' };
    }
};

/**
 * Crea una nueva notificación
 * @param notificacion - Datos de la notificación
 * @returns Resultado de la operación
 */
export const crearNotificacion = async (notificacion: {
    id_usuario: number;
    tipo: string;
    titulo: string;
    mensaje: string;
}) => {
    try {
        // Verificar si la tabla existe
        const tablaExiste = await verificarTablaNotificaciones();
        if (!tablaExiste) {
            return { success: false, data: null, error: 'La tabla de notificaciones no está configurada.' };
        }
        
        const { data, error } = await supabase
            .from('notificaciones')
            .insert([
                {
                    ...notificacion,
                    leido: false,
                    fecha: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        return { success: true, data, error: null };
    } catch (error: any) {
        console.error('Error al crear notificación:', error);
        return { success: false, data: null, error: error.message || 'Error al crear notificación' };
    }
};

/**
 * Elimina una notificación
 * @param idNotificacion - ID de la notificación
 * @returns Resultado de la operación
 */
export const eliminarNotificacion = async (idNotificacion: number) => {
    try {
        // Verificar si la tabla existe
        const tablaExiste = await verificarTablaNotificaciones();
        if (!tablaExiste) {
            return { success: false, data: null, error: 'La tabla de notificaciones no está configurada.' };
        }
        
        const { data, error } = await supabase
            .from('notificaciones')
            .delete()
            .eq('id', idNotificacion)
            .select();
        
        if (error) throw error;
        
        return { success: true, data, error: null };
    } catch (error: any) {
        console.error('Error al eliminar notificación:', error);
        return { success: false, data: null, error: error.message || 'Error al eliminar notificación' };
    }
};

/**
 * Obtiene el número de notificaciones no leídas de un usuario
 * @param idUsuario - ID del usuario (número entero)
 * @returns Número de notificaciones no leídas
 */
export const obtenerNumeroNotificacionesNoLeidas = async (idUsuario: number) => {
    try {
        // Verificar si la tabla existe
        const tablaExiste = await verificarTablaNotificaciones();
        if (!tablaExiste) {
            return { count: 0, error: 'La tabla de notificaciones no está configurada.' };
        }
        
        const { count, error } = await supabase
            .from('notificaciones')
            .select('*', { count: 'exact', head: true })
            .eq('id_usuario', idUsuario)
            .eq('leido', false);
        
        if (error) throw error;
        
        return { count: count || 0, error: null };
    } catch (error: any) {
        console.error('Error al obtener número de notificaciones no leídas:', error);
        return { count: 0, error: error.message || 'Error al obtener número de notificaciones no leídas' };
    }
}; 