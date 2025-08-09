import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { RecomendacionesService } from '../services/recomendacionesService';
import {
    PreferenciasUsuario,
    HistorialNavegacion,
    ComportamientoCompra,
    ProductoRecomendado,
    ProductoConScore,
    EstadisticasUsuario
} from '../types/recomendaciones';

export const useRecomendaciones = () => {
    const { user } = useAuth();
    
    // Estados para preferencias
    const [preferencias, setPreferencias] = useState<PreferenciasUsuario | null>(null);
    const [loadingPreferencias, setLoadingPreferencias] = useState(false);
    
    // Estados para recomendaciones
    const [recomendaciones, setRecomendaciones] = useState<ProductoConScore[]>([]);
    const [loadingRecomendaciones, setLoadingRecomendaciones] = useState(false);
    
    // Estados para estadísticas
    const [estadisticas, setEstadisticas] = useState<EstadisticasUsuario | null>(null);
    const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);
    
    // Estados para historial
    const [historial, setHistorial] = useState<HistorialNavegacion[]>([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);

    // ===== PREFERENCIAS =====
    
    /**
     * Cargar preferencias del usuario
     */
    const cargarPreferencias = useCallback(async () => {
        if (!user?.id) return;
        
        setLoadingPreferencias(true);
        try {
            const data = await RecomendacionesService.obtenerPreferencias(user.id);
            setPreferencias(data);
        } catch (error) {
            console.error('Error al cargar preferencias:', error);
        } finally {
            setLoadingPreferencias(false);
        }
    }, [user?.id]);

    /**
     * Guardar preferencias del usuario
     */
    const guardarPreferencias = useCallback(async (nuevasPreferencias: PreferenciasUsuario) => {
        if (!user?.id) return false;
        
        try {
            const success = await RecomendacionesService.guardarPreferencias({
                ...nuevasPreferencias,
                usuario_id: user.id
            });
            
            if (success) {
                setPreferencias(nuevasPreferencias);
                // Recargar recomendaciones después de cambiar preferencias
                await cargarRecomendaciones();
            }
            
            return success;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            return false;
        }
    }, [user?.id, cargarPreferencias]);

    // ===== RECOMENDACIONES =====
    
    /**
     * Cargar recomendaciones para el usuario
     */
    const cargarRecomendaciones = useCallback(async (limit: number = 10) => {
        if (!user?.id) return;
        
        setLoadingRecomendaciones(true);
        try {
            const data = await RecomendacionesService.generarRecomendaciones(user.id, limit);
            setRecomendaciones(data);
        } catch (error) {
            console.error('Error al cargar recomendaciones:', error);
        } finally {
            setLoadingRecomendaciones(false);
        }
    }, [user?.id]);

    /**
     * Marcar recomendación como vista
     */
    const marcarRecomendacionVista = useCallback(async (recomendacionId: number) => {
        if (!user?.id) return false;
        
        try {
            return await RecomendacionesService.marcarRecomendacionVista(recomendacionId, user.id);
        } catch (error) {
            console.error('Error al marcar como vista:', error);
            return false;
        }
    }, [user?.id]);

    /**
     * Marcar recomendación como clickeada
     */
    const marcarRecomendacionClickeada = useCallback(async (recomendacionId: number) => {
        if (!user?.id) return false;
        
        try {
            return await RecomendacionesService.marcarRecomendacionClickeada(recomendacionId, user.id);
        } catch (error) {
            console.error('Error al marcar como clickeada:', error);
            return false;
        }
    }, [user?.id]);

    // ===== HISTORIAL Y COMPORTAMIENTO =====
    
    /**
     * Registrar vista de producto
     */
    const registrarVistaProducto = useCallback(async (
        productoId: number, 
        accion: HistorialNavegacion['accion'] = 'vista',
        tiempoVista?: number
    ) => {
        if (!user?.id) return false;
        
        try {
            const success = await RecomendacionesService.registrarVistaProducto(
                user.id, 
                productoId, 
                accion, 
                tiempoVista
            );
            
            if (success) {
                // Recargar historial y recomendaciones
                await Promise.all([
                    cargarHistorial(),
                    cargarRecomendaciones()
                ]);
            }
            
            return success;
        } catch (error) {
            console.error('Error al registrar vista:', error);
            return false;
        }
    }, [user?.id, cargarHistorial, cargarRecomendaciones]);

    /**
     * Registrar comportamiento de compra
     */
    const registrarComportamiento = useCallback(async (
        comportamiento: Omit<ComportamientoCompra, 'id' | 'fecha_accion' | 'usuario_id'>
    ) => {
        if (!user?.id) return false;
        
        try {
            const success = await RecomendacionesService.registrarComportamiento({
                ...comportamiento,
                usuario_id: user.id
            });
            
            if (success) {
                // Recargar estadísticas y recomendaciones
                await Promise.all([
                    cargarEstadisticas(),
                    cargarRecomendaciones()
                ]);
            }
            
            return success;
        } catch (error) {
            console.error('Error al registrar comportamiento:', error);
            return false;
        }
    }, [user?.id, cargarEstadisticas, cargarRecomendaciones]);

    /**
     * Cargar historial de navegación
     */
    const cargarHistorial = useCallback(async (limit: number = 50) => {
        if (!user?.id) return;
        
        setLoadingHistorial(true);
        try {
            const data = await RecomendacionesService.obtenerHistorialNavegacion(user.id, limit);
            setHistorial(data);
        } catch (error) {
            console.error('Error al cargar historial:', error);
        } finally {
            setLoadingHistorial(false);
        }
    }, [user?.id]);

    // ===== ESTADÍSTICAS =====
    
    /**
     * Cargar estadísticas del usuario
     */
    const cargarEstadisticas = useCallback(async () => {
        if (!user?.id) return;
        
        setLoadingEstadisticas(true);
        try {
            const data = await RecomendacionesService.obtenerEstadisticasUsuario(user.id);
            setEstadisticas(data);
        } catch (error) {
            console.error('Error al cargar estadísticas:', error);
        } finally {
            setLoadingEstadisticas(false);
        }
    }, [user?.id]);

    // ===== EFECTOS =====
    
    useEffect(() => {
        if (user?.id) {
            // Cargar datos iniciales
            Promise.all([
                cargarPreferencias(),
                cargarRecomendaciones(),
                cargarHistorial(),
                cargarEstadisticas()
            ]);
        }
    }, [user?.id, cargarPreferencias, cargarRecomendaciones, cargarHistorial, cargarEstadisticas]);

    // ===== FUNCIONES DE UTILIDAD =====
    
    /**
     * Obtener productos recomendados filtrados por tipo
     */
    const obtenerRecomendacionesPorTipo = useCallback((tipo: string) => {
        return recomendaciones.filter(r => r.tipo_recomendacion === tipo);
    }, [recomendaciones]);

    /**
     * Obtener productos de alta preferencia
     */
    const obtenerAltaPreferencia = useCallback(() => {
        return recomendaciones.filter(r => r.score > 0.7);
    }, [recomendaciones]);

    /**
     * Verificar si un producto está en el historial
     */
    const productoEnHistorial = useCallback((productoId: number) => {
        return historial.some(h => h.producto_id === productoId);
    }, [historial]);

    /**
     * Obtener frecuencia de vista de un producto
     */
    const obtenerFrecuenciaProducto = useCallback((productoId: number) => {
        return historial.filter(h => h.producto_id === productoId).length;
    }, [historial]);

    return {
        // Estados
        preferencias,
        recomendaciones,
        estadisticas,
        historial,
        loadingPreferencias,
        loadingRecomendaciones,
        loadingEstadisticas,
        loadingHistorial,
        
        // Funciones de preferencias
        cargarPreferencias,
        guardarPreferencias,
        
        // Funciones de recomendaciones
        cargarRecomendaciones,
        marcarRecomendacionVista,
        marcarRecomendacionClickeada,
        
        // Funciones de historial y comportamiento
        registrarVistaProducto,
        registrarComportamiento,
        cargarHistorial,
        
        // Funciones de estadísticas
        cargarEstadisticas,
        
        // Funciones de utilidad
        obtenerRecomendacionesPorTipo,
        obtenerAltaPreferencia,
        productoEnHistorial,
        obtenerFrecuenciaProducto
    };
};
