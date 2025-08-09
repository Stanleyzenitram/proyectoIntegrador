import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { FaFileInvoice, FaHistory, FaStar, FaLightbulb } from 'react-icons/fa';

interface Pedido {
    id_pedido: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number | null;
    id_cliente: number;
    productos: {
        nombre_producto: string;
        imagen: string;
        total_productos: number;
    };
}



interface ProductoRecomendado {
    id_producto: string;
    nombre_producto: string;
    imagen: string;
    precio: number;
    stock_actual: number;
    metros_por_caja: number;
    frecuencia_compra: number;
}

export default function PedidosInt() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [productosRecomendados, setProductosRecomendados] = useState<ProductoRecomendado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingRepetir, setLoadingRepetir] = useState<number | null>(null);
    const [mostrarModalRepetir, setMostrarModalRepetir] = useState(false);
    const [pedidoParaRepetir, setPedidoParaRepetir] = useState<any>(null);
    const [productosDelPedido, setProductosDelPedido] = useState<any[]>([]);
    const [cargandoProductos, setCargandoProductos] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    const { user } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login', { 
                state: { 
                    returnTo: '/pedidos-int',
                    message: 'Por favor inicia sesión para ver tus pedidos' 
                } 
            });
            return;
        }

        // Solo ejecutar fetchData una vez cuando el usuario esté disponible
        if (pedidos.length === 0 && !loading) {
            fetchData();
        }
    }, [user, navigate]); // Removed pedidos.length and loading from dependencies

    // Timeout para evitar que se quede cargando indefinidamente
    useEffect(() => {
        if (loading) {
            const timeout = setTimeout(() => {
                if (loading) {
                    setLoadingTimeout(true);
                }
            }, 10000); // 10 segundos

            return () => clearTimeout(timeout);
        } else {
            setLoadingTimeout(false);
        }
    }, [loading]);

    // Función para obtener datos
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Iniciando carga de datos para usuario:', user?.id);
            
            // Obtener el ID del cliente
            if (!user) return;
            
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            if (clienteError) {
                console.error('Error al obtener cliente:', clienteError);
                throw new Error(`Error al obtener información del cliente: ${clienteError.message}`);
            }

            if (!clienteData) {
                console.error('Cliente no encontrado para UUID:', user.id);
                throw new Error('No se encontró el cliente');
            }

            console.log('Cliente encontrado:', clienteData.id_cliente);

            // Obtener pedidos del cliente
            console.log('Obteniendo pedidos para cliente ID:', clienteData.id_cliente);
            const { data: pedidosData, error: pedidosError } = await supabase
                .from('pedidos')
                .select('*')
                .eq('id_cliente', clienteData.id_cliente)
                .order('fecha_pedido', { ascending: false })
                .limit(10);

            if (pedidosError) {
                console.error('Error al obtener pedidos:', pedidosError);
                throw new Error(`Error al obtener pedidos: ${pedidosError.message}`);
            }

            console.log('Pedidos obtenidos:', pedidosData?.length || 0);

            // Si no hay pedidos, terminar aquí
            if (!pedidosData || pedidosData.length === 0) {
                console.log('No hay pedidos para mostrar');
                setPedidos([]);
                setLoading(false);
                return;
            }

            // Obtener detalles de todos los pedidos usando id_factura
            const facturasIds = pedidosData
                .map(p => p.id_factura)
                .filter(id => id !== null);

            if (facturasIds.length === 0) {
                console.log('No hay facturas asociadas a los pedidos');
                setPedidos(pedidosData.map((pedido: any) => ({
                    ...pedido,
                    productos: {
                        nombre_producto: 'Sin productos',
                        imagen: '',
                        total_productos: 0
                    }
                })));
                setLoading(false);
                return;
            }

            console.log('Facturas IDs a consultar:', facturasIds);

            const { data: todosLosDetalles, error: detallesError } = await supabase
                .from('detalle_facturas')
                .select(`
                    id_factura,
                    id_producto,
                    productos!inner (
                        nombre_producto,
                        imagen
                    )
                `)
                .in('id_factura', facturasIds)
                .order('id_detalle', { ascending: true });

            if (detallesError) {
                console.error('Error al obtener detalles:', detallesError);
                // Continuar sin detalles, mostrar pedidos básicos
                setPedidos(pedidosData.map((pedido: any) => ({
                    ...pedido,
                    productos: {
                        nombre_producto: 'Sin detalles disponibles',
                        imagen: '',
                        total_productos: 0
                    }
                })));
                setLoading(false);
                return;
            }

            console.log('Detalles obtenidos:', todosLosDetalles?.length || 0);

            // Agrupar detalles por factura
            const detallesPorFactura = todosLosDetalles?.reduce((acc: any, detalle: any) => {
                if (!acc[detalle.id_factura]) {
                    acc[detalle.id_factura] = [];
                }
                acc[detalle.id_factura].push(detalle);
                return acc;
            }, {}) || {};

            console.log('Detalles agrupados por factura:', Object.keys(detallesPorFactura));

            // Formatear pedidos con información del primer producto
            const pedidosFormateados = pedidosData.map((pedido: any) => {
                if (!pedido.id_factura) {
                    return {
                        ...pedido,
                        productos: {
                            nombre_producto: 'Sin factura',
                            imagen: '',
                            total_productos: 0
                        }
                    };
                }

                const detallesFactura = detallesPorFactura[pedido.id_factura] || [];
                const primerDetalle = detallesFactura[0];
                const totalProductos = detallesFactura.length;

                return {
                    ...pedido,
                    productos: primerDetalle?.productos ? {
                        nombre_producto: primerDetalle.productos.nombre_producto || 'Producto sin nombre',
                        imagen: primerDetalle.productos.imagen || '',
                        total_productos: totalProductos
                    } : {
                        nombre_producto: 'Sin productos',
                        imagen: '',
                        total_productos: 0
                    }
                };
            });

            console.log('Pedidos formateados:', pedidosFormateados.length);

            // Obtener productos más comprados para recomendaciones usando id_factura
            try {
                // Primero obtener las facturas del cliente
                const { data: facturasCliente } = await supabase
                    .from('pedidos')
                    .select('id_factura')
                    .eq('id_cliente', clienteData.id_cliente)
                    .not('id_factura', 'is', null);

                if (facturasCliente && facturasCliente.length > 0) {
                    const facturasIds = facturasCliente.map(f => f.id_factura);
                    
                    const { data: recomendacionesData } = await supabase
                        .from('detalle_facturas')
                        .select(`
                            id_producto,
                            cantidad,
                            productos (
                                id_producto,
                                nombre_producto,
                                imagen,
                                precio,
                                stock_actual,
                                metros_por_caja
                            )
                        `)
                        .in('id_factura', facturasIds);

                    if (recomendacionesData) {
                        // Agrupar por producto y contar frecuencia
                        const productosMap = new Map();
                        recomendacionesData.forEach((detalle: any) => {
                            const producto = detalle.productos;
                            if (producto && producto.stock_actual > 0) {
                                const key = producto.id_producto;
                                if (productosMap.has(key)) {
                                    productosMap.get(key).frecuencia_compra += detalle.cantidad;
                                } else {
                                    productosMap.set(key, {
                                        ...producto,
                                        frecuencia_compra: detalle.cantidad
                                    });
                                }
                            }
                        });

                        // Convertir a array y ordenar por frecuencia
                        const recomendaciones = Array.from(productosMap.values())
                            .sort((a, b) => b.frecuencia_compra - a.frecuencia_compra)
                            .slice(0, 4);

                        setProductosRecomendados(recomendaciones);
                        console.log('Recomendaciones cargadas:', recomendaciones.length);
                    }
                }
            } catch (recomendacionesError) {
                console.warn('Error al cargar recomendaciones:', recomendacionesError);
                // No es crítico, continuar sin recomendaciones
            }

            setPedidos(pedidosFormateados || []);
            console.log('Datos cargados exitosamente');
        } catch (error: any) {
            console.error('Error al cargar los datos:', error);
            setError('Error al cargar los datos. Por favor, intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };



    const formatearFecha = (fechaStr: string) => {
        try {
            const fecha = new Date(fechaStr);
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'en proceso':
                return 'bg-blue-100 text-blue-800';
            case 'enviado':
                return 'bg-purple-100 text-purple-800';
            case 'entregado':
                return 'bg-green-100 text-green-800';
            case 'cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const abrirModalRepetir = async (pedido: Pedido) => {
        try {
            setCargandoProductos(true);
            setPedidoParaRepetir(pedido);
            setMostrarModalRepetir(true);
            
            if (!pedido.id_factura) {
                throw new Error('Este pedido no tiene factura asociada');
            }
            
            console.log('Abriendo modal para pedido:', pedido.id_pedido, 'factura:', pedido.id_factura);
            
            // Obtener detalles del pedido con productos usando id_factura
            const { data: detallesData, error: detallesError } = await supabase
                .from('detalle_facturas')
                .select(`
                    cantidad,
                    precio_unitario,
                    subtotal,
                    productos (
                        id_producto,
                        nombre_producto,
                        imagen,
                        precio,
                        stock_actual,
                        metros_por_caja,
                        descripcion,
                        categoria_id,
                        estilo_id,
                        material_id,
                        descuento
                    )
                `)
                .eq('id_factura', pedido.id_factura);

            if (detallesError) {
                console.error('Error al obtener detalles:', detallesError);
                throw new Error(`Error al obtener detalles: ${detallesError.message}`);
            }

            if (!detallesData || detallesData.length === 0) {
                throw new Error('No se encontraron detalles para este pedido');
            }

            console.log('Detalles obtenidos para modal:', detallesData.length);

            // Formatear productos con cantidades editables
            const productosFormateados = (detallesData || []).map((detalle: any) => ({
                ...detalle.productos,
                cantidad_original: detalle.cantidad,
                cantidad_nueva: detalle.cantidad,
                precio_unitario: detalle.precio_unitario,
                subtotal_original: detalle.subtotal,
                disponible: (detalle.productos as any)?.stock_actual >= detalle.cantidad
            }));

            setProductosDelPedido(productosFormateados);
            console.log('Productos formateados para modal:', productosFormateados.length);
        } catch (error: any) {
            console.error('Error al cargar productos del pedido:', error);
            alert(`Error al cargar los productos del pedido: ${error.message}`);
            setMostrarModalRepetir(false);
            setPedidoParaRepetir(null);
            setProductosDelPedido([]);
        } finally {
            setCargandoProductos(false);
        }
    };

    const cerrarModal = () => {
        setMostrarModalRepetir(false);
        setPedidoParaRepetir(null);
        setProductosDelPedido([]);
    };

    const actualizarCantidad = (idProducto: string, nuevaCantidad: number) => {
        setProductosDelPedido(productos => 
            productos.map(producto => 
                producto.id_producto === idProducto 
                    ? { ...producto, cantidad_nueva: Math.max(0, nuevaCantidad) }
                    : producto
            )
        );
    };

    const confirmarRepetirPedido = async () => {
        try {
            setLoadingRepetir(-1); // Usar -1 para el modal
            
            let productosAgregados = 0;
            let productosNoDisponibles = 0;

            for (const producto of productosDelPedido) {
                if (producto.cantidad_nueva > 0) {
                    if ((producto as any).stock_actual >= producto.cantidad_nueva) {
                        await addItem(producto, producto.cantidad_nueva);
                        productosAgregados++;
                    } else {
                        productosNoDisponibles++;
                    }
                }
            }

            if (productosAgregados > 0) {
                alert(`Se agregaron ${productosAgregados} productos al carrito${productosNoDisponibles > 0 ? `. ${productosNoDisponibles} productos no están disponibles en stock.` : '.'}`);
                cerrarModal();
            } else {
                alert('No se agregaron productos al carrito');
            }

        } catch (error: any) {
            console.error('Error al confirmar pedido:', error);
            alert('Error al agregar productos al carrito');
        } finally {
            setLoadingRepetir(null);
        }
    };

    const agregarRecomendacion = async (producto: ProductoRecomendado) => {
        try {
            await addItem(producto as any, 1);
            alert(`${producto.nombre_producto} agregado al carrito`);
        } catch (error) {
            console.error('Error al agregar recomendación:', error);
            alert('Error al agregar el producto al carrito');
        }
    };
  
  return (
        <div className="w-full h-full flex flex-col mt-10 px-4 max-w-7xl mx-auto">
            {/* Navegación */}
            <div className="bg-gray-100 py-2 px-4 mb-6 rounded-md w-full">
                <div className="flex items-center text-gray-500 text-xs">
                    <Link to="/" className="hover:text-amber-900 transition-colors uppercase">
                        INICIO
                    </Link>
                    <span className="mx-1">&gt;</span>
                    <span className="text-amber-900 font-medium uppercase">MIS PEDIDOS</span>
                </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Pedidos</h1>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                        {loadingTimeout ? 'La carga está tomando más tiempo del esperado...' : 'Cargando información...'}
                    </p>
                    {loadingTimeout && (
                        <div className="mt-4 space-y-2">
                            <p className="text-sm text-gray-500">Si la página no carga, puedes:</p>
                            <button
                                onClick={() => {
                                    setLoading(false);
                                    setLoadingTimeout(false);
                                    setError('Tiempo de espera agotado. Por favor, intenta de nuevo.');
                                }}
                                className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
                            >
                                Cancelar carga
                            </button>
                        </div>
                    )}
                </div>
            ) : error ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                    <p>{error}</p>
                    <button 
                        onClick={() => {
                            setError(null);
                            setPedidos([]);
                            fetchData();
                        }}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            ) : (
                <>
                    {/* Botón de refrescar */}
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => {
                                setPedidos([]);
                                setProductosRecomendados([]);
                                fetchData();
                            }}
                            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
                        >
                            Actualizar datos
                        </button>
                    </div>

                    {/* Sección de Recomendaciones */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-8">
                        <div className="flex items-center mb-4">
                            <FaLightbulb className="text-amber-600 text-xl mr-3" />
                            <h2 className="text-xl font-semibold text-gray-900">Recomendaciones para ti</h2>
                        </div>
                        <p className="text-gray-600 mb-6">Basado en tus compras anteriores, estos productos podrían interesarte:</p>
                        
                        {productosRecomendados.length === 0 ? (
                            <div className="text-center py-8">
                                <FaStar className="text-amber-400 text-3xl mx-auto mb-3" />
                                <p className="text-gray-600">Haz tu primera compra para ver recomendaciones personalizadas</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {productosRecomendados.map((producto) => (
                                    <div key={producto.id_producto} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="aspect-w-1 aspect-h-1">
                                            <img 
                                                src={producto.imagen} 
                                                alt={producto.nombre_producto}
                                                className="w-full h-48 object-cover"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                                                {producto.nombre_producto}
                                            </h3>
                                            <p className="text-amber-600 font-bold text-lg mb-2">
                                                RD${producto.precio.toFixed(2)}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                Comprado {producto.frecuencia_compra} veces
                                            </p>
                                            <button
                                                onClick={() => agregarRecomendacion(producto)}
                                                className="w-full bg-amber-600 text-white px-3 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm"
                                            >
                                                Agregar al carrito
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Historial de Pedidos */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
                            <FaHistory className="mr-3 text-amber-600" />
                            Historial de Pedidos
                        </h2>

                        {pedidos.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-lg shadow-md">
                                <FaFileInvoice className="text-gray-400 text-4xl mx-auto mb-4" />
                                <p className="text-gray-600">No tienes pedidos aún</p>
                                <Link 
                                    to="/"
                                    className="inline-block mt-4 bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 transition-colors"
                                >
                                    Explorar productos
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {pedidos.map((pedido) => (
                                    <div key={pedido.id_pedido} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                {/* Imagen del producto */}
                                                <div className="flex-shrink-0">
                                                    {pedido.productos.imagen ? (
                                                        <img 
                                                            src={pedido.productos.imagen} 
                                                            alt={pedido.productos.nombre_producto}
                                                            className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '/placeholder-image.svg';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                                                            <FaFileInvoice className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                {/* Información del pedido */}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                                                            {pedido.estado}
                                                        </span>
                                                    </div>
                                                    <h3 className="font-medium text-gray-900 mb-1">
                                                        ID Pedido: {String(pedido.id_pedido).padStart(6, '0')}
                                                    </h3>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p><span className="font-medium">Fecha:</span> {formatearFecha(pedido.fecha_pedido)}</p>
                                                        <p><span className="font-medium">Método de pago:</span> {pedido.metodo_pago}</p>
                                                        <p><span className="font-medium">Total:</span> RD${pedido.total.toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Información del producto */}
                                        <div className="mb-4 p-3 bg-gray-50 rounded-md">
                                            <p className="text-sm font-medium text-gray-900 mb-1">
                                                {pedido.productos.nombre_producto}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {pedido.productos.total_productos > 1 ? 
                                                    `Y ${pedido.productos.total_productos - 1} artículos más` : 
                                                    'Artículo único'
                                                }
                                            </p>
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                onClick={() => navigate(`/factura/${pedido.id_factura}`)}
                                                className="px-4 py-2 text-amber-600 hover:text-amber-800 border border-amber-600 hover:border-amber-800 rounded-md transition-colors text-sm font-medium"
                                                disabled={!pedido.id_factura}
                                            >
                                                Ver factura
                                            </button>
                                            <button
                                                onClick={() => abrirModalRepetir(pedido)}
                                                className="px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-md transition-colors text-sm font-medium"
                                            >
                                                Repetir pedido
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                                </>
            )}

            {/* Modal de Repetir Pedido */}
            {mostrarModalRepetir && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header del Modal */}
                        <div className="bg-amber-600 text-white px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-bold">Volver a pedir</h2>
                            <button 
                                onClick={cerrarModal}
                                className="text-white hover:text-gray-200 text-2xl"
                            >
                                ×
                            </button>
                        </div>

                        {/* Contenido del Modal */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                            {cargandoProductos ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Cargando productos...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Encabezados de la tabla */}
                                    <div className="grid grid-cols-12 gap-4 mb-4 text-sm font-medium text-gray-500 uppercase tracking-wider border-b pb-2">
                                        <div className="col-span-5">Productos</div>
                                        <div className="col-span-2 text-center">Precio</div>
                                        <div className="col-span-2 text-center">Cantidad</div>
                                        <div className="col-span-1 text-center">UOM</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>

                                    {/* Lista de productos */}
                                    <div className="space-y-4">
                                        {productosDelPedido.map((producto, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100">
                                                {/* Imagen y nombre del producto */}
                                                <div className="col-span-5 flex items-center space-x-3">
                                                    <img 
                                                        src={producto.imagen || '/placeholder-image.svg'}
                                                        alt={producto.nombre_producto}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.src = '/placeholder-image.svg';
                                                        }}
                                                    />
                                                    <div>
                                                        <h3 className="font-medium text-gray-900 text-sm">
                                                            {producto.nombre_producto}
                                                        </h3>
                                                        {!producto.disponible && (
                                                            <span className="text-xs text-red-500">Stock insuficiente</span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Precio */}
                                                <div className="col-span-2 text-center">
                                                    <span className="font-medium">RD${producto.precio?.toFixed(2) || '0.00'}</span>
                                                </div>

                                                {/* Cantidad */}
                                                <div className="col-span-2 text-center">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => actualizarCantidad(producto.id_producto, producto.cantidad_nueva - 1)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                            disabled={producto.cantidad_nueva <= 0}
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-12 text-center font-medium">
                                                            {producto.cantidad_nueva}
                                                        </span>
                                                        <button
                                                            onClick={() => actualizarCantidad(producto.id_producto, producto.cantidad_nueva + 1)}
                                                            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                            disabled={producto.cantidad_nueva >= producto.stock_actual}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* UOM */}
                                                <div className="col-span-1 text-center">
                                                    <select className="text-sm border border-gray-300 rounded px-2 py-1">
                                                        <option value="cajas">CAJAS</option>
                                                    </select>
                                                </div>

                                                {/* Total */}
                                                <div className="col-span-2 text-right">
                                                    <span className="font-medium">
                                                        RD${((producto.precio || 0) * producto.cantidad_nueva).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Botón agregar producto */}
                                    <div className="mt-6 pt-4 border-t">
                                        <button className="text-amber-600 hover:text-amber-800 font-medium flex items-center">
                                            <span className="mr-2">+</span>
                                            Agregar producto
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer del Modal */}
                        {!cargandoProductos && (
                            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                                {/* Totales */}
                                <div className="text-right space-y-1">
                                    <div className="text-sm text-gray-600">
                                        Subtotal: RD${productosDelPedido.reduce((acc, p) => acc + ((p.precio || 0) * p.cantidad_nueva), 0).toFixed(2)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        ITBIS 18%: RD${(productosDelPedido.reduce((acc, p) => acc + ((p.precio || 0) * p.cantidad_nueva), 0) * 0.18).toFixed(2)}
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        Total incl. ITBIS: RD${(productosDelPedido.reduce((acc, p) => acc + ((p.precio || 0) * p.cantidad_nueva), 0) * 1.18).toFixed(2)}
                                    </div>
                                </div>

                                {/* Botones */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={cerrarModal}
                                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={confirmarRepetirPedido}
                                        disabled={loadingRepetir === -1}
                                        className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
                                    >
                                        {loadingRepetir === -1 ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                                Procesando...
                                            </div>
                                        ) : (
                                            'CONFIRMAR'
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
    </div>
    );
}
