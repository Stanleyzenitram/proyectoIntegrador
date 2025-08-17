// Utilidades para integrar el sistema de recomendaciones con las nuevas categorías

import { supabase } from '../services/supabase';
import { 
    PreferenciasCategorizadas, 
    obtenerFiltrosReales, 
    construirQueryConCategorias 
} from './preferenciasCategorias';

export interface ProductoRecomendadoCategorizado {
    id_producto: number;
    nombre_producto: string;
    imagen: string;
    precio: number;
    stock_actual: number;
    metros_por_caja?: number;
    descripcion?: string;
    id_categoria?: number;
    id_estilo?: number;
    id_materiales?: number;
    descuento?: number;
    score_recomendacion?: number;
    razon_recomendacion?: string;
    colorDom?: string;
    superficie?: string;
    durabilidad?: number;
    disponibilidad?: boolean;
}

/**
 * Cargar preferencias categorizadas del usuario
 */
export async function cargarPreferenciasCategorias(clienteId: number): Promise<PreferenciasCategorizadas | null> {
    try {
        const { data, error } = await supabase
            .from('preferencias_categorias')
            .select('*')
            .eq('idclientes', clienteId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Error al cargar preferencias categorizadas:', error);
        return null;
    }
}

/**
 * Generar recomendaciones basadas en categorías
 */
export async function generarRecomendacionesPorCategorias(
    clienteId: number,
    limite: number = 12
): Promise<ProductoRecomendadoCategorizado[]> {
    try {
        // Cargar preferencias categorizadas
        const preferencias = await cargarPreferenciasCategorias(clienteId);
        
        if (!preferencias) {
            // Si no hay preferencias categorizadas, devolver productos populares
            return await obtenerProductosPopulares(limite);
        }

        // Obtener filtros reales basados en categorías
        const filtros = obtenerFiltrosReales(preferencias);

        // Construir query base con joins para obtener nombres
        let query = supabase
            .from('productos')
            .select(`
                id_producto,
                nombre_producto,
                imagen,
                precio,
                stock_actual,
                metros_por_caja,
                descripcion,
                id_categoria,
                id_estilo,
                id_materiales,
                descuento,
                colorDom,
                superficie,
                durabilidad,
                disponibilidad,
                estilos(nombre_estilo),
                materiales(nombre_materiales)
            `)
            .eq('disponibilidad', true)
            .gt('stock_actual', 0);

        // Aplicar filtros por categorías seleccionadas
        query = aplicarFiltrosCategorias(query, filtros);

        // Obtener productos
        const { data: productos, error } = await query.limit(limite * 2); // Obtener más para calcular scores

        if (error) throw error;
        
        // Aplicar filtros post-query para estilos y materiales
        let productosFiltrados = productos || [];
        
        if (filtros.estilos && filtros.estilos.length > 0) {
            productosFiltrados = productosFiltrados.filter(producto => {
                const nombreEstilo = (producto as any).estilos?.nombre_estilo?.toLowerCase() || '';
                return filtros.estilos.some((estilo: string) => 
                    nombreEstilo.includes(estilo.toLowerCase())
                );
            });
        }
        
        if (filtros.materiales && filtros.materiales.length > 0) {
            productosFiltrados = productosFiltrados.filter(producto => {
                const nombreMaterial = (producto as any).materiales?.nombre_materiales?.toLowerCase() || '';
                return filtros.materiales.some((material: string) => 
                    nombreMaterial.includes(material.toLowerCase())
                );
            });
        }
        
        if (!productosFiltrados || productosFiltrados.length === 0) {
            // Intentar solo con filtro de precio como fallback
            if (filtros.precioMin !== undefined || filtros.precioMax !== undefined) {
                
                let queryPrecio = supabase
                    .from('productos')
                    .select(`
                        id_producto,
                        nombre_producto,
                        imagen,
                        precio,
                        stock_actual,
                        metros_por_caja,
                        descripcion,
                        id_categoria,
                        id_estilo,
                        id_materiales,
                        descuento,
                        colorDom,
                        superficie,
                        durabilidad,
                        disponibilidad
                    `)
                    .eq('disponibilidad', true)
                    .gt('stock_actual', 0);
                    
                if (filtros.precioMin !== undefined) {
                    queryPrecio = queryPrecio.gte('precio', filtros.precioMin);
                }
                if (filtros.precioMax !== undefined) {
                    queryPrecio = queryPrecio.lte('precio', filtros.precioMax);
                }
                
                const { data: productosPrecio, error: errorPrecio } = await queryPrecio.limit(limite);
                
                if (!errorPrecio && productosPrecio && productosPrecio.length > 0) {
                    return productosPrecio.map(p => ({
                        ...p,
                        score_recomendacion: 30,
                        razon_recomendacion: 'Dentro de tu rango de precio'
                    }));
                }
            }
            return await obtenerProductosPopulares(limite);
        }

        // Calcular scores basados en coincidencias de categorías
        const productosConScore = productosFiltrados.map(producto => {
            let score = 0;
            let razones: string[] = [];

            // Puntuar por coincidencia de color
            if (preferencias.categoria_color && filtros.colores) {
                if (producto.colorDom && filtros.colores.some(color => 
                    producto.colorDom.toLowerCase().includes(color.toLowerCase())
                )) {
                    score += 40;
                    razones.push('Color de tu preferencia');
                }
            }

            // Puntuar por coincidencia de estilo
            if (preferencias.categoria_estilo && filtros.estilos) {
                if (filtros.estilos.includes(producto.id_estilo)) {
                    score += 35;
                    razones.push('Estilo de tu preferencia');
                }
            }

            // Puntuar por coincidencia de material
            if (preferencias.categoria_material && filtros.materiales) {
                if (filtros.materiales.includes(producto.id_materiales)) {
                    score += 35;
                    razones.push('Material de tu preferencia');
                }
            }

            // Puntuar por rango de precio
            if (preferencias.categoria_precio && filtros.precioMin !== undefined && filtros.precioMax !== undefined) {
                if (producto.precio >= filtros.precioMin && producto.precio <= filtros.precioMax) {
                    score += 30;
                    razones.push('Precio dentro de tu rango preferido');
                }
            }

            // Puntuar por descuento
            if (producto.descuento && producto.descuento > 0) {
                score += 20;
                razones.push('Producto en oferta');
            }

            // Puntuar por stock disponible
            score += Math.min(10, producto.stock_actual / 5);

            // Si no hay razones específicas, dar razón general
            if (razones.length === 0) {
                razones.push('Recomendado para ti');
                score += 10;
            }

            return {
                ...producto,
                score_recomendacion: score,
                razon_recomendacion: razones.join(', ')
            };
        });

        // Ordenar por score y limitar resultados
        return productosConScore
            .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
            .slice(0, limite);

    } catch (error) {
        console.error('Error al generar recomendaciones por categorías:', error);
        return await obtenerProductosPopulares(limite);
    }
}

/**
 * Aplicar filtros de categorías a un query de Supabase
 */
function aplicarFiltrosCategorias(query: any, filtros: any): any {
    // Aplicar filtro de colores (usar OR para múltiples colores)
    if (filtros.colores && filtros.colores.length > 0) {
        const condicionesColor = filtros.colores.map((color: string) => `colorDom.ilike.%${color}%`);
        query = query.or(condicionesColor.join(','));
    }

    // Aplicar filtro de precio (estos siempre funcionan)
    if (filtros.precioMin !== undefined) {
        query = query.gte('precio', filtros.precioMin);
    }
    if (filtros.precioMax !== undefined) {
        query = query.lte('precio', filtros.precioMax);
    }
    
    return query;
}

/**
 * Obtener productos populares como fallback
 */
async function obtenerProductosPopulares(limite: number): Promise<ProductoRecomendadoCategorizado[]> {
    try {
        const { data, error } = await supabase
            .from('productos')
            .select(`
                id_producto,
                nombre_producto,
                imagen,
                precio,
                stock_actual,
                metros_por_caja,
                descripcion,
                id_categoria,
                id_estilo,
                id_materiales,
                descuento,
                colorDom,
                superficie,
                durabilidad,
                disponibilidad
            `)
            .eq('disponibilidad', true)
            .gt('stock_actual', 0)
            .order('descuento', { ascending: false, nullsFirst: false })
            .order('stock_actual', { ascending: false })
            .limit(limite);

        if (error) throw error;

        return (data || []).map(producto => ({
            ...producto,
            score_recomendacion: 25,
            razon_recomendacion: 'Producto popular'
        }));

    } catch (error) {
        console.error('Error al obtener productos populares:', error);
        return [];
    }
}

/**
 * Verificar si un usuario tiene preferencias categorizadas configuradas
 */
export async function tienePreferenciasCategorias(clienteId: number): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('preferencias_categorias')
            .select('id')
            .eq('idclientes', clienteId)
            .single();

        return !error && !!data;
    } catch (error) {
        return false;
    }
}

/**
 * Migrar preferencias legacy a formato categorizado (función auxiliar)
 */
export async function migrarPreferenciasLegacy(clienteId: number): Promise<boolean> {
    try {
        // Verificar si ya tiene preferencias categorizadas
        const tieneCategorizadas = await tienePreferenciasCategorias(clienteId);
        if (tieneCategorizadas) {
            return true; // Ya migrado
        }

        // Obtener preferencias legacy
        const { data: prefsLegacy, error: errorLegacy } = await supabase
            .from('preferencias')
            .select('*')
            .eq('idClientes', clienteId)
            .single();

        if (errorLegacy || !prefsLegacy) {
            return false; // No hay preferencias legacy para migrar
        }

        // Convertir a formato categorizado (migración básica)
        const preferenciasCategorizadas: PreferenciasCategorizadas = {
            idClientes: clienteId,
            categoria_precio: prefsLegacy.rango_precio || undefined,
            fecha_actualizacion: new Date().toISOString()
        };

        // Insertar preferencias categorizadas
        const { error: errorInsertar } = await supabase
            .from('preferencias_categorias')
            .insert([preferenciasCategorizadas]);

        if (errorInsertar) throw errorInsertar;

        return true;
    } catch (error) {
        console.error('Error al migrar preferencias legacy:', error);
        return false;
    }
}
