import { supabase } from './supabase';

export interface ProductoRelacionado {
    id?: number;
    producto_base_id: number;
    producto_relacionado_id: number;
    score_similitud: number;
    caracteristicas_comunes: string[];
    fecha_creacion?: string;
    fecha_actualizacion?: string;
    activo: boolean;
}

export interface CaracteristicasProducto {
    categorias: Set<number>;
    estilos: Set<number>;
    materiales: Set<number>;
    colores: Set<string>;
    superficies: Set<string>;
    durabilidades: Set<number>;
    rangoPrecio: { min: number; max: number };
}

/**
 * Analiza las características comunes de una lista de productos
 */
export const analizarCaracteristicasProductos = (productos: any[]): CaracteristicasProducto => {
    const caracteristicas: CaracteristicasProducto = {
        categorias: new Set(),
        estilos: new Set(),
        materiales: new Set(),
        colores: new Set(),
        superficies: new Set(),
        durabilidades: new Set(),
        rangoPrecio: { min: Infinity, max: -Infinity }
    };

    productos.forEach(producto => {
        if (producto.id_categoria) caracteristicas.categorias.add(producto.id_categoria);
        if (producto.id_estilo) caracteristicas.estilos.add(producto.id_estilo);
        if (producto.id_materiales) caracteristicas.materiales.add(producto.id_materiales);
        if (producto.colorDom) caracteristicas.colores.add(producto.colorDom);
        if (producto.superficie) caracteristicas.superficies.add(producto.superficie);
        if (producto.durabilidad) caracteristicas.durabilidades.add(producto.durabilidad);
        
        if (producto.precio) {
            caracteristicas.rangoPrecio.min = Math.min(caracteristicas.rangoPrecio.min, producto.precio);
            caracteristicas.rangoPrecio.max = Math.max(caracteristicas.rangoPrecio.max, producto.precio);
        }
    });

    return caracteristicas;
};

/**
 * Calcula la similitud entre un producto y un conjunto de características
 */
export const calcularSimilitudProducto = (producto: any, caracteristicas: CaracteristicasProducto) => {
    let score = 0;
    const razones: string[] = [];

    // Similitud por categoría
    if (producto.id_categoria && caracteristicas.categorias.has(producto.id_categoria)) {
        score += 25;
        razones.push('Misma categoría');
    }

    // Similitud por estilo
    if (producto.id_estilo && caracteristicas.estilos.has(producto.id_estilo)) {
        score += 20;
        razones.push('Mismo estilo');
    }

    // Similitud por material
    if (producto.id_materiales && caracteristicas.materiales.has(producto.id_materiales)) {
        score += 20;
        razones.push('Mismo material');
    }

    // Similitud por color
    if (producto.colorDom && caracteristicas.colores.has(producto.colorDom)) {
        score += 15;
        razones.push('Mismo color');
    }

    // Similitud por superficie
    if (producto.superficie && caracteristicas.superficies.has(producto.superficie)) {
        score += 15;
        razones.push('Misma superficie');
    }

    // Similitud por durabilidad
    if (producto.durabilidad && caracteristicas.durabilidades.has(producto.durabilidad)) {
        score += 15;
        razones.push('Misma durabilidad');
    }

    // Similitud por rango de precio
    if (producto.precio && 
        producto.precio >= caracteristicas.rangoPrecio.min * 0.7 && 
        producto.precio <= caracteristicas.rangoPrecio.max * 1.3) {
        score += 20;
        razones.push('Precio similar');
    }

    return { score, razones };
};

/**
 * Obtiene productos relacionados desde la tabla productosRelacionados
 */
export const obtenerProductosRelacionados = async (productosComprados: any[]): Promise<number[]> => {
    if (!productosComprados || productosComprados.length === 0) {
        return [];
    }

    try {
        const { data: productosRelacionados, error } = await supabase
            .from('productosRelacionados')
            .select('producto_relacionado_id, score_similitud')
            .in('producto_base_id', productosComprados.map(p => p.id_producto))
            .eq('activo', true)
            .order('score_similitud', { ascending: false })
            .limit(20);

        if (error) {
            console.error('Error obteniendo productos relacionados:', error);
            return [];
        }

        if (productosRelacionados && productosRelacionados.length >= 5) {
            const idsRelacionados = productosRelacionados.map(p => p.producto_relacionado_id);
            console.log('Productos relacionados encontrados en BD:', idsRelacionados);
            return idsRelacionados;
        }

        // Si no hay suficientes productos relacionados, generamos nuevos
        console.log('Generando y guardando nuevos productos relacionados...');
        const nuevosProductosRelacionados = await generarYGuardarProductosRelacionados(productosComprados);
        
        // Combinar productos existentes con nuevos
        const todosLosRelacionados = [
            ...(productosRelacionados || []).map(p => p.producto_relacionado_id),
            ...nuevosProductosRelacionados
        ];

        return todosLosRelacionados;
    } catch (error) {
        console.error('Error en obtenerProductosRelacionados:', error);
        return [];
    }
};

/**
 * Genera y guarda nuevos productos relacionados en la base de datos
 */
export const generarYGuardarProductosRelacionados = async (productosComprados: any[]): Promise<number[]> => {
    try {
        // Obtener características de los productos comprados
        const caracteristicas = analizarCaracteristicasProductos(productosComprados);
        
        // Buscar productos similares por características
        const { data: productosSimilares, error } = await supabase
            .from('productos')
            .select('id_producto, id_categoria, id_estilo, id_materiales, colorDom, superficie, durabilidad, precio')
            .neq('id_producto', productosComprados[0].id_producto)
            .limit(50);

        if (error || !productosSimilares) {
            console.error('Error obteniendo productos similares:', error);
            return [];
        }

        const productosRelacionados: number[] = [];
        const productosParaGuardar: Omit<ProductoRelacionado, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>[] = [];

        // Calcular similitud y preparar datos para guardar
        productosSimilares.forEach(producto => {
            const similitud = calcularSimilitudProducto(producto, caracteristicas);
            const score = similitud.score / 130; // Normalizar a 0-1

            if (score > 0.3) { // Solo productos con similitud significativa
                productosRelacionados.push(producto.id_producto);
                
                // Preparar datos para guardar en la BD
                productosComprados.forEach(productoBase => {
                    productosParaGuardar.push({
                        producto_base_id: productoBase.id_producto,
                        producto_relacionado_id: producto.id_producto,
                        score_similitud: score,
                        caracteristicas_comunes: similitud.razones,
                        activo: true
                    });
                });
            }
        });

        // Guardar productos relacionados en la BD
        if (productosParaGuardar.length > 0) {
            const { error: insertError } = await supabase
                .from('productosRelacionados')
                .upsert(productosParaGuardar, { 
                    onConflict: 'producto_base_id,producto_relacionado_id',
                    ignoreDuplicates: false 
                });

            if (insertError) {
                console.error('Error guardando productos relacionados:', insertError);
            } else {
                console.log(`${productosParaGuardar.length} productos relacionados guardados exitosamente`);
            }
        }

        return productosRelacionados;
    } catch (error) {
        console.error('Error generando productos relacionados:', error);
        return [];
    }
};

/**
 * Limpia productos relacionados obsoletos marcándolos como inactivos
 */
export const limpiarProductosRelacionadosObsoletos = async (): Promise<void> => {
    try {
        const { error } = await supabase
            .from('productosRelacionados')
            .update({ activo: false })
            .lt('score_similitud', 0.2);

        if (error) {
            console.error('Error limpiando productos relacionados obsoletos:', error);
        } else {
            console.log('Productos relacionados obsoletos limpiados exitosamente');
        }
    } catch (error) {
        console.error('Error en limpiarProductosRelacionadosObsoletos:', error);
    }
};

/**
 * Obtiene productos por características similares (función de respaldo)
 */
export const obtenerProductosPorCaracteristicas = async (productosComprados: any[]): Promise<number[]> => {
    try {
        const caracteristicas = analizarCaracteristicasProductos(productosComprados);
        const productosIds = productosComprados.map(p => p.id_producto).filter(Boolean);
        
        if (productosIds.length === 0) return [];

        let query = supabase
            .from('productos')
            .select('id_producto')
            .eq('disponibilidad', true)
            .gt('stock_actual', 0);

        // Excluir productos ya comprados
        if (productosIds.length > 0) {
            query = query.not('id_producto', 'in', productosIds);
        }

        // Buscar productos con características similares
        if (caracteristicas.categorias.size > 0) {
            query = query.in('id_categoria', Array.from(caracteristicas.categorias));
        }
        
        if (caracteristicas.estilos.size > 0) {
            query = query.in('id_estilo', Array.from(caracteristicas.estilos));
        }
        
        if (caracteristicas.materiales.size > 0) {
            query = query.in('id_materiales', Array.from(caracteristicas.materiales));
        }

        const { data: productosSimilares, error } = await query.limit(10);
        
        if (error) {
            console.warn('Error al obtener productos por características:', error);
            return [];
        }

        return productosSimilares?.map(p => p.id_producto) || [];

    } catch (error) {
        console.error('Error al obtener productos por características:', error);
        return [];
    }
};
