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

export interface ProductoRelacionadoCompra {
    id?: number;
    producto_base_id: number;
    producto_relacionado_id: number;
    score_compra_conjunta: number;
    frecuencia_compra_conjunta: number;
    total_compras_conjuntas: number;
    ultima_compra_conjunta?: string;
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
    totalProductos: number;
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
        rangoPrecio: { min: Infinity, max: -Infinity },
        totalProductos: productos.length
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

/**
 * Analiza el historial de compras de todos los clientes para identificar productos relacionados
 * basándose en compras conjuntas (donde se compraron 2 o más productos diferentes juntos)
 */
export const analizarComprasConjuntas = async (): Promise<ProductoRelacionadoCompra[]> => {
    console.log('🔍 Iniciando análisis de compras conjuntas...');
    
    try {
        // 1. Obtener todas las facturas con sus detalles
        const { data: facturasData, error: facturasError } = await supabase
            .from('facturas')
            .select(`
                id_factura,
                fecha_factura,
                detalles_factura (
                    id_producto,
                    cantidad,
                    precio_unitario
                )
            `)
            .order('fecha_factura', { ascending: false });

        if (facturasError) {
            console.error('Error obteniendo facturas:', facturasError);
            return [];
        }

        if (!facturasData || facturasData.length === 0) {
            console.log('No se encontraron facturas para analizar');
            return [];
        }

        console.log(`📊 Analizando ${facturasData.length} facturas...`);

        // 2. Procesar cada factura para encontrar productos comprados juntos
        const comprasConjuntas = new Map<string, {
            productos: number[];
            fecha: string;
            frecuencia: number;
        }>();

        facturasData.forEach(factura => {
            if (factura.detalles_factura && factura.detalles_factura.length >= 2) {
                // Solo facturas con 2 o más productos diferentes
                const productosUnicos = [...new Set(
                    factura.detalles_factura.map(d => d.id_producto)
                )];
                
                if (productosUnicos.length >= 2) {
                    // Crear combinaciones de productos
                    for (let i = 0; i < productosUnicos.length; i++) {
                        for (let j = i + 1; j < productosUnicos.length; j++) {
                            const producto1 = Math.min(productosUnicos[i], productosUnicos[j]);
                            const producto2 = Math.max(productosUnicos[i], productosUnicos[j]);
                            const key = `${producto1}-${producto2}`;
                            
                            if (comprasConjuntas.has(key)) {
                                const existente = comprasConjuntas.get(key)!;
                                existente.frecuencia++;
                                existente.fecha = factura.fecha_factura; // Actualizar a la más reciente
                            } else {
                                comprasConjuntas.set(key, {
                                    productos: [producto1, producto2],
                                    fecha: factura.fecha_factura,
                                    frecuencia: 1
                                });
                            }
                        }
                    }
                }
            }
        });

        console.log(`🎯 Encontradas ${comprasConjuntas.size} combinaciones de productos comprados juntos`);

        // 3. Calcular scores y preparar datos para guardar
        const productosRelacionados: ProductoRelacionadoCompra[] = [];
        const totalFacturas = facturasData.length;

        comprasConjuntas.forEach((compra, key) => {
            // Calcular score basado en frecuencia y recencia
            const frecuenciaRelativa = compra.frecuencia / totalFacturas;
            const diasDesdeUltimaCompra = Math.max(0, 
                (Date.now() - new Date(compra.fecha).getTime()) / (1000 * 60 * 60 * 24)
            );
            
            // Score más alto para productos comprados juntos frecuentemente y recientemente
            let score = frecuenciaRelativa * 100; // Base: 0-100
            
            // Bonus por recencia (últimos 30 días)
            if (diasDesdeUltimaCompra <= 30) {
                score += 20;
            } else if (diasDesdeUltimaCompra <= 90) {
                score += 10;
            }
            
            // Bonus por alta frecuencia
            if (compra.frecuencia >= 5) {
                score += 30;
            } else if (compra.frecuencia >= 3) {
                score += 15;
            }

            // Normalizar score a 0-100
            score = Math.min(100, Math.max(0, score));

            if (score >= 15) { // Solo productos con relación significativa
                productosRelacionados.push({
                    producto_base_id: compra.productos[0],
                    producto_relacionado_id: compra.productos[1],
                    score_compra_conjunta: score,
                    frecuencia_compra_conjunta: compra.frecuencia,
                    total_compras_conjuntas: compra.frecuencia,
                    ultima_compra_conjunta: compra.fecha,
                    activo: true
                });

                // También agregar la relación inversa
                productosRelacionados.push({
                    producto_base_id: compra.productos[1],
                    producto_relacionado_id: compra.productos[0],
                    score_compra_conjunta: score,
                    frecuencia_compra_conjunta: compra.frecuencia,
                    total_compras_conjuntas: compra.frecuencia,
                    ultima_compra_conjunta: compra.fecha,
                    activo: true
                });
            }
        });

        console.log(`💾 Preparados ${productosRelacionados.length} registros de productos relacionados`);

        return productosRelacionados;

    } catch (error) {
        console.error('Error en analizarComprasConjuntas:', error);
        return [];
    }
};

/**
 * Guarda los productos relacionados basados en compras conjuntas en la base de datos
 */
export const guardarProductosRelacionadosCompra = async (): Promise<boolean> => {
    try {
        console.log('💾 Guardando productos relacionados basados en compras conjuntas...');
        
        // 1. Analizar compras conjuntas
        const productosRelacionados = await analizarComprasConjuntas();
        
        if (productosRelacionados.length === 0) {
            console.log('No se encontraron productos relacionados para guardar');
            return false;
        }

        // 2. Verificar si ya existe la tabla productos_relacionados_compra
        const { data: tableExists } = await supabase
            .from('productos_relacionados_compra')
            .select('id')
            .limit(1);

        if (!tableExists) {
            console.log('⚠️ Tabla productos_relacionados_compra no existe. Creando...');
            
            // Crear la tabla si no existe
            const { error: createError } = await supabase.rpc('create_productos_relacionados_compra_table');
            
            if (createError) {
                console.error('Error creando tabla:', createError);
                return false;
            }
        }

        // 3. Limpiar registros existentes (opcional - comentar si quieres mantener histórico)
        const { error: deleteError } = await supabase
            .from('productos_relacionados_compra')
            .delete()
            .neq('id', 0); // Eliminar todos

        if (deleteError) {
            console.warn('Advertencia al limpiar registros existentes:', deleteError);
        }

        // 4. Insertar nuevos registros
        const { error: insertError } = await supabase
            .from('productos_relacionados_compra')
            .insert(productosRelacionados);

        if (insertError) {
            console.error('Error insertando productos relacionados:', insertError);
            return false;
        }

        console.log(`✅ Guardados ${productosRelacionados.length} productos relacionados exitosamente`);
        return true;

    } catch (error) {
        console.error('Error en guardarProductosRelacionadosCompra:', error);
        return false;
    }
};

/**
 * Obtiene productos relacionados basados en compras conjuntas
 */
export const obtenerProductosRelacionadosCompra = async (productoId: number): Promise<number[]> => {
    try {
        const { data: productosRelacionados, error } = await supabase
            .from('productos_relacionados_compra')
            .select('producto_relacionado_id, score_compra_conjunta')
            .eq('producto_base_id', productoId)
            .eq('activo', true)
            .order('score_compra_conjunta', { ascending: false })
            .limit(10);

        if (error) {
            console.error('Error obteniendo productos relacionados por compra:', error);
            return [];
        }

        return productosRelacionados?.map(p => p.producto_relacionado_id) || [];

    } catch (error) {
        console.error('Error en obtenerProductosRelacionadosCompra:', error);
        return [];
    }
};

/**
 * Función para ejecutar el análisis completo y guardar resultados
 * Esta función se puede ejecutar manualmente o programáticamente
 */
export const ejecutarAnalisisProductosRelacionados = async (): Promise<{
    success: boolean;
    totalRelaciones: number;
    message: string;
}> => {
    try {
        console.log('🚀 Iniciando análisis completo de productos relacionados...');
        
        const startTime = Date.now();
        const success = await guardarProductosRelacionadosCompra();
        const endTime = Date.now();
        
        if (success) {
            // Obtener el total de relaciones guardadas
            const { count } = await supabase
                .from('productos_relacionados_compra')
                .select('*', { count: 'exact', head: true });

            return {
                success: true,
                totalRelaciones: count || 0,
                message: `Análisis completado exitosamente en ${((endTime - startTime) / 1000).toFixed(2)}s. ${count || 0} relaciones guardadas.`
            };
        } else {
            return {
                success: false,
                totalRelaciones: 0,
                message: 'Error durante el análisis de productos relacionados.'
            };
        }

    } catch (error) {
        console.error('Error en ejecutarAnalisisProductosRelacionados:', error);
        return {
            success: false,
            totalRelaciones: 0,
            message: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`
        };
    }
};
