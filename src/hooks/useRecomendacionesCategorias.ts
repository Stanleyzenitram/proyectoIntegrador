import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';
import { 
    generarRecomendacionesPorCategorias,
    ProductoRecomendadoCategorizado,
    cargarPreferenciasCategorias
} from '../utils/recomendacionesCategorias';
import { PreferenciasCategorizadas } from '../utils/preferenciasCategorias';

export const useRecomendacionesCategorias = () => {
    const [productosRecomendados, setProductosRecomendados] = useState<ProductoRecomendadoCategorizado[]>([]);
    const [preferencias, setPreferencias] = useState<PreferenciasCategorizadas | null>(null);
    const [loading, setLoading] = useState(false);
    const [loadingPreferencias, setLoadingPreferencias] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    // Cargar preferencias del usuario
    const cargarPreferencias = useCallback(async () => {
        if (!user) return null;

        try {
            setLoadingPreferencias(true);
            setError(null);

            // Obtener ID del cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            if (clienteError || !clienteData) {
                throw new Error('No se pudo obtener información del cliente');
            }

            const clienteId = clienteData.id_cliente;

            // Cargar preferencias categorizadas  
            const { data: prefsCategorizadas, error: errorPrefs } = await supabase
                .from('preferencias_categorias')
                .select('*')
                .eq('idclientes', clienteId)
                .single();

            if (errorPrefs && errorPrefs.code !== 'PGRST116') {
                throw errorPrefs;
            }
            setPreferencias(prefsCategorizadas);

            return prefsCategorizadas;
        } catch (error) {
            console.error('Error al cargar preferencias:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
            return null;
        } finally {
            setLoadingPreferencias(false);
        }
    }, [user]);

    // Generar recomendaciones
    const generarRecomendaciones = useCallback(async (limite: number = 12) => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Obtener ID del cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            if (clienteError || !clienteData) {
                throw new Error('No se pudo obtener información del cliente');
            }

            const clienteId = clienteData.id_cliente;

            // Generar recomendaciones basadas en categorías
            const recomendaciones = await generarRecomendacionesPorCategorias(clienteId, limite);
            setProductosRecomendados(recomendaciones);

        } catch (error) {
            console.error('Error al generar recomendaciones:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Guardar preferencias
    const guardarPreferencias = useCallback(async (nuevasPreferencias: PreferenciasCategorizadas): Promise<boolean> => {
        if (!user) return false;

        try {
            setLoadingPreferencias(true);

            // Obtener ID del cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            if (clienteError || !clienteData) {
                throw new Error('No se pudo obtener información del cliente');
            }

            const datosCompletos = {
                ...nuevasPreferencias,
                idclientes: clienteData.id_cliente, // Nota: columna en minúscula según BD
                fecha_actualizacion: new Date().toISOString()
            };

            // Verificar si ya existen preferencias para este cliente
            const { data: preferenciaExistente } = await supabase
                .from('preferencias_categorias')
                .select('id')
                .eq('idclientes', clienteData.id_cliente)
                .single();

            if (preferenciaExistente) {
                // Actualizar preferencias existentes
                const { error } = await supabase
                    .from('preferencias_categorias')
                    .update(datosCompletos)
                    .eq('idclientes', clienteData.id_cliente);

                if (error) throw error;
            } else {
                // Insertar nuevas preferencias
                const { error } = await supabase
                    .from('preferencias_categorias')
                    .insert([datosCompletos]);

                if (error) throw error;
            }

            // Actualizar estado local
            setPreferencias(datosCompletos);

            // Regenerar recomendaciones con las nuevas preferencias
            await generarRecomendaciones();

            return true;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            setError(error instanceof Error ? error.message : 'Error al guardar preferencias');
            return false;
        } finally {
            setLoadingPreferencias(false);
        }
    }, [user, generarRecomendaciones]);

    // Obtener recomendaciones por categoría específica
    const obtenerRecomendacionesPorCategoria = useCallback(async (tipo: 'color' | 'estilo' | 'material' | 'precio', categoriaId: string, limite: number = 8) => {
        if (!user) return [];

        try {
            const { data: clienteData } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            if (!clienteData) return [];

            // Crear preferencias temporales con solo la categoría especificada
            const preferenciasTempo: PreferenciasCategorizadas = {
                idClientes: clienteData.id_cliente,
                fecha_actualizacion: new Date().toISOString()
            };

            // Asignar la categoría específica
            switch (tipo) {
                case 'color':
                    preferenciasTempo.categoria_color = categoriaId;
                    break;
                case 'estilo':
                    preferenciasTempo.categoria_estilo = categoriaId;
                    break;
                case 'material':
                    preferenciasTempo.categoria_material = categoriaId;
                    break;
                case 'precio':
                    preferenciasTempo.categoria_precio = categoriaId;
                    break;
            }

            return await generarRecomendacionesPorCategorias(clienteData.id_cliente, limite);
        } catch (error) {
            console.error('Error al obtener recomendaciones por categoría:', error);
            return [];
        }
    }, [user]);

    // Cargar datos iniciales cuando el usuario cambia
    useEffect(() => {
        if (user) {
            cargarPreferencias();
            generarRecomendaciones();
        }
    }, [user, cargarPreferencias, generarRecomendaciones]);

    return {
        // Estados
        productosRecomendados,
        preferencias,
        loading,
        loadingPreferencias,
        error,

        // Funciones
        generarRecomendaciones,
        cargarPreferencias,
        guardarPreferencias,
        obtenerRecomendacionesPorCategoria
    };
};
