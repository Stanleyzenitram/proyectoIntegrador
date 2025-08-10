import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FaStar, FaHeart, FaShoppingCart, FaEye, FaLightbulb, FaInfoCircle, FaCheck, FaRedo, FaTimes } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { 
    obtenerProductosRelacionados, 
    generarYGuardarProductosRelacionados, 
    limpiarProductosRelacionadosObsoletos,
    obtenerProductosPorCaracteristicas,
    analizarCaracteristicasProductos,
    calcularSimilitudProducto
} from '../services/productosRelacionadosService';

interface ProductoRecomendado {
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
    formato?: string;
    piezas_por_caja?: number;
}

interface RecomendacionesInteligentesProps {
    contextProducts?: any[]; // Products from current context (e.g., repeat order modal)
    compact?: boolean; // Para usar en modales o espacios reducidos
}

export default function RecomendacionesInteligentes({ 
    contextProducts,
    compact = false
}: RecomendacionesInteligentesProps = {}) {
    const [productosRecomendados, setProductosRecomendados] = useState<ProductoRecomendado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAll, setShowAll] = useState(false);
    const [mostrarDetalles, setMostrarDetalles] = useState<number | null>(null);
    const { user } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    const [selectedProduct, setSelectedProduct] = useState<ProductoRecomendado | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'metros' | 'cajas'>('metros');
    const [metrosDeseados, setMetrosDeseados] = useState(0);
    const [cajasDeseadas, setCajasDeseadas] = useState(1);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (user) {
            generarRecomendaciones();
        }
    }, [user]);

    // Efecto adicional para regenerar recomendaciones cuando cambien los productos del contexto
    useEffect(() => {
        if (user && contextProducts && contextProducts.length > 0) {
            console.log('Context products changed, regenerating recommendations...');
            generarRecomendaciones();
        }
    }, [user, contextProducts]);

    const generarRecomendaciones = async () => {
        if (!user) {
            console.log('No user found, returning from generarRecomendaciones.');
            return;
        }
        console.log('generarRecomendaciones called. User ID:', user.id);
        
        try {
            setLoading(true);
            setError(null);
            
            // Obtener ID del cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            console.log('Cliente Data:', clienteData, 'Cliente Error:', clienteError);
            
            if (clienteError || !clienteData) {
                throw new Error('No se pudo obtener información del cliente');
            }

            const clienteId = clienteData.id_cliente;
            console.log('Cliente ID:', clienteId);

            // Obtener productos para recomendaciones
            let productosComprados: any[] = [];
            
            console.log('Context Products:', contextProducts);
            
            // LÓGICA SEPARADA:
            // Si hay productos de contexto (ej: modal de repetir pedido), usar productos relacionados
            // Si NO hay productos de contexto (ej: página principal de PedidosInt), usar historial de compras
            if (contextProducts && contextProducts.length > 0) {
                // MODO PRODUCTOS RELACIONADOS (para plantilla general)
                console.log('MODO: Productos relacionados por similitud');
                productosComprados = contextProducts.map(producto => ({
                    id_producto: producto.id_producto,
                    cantidad: producto.cantidad,
                    productos: [{
                        id_producto: producto.id_producto,
                        nombre_producto: producto.nombre_producto,
                        id_categoria: producto.id_categoria,
                        id_estilo: producto.id_estilo,
                        id_materiales: producto.id_materiales
                    }]
                }));
                console.log('Productos Comprados (from context):', productosComprados);
            } else {
                // MODO HISTORIAL DE COMPRAS (para PedidosInt)
                console.log('MODO: Historial de compras');
                
                // Obtener historial de compras del cliente
                const { data: facturasData } = await supabase
                    .from('facturas')
                    .select('id_factura')
                    .eq('id_cliente', clienteId);

                console.log('Facturas Data:', facturasData);
                
                if (facturasData && facturasData.length > 0) {
                    const facturasIds = facturasData.map(f => f.id_factura);
                    console.log('Facturas IDs:', facturasIds);
                    
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

                    console.log('Detalles Data:', detallesData);
                    
                    if (detallesData) {
                        productosComprados = detallesData.map(detalle => ({
                            id_producto: detalle.id_producto,
                            cantidad: 1,
                            productos: [detalle.productos]
                        }));
                        console.log('Productos Comprados (from DB):', productosComprados);
                    }
                }
            }
            
            console.log('Productos Comprados finales:', productosComprados);

            // Generar recomendaciones personalizadas
            console.log('Calling generarRecomendacionesPersonalizadas with:', {
                productosComprados,
                clienteId,
                modo: contextProducts && contextProducts.length > 0 ? 'productos_relacionados' : 'historial_compras'
            });
            
            const recomendaciones = await generarRecomendacionesPersonalizadas(
                productosComprados,
                clienteId,
                Boolean(contextProducts && contextProducts.length > 0) // nuevo parámetro para indicar el modo
            );

            console.log('Recomendaciones generadas:', recomendaciones);
            setProductosRecomendados(recomendaciones);

        } catch (error) {
            console.error('Error al generar recomendaciones:', error);
            setError(error instanceof Error ? error.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const generarRecomendacionesPersonalizadas = async (
        productosComprados: any[],
        clienteId: number,
        modoProductosRelacionados: boolean // Nuevo parámetro para indicar si se usan productos relacionados
    ): Promise<ProductoRecomendado[]> => {
        console.log('generarRecomendacionesPersonalizadas called with:', { productosComprados, clienteId, modoProductosRelacionados });
        
        try {
            // SIEMPRE generar y guardar productos relacionados para poblar la tabla
            // Esto asegura que la tabla productosRelacionados esté siempre actualizada
            console.log('Generando y guardando productos relacionados para enriquecer la base de datos...');
            await generarYGuardarProductosRelacionados(productosComprados);

            // Limpiar productos relacionados obsoletos periódicamente (cada 10 llamadas)
            if (Math.random() < 0.1) {
                limpiarProductosRelacionadosObsoletos();
            }

            // Obtener preferencias del usuario por uso
            const preferenciasUsuario = await obtenerPreferenciasUsuario(clienteId);
            console.log('Preferencias del usuario:', preferenciasUsuario);

            // Analizar características de los productos comprados
            const caracteristicasCompradas = analizarCaracteristicasProductos(productosComprados);
            console.log('Características de productos comprados:', caracteristicasCompradas);

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

            // Aplicar filtros inteligentes basados en productos comprados
            const filtrosAplicados = aplicarFiltrosInteligentes(query, caracteristicasCompradas);
            query = filtrosAplicados.query;

            // Obtener productos base
            const { data: productosBase, error: productosError } = await query.limit(50);

            console.log('Productos Base (from initial query):', productosBase, 'Productos Error:', productosError);

            if (productosError) throw productosError;
            if (!productosBase) return [];

            let productosPuntuados: any[] = [];

            if (modoProductosRelacionados) {
                // MODO PRODUCTOS RELACIONADOS (para plantilla general)
                console.log('Aplicando lógica de productos relacionados por similitud');
                
                // Obtener productos relacionados
                const productosRelacionados = await obtenerProductosRelacionados(productosComprados);
                console.log('Productos Relacionados:', productosRelacionados);

                // Puntuar productos basándose en similitud y productos relacionados
                productosPuntuados = productosBase.map(producto => {
                    let score = 0;
                    let razones: string[] = [];

                    // Puntuar por similitud con productos del contexto
                    const scoreSimilitud = calcularSimilitudProducto(producto, caracteristicasCompradas);
                    score += scoreSimilitud.score;
                    if (scoreSimilitud.razones.length > 0) {
                        razones.push(...scoreSimilitud.razones);
                    }

                    // Puntuar por productos relacionados (prioridad alta)
                    if (productosRelacionados.includes(producto.id_producto)) {
                        score += 40; // Prioridad muy alta para productos relacionados
                        razones.push('Producto relacionado con tus selección actual');
                    }

                    // Puntuar por descuento
                    if (producto.descuento && producto.descuento > 0) {
                        score += 20;
                        razones.push('Producto en oferta');
                    }

                    // Puntuar por stock
                    score += Math.min(15, producto.stock_actual / 3);

                    // Verificar si coincide con preferencias de uso del usuario
                    const mensajeUso = verificarCoincidenciaUso(producto, preferenciasUsuario);
                    if (mensajeUso) {
                        score += 30; // Prioridad alta para productos que coinciden con uso preferido
                        razones.push(mensajeUso);
                    }

                    return {
                        ...producto,
                        score_recomendacion: score,
                        razon_recomendacion: razones.join(', ')
                    };
                });

            } else {
                // MODO HISTORIAL DE COMPRAS (para PedidosInt)
                console.log('Aplicando lógica de historial de compras');
                
                // Puntuar productos basándose en historial de compras
                productosPuntuados = productosBase.map(producto => {
                    let score = 0;
                    let razones: string[] = [];

                    // Puntuar por similitud con productos comprados anteriormente
                    const scoreSimilitud = calcularSimilitudProducto(producto, caracteristicasCompradas);
                    score += scoreSimilitud.score;
                    if (scoreSimilitud.razones.length > 0) {
                        razones.push(...scoreSimilitud.razones);
                    }

                    // Puntuar por descuento
                    if (producto.descuento && producto.descuento > 0) {
                        score += 20;
                        razones.push('Producto en oferta');
                    }

                    // Puntuar por stock
                    score += Math.min(15, producto.stock_actual / 3);

                    // Verificar si coincide con preferencias de uso del usuario
                    const mensajeUso = verificarCoincidenciaUso(producto, preferenciasUsuario);
                    if (mensajeUso) {
                        score += 30; // Prioridad alta para productos que coinciden con uso preferido
                        razones.push(mensajeUso);
                    }

                    return {
                        ...producto,
                        score_recomendacion: score,
                        razon_recomendacion: razones.join(', ')
                    };
                });
            }

            console.log('Productos puntuados (before sort/slice):', productosPuntuados);
            
            // Ordenar por score y tomar los mejores
            const productosFinales = productosPuntuados
                .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                .slice(0, 12);
                
            console.log('Final Productos Recomendados:', productosFinales);
            return productosFinales;

        } catch (error) {
            console.error('Error al generar recomendaciones personalizadas:', error);
            return [];
        }
    };

    // Función para obtener preferencias del usuario por uso
    const obtenerPreferenciasUsuario = async (clienteId: number) => {
        try {
            // Obtener preferencias del usuario desde la tabla usoXpref
            const { data: preferenciasData, error } = await supabase
                .from('usoXpref')
                .select(`
                    idUso,
                    uso (
                        nombre
                    ),
                    preferenciasProd (
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
                console.warn('Error al obtener preferencias del usuario:', error);
                return [];
            }

            return preferenciasData || [];
        } catch (error) {
            console.error('Error al obtener preferencias del usuario:', error);
            return [];
        }
    };

    // Función para verificar si un producto coincide con las preferencias de uso del usuario
    const verificarCoincidenciaUso = (producto: any, preferenciasUsuario: any[]) => {
        if (!preferenciasUsuario || preferenciasUsuario.length === 0) return null;

        for (const pref of preferenciasUsuario) {
            if (!pref.preferenciasProd || !Array.isArray(pref.preferenciasProd) || pref.preferenciasProd.length === 0) continue;
            
            const preferencia = pref.preferenciasProd[0];
            const uso = pref.uso?.nombre;
            
            if (!uso) continue;

            // Verificar coincidencias por categoría
            if (preferencia.idCategoria && producto.id_categoria === preferencia.idCategoria) {
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por material
            if (preferencia.idMaterial && producto.id_materiales === preferencia.idMaterial) {
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por estilo
            if (preferencia.idEstilo && producto.id_estilo === preferencia.idEstilo) {
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por color
            if (preferencia.color && producto.colorDom && 
                producto.colorDom.toLowerCase().includes(preferencia.color.toLowerCase())) {
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por superficie
            if (preferencia.superficie && producto.superficie && 
                producto.superficie.toLowerCase().includes(preferencia.superficie.toLowerCase())) {
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por durabilidad
            if (preferencia.durabilidad && producto.durabilidad && 
                producto.durabilidad >= preferencia.durabilidad) {
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por rango de precio
            if (preferencia.precMin && preferencia.precMax && 
                producto.precio >= preferencia.precMin && producto.precio <= preferencia.precMax) {
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }
        }

        return null;
    };

    // Nueva función para analizar características de productos comprados

    // Nueva función para aplicar filtros inteligentes
    const aplicarFiltrosInteligentes = (query: any, caracteristicas: any) => {
        let queryModificado = query;
        const filtrosAplicados: string[] = [];

        // Si hay productos comprados, priorizar características similares
        if (caracteristicas.totalProductos > 0) {
            // Incluir productos de las mismas categorías
            if (caracteristicas.categorias.size > 0) {
                queryModificado = queryModificado.in('id_categoria', Array.from(caracteristicas.categorias));
                filtrosAplicados.push('misma categoría');
            }

            // Incluir productos de estilos similares
            if (caracteristicas.estilos.size > 0) {
                queryModificado = queryModificado.in('id_estilo', Array.from(caracteristicas.estilos));
                filtrosAplicados.push('estilo similar');
            }

            // Incluir productos de materiales similares
            if (caracteristicas.materiales.size > 0) {
                queryModificado = queryModificado.in('id_materiales', Array.from(caracteristicas.materiales));
                filtrosAplicados.push('material similar');
            }
        }

        console.log('Filtros aplicados:', filtrosAplicados);
        return { query: queryModificado, filtros: filtrosAplicados };
    };

    const obtenerProductosRelacionados = async (productosComprados: any[]): Promise<number[]> => {
        console.log('obtenerProductosRelacionados called with:', productosComprados);
        
        if (!productosComprados || productosComprados.length === 0) {
            return [];
        }

        try {
            // Obtener productos relacionados desde la tabla productosRelacionados
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

            // Si encontramos suficientes productos relacionados, los retornamos
            if (productosRelacionados && productosRelacionados.length >= 5) {
                const idsRelacionados = productosRelacionados.map(p => p.producto_relacionado_id);
                console.log('Productos relacionados encontrados en BD:', idsRelacionados);
                return idsRelacionados;
            }

            // Si no hay suficientes productos relacionados, generamos nuevos y los guardamos
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

    // Nueva función para generar y guardar productos relacionados
    const generarYGuardarProductosRelacionados = async (productosComprados: any[]): Promise<number[]> => {
        try {
            // Obtener características de los productos comprados
            const caracteristicas = analizarCaracteristicasProductos(productosComprados);
            
            // Obtener todos los IDs de productos del contexto para excluirlos
            const idsProductosContexto = productosComprados.map(p => p.id_producto);
            console.log('Excluyendo productos del contexto:', idsProductosContexto);
            
            // Buscar productos similares por características, excluyendo TODOS los productos del contexto
            const { data: productosSimilares, error } = await supabase
                .from('productos')
                .select('id_producto, id_categoria, id_estilo, id_materiales, colorDom, superficie, durabilidad, precio')
                .not('id_producto', 'in', `(${idsProductosContexto.join(',')})`)
                .limit(50);

            if (error || !productosSimilares) {
                console.error('Error obteniendo productos similares:', error);
                return [];
            }

            const productosRelacionados: any[] = [];
            const productosParaGuardar: any[] = [];

            // Calcular similitud y preparar datos para guardar
            productosSimilares.forEach(producto => {
                // Crear un objeto ProductoRecomendado compatible para el cálculo
                const productoCompatible: ProductoRecomendado = {
                    id_producto: producto.id_producto,
                    nombre_producto: '',
                    imagen: '',
                    precio: producto.precio || 0,
                    stock_actual: 0,
                    id_categoria: producto.id_categoria,
                    id_estilo: producto.id_estilo,
                    id_materiales: producto.id_materiales,
                    colorDom: producto.colorDom,
                    superficie: producto.superficie,
                    durabilidad: producto.durabilidad
                };

                const similitud = calcularSimilitudProducto(productoCompatible, caracteristicas);
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

    // Función para limpiar productos relacionados obsoletos
    const limpiarProductosRelacionadosObsoletos = async () => {
        try {
            // Marcar como inactivos productos relacionados con score muy bajo
            const { error } = await supabase
                .from('productosRelacionados')
                .update({ activo: false })
                .lt('score_similitud', 0.2);

            if (error) {
                console.error('Error limpiando productos relacionados obsoletos:', error);
            }
        } catch (error) {
            console.error('Error en limpiarProductosRelacionadosObsoletos:', error);
        }
    };

    // Nueva función para poblar la tabla productosRelacionados con todos los pedidos multi-producto
    const poblarTablaProductosRelacionados = async () => {
        try {
            console.log('Iniciando población de tabla productosRelacionados...');
            
            // Obtener todos los pedidos que tengan más de un producto
            const { data: pedidosMultiProducto, error: pedidosError } = await supabase
                .from('detallePedidos')
                .select(`
                    id_pedido,
                    id_producto,
                    cantidad,
                    productos!inner(
                        id_producto,
                        nombre_producto,
                        id_categoria,
                        id_estilo,
                        id_materiales,
                        colorDom,
                        superficie,
                        durabilidad
                    )
                `)
                .order('id_pedido', { ascending: true });

            if (pedidosError) {
                console.error('Error obteniendo pedidos multi-producto:', pedidosError);
                return;
            }

            if (!pedidosMultiProducto) {
                console.log('No se encontraron pedidos para procesar');
                return;
            }

            // Agrupar productos por pedido
            const pedidosAgrupados = new Map();
            pedidosMultiProducto.forEach(detalle => {
                if (!pedidosAgrupados.has(detalle.id_pedido)) {
                    pedidosAgrupados.set(detalle.id_pedido, []);
                }
                pedidosAgrupados.get(detalle.id_pedido).push({
                    id_producto: detalle.id_producto,
                    cantidad: detalle.cantidad,
                    ...detalle.productos
                });
            });

            // Filtrar solo pedidos con más de un producto
            const pedidosConMultiplesProductos = Array.from(pedidosAgrupados.entries())
                .filter(([_, productos]) => productos.length > 1)
                .map(([idPedido, productos]) => ({ idPedido, productos }));

            console.log(`Encontrados ${pedidosConMultiplesProductos.length} pedidos con múltiples productos`);

            // Procesar cada pedido para generar productos relacionados
            let totalProductosRelacionados = 0;
            for (const pedido of pedidosConMultiplesProductos) {
                console.log(`Procesando pedido ${pedido.idPedido} con ${pedido.productos.length} productos`);
                
                // Generar productos relacionados para este pedido
                const productosRelacionados = await generarYGuardarProductosRelacionados(pedido.productos);
                totalProductosRelacionados += productosRelacionados.length;
                
                // Pequeña pausa para no sobrecargar la BD
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            console.log(`Población completada. Total de productos relacionados generados: ${totalProductosRelacionados}`);
            
        } catch (error) {
            console.error('Error en poblarTablaProductosRelacionados:', error);
        }
    };

    // Función para obtener productos por características similares (respaldo)
    const obtenerProductosPorCaracteristicas = async (productosComprados: any[]): Promise<number[]> => {
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

    const agregarAlCarrito = (producto: ProductoRecomendado) => {
        addItem({
            id_producto: producto.id_producto,
            nombre_producto: producto.nombre_producto,
            precio: producto.precio,
            imagen: producto.imagen,
            stock_actual: producto.stock_actual,
            metros_por_caja: producto.metros_por_caja || 0,
            descripcion: producto.descripcion || '',
            id_categoria: producto.id_categoria || 1,
            id_estilo: producto.id_estilo || 1,
            id_materiales: producto.id_materiales || 1,
            formato: 'Rectangular',
            piezas_por_caja: 1,
            superficie: producto.superficie || 'Lisa',
            durabilidad: producto.durabilidad || 5,
            colorDom: producto.colorDom || 'Blanco',
            disponibilidad: producto.disponibilidad || true
        }, 1);
    };

    const convertirAProducto = (productoRecomendado: ProductoRecomendado) => {
        return {
            id_producto: productoRecomendado.id_producto,
            nombre_producto: productoRecomendado.nombre_producto,
            descripcion: productoRecomendado.descripcion || '',
            precio: productoRecomendado.precio,
            stock_actual: productoRecomendado.stock_actual,
            imagen: productoRecomendado.imagen,
            descuento: productoRecomendado.descuento,
            metros_por_caja: productoRecomendado.metros_por_caja || 0,
            disponibilidad: productoRecomendado.disponibilidad || true,
            formato: productoRecomendado.formato || '',
            piezas_por_caja: productoRecomendado.piezas_por_caja || 0,
            id_estilo: productoRecomendado.id_estilo || 0,
            id_materiales: productoRecomendado.id_materiales || 0,
            id_categoria: productoRecomendado.id_categoria || 0,
            superficie: productoRecomendado.superficie || '',
            durabilidad: productoRecomendado.durabilidad || 0,
            colorDom: productoRecomendado.colorDom || ''
        };
    };

    const nextSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === productosRecomendados.length - 4 ? 0 : prevIndex + 1
        );
    };

    const prevSlide = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? productosRecomendados.length - 4 : prevIndex - 1
        );
    };

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(precio);
    };

    const abrirModalProducto = (producto: ProductoRecomendado) => {
        setSelectedProduct(producto);
        setMetrosDeseados(producto.metros_por_caja || 0);
        setCajasDeseadas(1);
        setShowProductModal(true);
    };

    const cerrarModalProducto = () => {
        setShowProductModal(false);
        setSelectedProduct(null);
    };

    // Función para calcular metros cuadrados por pieza
    const calcularMetrosPorPieza = (formato: string | undefined): number => {
        if (!formato) return 0;
        const [ancho, largo] = formato.split('x').map(Number);
        if (!ancho || !largo) return 0;
        return (ancho * largo) / 10000;
    };

    // Función para calcular el precio total
    const calcularPrecioTotal = (producto: ProductoRecomendado) => {
        const precioBase = producto.precio * cajasDeseadas;

        // Aplicar descuento si existe
        if (producto.descuento && producto.descuento > 0) {
            const descuento = (precioBase * producto.descuento) / 100;
            return precioBase - descuento;
        }

        return precioBase;
    };

    // Actualizar cálculos basados en el modo de selección
    useEffect(() => {
        if (selectedProduct) {
            if (selectionMode === 'cajas') {
                setMetrosDeseados(cajasDeseadas * (selectedProduct.metros_por_caja || 0));
            } else {
                const cajasNecesarias = Math.ceil(metrosDeseados / (selectedProduct.metros_por_caja || 1));
                setCajasDeseadas(cajasNecesarias);
                setMetrosDeseados(cajasNecesarias * (selectedProduct.metros_por_caja || 0));
            }
        }
    }, [selectionMode, cajasDeseadas, metrosDeseados, selectedProduct]);

    const handleMetrosChange = (metros: number) => {
        if (!selectedProduct) return;
        if (metros < (selectedProduct.metros_por_caja || 0)) return;
        const cajasRequeridas = Math.ceil(metros / (selectedProduct.metros_por_caja || 1));
        
        if (cajasRequeridas <= selectedProduct.stock_actual) {
            const metrosReales = cajasRequeridas * (selectedProduct.metros_por_caja || 0);
            setMetrosDeseados(metrosReales);
            setCajasDeseadas(cajasRequeridas);
        }
    };

    const handleCajasChange = (cajas: number) => {
        if (!selectedProduct) return;
        if (cajas >= 1 && cajas <= selectedProduct.stock_actual) {
            setCajasDeseadas(cajas);
            setMetrosDeseados(cajas * (selectedProduct.metros_por_caja || 0));
        }
    };

    const handleAddToCartFromModal = () => {
        if (!selectedProduct) return;
        
        const metrosReales = cajasDeseadas * (selectedProduct.metros_por_caja || 0);
        
        addItem(convertirAProducto(selectedProduct), cajasDeseadas, {
            metrosCuadrados: metrosDeseados,
            cajasNecesarias: cajasDeseadas,
            metrosReales: metrosReales
        });
        
        cerrarModalProducto();
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Sin stock', color: 'text-red-600' };
        if (stock <= 3) return { text: 'Stock bajo', color: 'text-yellow-600' };
        return { text: 'Disponible', color: 'text-green-600' };
    };



    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Generando recomendaciones inteligentes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                    <button 
                        onClick={generarRecomendaciones}
                        className="mt-2 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors cursor-pointer text-sm"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    console.log('Rendering component with:', { 
        loading, 
        error, 
        productosRecomendados: productosRecomendados.length,
        showAll,
        currentIndex 
    });
    
    if (productosRecomendados.length === 0) {
        console.log('No productos recomendados, showing empty state');
        return (
            <div className="text-center py-8">
                <FaLightbulb className="text-gray-400 text-4xl mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay recomendaciones disponibles</h3>
                <p className="text-gray-600 text-sm mb-4">
                    Genera recomendaciones basadas en tu historial de compras.
                </p>
                <button
                    onClick={generarRecomendaciones}
                    className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm cursor-pointer"
                >
                                            <FaRedo className="mr-2" />
                    Generar Recomendaciones
                </button>
            </div>
        );
    }

    const productosAMostrar = showAll ? productosRecomendados : productosRecomendados.slice(currentIndex, currentIndex + 4);
    console.log('Productos a mostrar:', productosAMostrar);

    return (
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 ${compact ? 'p-4' : 'p-6'}`}>
            <div className={`flex items-center justify-between ${compact ? 'mb-4' : 'mb-6'}`}>
                <div className="flex items-center">
                    <FaLightbulb className="text-blue-500 text-xl mr-3" />
                    <div>
                        <h3 className={`font-semibold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
                            {compact ? 'Recomendaciones' : 'Recomendaciones Inteligentes'}
                        </h3>
                        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                            {contextProducts && contextProducts.length > 0 
                                ? `Productos relacionados por similitud (${contextProducts.length} productos)`
                                : 'Basadas en tu historial de compras'
                            }
                        </p>
                    </div>
                </div>
                
                {!showAll && productosRecomendados.length > 4 && (
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={prevSlide}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            disabled={currentIndex === 0}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            disabled={currentIndex >= productosRecomendados.length - 4}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>

            <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6'}`}>
                {productosAMostrar.map((producto) => {
                    // Verificar si tiene mensaje de uso preferido
                    const tieneMensajeUso = producto.razon_recomendacion && 
                        producto.razon_recomendacion.includes('Perfecto para tu');
                    
                    return (
                        <div key={producto.id_producto} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
                            <div className="relative">
                                <img
                                    src={producto.imagen || '/placeholder-image.svg'}
                                    alt={producto.nombre_producto}
                                    className={`w-full object-cover ${compact ? 'h-20' : 'h-28'}`}
                                />
                                
                                {/* Badges */}
                                <div className="absolute top-1.5 left-1.5 flex flex-col space-y-1">
                                    {producto.score_recomendacion && (
                                        <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center">
                                            <FaStar className="mr-0.5" />
                                            {Number(producto.score_recomendacion).toFixed(2)}
                                        </div>
                                    )}
                                    {producto.descuento && producto.descuento > 0 && (
                                        <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                            -{producto.descuento}%
                                        </div>
                                    )}
                                </div>

                                {/* Badge especial para mensaje de uso preferido */}
                                {tieneMensajeUso && (
                                    <div className="absolute top-1.5 right-1.5">
                                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                            <FaHeart className="mr-1 inline" />
                                            ¡Ideal!
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={`${compact ? 'p-2' : 'p-2.5'}`}>
                                <h4 className={`font-medium text-gray-900 mb-1.5 ${compact ? 'text-xs' : 'text-sm'} line-clamp-2`}>
                                    {producto.nombre_producto}
                                </h4>
                                
                                {/* Mensaje de uso preferido destacado */}
                                {tieneMensajeUso && (
                                    <div className="mb-1.5 p-1.5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 text-xs font-medium text-center">
                                            {producto.razon_recomendacion?.split(', ').find(razon => 
                                                razon.includes('Perfecto para tu')
                                            )}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-1.5">
                                    <span className={`font-bold text-amber-600 ${compact ? 'text-sm' : 'text-base'}`}>
                                        {formatearPrecio(producto.precio)}
                                    </span>
                                    <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                                        Stock: {producto.stock_actual}
                                    </span>
                                </div>

                                {/* Razones de recomendación (sin el mensaje de uso ya que está destacado arriba) */}
                                {producto.razon_recomendacion && !tieneMensajeUso && (
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                        {producto.razon_recomendacion}
                                    </p>
                                )}

                                {/* Botones de acción */}
                                <div className="flex space-x-1.5">
                                    <button
                                        onClick={() => agregarAlCarrito(producto)}
                                        className={`bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center flex-1 cursor-pointer ${
                                            compact ? 'py-1 px-1.5 text-xs' : 'py-1.5 px-2 text-xs'
                                        }`}
                                    >
                                        <FaShoppingCart className="mr-1" />
                                        {compact ? 'Agregar' : 'Agregar'}
                                    </button>
                                    <button 
                                        onClick={() => abrirModalProducto(producto)}
                                        className={`bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer ${
                                            compact ? 'py-1 px-1.5 text-xs' : 'py-1.5 px-2 text-xs'
                                        }`}
                                    >
                                        <FaEye className="mr-1" />
                                        Ver
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Botón para mostrar todas las recomendaciones */}
            {productosRecomendados.length > 4 && (
                <div className="text-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                    >
                        {showAll ? (
                            <>
                                <FaEye className="mr-2" />
                                Mostrar Menos
                            </>
                        ) : (
                            <>
                                <FaLightbulb className="mr-2" />
                                Ver Todas las Recomendaciones ({productosRecomendados.length})
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Información adicional */}
            {!compact && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-start">
                        <FaInfoCircle className="text-blue-600 mt-1 mr-3 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-2">¿Cómo funcionan estas recomendaciones?</p>
                            <div className="space-y-2">
                                <p>
                                    <strong>Análisis de compras anteriores:</strong> Analizamos los productos que has comprado 
                                    para identificar patrones en categorías, estilos, materiales y colores.
                                </p>
                                <p>
                                    <strong>Productos relacionados:</strong> Incluimos productos que están técnicamente 
                                    relacionados con tus compras anteriores, almacenados en nuestra base de datos de relaciones.
                                </p>
                                <p>
                                    <strong>Puntuación inteligente:</strong> Cada producto recibe una puntuación basada en 
                                    qué tan bien se adapta a tus patrones de compra anteriores (se calcula analizando similitud de características, 
                                    historial de compras, y coincidencias con preferencias de uso).
                                </p>
                                <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                                    <p className="font-medium mb-2 text-blue-900">¿Qué significan los badges?</p>
                                    <div className="space-y-1 text-xs text-blue-800">
                                        <div className="flex items-center">
                                            <div className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center mr-2">
                                                <FaStar className="mr-0.5" />
                                                85
                                            </div>
                                            <span><strong>Estrella azul:</strong> Puntuación de recomendación (0-100). Cuanto más alta, mejor se adapta a tus preferencias (se calcula analizando similitud de características, historial de compras, y coincidencias con preferencias de uso).</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full mr-2">
                                                -15%
                                            </div>
                                            <span><strong>Porcentaje rojo:</strong> Descuento disponible en el producto.</span>
                                        </div>
                                        <div className="flex items-center">
                                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium mr-2">
                                                <FaHeart className="mr-1 inline" />
                                                ¡Ideal!
                                            </div>
                                            <span><strong>Badge verde:</strong> Producto que coincide perfectamente con tus preferencias de uso.</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de detalle del producto */}
            {selectedProduct && showProductModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[95vh] flex flex-col">
                        {/* Header del modal */}
                        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">{selectedProduct.nombre_producto}</h3>
                                <p className="text-xs text-gray-600">ID: {selectedProduct.id_producto}</p>
                            </div>
                            <button 
                                onClick={cerrarModalProducto} 
                                className="text-gray-500 hover:text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>

                        {/* Contenido del modal */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4">
                                {/* Imagen y información principal */}
                                <div className="grid grid-cols-1 gap-4 mb-4">
                                    <div>
                                        <img
                                            src={selectedProduct.imagen || '/placeholder-image.svg'}
                                            alt={selectedProduct.nombre_producto}
                                            className="w-full h-48 object-cover rounded-lg shadow-md"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        {/* Precio y stock */}
                                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 rounded-lg border border-amber-200">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xl font-bold text-amber-600">
                                                    {formatearPrecio(selectedProduct.precio)}
                                                </span>
                                                {selectedProduct.descuento && selectedProduct.descuento > 0 && (
                                                    <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                                                        -{selectedProduct.descuento}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-600">Stock disponible:</span>
                                                <span className={`font-semibold text-sm ${selectedProduct.stock_actual > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {selectedProduct.stock_actual} cajas
                                                </span>
                                            </div>
                                        </div>

                                        {/* Información técnica */}
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <h4 className="font-medium text-gray-900 mb-2 text-sm">Información Técnica</h4>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-600">Metros por caja:</span>
                                                    <p className="font-medium">{selectedProduct.metros_por_caja || 0} m²</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Superficie:</span>
                                                    <p className="font-medium">{selectedProduct.superficie || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Durabilidad:</span>
                                                    <p className="font-medium">{selectedProduct.durabilidad || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Color:</span>
                                                    <p className="font-medium">{selectedProduct.colorDom || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Descripción */}
                                        {selectedProduct.descripcion && (
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm">Descripción</h4>
                                                <p className="text-xs text-gray-700">{selectedProduct.descripcion}</p>
                                            </div>
                                        )}

                                        {/* Razón de recomendación */}
                                        {selectedProduct.razon_recomendacion && (
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm">¿Por qué te lo recomendamos?</h4>
                                                <p className="text-xs text-gray-700">{selectedProduct.razon_recomendacion}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selector de cantidad */}
                                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                    <h4 className="font-medium text-gray-900 mb-3 text-sm">Cantidad a comprar</h4>
                                    
                                    {/* Selector de modo */}
                                    <div className="flex items-center space-x-3 mb-3">
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="selectionMode"
                                                value="cajas"
                                                checked={selectionMode === 'cajas'}
                                                onChange={(e) => setSelectionMode(e.target.value as 'metros' | 'cajas')}
                                                className="mr-1.5"
                                            />
                                            <span className="text-xs">Por cajas</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="radio"
                                                name="selectionMode"
                                                value="metros"
                                                checked={selectionMode === 'metros'}
                                                onChange={(e) => setSelectionMode(e.target.value as 'metros' | 'cajas')}
                                                className="mr-1.5"
                                            />
                                            <span className="text-xs">Por metros cuadrados</span>
                                        </label>
                                    </div>

                                    {/* Controles de cantidad */}
                                    {selectionMode === 'cajas' ? (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => handleCajasChange(cajasDeseadas - 1)}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full border transition-colors cursor-pointer"
                                                    disabled={cajasDeseadas <= 1}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                                    </svg>
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={cajasDeseadas} 
                                                    onChange={(e) => handleCajasChange(Number(e.target.value))} 
                                                    min="1" 
                                                    max={selectedProduct.stock_actual} 
                                                    className="w-16 text-center border border-gray-300 rounded-md text-xs py-1.5"
                                                />
                                                <button 
                                                    onClick={() => handleCajasChange(cajasDeseadas + 1)}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full border transition-colors cursor-pointer"
                                                    disabled={cajasDeseadas >= selectedProduct.stock_actual}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                = {metrosDeseados.toFixed(2)} m²
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => handleMetrosChange(metrosDeseados - (selectedProduct.metros_por_caja || 0))}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full border transition-colors cursor-pointer"
                                                    disabled={metrosDeseados <= (selectedProduct.metros_por_caja || 0)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                                                    </svg>
                                                </button>
                                                <input 
                                                    type="number" 
                                                    value={metrosDeseados.toFixed(2)} 
                                                    onChange={(e) => handleMetrosChange(Number(e.target.value))} 
                                                    min={selectedProduct.metros_por_caja || 0} 
                                                    max={selectedProduct.stock_actual * (selectedProduct.metros_por_caja || 1)} 
                                                    step={selectedProduct.metros_por_caja || 1}
                                                    className="w-20 text-center border border-gray-300 rounded-md text-xs py-1.5"
                                                />
                                                <button 
                                                    onClick={() => handleMetrosChange(metrosDeseados + (selectedProduct.metros_por_caja || 0))}
                                                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full border transition-colors cursor-pointer"
                                                    disabled={metrosDeseados >= selectedProduct.stock_actual * (selectedProduct.metros_por_caja || 1)}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <div className="text-xs text-gray-600">
                                                = {cajasDeseadas} cajas
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Resumen del pedido */}
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200 mb-4">
                                    <h4 className="font-medium text-gray-900 mb-2 text-sm">Resumen del pedido</h4>
                                    <div className="grid grid-cols-2 gap-3 text-xs">
                                        <div>
                                            <span className="text-gray-600">Cantidad de cajas:</span>
                                            <p className="font-medium text-base">{cajasDeseadas}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Metros cuadrados:</span>
                                            <p className="font-medium text-base">{metrosDeseados.toFixed(2)} m²</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Precio por caja:</span>
                                            <p className="font-medium">{formatearPrecio(selectedProduct.precio)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600">Precio total:</span>
                                            <p className="font-medium text-base text-amber-600">
                                                {formatearPrecio(calcularPrecioTotal(selectedProduct))}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Botones de acción */}
                                <div className="flex">
                                    <button 
                                        onClick={handleAddToCartFromModal}
                                        className="w-full bg-amber-600 text-white py-2.5 px-3 rounded-lg hover:bg-amber-700 transition-colors font-medium flex items-center justify-center text-sm cursor-pointer"
                                    >
                                        <FaShoppingCart className="mr-1.5" />
                                        Agregar al Carrito
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
