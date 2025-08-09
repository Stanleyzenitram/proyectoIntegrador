import { supabase } from './supabase';
import {
    PreferenciasUsuario,
    HistorialNavegacion,
    ComportamientoCompra,
    ProductoRecomendado,
    ProductoConScore,
    FiltrosRecomendacion,
    EstadisticasUsuario
} from '../types/recomendaciones';

export class RecomendacionesService {
    
    // ===== PREFERENCIAS DE USUARIO =====
    
    /**
     * Obtener preferencias del usuario
     */
    static async obtenerPreferencias(usuarioId: string): Promise<PreferenciasUsuario | null> {
        try {
            const { data, error } = await supabase
                .from('preferencias_usuario')
                .select('*')
                .eq('usuario_id', usuarioId)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
            return data;
        } catch (error) {
            console.error('Error al obtener preferencias:', error);
            return null;
        }
    }

    /**
     * Guardar o actualizar preferencias del usuario
     */
    static async guardarPreferencias(preferencias: PreferenciasUsuario): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('preferencias_usuario')
                .upsert(preferencias, {
                    onConflict: 'usuario_id'
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error al guardar preferencias:', error);
            return false;
        }
    }

    // ===== HISTORIAL DE NAVEGACIÓN =====
    
    /**
     * Registrar vista de producto
     */
    static async registrarVistaProducto(
        usuarioId: string, 
        productoId: number, 
        accion: HistorialNavegacion['accion'] = 'vista',
        tiempoVista?: number
    ): Promise<boolean> {
        try {
            const historial: Omit<HistorialNavegacion, 'id'> = {
                usuario_id: usuarioId,
                producto_id: productoId,
                fecha_vista: new Date().toISOString(),
                tiempo_vista: tiempoVista,
                accion
            };

            const { error } = await supabase
                .from('historial_navegacion')
                .insert(historial);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error al registrar vista:', error);
            return false;
        }
    }

    /**
     * Obtener historial de navegación del usuario
     */
    static async obtenerHistorialNavegacion(
        usuarioId: string, 
        limit: number = 50
    ): Promise<HistorialNavegacion[]> {
        try {
            const { data, error } = await supabase
                .from('historial_navegacion')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('fecha_vista', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error al obtener historial:', error);
            return [];
        }
    }

    // ===== COMPORTAMIENTO DE COMPRA =====
    
    /**
     * Registrar comportamiento de compra
     */
    static async registrarComportamiento(
        comportamiento: Omit<ComportamientoCompra, 'id' | 'fecha_accion'>
    ): Promise<boolean> {
        try {
            const nuevoComportamiento: Omit<ComportamientoCompra, 'id'> = {
                ...comportamiento,
                fecha_accion: new Date().toISOString()
            };

            const { error } = await supabase
                .from('comportamiento_compra')
                .insert(nuevoComportamiento);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error al registrar comportamiento:', error);
            return false;
        }
    }

    /**
     * Obtener comportamiento de compra del usuario
     */
    static async obtenerComportamientoCompra(
        usuarioId: string, 
        limit: number = 100
    ): Promise<ComportamientoCompra[]> {
        try {
            const { data, error } = await supabase
                .from('comportamiento_compra')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('fecha_accion', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error al obtener comportamiento:', error);
            return [];
        }
    }

    // ===== PRODUCTOS RECOMENDADOS =====
    
    /**
     * Obtener productos recomendados para el usuario
     */
    static async obtenerProductosRecomendados(
        usuarioId: string, 
        limit: number = 10
    ): Promise<ProductoRecomendado[]> {
        try {
            const { data, error } = await supabase
                .from('productos_recomendados')
                .select('*')
                .eq('usuario_id', usuarioId)
                .order('score_recomendacion', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error al obtener recomendaciones:', error);
            return [];
        }
    }

    /**
     * Marcar recomendación como vista
     */
    static async marcarRecomendacionVista(
        recomendacionId: number, 
        usuarioId: string
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('productos_recomendados')
                .update({ visto: true })
                .eq('id', recomendacionId)
                .eq('usuario_id', usuarioId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error al marcar como vista:', error);
            return false;
        }
    }

    /**
     * Marcar recomendación como clickeada
     */
    static async marcarRecomendacionClickeada(
        recomendacionId: number, 
        usuarioId: string
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('productos_recomendados')
                .update({ clickeado: true })
                .eq('id', recomendacionId)
                .eq('usuario_id', usuarioId);

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error al marcar como clickeada:', error);
            return false;
        }
    }

    // ===== ALGORITMO DE RECOMENDACIONES =====
    
    /**
     * Generar recomendaciones basadas en preferencias y comportamiento
     */
    static async generarRecomendaciones(
        usuarioId: string, 
        limit: number = 10
    ): Promise<ProductoConScore[]> {
        try {
            // Obtener preferencias del usuario
            const preferencias = await this.obtenerPreferencias(usuarioId);
            
            // Obtener historial de navegación
            const historial = await this.obtenerHistorialNavegacion(usuarioId, 100);
            
            // Obtener comportamiento de compra
            const comportamiento = await this.obtenerComportamientoCompra(usuarioId, 100);

            // Construir query base para productos
            let query = supabase
                .from('productos')
                .select(`
                    *,
                    categorias(nombre),
                    estilos(nombre),
                    materiales(nombre)
                `)
                .eq('activo', true);

            // Aplicar filtros basados en preferencias
            if (preferencias) {
                if (preferencias.categorias_favoritas.length > 0) {
                    query = query.in('id_categoria', preferencias.categorias_favoritas);
                }
                if (preferencias.estilos_preferidos.length > 0) {
                    query = query.in('id_estilo', preferencias.estilos_preferidos);
                }
                if (preferencias.materiales_favoritos.length > 0) {
                    query = query.in('id_material', preferencias.materiales_favoritos);
                }
                if (preferencias.rango_precio_min) {
                    query = query.gte('precio', preferencias.rango_precio_min);
                }
                if (preferencias.rango_precio_max) {
                    query = query.lte('precio', preferencias.rango_precio_max);
                }
            }

            const { data: productos, error } = await query.limit(limit * 2); // Obtener más para calcular scores

            if (error) throw error;
            if (!productos) return [];

            // Calcular scores para cada producto
            const productosConScore = productos.map(producto => {
                let score = 0;
                let tipoRecomendacion = 'general';
                let razon = '';

                // Score por preferencias de categoría
                if (preferencias?.categorias_favoritas.includes(producto.id_categoria)) {
                    score += 0.3;
                    razon += 'Categoría favorita. ';
                }

                // Score por preferencias de estilo
                if (preferencias?.estilos_preferidos.includes(producto.id_estilo)) {
                    score += 0.25;
                    razon += 'Estilo preferido. ';
                }

                // Score por preferencias de material
                if (preferencias?.materiales_favoritos.includes(producto.id_material)) {
                    score += 0.25;
                    razon += 'Material favorito. ';
                }

                // Score por historial de navegación
                const vistasProducto = historial.filter(h => h.producto_id === producto.id_producto).length;
                score += Math.min(vistasProducto * 0.1, 0.2);

                // Score por comportamiento de compra
                const comprasProducto = comportamiento.filter(c => c.producto_id === producto.id_producto).length;
                score += Math.min(comprasProducto * 0.15, 0.3);

                // Normalizar score a 0-1
                score = Math.min(score, 1);

                if (score > 0.7) tipoRecomendacion = 'alta_preferencia';
                else if (score > 0.4) tipoRecomendacion = 'media_preferencia';
                else tipoRecomendacion = 'general';

                return {
                    producto,
                    score,
                    tipo_recomendacion: tipoRecomendacion,
                    razon: razon || 'Recomendación general basada en tus preferencias.'
                };
            });

            // Ordenar por score y limitar resultados
            return productosConScore
                .sort((a, b) => b.score - a.score)
                .slice(0, limit);

        } catch (error) {
            console.error('Error al generar recomendaciones:', error);
            return [];
        }
    }

    // ===== ESTADÍSTICAS DEL USUARIO =====
    
    /**
     * Obtener estadísticas del usuario para análisis
     */
    static async obtenerEstadisticasUsuario(usuarioId: string): Promise<EstadisticasUsuario | null> {
        try {
            // Obtener totales
            const [historial, comportamiento] = await Promise.all([
                this.obtenerHistorialNavegacion(usuarioId, 1000),
                this.obtenerComportamientoCompra(usuarioId, 1000)
            ]);

            // Calcular estadísticas
            const totalProductosVistos = historial.length;
            const totalProductosComprados = comportamiento.filter(c => c.accion === 'comprado').length;

            // Agrupar por categorías, estilos y materiales
            const categoriasCount = this.agruparPorPropiedad(historial, 'categoria');
            const estilosCount = this.agruparPorPropiedad(historial, 'estilo');
            const materialesCount = this.agruparPorPropiedad(historial, 'material');

            // Calcular rango de precios promedio
            const precios = comportamiento
                .filter(c => c.precio_unitario > 0)
                .map(c => c.precio_unitario);
            
            const rangoPrecioPromedio = precios.length > 0 
                ? { min: Math.min(...precios), max: Math.max(...precios) }
                : { min: 0, max: 0 };

            return {
                total_productos_vistos: totalProductosVistos,
                total_productos_comprados: totalProductosComprados,
                categorias_mas_vistas: categoriasCount.slice(0, 5),
                estilos_mas_vistos: estilosCount.slice(0, 5),
                materiales_mas_vistos: materialesCount.slice(0, 5),
                rango_precio_promedio: rangoPrecioPromedio
            };

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return null;
        }
    }

    // ===== MÉTODOS AUXILIARES =====
    
    private static agruparPorPropiedad(
        historial: HistorialNavegacion[], 
        propiedad: string
    ): Array<{categoria_id?: number, estilo_id?: number, material_id?: number, nombre: string, count: number}> {
        // Este método necesitaría ser implementado con queries más complejas
        // para obtener los nombres reales de categorías, estilos y materiales
        return [];
    }
}
