import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';

export interface ProductoRecomendado {
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
    uso_recomendado?: string;
}

export interface Preferencia {
    id?: string;
    idClientes: number;
    idEstilo?: number;
    color?: string;
    idMaterial?: number;
    idCategoria?: number;
    durabilidad?: number;
    superficie?: string;
    enTendencia?: boolean;
    precMin?: number;
    precMax?: number;
    usoEspecifico?: string;
}

export interface RecomendacionContext {
    productosComprados?: any[];
    preferenciasEspecificas?: Preferencia;
}

export const useRecomendaciones = (context?: RecomendacionContext) => {
    const [productosRecomendados, setProductosRecomendados] = useState<ProductoRecomendado[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    const generarRecomendaciones = useCallback(async () => {
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

            // Obtener preferencias del cliente
            let preferencias: Preferencia[] = [];
            if (context?.preferenciasEspecificas) {
                preferencias = [context.preferenciasEspecificas];
            } else {
                const { data: prefData, error: prefError } = await supabase
                    .from('preferenciasProd')
                    .select('*')
                    .eq('idClientes', clienteId);

                if (prefError) {
                    console.warn('No se pudieron cargar preferencias:', prefError);
                }
                preferencias = prefData || [];
            }

            // Obtener productos para recomendaciones
            let productosComprados: any[] = context?.productosComprados || [];

            if (productosComprados.length === 0) {
                // Obtener historial de compras del cliente
                const { data: facturasData } = await supabase
                    .from('facturas')
                    .select('id_factura')
                    .eq('id_cliente', clienteId);

                if (facturasData && facturasData.length > 0) {
                    const facturasIds = facturasData.map(f => f.id_factura);

                    const { data: detallesData } = await supabase
                        .from('detalles_factura')
                        .select(`
                            id_producto,
                            productos (
                                id_producto,
                                nombre_producto,
                                id_categoria,
                                id_estilo,
                                id_materiales
                            )
                        `)
                        .in('id_factura', facturasIds);

                    if (detallesData) {
                        productosComprados = detallesData.map(detalle => ({
                            id_producto: detalle.id_producto,
                            cantidad: 1,
                            productos: [detalle.productos]
                        }));
                    }
                }
            }

            // Generar recomendaciones personalizadas
            const recomendaciones = await generarRecomendacionesPersonalizadas(
                preferencias,
                productosComprados,
                clienteId
            );

            setProductosRecomendados(recomendaciones);

        } catch (error) {
            console.error('Error al generar recomendaciones:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [user, context]);

    const generarRecomendacionesPersonalizadas = async (
        preferencias: Preferencia[],
        productosComprados: any[],
        clienteId: number
    ): Promise<ProductoRecomendado[]> => {
        try {
            // Cargar preferencias por uso del cliente para enriquecer las recomendaciones y mensajes
            const preferenciasPorUso = await obtenerPreferenciasPorUso(clienteId);

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
                    disponibilidad
                `)
                .eq('disponibilidad', true)
                .gt('stock_actual', 0);

            // Aplicar filtros basados en preferencias
            if (preferencias.length > 0) {
                const preferencia = preferencias[0];

                if (preferencia.idCategoria) {
                    query = query.eq('id_categoria', preferencia.idCategoria);
                }
                if (preferencia.idEstilo) {
                    query = query.eq('id_estilo', preferencia.idEstilo);
                }
                if (preferencia.idMaterial) {
                    query = query.eq('id_materiales', preferencia.idMaterial);
                }
                if (preferencia.precMin && preferencia.precMax) {
                    query = query.gte('precio', preferencia.precMin).lte('precio', preferencia.precMax);
                }
                if (preferencia.durabilidad && preferencia.durabilidad > 0) {
                    query = query.gte('durabilidad', preferencia.durabilidad);
                }
                if (preferencia.color) {
                    query = query.ilike('colorDom', `%${preferencia.color}%`);
                }
                if (preferencia.superficie) {
                    query = query.ilike('superficie', `%${preferencia.superficie}%`);
                }
            }

            // Obtener productos base
            const { data: productosBase, error: productosError } = await query.limit(30);

            if (productosError) throw productosError;
            if (!productosBase) return [];

            // Obtener productos relacionados
            const productosRelacionados = await obtenerProductosRelacionados(productosComprados);

            // Combinar y puntuar productos
            const productosPuntuados = productosBase.map(producto => {
                let score = 0;
                let razones: string[] = [];
                let usoRecomendado: string | undefined;

                // Puntuar por preferencias
                if (preferencias.length > 0) {
                    score += 50;
                    razones.push('Basado en tus preferencias');
                }

                // Puntuar por productos relacionados
                if (productosRelacionados.includes(producto.id_producto)) {
                    score += 30;
                    razones.push('Relacionado con compras anteriores');
                }

                // Puntuar por descuento
                if (producto.descuento && producto.descuento > 0) {
                    score += 20;
                    razones.push('Producto en oferta');
                }

                // Puntuar por tendencia
                if (preferencias.some(p => p.enTendencia)) {
                    score += 15;
                    razones.push('Producto en tendencia');
                }

                // Puntuar por stock
                score += Math.min(10, producto.stock_actual / 5);

                // Puntuar por precio
                if (preferencias.length > 0 && preferencias[0].precMin && preferencias[0].precMax) {
                    const precioMedio = (preferencias[0].precMin + preferencias[0].precMax) / 2;
                    const diferenciaPrecio = Math.abs(producto.precio - precioMedio);
                    score += Math.max(0, 15 - diferenciaPrecio / 100);
                }

                // Coincidencia por uso específico guardado (si existe)
                const mensajeUso = verificarCoincidenciaUsoProducto(producto, preferenciasPorUso);
                if (mensajeUso) {
                    score += 40; // impulso por coincidencia de uso
                    usoRecomendado = mensajeUso;
                    razones.push(mensajeUso);
                }

                return {
                    ...producto,
                    score_recomendacion: score,
                    razon_recomendacion: razones.join(', '),
                    uso_recomendado: usoRecomendado
                };
            });

            // Ordenar por score y tomar los mejores
            return productosPuntuados
                .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                .slice(0, 12);

        } catch (error) {
            console.error('Error al generar recomendaciones personalizadas:', error);
            return [];
        }
    };

    // Obtener preferencias del cliente ligadas a usos con el nombre del uso
    const obtenerPreferenciasPorUso = async (clienteId: number) => {
        try {
            const { data, error } = await supabase
                .from('usoXpref')
                .select(`
                    uso:uso ( nombre ),
                    preferenciasProd:preferenciasProd (
                        idClientes,
                        idEstilo,
                        color,
                        idMaterial,
                        idCategoria,
                        durabilidad,
                        superficie,
                        enTendencia,
                        precMin,
                        precMax
                    )
                `)
                .eq('preferenciasProd.idClientes', clienteId);

            if (error) {
                console.warn('No se pudieron cargar preferencias por uso:', error);
                return [] as any[];
            }

            return data || [];
        } catch (err) {
            console.error('Error al obtener preferencias por uso:', err);
            return [] as any[];
        }
    };

    // Verifica si el producto coincide con alguna preferencia por uso y devuelve el mensaje
    const verificarCoincidenciaUsoProducto = (producto: any, preferenciasPorUso: any[]): string | null => {
        if (!preferenciasPorUso || preferenciasPorUso.length === 0) return null;

        for (const pref of preferenciasPorUso) {
            const preferencia = pref?.preferenciasProd?.[0];
            const usoNombre: string | undefined = pref?.uso?.nombre;
            if (!preferencia || !usoNombre) continue;

            if (preferencia.idCategoria && producto.id_categoria === preferencia.idCategoria) {
                return `Perfecto para tu ${usoNombre.toLowerCase()}`;
            }
            if (preferencia.idMaterial && producto.id_materiales === preferencia.idMaterial) {
                return `Perfecto para tu ${usoNombre.toLowerCase()}`;
            }
            if (preferencia.idEstilo && producto.id_estilo === preferencia.idEstilo) {
                return `Perfecto para tu ${usoNombre.toLowerCase()}`;
            }
            if (preferencia.color && producto.colorDom && producto.colorDom.toLowerCase().includes(preferencia.color.toLowerCase())) {
                return `Perfecto para tu ${usoNombre.toLowerCase()}`;
            }
            if (preferencia.superficie && producto.superficie && producto.superficie.toLowerCase().includes(preferencia.superficie.toLowerCase())) {
                return `Perfecto para tu ${usoNombre.toLowerCase()}`;
            }
            if (preferencia.durabilidad && producto.durabilidad && producto.durabilidad >= preferencia.durabilidad) {
                return `Perfecto para tu ${usoNombre.toLowerCase()}`;
            }
            if (
                preferencia.precMin && preferencia.precMax &&
                producto.precio >= preferencia.precMin && producto.precio <= preferencia.precMax
            ) {
                return `Perfecto para tu ${usoNombre.toLowerCase()}`;
            }
        }

        return null;
    };

    const obtenerProductosRelacionados = async (productosComprados: any[]): Promise<number[]> => {
        try {
            const productosIds = productosComprados.map(p => p.productos?.id_producto).filter(Boolean);

            if (productosIds.length === 0) return [];

            const { data: relacionados } = await supabase
                .from('productosRelacionados')
                .select('idProdAsoc')
                .in('idProdBase', productosIds);

            return relacionados?.map(r => r.idProdAsoc) || [];

        } catch (error) {
            console.error('Error al obtener productos relacionados:', error);
            return [];
        }
    };

    const actualizarPreferencias = useCallback(async (nuevasPreferencias: Partial<Preferencia>) => {
        if (!user) return false;

        try {
            const { data: clienteData } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            if (!clienteData) return false;

            const { error } = await supabase
                .from('preferenciasProd')
                .upsert({
                    idClientes: clienteData.id_cliente,
                    ...nuevasPreferencias
                });

            if (error) throw error;

            // Regenerar recomendaciones con las nuevas preferencias
            await generarRecomendaciones();
            return true;

        } catch (error) {
            console.error('Error al actualizar preferencias:', error);
            return false;
        }
    }, [user, generarRecomendaciones]);

    const obtenerRecomendacionesPorCategoria = useCallback(async (categoriaId: number) => {
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
                .eq('id_categoria', categoriaId)
                .eq('disponibilidad', true)
                .gt('stock_actual', 0)
                .limit(8);

            if (error) throw error;

            return data?.map(producto => ({
                ...producto,
                score_recomendacion: 40,
                razon_recomendacion: 'Recomendado por categoría'
            })) || [];

        } catch (error) {
            console.error('Error al obtener recomendaciones por categoría:', error);
            return [];
        }
    }, []);

    const obtenerRecomendacionesSimilares = useCallback(async (productoId: number) => {
        try {
            // Obtener características del producto base
            const { data: productoBase } = await supabase
                .from('productos')
                .select('id_categoria, id_estilo, id_materiales, precio, colorDom')
                .eq('id_producto', productoId)
                .single();

            if (!productoBase) return [];

            // Buscar productos similares
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
                    disponibilidad
                `)
                .eq('disponibilidad', true)
                .gt('stock_actual', 0)
                .neq('id_producto', productoId);

            // Aplicar filtros de similitud
            if (productoBase.id_categoria) {
                query = query.eq('id_categoria', productoBase.id_categoria);
            }
            if (productoBase.id_estilo) {
                query = query.eq('id_estilo', productoBase.id_estilo);
            }
            if (productoBase.id_materiales) {
                query = query.eq('id_materiales', productoBase.id_materiales);
            }

            const { data, error } = await query.limit(6);

            if (error) throw error;

            return data?.map(producto => ({
                ...producto,
                score_recomendacion: 35,
                razon_recomendacion: 'Producto similar'
            })) || [];

        } catch (error) {
            console.error('Error al obtener productos similares:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        if (user) {
            generarRecomendaciones();
        }
    }, [user, generarRecomendaciones]);

    return {
        productosRecomendados,
        loading,
        error,
        generarRecomendaciones,
        actualizarPreferencias,
        obtenerRecomendacionesPorCategoria,
        obtenerRecomendacionesSimilares
    };
};
