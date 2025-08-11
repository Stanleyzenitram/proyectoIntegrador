import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FaStar, FaHeart, FaShoppingCart, FaEye, FaLightbulb, FaInfoCircle, FaCheck, FaTimes } from 'react-icons/fa';
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
    const { user } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    const [productosRecomendados, setProductosRecomendados] = useState<ProductoRecomendado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAll, setShowAll] = useState(false);

    const [mostrarDetalles, setMostrarDetalles] = useState<number | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<ProductoRecomendado | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'metros' | 'cajas'>('metros');
    const [metrosDeseados, setMetrosDeseados] = useState(0);
    const [cajasDeseadas, setCajasDeseadas] = useState(1);
    const [esRevestimiento, setEsRevestimiento] = useState(false);
    const [loadingTipo, setLoadingTipo] = useState(true);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [preferenciasInfo, setPreferenciasInfo] = useState<{
        total: number;
        validas: number;
        modo: 'preferencias' | 'generales' | 'fallback';
    }>({ total: 0, validas: 0, modo: 'generales' });
    




    // Función para determinar si un producto es de revestimientos
    const determinarTipoProducto = async (producto: ProductoRecomendado): Promise<boolean> => {
        try {
            // Si no tiene categoría, asumimos que no es revestimiento
            if (!producto.id_categoria) return false;
            
            // Categorías que se consideran revestimientos
            const categoriasRevestimientos = [
                'revestimiento',
                'cerámica', 
                'porcelanato',
                'gres',
                'mosaico',
                'piedra natural',
                'piso',
                'pared',
                'azulejo',
                'baldosa'
            ];
            
            // Buscar la categoría en la base de datos
            const { data: categoria } = await supabase
                .from('categorias')
                .select('nombre_categoria')
                .eq('id_categoria', producto.id_categoria)
                .single();
            
            if (categoria) {
                const nombreCategoria = categoria.nombre_categoria.toLowerCase();
                const esRevestimientoPorCategoria = categoriasRevestimientos.some(term => 
                    nombreCategoria.includes(term)
                );
                
                if (esRevestimientoPorCategoria) return true;
            }
            
            // Verificación adicional por nombre del producto y características
            const nombreProducto = producto.nombre_producto.toLowerCase();
            const descripcion = producto.descripcion?.toLowerCase() || '';
            
            // Verificar si el nombre o descripción contienen términos de revestimientos
            const esRevestimientoPorNombre = categoriasRevestimientos.some(term => 
                nombreProducto.includes(term) || descripcion.includes(term)
            );
            
            // También verificar si tiene formato y metros_por_caja (indicadores de revestimiento)
            const tieneFormatoRevestimiento = Boolean(producto.formato && 
                producto.formato.includes('x') && 
                producto.metros_por_caja && producto.metros_por_caja > 0);
            
            return esRevestimientoPorNombre || tieneFormatoRevestimiento;
            
        } catch (error) {
            console.error('Error al verificar categoría:', error);
            
            // Fallback: verificación por características del producto
            const nombreProducto = producto.nombre_producto.toLowerCase();
            const descripcion = producto.descripcion?.toLowerCase() || '';
            
            const categoriasRevestimientos = [
                'revestimiento', 'cerámica', 'porcelanato', 'gres', 'mosaico',
                'piedra natural', 'piso', 'pared', 'azulejo', 'baldosa'
            ];
            
            const esRevestimientoPorNombre = categoriasRevestimientos.some(term => 
                nombreProducto.includes(term) || descripcion.includes(term)
            );
            
            const tieneFormatoRevestimiento = Boolean(producto.formato && 
                producto.formato.includes('x') && 
                producto.metros_por_caja && producto.metros_por_caja > 0);
            
            return esRevestimientoPorNombre || tieneFormatoRevestimiento;
        }
    };

    // Efecto principal para regenerar recomendaciones cuando cambie el usuario
    useEffect(() => {
        if (user) {
            console.log('🔄 Usuario cambiado, regenerando recomendaciones para:', user.id);
            // Limpiar estado anterior
            setProductosRecomendados([]);
            // Forzar regeneración
            generarRecomendaciones();
        }
    }, [user?.id]); // Cambiar de [user] a [user?.id] para detectar cambios de ID

    // Efecto adicional para regenerar recomendaciones cuando cambien los productos del contexto
    useEffect(() => {
        if (user && contextProducts && contextProducts.length > 0) {
            console.log('Context products changed, regenerating recommendations...');
            generarRecomendaciones();
        }
    }, [user?.id, contextProducts]); // Cambiar de [user] a [user?.id]

    const generarRecomendaciones = async () => {
        if (!user) {
            console.log('❌ No user found, returning from generarRecomendaciones.');
            return;
        }
        console.log('🚀 generarRecomendaciones called. User ID:', user.id);
        console.log('🆔 Generando recomendaciones para usuario:', user.email || user.id);
        
        try {
            setLoading(true);
            setError(null);
            
            // Obtener ID del cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            console.log('👤 Cliente Data:', clienteData, 'Cliente Error:', clienteError);
            
            if (clienteError || !clienteData) {
                throw new Error('No se pudo obtener información del cliente');
            }

            const clienteId = clienteData.id_cliente;
            console.log('🆔 Cliente ID:', clienteId);

            // Obtener productos para recomendaciones
            let productosComprados: any[] = [];
            
            console.log('📦 Context Products:', contextProducts);
            
            // LÓGICA SEPARADA:
            // Si hay productos de contexto (ej: modal de repetir pedido), usar productos relacionados
            // Si NO hay productos de contexto (ej: página principal de PedidosInt), usar historial de compras
            if (contextProducts && contextProducts.length > 0) {
                // MODO PRODUCTOS RELACIONADOS (para plantilla general)
                console.log('🎯 MODO: Productos relacionados por similitud');
                productosComprados = contextProducts.map(producto => ({
                    id_producto: producto.id_producto,
                    cantidad: producto.cantidad,
                    productos: [{
                        id_producto: producto.id_producto,
                        nombre_producto: producto.nombre_producto,
                        id_categoria: producto.id_categoria,
                        id_estilo: producto.id_estilo,
                        id_materiales: producto.id_materiales,
                        colorDom: producto.colorDom,
                        superficie: producto.superficie,
                        durabilidad: producto.durabilidad,
                        precio: producto.precio
                    }],
                    // Incluir todos los campos necesarios para el análisis
                    ...producto
                }));
                console.log('📋 Productos Comprados (from context):', productosComprados);
            } else {
                // MODO HISTORIAL DE COMPRAS (para PedidosInt)
                console.log('📚 MODO: Historial de compras');
                
                // Obtener historial de compras del cliente
                const { data: facturasData } = await supabase
                    .from('facturas')
                    .select('id_factura')
                    .eq('id_cliente', clienteId);

                console.log('🧾 Facturas Data:', facturasData);
                
                if (facturasData && facturasData.length > 0) {
                    const facturasIds = facturasData.map(f => f.id_factura);
                    console.log('🆔 Facturas IDs:', facturasIds);
                    
                    const { data: detallesData } = await supabase
                        .from('detalles_factura')
                        .select(`
                            id_producto,
                            productos (
                                id_producto,
                                nombre_producto,
                                id_categoria,
                                id_estilo,
                                id_materiales,
                                colorDom,
                                superficie,
                                durabilidad,
                                precio
                            )
                        `)
                        .in('id_factura', facturasIds);

                    console.log('📝 Detalles Data:', detallesData);
                    
                    if (detallesData) {
                        productosComprados = detallesData.map(detalle => ({
                            id_producto: detalle.id_producto,
                            cantidad: 1,
                            productos: [detalle.productos],
                            // Incluir todos los campos necesarios para el análisis
                            ...detalle.productos
                        }));
                        console.log('📋 Productos Comprados (from DB):', productosComprados);
                    }
                }
            }
            
            console.log('🎯 Productos Comprados finales:', productosComprados);

            // Generar recomendaciones personalizadas - SIEMPRE llamar la función
            // Si no hay compras previas, la función internamente generará recomendaciones por preferencias
            console.log('🔮 Calling generarRecomendacionesPersonalizadas with:', {
                productosComprados,
                clienteId,
                modo: contextProducts && contextProducts.length > 0 ? 'productos_relacionados' : 'historial_compras',
                sinCompras: productosComprados.length === 0
            });
            
            const recomendaciones = await generarRecomendacionesPersonalizadas(
                productosComprados,
                clienteId,
                Boolean(contextProducts && contextProducts.length > 0) // nuevo parámetro para indicar el modo
            );

            console.log('✨ Recomendaciones generadas:', recomendaciones);
            
            if (recomendaciones && recomendaciones.length > 0) {
                console.log(`✅ Se generaron ${recomendaciones.length} recomendaciones exitosamente`);
                setProductosRecomendados(recomendaciones);
            } else {
                console.log('⚠️ No se generaron recomendaciones');
                setProductosRecomendados([]);
            }

        } catch (error) {
            console.error('❌ Error al generar recomendaciones:', error);
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
            // Obtener preferencias del usuario por uso (SIEMPRE obtener, incluso si no hay productos comprados)
            const preferenciasUsuario = await obtenerPreferenciasUsuario(clienteId);
            console.log('Preferencias del usuario:', preferenciasUsuario);

            // MEJORA: Si no hay productos comprados, generar recomendaciones basadas SOLO en preferencias
            if (productosComprados.length === 0) {
                console.log('🆕 No hay historial de compras, generando recomendaciones por preferencias...');
                const recomendacionesPorPreferencias = await generarRecomendacionesPorPreferencias(preferenciasUsuario, clienteId);
                
                if (recomendacionesPorPreferencias.length > 0) {
                    console.log('✅ Recomendaciones por preferencias generadas exitosamente');
                    return recomendacionesPorPreferencias;
                } else {
                    console.log('⚠️ No se generaron recomendaciones por preferencias, usando fallback general...');
                    return await generarRecomendacionesGenerales(clienteId);
                }
            }

            // SIEMPRE generar y guardar productos relacionados para poblar la tabla
            // Esto asegura que la tabla productosRelacionados esté siempre actualizada
            console.log('Generando y guardar productos relacionados para enriquecer la base de datos...');
            await generarYGuardarProductosRelacionados(productosComprados);

            // Limpiar productos relacionados obsoletos periódicamente (cada 10 llamadas)
            if (Math.random() < 0.1) {
                limpiarProductosRelacionadosObsoletos();
            }

            // Analizar características de los productos comprados
            const caracteristicasCompradas = analizarCaracteristicasProductos(productosComprados);
            console.log('🔍 Características de productos comprados:', {
                categorias: Array.from(caracteristicasCompradas.categorias),
                estilos: Array.from(caracteristicasCompradas.estilos),
                materiales: Array.from(caracteristicasCompradas.materiales),
                colores: Array.from(caracteristicasCompradas.colores),
                superficies: Array.from(caracteristicasCompradas.superficies),
                durabilidades: Array.from(caracteristicasCompradas.durabilidades),
                rangoPrecio: caracteristicasCompradas.rangoPrecio
            });
            console.log('📊 Productos comprados para análisis:', productosComprados.map(p => ({
                id: p.id_producto,
                nombre: p.nombre_producto,
                categoria: p.id_categoria,
                estilo: p.id_estilo,
                material: p.id_materiales,
                color: p.colorDom,
                superficie: p.superficie,
                durabilidad: p.durabilidad,
                precio: p.precio
            })));

            // MEJORA: Obtener más productos base para mayor diversificación
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

            // MEJORA: Aumentar el límite para obtener más productos y mejor diversificación
            const { data: productosBase, error: productosError } = await query.limit(200); // Aumentado de 100 a 200 para más recomendaciones

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
                    
                    // Logging detallado para debugging
                    if (scoreSimilitud.score > 0) {
                        console.log(`🎯 Similitud alta para ${producto.nombre_producto} (contexto):`, {
                            score: scoreSimilitud.score,
                            razones: scoreSimilitud.razones,
                            producto: {
                                categoria: producto.id_categoria,
                                estilo: producto.id_estilo,
                                material: producto.id_materiales,
                                color: producto.colorDom,
                                superficie: producto.superficie,
                                durabilidad: producto.durabilidad
                            }
                        });
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

                    // MEJORA: Verificar si coincide con preferencias de uso del usuario (prioridad muy alta)
                    const mensajeUso = verificarCoincidenciaUso(producto, preferenciasUsuario);
                    if (mensajeUso) {
                        score += 50; // Prioridad muy alta para productos que coinciden con uso preferido
                        razones.push(mensajeUso);
                        console.log('🎯 Producto con coincidencia de uso:', producto.nombre_producto, 'Score:', score, 'Mensaje:', mensajeUso);
                    } else {
                        console.log('❌ Producto sin coincidencia de uso:', producto.nombre_producto, 'Score actual:', score);
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
                    
                    // Logging detallado para debugging
                    if (scoreSimilitud.score > 0) {
                        console.log(`🎯 Similitud alta para ${producto.nombre_producto}:`, {
                            score: scoreSimilitud.score,
                            razones: scoreSimilitud.razones,
                            producto: {
                                categoria: producto.id_categoria,
                                estilo: producto.id_estilo,
                                material: producto.id_materiales,
                                color: producto.colorDom,
                                superficie: producto.superficie,
                                durabilidad: producto.durabilidad
                            }
                        });
                    }

                    // Puntuar por descuento
                    if (producto.descuento && producto.descuento > 0) {
                        score += 20;
                        razones.push('Producto en oferta');
                    }

                    // Puntuar por stock
                    score += Math.min(15, producto.stock_actual / 3);

                    // MEJORA: Verificar si coincide con preferencias de uso del usuario (prioridad muy alta)
                    const mensajeUso = verificarCoincidenciaUso(producto, preferenciasUsuario);
                    if (mensajeUso) {
                        score += 50; // Prioridad muy alta para productos que coinciden con uso preferido
                        razones.push(mensajeUso);
                        console.log('🎯 Producto con coincidencia de uso (historial):', producto.nombre_producto, 'Score:', score, 'Mensaje:', mensajeUso);
                    } else {
                        console.log('❌ Producto sin coincidencia de uso (historial):', producto.nombre_producto, 'Score actual:', score);
                    }

                    return {
                        ...producto,
                        score_recomendacion: score,
                        razon_recomendacion: razones.join(', ')
                    };
                });
            }

            console.log('Productos puntuados (before sort/slice):', productosPuntuados);
            
            // MEJORA: Implementar estrategia de diversificación inteligente
            const productosFinales = await aplicarDiversificacionInteligente(productosPuntuados, caracteristicasCompradas, productosComprados);
                
            console.log('🎯 Productos finales ordenados por score:');
            productosFinales.forEach((producto, index) => {
                console.log(`${index + 1}. ${producto.nombre_producto} - Score: ${producto.score_recomendacion} - Razón: ${producto.razon_recomendacion}`);
            });
                
            console.log('Final Productos Recomendados:', productosFinales);
            return productosFinales;

        } catch (error) {
            console.error('Error al generar recomendaciones personalizadas:', error);
            return [];
        }
    };

    // NUEVA FUNCIÓN: Aplicar diversificación inteligente para incluir productos nuevos
    const aplicarDiversificacionInteligente = async (
        productosPuntuados: any[], 
        caracteristicas: any,
        productosComprados: any[] // Nuevo parámetro para pasar productos ya comprados
    ): Promise<ProductoRecomendado[]> => {
        console.log('🔀 Aplicando diversificación inteligente...');
        
        // Ordenar por score inicial
        const productosOrdenados = productosPuntuados
            .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0));
        
        // Tomar los primeros 12 productos con mejor score (productos similares a lo que ya compraste)
        const productosSimilares = productosOrdenados.slice(0, 12);
        
        // MEJORA: Buscar productos nuevos con características complementarias
        const productosNuevos = await buscarProductosNuevosComplementarios(caracteristicas, productosOrdenados, productosComprados);
        
        // MEJORA: Buscar productos de tendencia o populares
        const productosTendencia = await buscarProductosTendencia(productosOrdenados);
        
        // Combinar y balancear las recomendaciones
        const recomendacionesFinales = [
            ...productosSimilares,                    // 12 productos similares a lo que ya compraste
            ...productosNuevos.slice(0, 8),          // 8 productos nuevos complementarios
            ...productosTendencia.slice(0, 3)        // 3 productos de tendencia
        ];
        
        console.log('📊 Distribución final de recomendaciones:');
        console.log(`   - Productos similares: ${productosSimilares.length}`);
        console.log(`   - Productos nuevos: ${productosNuevos.slice(0, 8).length}`);
        console.log(`   - Productos tendencia: ${productosTendencia.slice(0, 3).length}`);
        
        return recomendacionesFinales;
    };

    // NUEVA FUNCIÓN: Buscar productos nuevos con características complementarias
    const buscarProductosNuevosComplementarios = async (
        caracteristicas: any, 
        productosExistentes: any[],
        productosComprados: any[] // Nuevo parámetro para excluir productos ya comprados
    ): Promise<ProductoRecomendado[]> => {
        console.log('🔍 Buscando productos nuevos complementarios...');
        
        try {
            // Obtener IDs de productos ya incluidos en recomendaciones actuales
            const idsExcluidos = productosExistentes.map(p => p.id_producto);
            
            // Obtener IDs de productos ya comprados por el usuario
            const idsProductosComprados = productosComprados.map(p => p.id_producto);
            
            // Combinar ambos arrays de IDs para excluirlos completamente
            const todosLosIdsExcluidos = [...idsExcluidos, ...idsProductosComprados];
            
            console.log('🚫 Productos excluidos:', {
                deRecomendaciones: idsExcluidos.length,
                yaComprados: idsProductosComprados.length,
                total: todosLosIdsExcluidos.length
            });
            
            // Buscar productos que tengan algunas características similares pero también sean diferentes
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
                .not('id_producto', 'in', `(${todosLosIdsExcluidos.join(',')})`)
                .limit(100); // Aumentado de 50 a 100 para más productos

            // Aplicar filtros más flexibles para productos nuevos
            if (caracteristicas.categorias.size > 0) {
                // Incluir productos de categorías relacionadas pero no exactamente iguales
                query = query.or(
                    `id_categoria.in.(${Array.from(caracteristicas.categorias).join(',')}),` +
                    `id_categoria.not.in.(${Array.from(caracteristicas.categorias).join(',')})`
                );
            }
            
            if (caracteristicas.estilos.size > 0) {
                // Incluir productos de estilos complementarios
                query = query.or(
                    `id_estilo.in.(${Array.from(caracteristicas.estilos).join(',')}),` +
                    `id_estilo.not.in.(${Array.from(caracteristicas.estilos).join(',')})`
                );
            }

            const { data: productosNuevos, error } = await query;
            
            if (error || !productosNuevos) {
                console.warn('Error buscando productos nuevos:', error);
                return [];
            }

            // Puntuar productos nuevos con lógica diferente
            const productosNuevosPuntuados = productosNuevos.map(producto => {
                let score = 0;
                let razones: string[] = [];

                // Puntuar por similitud parcial (no exacta)
                const scoreSimilitud = calcularSimilitudProducto(producto, caracteristicas);
                score += scoreSimilitud.score * 0.7; // Reducir peso para productos nuevos
                
                // Bonus por ser diferente pero complementario
                if (scoreSimilitud.score > 30 && scoreSimilitud.score < 80) {
                    score += 25;
                    razones.push('Producto complementario a tus preferencias');
                }

                // Bonus por descuento
                if (producto.descuento && producto.descuento > 0) {
                    score += 30;
                    razones.push('Producto en oferta');
                }

                // Bonus por stock alto (sin mostrar en razones)
                if (producto.stock_actual > 10) {
                    score += 20;
                }

                // Bonus por ser "nuevo" (no comprado antes)
                score += 15;
                razones.push('Nuevo para ti');

                return {
                    ...producto,
                    score_recomendacion: score,
                    razon_recomendacion: razones.join(', ')
                };
            });

            // Ordenar y retornar los mejores productos nuevos
            return productosNuevosPuntuados
                .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                .slice(0, 5);

        } catch (error) {
            console.error('Error buscando productos nuevos:', error);
            return [];
        }
    };

    // NUEVA FUNCIÓN: Buscar productos de tendencia o populares
    const buscarProductosTendencia = async (productosExistentes: any[]): Promise<ProductoRecomendado[]> => {
        console.log('🔥 Buscando productos de tendencia...');
        
        try {
            // Obtener IDs de productos ya incluidos para excluirlos
            const idsExcluidos = productosExistentes.map(p => p.id_producto);
            
            // Buscar productos populares o de tendencia
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
                .not('id_producto', 'in', `(${idsExcluidos.join(',')})`)
                .limit(50); // Aumentado de 20 a 50 para más productos de tendencia

            const { data: productosTendencia, error } = await query;
            
            if (error || !productosTendencia) {
                console.warn('Error buscando productos de tendencia:', error);
                return [];
            }

            // Puntuar productos de tendencia
            const productosTendenciaPuntuados = productosTendencia.map(producto => {
                let score = 0;
                let razones: string[] = [];

                // Bonus por descuento alto
                if (producto.descuento && producto.descuento > 15) {
                    score += 40;
                    razones.push('Gran oferta');
                } else if (producto.descuento && producto.descuento > 0) {
                    score += 20;
                    razones.push('Producto en oferta');
                }

                // Bonus por stock alto (sin mostrar en razones)
                if (producto.stock_actual > 20) {
                    score += 25;
                } else if (producto.stock_actual > 10) {
                    score += 15;
                }

                // Bonus por ser producto premium
                if (producto.precio > 5000) {
                    score += 20;
                    razones.push('Producto premium');
                }

                // Bonus por características especiales
                if (producto.superficie && producto.superficie.toLowerCase().includes('antideslizante')) {
                    score += 15;
                    razones.push('Superficie antideslizante');
                }

                if (producto.durabilidad && producto.durabilidad >= 8) {
                    score += 15;
                    razones.push('Alta durabilidad');
                }

                // Bonus por ser "tendencia"
                score += 10;
                razones.push('Producto de tendencia');

                return {
                    ...producto,
                    score_recomendacion: score,
                    razon_recomendacion: razones.join(', ')
                };
            });

            // Ordenar y retornar los mejores productos de tendencia
            return productosTendenciaPuntuados
                .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                .slice(0, 3);

        } catch (error) {
            console.error('Error buscando productos de tendencia:', error);
            return [];
        }
    };

    // Función para obtener preferencias del usuario desde preferenciasProd (sin lógica de uso)
    const obtenerPreferenciasUsuario = async (clienteId: number) => {
        try {
            console.log('🔍 Buscando preferencias para cliente ID:', clienteId);
            
            // Obtener preferencias del usuario desde la tabla usoXpref
            // Primero obtenemos las preferencias del cliente
            const { data: preferenciasCliente, error: errorPreferencias } = await supabase
                .from('preferenciasProd')
                .select('*')
                .eq('idClientes', clienteId);

            if (errorPreferencias) {
                console.warn('Error al obtener preferencias del cliente:', errorPreferencias);
                return [];
            }

            if (!preferenciasCliente || preferenciasCliente.length === 0) {
                console.log('⚠️ No se encontraron preferencias para el cliente');
                return [];
            }

            console.log('✅ Preferencias del cliente encontradas:', preferenciasCliente.length);

            // Ahora obtenemos los usos asociados a estas preferencias
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
                .in('preferenciasProd.idClientes', [clienteId]);

            console.log('📊 Query ejecutada para preferencias');
            console.log('📋 Datos de preferencias obtenidos:', preferenciasData);
            console.log('❌ Error en preferencias:', error);

            if (error) {
                console.warn('Error al obtener preferencias del usuario:', error);
                return [];
            }

            // Verificar la estructura de los datos
            if (preferenciasData && preferenciasData.length > 0) {
                console.log('✅ Preferencias encontradas:', preferenciasData.length);
                preferenciasData.forEach((pref, index) => {
                    console.log(`📝 Preferencia ${index + 1}:`, {
                        idUso: pref.idUso,
                        preferenciasProd: pref.preferenciasProd
                    });
                });
            } else {
                console.log('⚠️ No se encontraron preferencias para el cliente');
            }

            return preferenciasData || [];
        } catch (error) {
            console.error('Error al obtener preferencias del usuario:', error);
            return [];
        }
    };

    // Función para verificar si un producto coincide con las preferencias de uso del usuario
    // NOTA: Esta función ya no se usa, reemplazada por calcularScoreSimilitud
    const verificarCoincidenciaUso = (producto: any, preferenciasUsuario: any[]) => {
        console.log('🔍 Verificando coincidencia de uso para producto:', producto.id_producto, producto.nombre_producto);
        console.log('📋 Preferencias del usuario:', preferenciasUsuario);
        
        if (!preferenciasUsuario || preferenciasUsuario.length === 0) {
            console.log('⚠️ No hay preferencias del usuario para verificar');
            return null;
        }

        for (const pref of preferenciasUsuario) {
            console.log('🔍 Analizando preferencia:', pref);
            
            if (!pref.preferenciasProd || !Array.isArray(pref.preferenciasProd) || pref.preferenciasProd.length === 0) {
                console.log('⚠️ Preferencia sin datos de productos válidos');
                continue;
            }
            
            const preferencia = pref.preferenciasProd[0];
            const uso = pref.uso?.nombre;
            
            console.log('📝 Datos de preferencia:', {
                preferencia,
                uso,
                producto: {
                    id_categoria: producto.id_categoria,
                    id_materiales: producto.id_materiales,
                    id_estilo: producto.id_estilo,
                    colorDom: producto.colorDom,
                    superficie: producto.superficie,
                    durabilidad: producto.durabilidad,
                    precio: producto.precio
                }
            });
            
            if (!uso) {
                console.log('⚠️ No se encontró nombre de uso');
                continue;
            }

            // Verificar coincidencias por categoría
            if (preferencia.idCategoria && producto.id_categoria === preferencia.idCategoria) {
                console.log('✅ Coincidencia por categoría:', preferencia.idCategoria);
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por material
            if (preferencia.idMaterial && producto.id_materiales === preferencia.idMaterial) {
                console.log('✅ Coincidencia por material:', preferencia.idMaterial);
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por estilo
            if (preferencia.idEstilo && producto.id_estilo === preferencia.idEstilo) {
                console.log('✅ Coincidencia por estilo:', preferencia.idEstilo);
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por color
            if (preferencia.color && producto.colorDom && 
                producto.colorDom.toLowerCase().includes(preferencia.color.toLowerCase())) {
                console.log('✅ Coincidencia por color:', preferencia.color);
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por superficie
            if (preferencia.superficie && producto.superficie && 
                producto.superficie.toLowerCase().includes(preferencia.superficie.toLowerCase())) {
                console.log('✅ Coincidencia por superficie:', preferencia.superficie);
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por durabilidad
            if (preferencia.durabilidad && producto.durabilidad && 
                producto.durabilidad >= preferencia.durabilidad) {
                console.log('✅ Coincidencia por durabilidad:', preferencia.durabilidad);
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // Verificar coincidencias por rango de precio
            if (preferencia.precMin && preferencia.precMax && 
                producto.precio >= preferencia.precMin && producto.precio <= preferencia.precMax) {
                console.log('✅ Coincidencia por rango de precio:', preferencia.precMin, '-', preferencia.precMax);
                return `Perfecto para tu ${uso.toLowerCase()}`;
            }

            // MEJORA: Verificar coincidencias parciales por similitud de características
            if (preferencia.idCategoria && producto.id_categoria) {
                // Si la categoría es similar (mismo tipo de producto)
                const categoriasSimilares = {
                    'revestimiento': ['cerámica', 'porcelanato', 'gres', 'mosaico'],
                    'cerámica': ['revestimiento', 'porcelanato', 'gres'],
                    'porcelanato': ['revestimiento', 'cerámica', 'gres'],
                    'gres': ['revestimiento', 'cerámica', 'porcelanato']
                };
                
                // Aquí podrías implementar lógica más sofisticada para categorías similares
                // Por ahora, damos un bonus menor por categorías relacionadas
                if (producto.id_categoria !== preferencia.idCategoria) {
                    console.log('🔄 Categoría relacionada (coincidencia parcial)');
                    return `Ideal para tu ${uso.toLowerCase()} (categoría relacionada)`;
                }
            }
        }

        console.log('❌ No se encontraron coincidencias para este producto');
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
        try {
            console.log('🔍 Obteniendo productos relacionados para:', productosComprados);
            
            if (productosComprados.length === 0) return [];

            const productosIds = productosComprados.map(p => p.id_producto).filter(Boolean);
            console.log('IDs de productos para buscar relacionados:', productosIds);

            // Usar la tabla CORRECTA: productosRelacionados
            const { data: relacionados, error } = await supabase
                .from('productosRelacionados')
                .select('idProdAsoc, frecuencia')
                .in('idProdBase', productosIds)
                .order('frecuencia', { ascending: false })
                .limit(50); // Aumentado de 20 a 50 para más productos relacionados

            if (error) {
                console.error('❌ Error obteniendo productos relacionados:', error);
                return [];
            }

            const productosRelacionados = relacionados?.map(r => r.idProdAsoc) || [];
            console.log(`✅ Encontrados ${productosRelacionados.length} productos relacionados`);
            
            return productosRelacionados;

        } catch (error) {
            console.error('❌ Error en obtenerProductosRelacionados:', error);
            return [];
        }
    };

    // Nueva función para generar y guardar productos relacionados
    const generarYGuardarProductosRelacionados = async (productosComprados: any[]): Promise<number[]> => {
        try {
            console.log('🔗 Generando productos relacionados para:', productosComprados);
            
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
                .limit(100); // Aumentado de 50 a 100 para más productos similares

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
                    
                    // Preparar datos para guardar en la tabla CORRECTA: productosRelacionados
                    productosComprados.forEach(productoBase => {
                        productosParaGuardar.push({
                            idProdBase: productoBase.id_producto,
                            idProdAsoc: producto.id_producto,
                            frecuencia: Math.round(score * 100), // Convertir a porcentaje 0-100
                            created_at: new Date().toISOString()
                        });
                    });
                }
            });

            // Guardar productos relacionados en la tabla CORRECTA
            if (productosParaGuardar.length > 0) {
                console.log(`💾 Guardando ${productosParaGuardar.length} productos relacionados...`);
                
                const { error: insertError } = await supabase
                    .from('productosRelacionados')
                    .upsert(productosParaGuardar, { 
                        onConflict: 'idProdBase,idProdAsoc',
                        ignoreDuplicates: false 
                    });

                if (insertError) {
                    console.error('❌ Error guardando productos relacionados:', insertError);
                } else {
                    console.log(`✅ ${productosParaGuardar.length} productos relacionados guardados exitosamente en productosRelacionados`);
                }
            }

            return productosRelacionados;
        } catch (error) {
            console.error('❌ Error generando productos relacionados:', error);
            return [];
        }
    };

    // Función para limpiar productos relacionados obsoletos
    const limpiarProductosRelacionadosObsoletos = async () => {
        try {
            console.log('🧹 Limpiando productos relacionados obsoletos...');
            
            // Marcar como inactivos productos relacionados con score muy bajo
            const { error } = await supabase
                .from('productosRelacionados')
                .update({ activo: false })
                .lt('frecuencia', 20); // Frecuencia menor a 20%

            if (error) {
                console.error('❌ Error limpiando productos relacionados obsoletos:', error);
            } else {
                console.log('✅ Productos relacionados obsoletos marcados como inactivos');
            }
        } catch (error) {
            console.error('❌ Error en limpiarProductosRelacionadosObsoletos:', error);
        }
    };

                // Nueva función para poblar la tabla productosRelacionados con todos los pedidos multi-producto
            const poblarTablaProductosRelacionados = async () => {
                try {
                    console.log('🚀 Iniciando población de tabla productosRelacionados...');
                    
                    // Obtener todos los pedidos que tengan más de un producto
                    const { data: pedidosMultiProducto, error: pedidosError } = await supabase
                        .from('detalles_factura')
                        .select(`
                            id_factura,
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
                        .order('id_factura', { ascending: true });

            if (pedidosError) {
                console.error('❌ Error obteniendo pedidos multi-producto:', pedidosError);
                return;
            }

            if (!pedidosMultiProducto) {
                console.log('ℹ️ No se encontraron pedidos para procesar');
                return;
            }

            // Agrupar productos por factura
            const facturasAgrupadas = new Map();
            pedidosMultiProducto.forEach(detalle => {
                if (!facturasAgrupadas.has(detalle.id_factura)) {
                    facturasAgrupadas.set(detalle.id_factura, []);
                }
                facturasAgrupadas.get(detalle.id_factura).push({
                    id_producto: detalle.id_producto,
                    cantidad: detalle.cantidad,
                    ...detalle.productos
                });
            });

            // Filtrar solo facturas con más de un producto
            const facturasConMultiplesProductos = Array.from(facturasAgrupadas.entries())
                .filter(([_, productos]) => productos.length > 1)
                .map(([idFactura, productos]) => ({ idFactura, productos }));

            console.log(`📊 Encontradas ${facturasConMultiplesProductos.length} facturas con múltiples productos`);

            // Procesar cada factura para generar productos relacionados
            let totalProductosRelacionados = 0;
            for (const factura of facturasConMultiplesProductos) {
                console.log(`🔄 Procesando factura ${factura.idFactura} con ${factura.productos.length} productos`);
                
                // Generar productos relacionados para esta factura
                const productosRelacionados = await generarYGuardarProductosRelacionados(factura.productos);
                totalProductosRelacionados += productosRelacionados.length;
                
                console.log(`✅ Factura ${factura.idFactura}: ${productosRelacionados.length} productos relacionados generados`);
            }

            console.log(`🎉 Proceso completado. Total de productos relacionados generados: ${totalProductosRelacionados}`);
            
        } catch (error) {
            console.error('❌ Error en poblarTablaProductosRelacionados:', error);
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

            const { data: productosSimilares, error } = await query.limit(25); // Aumentado de 10 a 25 para más productos similares
            
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
        // Validar que el producto tenga los datos necesarios
        if (!producto.id_producto || !producto.nombre_producto || !producto.precio) {
            console.error('Producto inválido:', producto);
            return;
        }

        addItem({
            id_producto: producto.id_producto,
            nombre_producto: producto.nombre_producto,
            precio: producto.precio,
            imagen: producto.imagen || '',
            stock_actual: producto.stock_actual || 0,
            metros_por_caja: producto.metros_por_caja || 0,
            descripcion: producto.descripcion || '',
            id_categoria: producto.id_categoria || 1,
            id_estilo: producto.id_estilo || 1,
            id_materiales: producto.id_materiales || 1,
            formato: producto.formato || 'Rectangular',
            piezas_por_caja: producto.piezas_por_caja || 1,
            superficie: producto.superficie || 'Lisa',
            durabilidad: producto.durabilidad || 5,
            disponibilidad: producto.disponibilidad !== false,
            colorDom: producto.colorDom || 'Blanco',
            descuento: producto.descuento || 0
        }, 1); // Agregar con cantidad 1 por defecto
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



    // Función para obtener todos los productos recomendados
    // Función para determinar el tipo de recomendación
    const getTipoRecomendacion = (producto: ProductoRecomendado) => {
        if (producto.razon_recomendacion?.includes('Producto complementario') || 
            producto.razon_recomendacion?.includes('Nuevo para ti')) {
            return 'nuevo';
        }
        if (producto.razon_recomendacion?.includes('Producto de tendencia') ||
            producto.razon_recomendacion?.includes('Gran oferta') ||
            producto.razon_recomendacion?.includes('Producto premium')) {
            return 'tendencia';
        }
        if (producto.razon_recomendacion?.includes('Producto relacionado') ||
            producto.razon_recomendacion?.includes('Similitud')) {
            return 'relacionado';
        }
        if (producto.razon_recomendacion?.includes('Perfecto para tu')) {
            return 'ideal';
        }
        return 'general';
    };

    const getProductsToShow = () => {
        if (showAll) {
            return productosRecomendados;
        }
        // Mostrar 6 productos inicialmente para llenar mejor el grid
        // Solo mostrar el botón "Ver todas" si hay más de 6 productos
        return productosRecomendados.slice(0, 6);
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

    // Función para generar recomendaciones por similitud de características (sin lógica de uso)
    const generarRecomendacionesPorPreferencias = async (
        preferenciasUsuario: any[],
        clienteId: number
    ): Promise<ProductoRecomendado[]> => {
        console.log('🎯 Generando recomendaciones por preferencias para usuario sin historial...');
        console.log('📊 Preferencias recibidas:', preferenciasUsuario?.length || 0);
        
        try {
            if (!preferenciasUsuario || preferenciasUsuario.length === 0) {
                console.log('⚠️ No hay preferencias del usuario, generando recomendaciones generales...');
                return await generarRecomendacionesGenerales(clienteId);
            }

            // Imprimir estructura de preferencias para debug
            console.log('🔍 Estructura de preferencias recibidas:', JSON.stringify(preferenciasUsuario.slice(0, 2), null, 2));

            // Verificar si las preferencias tienen datos válidos
            // Revisar tanto la estructura de usoXpref como preferencias directas
            const preferenciasValidas = preferenciasUsuario.filter(pref => {
                // Caso 1: Estructura de usoXpref (con preferenciasProd array)
                if (pref.preferenciasProd && Array.isArray(pref.preferenciasProd) && pref.preferenciasProd.length > 0) {
                    return true;
                }
                // Caso 2: Estructura directa de preferenciasProd
                if (pref.idClientes || pref.idEstilo || pref.idMaterial || pref.idCategoria || pref.color) {
                    return true;
                }
                return false;
            });

            console.log(`📋 Preferencias totales: ${preferenciasUsuario.length}, Preferencias válidas: ${preferenciasValidas.length}`);
            if (preferenciasValidas.length > 0) {
                console.log('✅ Ejemplos de preferencias válidas:', JSON.stringify(preferenciasValidas.slice(0, 2), null, 2));
            }

            // Actualizar estado de preferencias
            setPreferenciasInfo({
                total: preferenciasUsuario.length,
                validas: preferenciasValidas.length,
                modo: preferenciasValidas.length > 0 ? 'preferencias' : 'generales'
            });

            if (preferenciasValidas.length === 0) {
                console.log('⚠️ No hay preferencias válidas, intentando obtener preferencias directamente...');
                
                // Intentar obtener preferencias directamente de preferenciasProd
                const { data: preferenciasDirect, error: errorDirect } = await supabase
                    .from('preferenciasProd')
                    .select('*')
                    .eq('idClientes', clienteId);
                
                if (!errorDirect && preferenciasDirect && preferenciasDirect.length > 0) {
                    console.log('✅ Preferencias directas encontradas:', preferenciasDirect.length);
                    console.log('📊 Preferencias directas:', JSON.stringify(preferenciasDirect, null, 2));
                    return await procesarPreferenciasDirect(preferenciasDirect, clienteId);
                }
                
                console.log('⚠️ No hay preferencias válidas, generando recomendaciones generales...');
                return await generarRecomendacionesGenerales(clienteId);
            }

            // Obtener productos que coincidan con las preferencias del usuario
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

            // MEJORA: Agregar aleatorización para evitar siempre los mismos productos
            // Usar un offset aleatorio basado en el ID del cliente para variar las recomendaciones
            const offsetAleatorio = (clienteId % 30) * 15; // Variar el offset por usuario
            query = query.range(offsetAleatorio, offsetAleatorio + 200); // Obtener más productos para luego aleatorizar

            // Aplicar filtros basados en preferencias
            const filtrosPreferencias = aplicarFiltrosPorPreferencias(query, preferenciasValidas);
            query = filtrosPreferencias.query;

            const { data: productosBase, error: productosError } = await query;
            
            if (productosError) throw productosError;
            if (!productosBase) return [];

            console.log(`✅ Encontrados ${productosBase.length} productos que coinciden con preferencias`);

            // MEJORA: Aleatorizar los productos antes de puntuarlos
            const productosAleatorizados = [...productosBase].sort(() => Math.random() - 0.5);

            // Puntuar productos basándose en similitud con preferencias (prioridad máxima)
            const productosPuntuados = productosAleatorizados.map(producto => {
                let score = 0;
                let razones: string[] = [];

                // Puntuar por similitud con preferencias (prioridad máxima)
                const similitud = calcularScoreSimilitud(producto, preferenciasValidas);
                if (similitud.score > 0) {
                    score += similitud.score; // Score basado en similitud de características
                    razones.push(...similitud.razones);
                    console.log('🎯 Producto con similitud de preferencias:', producto.nombre_producto, 'Score:', score, 'Similitud:', (similitud.porcentaje || 0).toFixed(1) + '%');
                }

                // Puntuar por descuento
                if (producto.descuento && producto.descuento > 0) {
                    score += 25;
                    razones.push('Producto en oferta');
                }

                // Puntuar por stock alto (sin mostrar en razones)
                if (producto.stock_actual > 10) {
                    score += 20;
                } else if (producto.stock_actual > 5) {
                    score += 15;
                }

                // Bonus por ser producto premium
                if (producto.precio > 5000) {
                    score += 15;
                    razones.push('Producto premium');
                }

                // Bonus por características especiales
                if (producto.superficie && producto.superficie.toLowerCase().includes('antideslizante')) {
                    score += 20;
                    razones.push('Superficie antideslizante');
                }

                if (producto.durabilidad && producto.durabilidad >= 8) {
                    score += 20;
                    razones.push('Alta durabilidad');
                }

                // Bonus por ser "nuevo para ti"
                score += 10;
                razones.push('Basado en tus preferencias');

                // MEJORA: Agregar variabilidad adicional basada en el ID del producto y cliente
                // Esto asegura que diferentes usuarios vean diferentes productos
                const variabilidadUsuario = (clienteId + producto.id_producto) % 25;
                score += variabilidadUsuario;
                razones.push('Recomendación personalizada');

                return {
                    ...producto,
                    score_recomendacion: score,
                    razon_recomendacion: razones.join(', ')
                };
            });

            // Ordenar por score de similitud (las que coincidan más primero) y retornar los mejores
            const productosFinales = productosPuntuados
                .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                .slice(0, 12);

            console.log('🎯 Productos recomendados por preferencias:');
            productosFinales.forEach((producto, index) => {
                console.log(`${index + 1}. ${producto.nombre_producto} - Score: ${producto.score_recomendacion} - Razón: ${producto.razon_recomendacion}`);
            });

            return productosFinales;

        } catch (error) {
            console.error('Error al generar recomendaciones por preferencias:', error);
            return await generarRecomendacionesGenerales(clienteId);
        }
    };

    // NUEVA FUNCIÓN: Generar recomendaciones generales cuando no hay preferencias ni historial
    // Nueva función para procesar preferencias directas
    const procesarPreferenciasDirect = async (
        preferenciasDirect: any[],
        clienteId: number
    ): Promise<ProductoRecomendado[]> => {
        console.log('🎯 Procesando preferencias directas...');
        
        try {
            const preferencia = preferenciasDirect[0]; // Usar la primera preferencia
            console.log('📊 Preferencia a procesar:', JSON.stringify(preferencia, null, 2));

            // Construir query basada en las preferencias directas
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

            // Aplicar filtros basados en preferencias (uno por vez para máxima flexibilidad)
            if (preferencia.idCategoria) {
                console.log('🏷️ Aplicando filtro por categoría:', preferencia.idCategoria);
                query = query.eq('id_categoria', preferencia.idCategoria);
            } else if (preferencia.idEstilo) {
                console.log('🎨 Aplicando filtro por estilo:', preferencia.idEstilo);
                query = query.eq('id_estilo', preferencia.idEstilo);
            } else if (preferencia.idMaterial) {
                console.log('🧱 Aplicando filtro por material:', preferencia.idMaterial);
                query = query.eq('id_materiales', preferencia.idMaterial);
            }

            // Si hay rango de precios, aplicarlo
            if (preferencia.precMin && preferencia.precMax) {
                console.log('💰 Aplicando filtro por precio:', preferencia.precMin, '-', preferencia.precMax);
                query = query.gte('precio', preferencia.precMin).lte('precio', preferencia.precMax);
            }

            const { data: productos, error } = await query.limit(20);

            if (error) {
                console.error('❌ Error obteniendo productos por preferencias directas:', error);
                return await generarRecomendacionesGenerales(clienteId);
            }

            console.log('📦 Productos encontrados con filtros:', productos?.length || 0);

            if (!productos || productos.length === 0) {
                console.log('⚠️ No se encontraron productos con las preferencias específicas, ampliando búsqueda...');
                
                // Búsqueda más amplia - solo productos disponibles
                const { data: productosAmplia } = await supabase
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
                    .limit(20);

                console.log('📦 Productos en búsqueda amplia:', productosAmplia?.length || 0);

                if (!productosAmplia || productosAmplia.length === 0) {
                    return await generarRecomendacionesGenerales(clienteId);
                }

                // Puntuar productos basándose en las preferencias
                const productosConScore = productosAmplia.map(producto => {
                    let score = 10; // Score base
                    let razones: string[] = ['Producto disponible'];

                    // Puntuar por coincidencias con preferencias
                    if (preferencia.idCategoria && producto.id_categoria === preferencia.idCategoria) {
                        score += 40;
                        razones.push('Categoría de tu preferencia');
                    }
                    if (preferencia.idEstilo && producto.id_estilo === preferencia.idEstilo) {
                        score += 35;
                        razones.push('Estilo de tu preferencia');
                    }
                    if (preferencia.idMaterial && producto.id_materiales === preferencia.idMaterial) {
                        score += 35;
                        razones.push('Material de tu preferencia');
                    }
                    if (preferencia.color && producto.colorDom && 
                        producto.colorDom.toLowerCase().includes(preferencia.color.toLowerCase())) {
                        score += 25;
                        razones.push('Color de tu preferencia');
                    }
                    if (preferencia.superficie && producto.superficie && 
                        producto.superficie.toLowerCase().includes(preferencia.superficie.toLowerCase())) {
                        score += 25;
                        razones.push('Superficie de tu preferencia');
                    }

                    // Puntuar por precio dentro del rango
                    if (preferencia.precMin && preferencia.precMax) {
                        if (producto.precio >= preferencia.precMin && producto.precio <= preferencia.precMax) {
                            score += 30;
                            razones.push('Precio dentro de tu rango preferido');
                        }
                    }

                    // Puntuar por descuento
                    if (producto.descuento && producto.descuento > 0) {
                        score += 15;
                        razones.push('Producto en oferta');
                    }

                    return {
                        ...producto,
                        score_recomendacion: score,
                        razon_recomendacion: razones.join(', ')
                    };
                });

                // Ordenar por score y tomar los mejores
                const productosFinales = productosConScore
                    .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                    .slice(0, 12);

                console.log('✅ Productos recomendados por preferencias directas (amplia):', productosFinales.length);
                return productosFinales;
            }

            // Si encontramos productos con los filtros directos
            const productosConScore = productos.map(producto => ({
                ...producto,
                score_recomendacion: 80, // Score alto por coincidencia directa
                razon_recomendacion: 'Coincide perfectamente con tus preferencias'
            }));

            console.log('✅ Productos encontrados con preferencias directas:', productosConScore.length);
            return productosConScore;

        } catch (error) {
            console.error('❌ Error procesando preferencias directas:', error);
            return await generarRecomendacionesGenerales(clienteId);
        }
    };

    const generarRecomendacionesGenerales = async (clienteId: number): Promise<ProductoRecomendado[]> => {
        console.log('🌟 Generando recomendaciones generales para usuario nuevo...');
        
        // Actualizar estado de preferencias
        setPreferenciasInfo({
            total: 0,
            validas: 0,
            modo: 'generales'
        });
        
        try {
            console.log('🔍 Buscando productos disponibles para recomendaciones generales...');
            
            // Obtener productos disponibles (sin filtros restrictivos)
            const { data: productosBase, error: productosError } = await supabase
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
                .limit(50);
            
            if (productosError) throw productosError;
            if (!productosBase) return [];

            console.log(`✅ Encontrados ${productosBase.length} productos para recomendaciones generales`);
            
            // Debug: verificar si realmente no hay productos disponibles
            if (productosBase.length === 0) {
                console.log('🔍 No se encontraron productos, verificando datos en base...');
                
                // Verificar cuántos productos existen en total
                const { data: totalProductos, error: errorTotal } = await supabase
                    .from('productos')
                    .select('id_producto, disponibilidad, stock_actual')
                    .limit(10);
                
                console.log('📊 Muestra de productos en base:', totalProductos?.length || 0);
                if (totalProductos) {
                    console.log('📋 Ejemplos de productos:', totalProductos.slice(0, 3));
                }
                
                // Intentar obtener cualquier producto sin filtros
                const { data: cualquierProducto } = await supabase
                    .from('productos')
                    .select('*')
                    .limit(5);
                
                if (cualquierProducto && cualquierProducto.length > 0) {
                    console.log('✅ Se encontraron productos sin filtros, usando como fallback');
                    const productosConScore = cualquierProducto.map(producto => ({
                        ...producto,
                        score_recomendacion: 20,
                        razon_recomendacion: 'Producto disponible para empezar'
                    }));
                    return productosConScore;
                }
                
                return [];
            }

            // MEJORA: Aleatorizar los productos antes de puntuarlos
            const productosAleatorizados = [...productosBase].sort(() => Math.random() - 0.5);

            // Puntuar productos para recomendaciones generales
            const productosPuntuados = productosAleatorizados.map(producto => {
                let score = 0;
                let razones: string[] = [];

                // Puntuar por descuento alto
                if (producto.descuento && producto.descuento > 20) {
                    score += 40;
                    razones.push('Gran oferta');
                } else if (producto.descuento && producto.descuento > 0) {
                    score += 25;
                    razones.push('Producto en oferta');
                }

                // Puntuar por stock alto (sin mostrar en razones)
                if (producto.stock_actual > 20) {
                    score += 30;
                } else if (producto.stock_actual > 10) {
                    score += 20;
                }

                // Puntuar por ser producto premium
                if (producto.precio > 8000) {
                    score += 25;
                    razones.push('Producto premium');
                } else if (producto.precio > 3000) {
                    score += 15;
                    razones.push('Producto de calidad');
                }

                // Puntuar por características especiales
                if (producto.superficie && producto.superficie.toLowerCase().includes('antideslizante')) {
                    score += 25;
                    razones.push('Superficie antideslizante');
                }

                if (producto.durabilidad && producto.durabilidad >= 9) {
                    score += 25;
                    razones.push('Durabilidad excepcional');
                } else if (producto.durabilidad && producto.durabilidad >= 7) {
                    score += 20;
                    razones.push('Alta durabilidad');
                }

                // Bonus por ser "popular" o "tendencia"
                score += 15;
                razones.push('Producto popular');

                // MEJORA: Agregar variabilidad adicional basada en el ID del producto
                // Esto asegura que diferentes usuarios vean diferentes productos
                const variabilidadUsuario = (clienteId + producto.id_producto) % 20;
                score += variabilidadUsuario;
                razones.push('Recomendación personalizada');

                return {
                    ...producto,
                    score_recomendacion: score,
                    razon_recomendacion: razones.join(', ')
                };
            });

            // Ordenar por score de similitud (las que coincidan más primero) y retornar los mejores
            const productosFinales = productosPuntuados
                .sort((a, b) => (b.score_recomendacion || 0) - (a.score_recomendacion || 0))
                .slice(0, 12);

            console.log('🌟 Productos recomendados generales:');
            productosFinales.forEach((producto, index) => {
                console.log(`${index + 1}. ${producto.nombre_producto} - Score: ${producto.score_recomendacion} - Razón: ${producto.razon_recomendacion}`);
            });

            return productosFinales;

        } catch (error) {
            console.error('Error al generar recomendaciones generales:', error);
            return [];
        }
    };

    // Función para aplicar filtros basados en preferencias del usuario (enfoque en similitud)
    const aplicarFiltrosPorPreferencias = (query: any, preferenciasUsuario: any[]) => {
        let queryModificado = query;
        const filtrosAplicados: string[] = [];

        try {
            // Recolectar todos los valores únicos de cada característica
            const categorias = new Set<number>();
            const materiales = new Set<number>();
            const estilos = new Set<number>();
            const rangosPrecio: { min: number; max: number }[] = [];

            for (const pref of preferenciasUsuario) {
                if (!pref.preferenciasProd || !Array.isArray(pref.preferenciasProd) || pref.preferenciasProd.length === 0) {
                    continue;
                }
                
                const preferencia = pref.preferenciasProd[0];
                
                // Recolectar categorías
                if (preferencia.idCategoria) {
                    categorias.add(preferencia.idCategoria);
                }
                
                // Recolectar materiales
                if (preferencia.idMaterial) {
                    materiales.add(preferencia.idMaterial);
                }
                
                // Recolectar estilos
                if (preferencia.idEstilo) {
                    estilos.add(preferencia.idEstilo);
                }
                
                // Recolectar rangos de precio
                if (preferencia.precMin && preferencia.precMax) {
                    rangosPrecio.push({ min: preferencia.precMin, max: preferencia.precMax });
                }
            }

            // Aplicar filtros más inteligentes para encontrar productos similares
            
            // Filtrar por categorías (OR lógico para incluir productos de categorías relacionadas)
            if (categorias.size > 0) {
                queryModificado = queryModificado.in('id_categoria', Array.from(categorias));
                filtrosAplicados.push(`categorías: ${Array.from(categorias).join(', ')}`);
            }
            
            // Filtrar por materiales (OR lógico para incluir productos de materiales relacionados)
            if (materiales.size > 0) {
                queryModificado = queryModificado.in('id_materiales', Array.from(materiales));
                filtrosAplicados.push(`materiales: ${Array.from(materiales).join(', ')}`);
            }
            
            // Filtrar por estilos (OR lógico para incluir productos de estilos relacionados)
            if (estilos.size > 0) {
                queryModificado = queryModificado.in('id_estilo', Array.from(estilos));
                filtrosAplicados.push(`estilos: ${Array.from(estilos).join(', ')}`);
            }
            
            // Filtrar por rango de precio (ampliar ligeramente el rango para incluir productos similares)
            if (rangosPrecio.length > 0) {
                const minPrecio = Math.min(...rangosPrecio.map(r => r.min));
                const maxPrecio = Math.max(...rangosPrecio.map(r => r.max));
                const margenPrecio = (maxPrecio - minPrecio) * 0.2; // 20% de margen
                
                queryModificado = queryModificado
                    .gte('precio', Math.max(0, minPrecio - margenPrecio))
                    .lte('precio', maxPrecio + margenPrecio);
                filtrosAplicados.push(`precio: ${Math.max(0, minPrecio - margenPrecio).toFixed(0)} - ${(maxPrecio + margenPrecio).toFixed(0)}`);
            }

            console.log('🎯 Filtros aplicados por preferencias para productos similares:', filtrosAplicados);
            return { query: queryModificado, filtros: filtrosAplicados };
            
        } catch (error) {
            console.error('Error aplicando filtros por preferencias:', error);
            return { query: queryModificado, filtros: [] };
        }
    };

    // Función de fallback para calcular score cuando no hay preferencias válidas
    const calcularScoreFallback = (producto: any): { score: number, razones: string[] } => {
        let score = 0;
        let razones: string[] = [];

        // Score base por disponibilidad
        if (producto.disponibilidad && producto.stock_actual > 0) {
            score += 10;
            razones.push('Producto disponible');
        }

        // Score por descuento
        if (producto.descuento && producto.descuento > 0) {
            score += 25;
            razones.push('Producto en oferta');
        }

        // Score por stock (sin mostrar en razones)
        if (producto.stock_actual > 10) {
            score += 20;
        } else if (producto.stock_actual > 5) {
            score += 15;
        }

        // Score por características especiales
        if (producto.superficie && producto.superficie.toLowerCase().includes('antideslizante')) {
            score += 20;
            razones.push('Superficie antideslizante');
        }

        if (producto.durabilidad && producto.durabilidad >= 8) {
            score += 20;
            razones.push('Alta durabilidad');
        }

        // Score por ser producto premium
        if (producto.precio > 5000) {
            score += 15;
            razones.push('Producto premium');
        }

        // Score por tener descripción completa
        if (producto.descripcion && producto.descripcion.length > 50) {
            score += 10;
            razones.push('Descripción completa');
        }

        console.log(`🔄 Score fallback para ${producto.nombre_producto}: ${score} - Razones: ${razones.join(', ')}`);
        
        return { score, razones };
    };

    const calcularScoreSimilitud = (producto: any, preferenciasUsuario: any[]) => {
        console.log('🔍 Calculando score de similitud para producto:', producto.id_producto, producto.nombre_producto);
        console.log('📋 Preferencias del usuario:', preferenciasUsuario);
        
        if (!preferenciasUsuario || preferenciasUsuario.length === 0) {
            console.log('⚠️ No hay preferencias del usuario para calcular similitud');
            return { score: 0, razones: [], coincidencias: 0 };
        }

        let scoreTotal = 0;
        let razones: string[] = [];
        let totalCoincidencias = 0;
        let maxPosiblesCoincidencias = 0;
        let preferenciasValidas = 0;

        for (const pref of preferenciasUsuario) {
            console.log('🔍 Analizando preferencia:', pref);
            
            if (!pref.preferenciasProd || !Array.isArray(pref.preferenciasProd) || pref.preferenciasProd.length === 0) {
                console.log('⚠️ Preferencia sin datos de productos válidos, saltando...');
                continue;
            }
            
            preferenciasValidas++;
            const preferencia = pref.preferenciasProd[0];
            let coincidenciasPreferencia = 0;
            let scorePreferencia = 0;
            
            console.log('📝 Datos de preferencia válida:', {
                preferencia,
                uso: pref.uso?.nombre,
                producto: {
                    id_categoria: producto.id_categoria,
                    id_materiales: producto.id_materiales,
                    id_estilo: producto.id_estilo,
                    colorDom: producto.colorDom,
                    superficie: producto.superficie,
                    durabilidad: producto.durabilidad,
                    precio: producto.precio
                }
            });

            // Verificar coincidencias por categoría (peso: 25 puntos)
            if (preferencia.idCategoria && producto.id_categoria === preferencia.idCategoria) {
                scorePreferencia += 25;
                coincidenciasPreferencia++;
                razones.push('Categoría exacta');
                console.log('✅ Coincidencia por categoría:', preferencia.idCategoria);
            }

            // Verificar coincidencias por material (peso: 20 puntos)
            if (preferencia.idMaterial && producto.id_materiales === preferencia.idMaterial) {
                scorePreferencia += 20;
                coincidenciasPreferencia++;
                razones.push('Material exacto');
                console.log('✅ Coincidencia por material:', preferencia.idMaterial);
            }

            // Verificar coincidencias por estilo (peso: 20 puntos)
            if (preferencia.idEstilo && producto.id_estilo === preferencia.idEstilo) {
                scorePreferencia += 20;
                coincidenciasPreferencia++;
                razones.push('Estilo exacto');
                console.log('✅ Coincidencia por estilo:', preferencia.idEstilo);
            }

            // Verificar coincidencias por color (peso: 15 puntos)
            if (preferencia.color && producto.colorDom && 
                producto.colorDom.toLowerCase().includes(preferencia.color.toLowerCase())) {
                scorePreferencia += 15;
                coincidenciasPreferencia++;
                razones.push('Color similar');
                console.log('✅ Coincidencia por color:', preferencia.color);
            }

            // Verificar coincidencias por superficie (peso: 10 puntos)
            if (preferencia.superficie && producto.superficie && 
                producto.superficie.toLowerCase().includes(preferencia.superficie.toLowerCase())) {
                scorePreferencia += 10;
                coincidenciasPreferencia++;
                razones.push('Superficie similar');
                console.log('✅ Coincidencia por superficie:', preferencia.superficie);
            }

            // Verificar coincidencias por durabilidad (peso: 10 puntos)
            if (preferencia.durabilidad && producto.durabilidad && 
                producto.durabilidad >= preferencia.durabilidad) {
                scorePreferencia += 10;
                coincidenciasPreferencia++;
                razones.push('Durabilidad adecuada');
                console.log('✅ Coincidencia por durabilidad:', preferencia.durabilidad);
            }

            // Verificar coincidencias por rango de precio (peso: 10 puntos)
            if (preferencia.precMin && preferencia.precMax && 
                producto.precio >= preferencia.precMin && producto.precio <= preferencia.precMax) {
                scorePreferencia += 10;
                coincidenciasPreferencia++;
                razones.push('Precio en rango');
                console.log('✅ Coincidencia por rango de precio:', preferencia.precMin, '-', preferencia.precMax);
            }

            // Bonus por coincidencias múltiples en la misma preferencia
            if (coincidenciasPreferencia >= 3) {
                scorePreferencia += 15; // Bonus por múltiples coincidencias
                razones.push('Múltiples características coinciden');
            } else if (coincidenciasPreferencia >= 2) {
                scorePreferencia += 8; // Bonus por algunas coincidencias
                razones.push('Varias características coinciden');
            }

            scoreTotal += scorePreferencia;
            totalCoincidencias += coincidenciasPreferencia;
            maxPosiblesCoincidencias += 8; // Máximo de características por preferencia
        }

        // Si no hay preferencias válidas, retornar score 0
        if (preferenciasValidas === 0) {
            console.log('⚠️ No se encontraron preferencias válidas para calcular similitud, usando fallback...');
            const fallbackScore = calcularScoreFallback(producto);
            return { 
                score: fallbackScore.score, 
                razones: fallbackScore.razones, 
                coincidencias: 0,
                porcentaje: 0
            };
        }

        // Calcular porcentaje de coincidencia total
        const porcentajeCoincidencia = maxPosiblesCoincidencias > 0 ? (totalCoincidencias / maxPosiblesCoincidencias) * 100 : 0;
        
        // Bonus por alto porcentaje de coincidencia
        if (porcentajeCoincidencia >= 80) {
            scoreTotal += 30;
            razones.push('Alta similitud general');
        } else if (porcentajeCoincidencia >= 60) {
            scoreTotal += 20;
            razones.push('Buena similitud general');
        } else if (porcentajeCoincidencia >= 40) {
            scoreTotal += 10;
            razones.push('Similitud moderada');
        }

        console.log(`📊 Score final: ${scoreTotal}, Coincidencias: ${totalCoincidencias}/${maxPosiblesCoincidencias} (${porcentajeCoincidencia.toFixed(1)}%), Preferencias válidas: ${preferenciasValidas}`);
        
        return { 
            score: scoreTotal, 
            razones: razones, 
            coincidencias: totalCoincidencias,
            porcentaje: porcentajeCoincidencia
        };
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">
                    {contextProducts && contextProducts.length > 0 
                        ? 'Analizando productos similares...'
                        : 'Generando recomendaciones inteligentes...'
                    }
                </p>
                <div className="mt-2 text-sm text-gray-500">
                    {contextProducts && contextProducts.length > 0 
                        ? 'Buscando productos relacionados por similitud'
                        : 'Analizando tu historial de compras y preferencias'
                    }
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 text-sm">{error}</p>

                </div>
            </div>
        );
    }

    console.log('Rendering component with:', { 
        loading, 
        error, 
        productosRecomendados: productosRecomendados.length,
        showAll
    });
    
    if (productosRecomendados.length === 0) {
        console.log('No productos recomendados, showing empty state');
        return (
            <div className="text-center py-8">
                <FaLightbulb className="text-gray-400 text-4xl mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Generando recomendaciones personalizadas</h3>
                <p className="text-gray-600 text-sm mb-4">
                    {contextProducts && contextProducts.length > 0 
                        ? 'Analizando productos similares para encontrar las mejores opciones...'
                        : 'Analizando tu historial de compras y preferencias para crear recomendaciones únicas...'
                    }
                </p>
                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                        <span>Analizando preferencias de uso</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                        <span>Buscando productos relacionados</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span>Calculando similitudes</span>
                    </div>
                </div>

            </div>
        );
    }

    const productosAMostrar = getProductsToShow();
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
                        {/* Indicador de estado de preferencias */}
                        {!compact && preferenciasInfo.total > 0 && (
                            <div className="flex items-center space-x-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${
                                    preferenciasInfo.validas > 0 ? 'bg-green-500' : 'bg-yellow-500'
                                }`}></div>
                                <span className="text-xs text-gray-500">
                                    {preferenciasInfo.validas > 0 
                                        ? `${preferenciasInfo.validas} preferencias activas`
                                        : `${preferenciasInfo.total} preferencias sin datos válidos`
                                    }
                                </span>
                            </div>
                        )}
                        <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
                            {contextProducts && contextProducts.length > 0 
                                ? `Productos relacionados por similitud (${contextProducts.length} productos)`
                                : productosRecomendados.length > 0 
                                    ? `Basadas en ${preferenciasInfo.modo === 'preferencias' ? 'tus preferencias personalizadas' : preferenciasInfo.modo === 'generales' ? 'productos populares y ofertas' : 'características generales'} (${productosRecomendados.length} productos)`
                                    : 'Analizando tus preferencias para crear recomendaciones únicas'
                            }
                        </p>
                        {/* MEJORA: Información sobre personalización */}
                        {!compact && (
                            <div className="text-xs text-gray-500 mt-1">
                                {preferenciasInfo.modo === 'preferencias' ? (
                                    `💡 Recomendaciones personalizadas (${preferenciasInfo.validas}/${preferenciasInfo.total} preferencias válidas)`
                                ) : preferenciasInfo.modo === 'generales' ? (
                                    '🌟 Recomendaciones basadas en productos populares y ofertas'
                                ) : (
                                    '🔄 Recomendaciones basadas en características generales del producto'
                                )}

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Indicador de distribución de recomendaciones */}
            {productosRecomendados.length > 0 && (
                <div className={`mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 ${compact ? 'text-xs' : 'text-sm'}`}>
                    <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700">Distribución de recomendaciones:</span>
                        <div className="flex space-x-2">
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-indigo-700">Relacionados</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span className="text-purple-700">Nuevos</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-orange-700">Tendencia</span>
                            </div>
                            <div className="flex items-center space-x-1">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-green-700">Ideales</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Contador de tipos de recomendación */}
                    <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Relacionados:</span>
                                <span className="font-medium text-indigo-700">
                                    {productosRecomendados.filter(p => getTipoRecomendacion(p) === 'relacionado').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Nuevos:</span>
                                <span className="font-medium text-purple-700">
                                    {productosRecomendados.filter(p => getTipoRecomendacion(p) === 'nuevo').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Tendencia:</span>
                                <span className="font-medium text-orange-700">
                                    {productosRecomendados.filter(p => getTipoRecomendacion(p) === 'tendencia').length}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Ideales:</span>
                                <span className="font-medium text-green-700">
                                    {productosRecomendados.filter(p => getTipoRecomendacion(p) === 'ideal').length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`grid gap-3 ${compact ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 mb-4' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 mb-6'}`}>
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

                                {/* Badge de tipo de recomendación */}
                                <div className="absolute top-1.5 right-1.5">
                                    {(() => {
                                        const tipo = getTipoRecomendacion(producto);
                                        switch (tipo) {
                                            case 'nuevo':
                                                return (
                                                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                                        <FaEye className="mr-1 inline" />
                                                        Nuevo
                                                    </div>
                                                );
                                            case 'tendencia':
                                                return (
                                                    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                                        <FaStar className="mr-1 inline" />
                                                        Tendencia
                                                    </div>
                                                );
                                            case 'relacionado':
                                                return (
                                                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                                        <FaCheck className="mr-1 inline" />
                                                        Relacionado
                                                    </div>
                                                );
                                            case 'ideal':
                                                return (
                                                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                                                        <FaHeart className="mr-1 inline" />
                                                        ¡Ideal!
                                                    </div>
                                                );
                                            default:
                                                return null;
                                        }
                                    })()}
                                </div>
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

                                <div className="mb-1.5">
                                    <span className={`font-bold text-amber-600 ${compact ? 'text-sm' : 'text-base'}`}>
                                        {formatearPrecio(producto.precio)}
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
            {productosRecomendados.length > 6 && (
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
                <div className="mt-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 overflow-hidden">
                        {/* Header del collapse */}
                        <button
                            onClick={() => setShowInfo(!showInfo)}
                            className="w-full p-4 text-left flex items-center justify-between hover:bg-blue-100/50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center">
                                <FaInfoCircle className="text-blue-600 mr-3 flex-shrink-0" />
                                <span className="font-medium text-blue-800">¿Cómo funcionan estas recomendaciones?</span>
                            </div>
                            <div className={`transform transition-transform duration-200 ${showInfo ? 'rotate-180' : ''}`}>
                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </button>
                        
                        {/* Contenido del collapse */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            showInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}>
                            <div className="p-4 pt-0 border-t border-blue-200">
                                <div className="text-sm text-blue-800 space-y-2">
                                    <p>
                                        <strong>Análisis de compras anteriores:</strong> Analizamos los productos que has comprado 
                                        para identificar patrones en categorías, estilos, materiales y colores.
                                    </p>
                                    <p>
                                        <strong>Preferencias de uso personalizadas:</strong> Utilizamos tus preferencias específicas 
                                        de uso (cocina, baño, exterior, etc.) para encontrar productos que se adapten perfectamente 
                                        a tus necesidades y gustos.
                                    </p>
                                    <p>
                                        <strong>Productos relacionados:</strong> Incluimos productos que están técnicamente 
                                        relacionados con tus compras anteriores, almacenados en nuestra base de datos de relaciones.
                                    </p>
                                    <p>
                                        <strong>Recomendaciones inteligentes:</strong> Si no tienes historial de compras, 
                                        generamos recomendaciones basadas en tus preferencias de uso. Si tampoco tienes preferencias, 
                                        te mostramos productos populares y de tendencia.
                                    </p>
                                    <p>
                                        <strong>Puntuación inteligente:</strong> Cada producto recibe una puntuación basada en 
                                        qué tan bien se adapta a tus patrones de compra anteriores y preferencias de uso (se calcula analizando similitud de características, 
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
                                                <span><strong>Estrella azul:</strong> Puntuación de recomendación (0-100). Cuanto más alta, mejor se adapta a tus preferencias.</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full mr-2">
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
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-2 py-1 rounded-full font-medium mr-2">
                                                    <FaEye className="mr-1 inline" />
                                                    Nuevo
                                                </div>
                                                <span><strong>Badge púrpura:</strong> Producto complementario a tus preferencias.</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs px-2 py-1 rounded-full font-medium mr-2">
                                                    <FaStar className="mr-1 inline" />
                                                    Tendencia
                                                </div>
                                                <span><strong>Badge naranja:</strong> Producto de tendencia o popular.</span>
                                            </div>
                                            <div className="flex items-center">
                                                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium mr-2">
                                                    <FaCheck className="mr-1 inline" />
                                                    Relacionado
                                                </div>
                                                <span><strong>Badge azul:</strong> Producto técnicamente relacionado con tus compras anteriores.</span>
                                            </div>
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
