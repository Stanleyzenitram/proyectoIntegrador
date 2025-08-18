import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { usosService, type UsoConPreferencia, type PreferenciaUso } from '../services/usosService';

export const usePreferenciasUso = () => {
    const [usos, setUsos] = useState<UsoConPreferencia[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Cargar usos disponibles
    const cargarUsos = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Intentar obtener usos existentes
            let usosExistentes = await usosService.obtenerUsos();
            
            // Si no hay usos, crear los por defecto
            if (usosExistentes.length === 0) {
                await usosService.crearUsosPorDefecto();
                usosExistentes = await usosService.obtenerUsos();
            }

            // Obtener usos con preferencias del usuario
            const usosConPreferencia = await usosService.obtenerUsosConPreferencia(user.id);
            setUsos(usosConPreferencia);
        } catch (err) {
            console.error('Error cargando usos:', err);
            setError('Error al cargar los usos disponibles');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Guardar preferencias de uso
    const guardarPreferencias = useCallback(async (usosSeleccionados: Array<{ uso_id: number, prioridad: number }>): Promise<boolean> => {
        if (!user) return false;

        try {
            setLoading(true);
            const success = await usosService.guardarPreferenciasUso(user.id, usosSeleccionados);
            
            if (success) {
                // Recargar usos para actualizar el estado
                await cargarUsos();
            }
            
            return success;
        } catch (err) {
            console.error('Error guardando preferencias:', err);
            setError('Error al guardar las preferencias');
            return false;
        } finally {
            setLoading(false);
        }
    }, [user, cargarUsos]);

    // Cambiar prioridad de un uso
    const cambiarPrioridad = useCallback((usoId: number, nuevaPrioridad: number) => {
        setUsos(prev => prev.map(uso => 
            uso.id === usoId 
                ? { ...uso, prioridad: nuevaPrioridad }
                : uso
        ));
    }, []);

    // Seleccionar/deseleccionar un uso
    const toggleUso = useCallback((usoId: number) => {
        setUsos(prev => prev.map(uso => 
            uso.id === usoId 
                ? { ...uso, seleccionado: !uso.seleccionado, prioridad: !uso.seleccionado ? 3 : 0 }
                : uso
        ));
    }, []);

    // Obtener usos seleccionados con prioridad
    const obtenerUsosSeleccionados = useCallback(() => {
        return usos
            .filter(uso => uso.seleccionado)
            .map(uso => ({
                uso_id: uso.id!,
                prioridad: uso.prioridad || 3
            }));
    }, [usos]);

    // Cargar usos al montar el componente
    useEffect(() => {
        cargarUsos();
    }, [cargarUsos]);

    return {
        usos,
        loading,
        error,
        cargarUsos,
        guardarPreferencias,
        cambiarPrioridad,
        toggleUso,
        obtenerUsosSeleccionados
    };
};
