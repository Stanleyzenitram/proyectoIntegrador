import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { FaFileInvoice, FaHistory, FaShoppingCart, FaEye, FaTrash, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import RecomendacionesInteligentes from '../components/RecomendacionesInteligentes';

interface Pedido {
    id_pedido: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number;
    productos?: {
        total_productos: number;
        items: Array<{
            id_producto: number;
            nombre_producto: string;
            imagen: string;
            cantidad: number;
            precio_unitario: number;
            subtotal: number;
        }>;
    };
}

interface Producto {
    id_producto: number;
    nombre_producto: string;
    imagen: string;
    precio: number;
    stock_actual: number;
    metros_por_caja: number;
    descripcion: string;
    categoria_id: number;
    estilo_id: number;
    materiales_id: number;
    formato: string;
    piezas_por_caja: number;
    superficie: string;
    durabilidad: number;
    colorDom: string;
    color: string;
    disponibilidad: boolean;
}

const PedidosInt = () => {
    const { user } = useAuth();
    const { addItem } = useCart();
    const navigate = useNavigate();
    
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
    const [modalRepetirAbierto, setModalRepetirAbierto] = useState(false);
    const [productosRepetir, setProductosRepetir] = useState<Producto[]>([]);
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
    const [orden, setOrden] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        if (user) {
            cargarPedidos();
        }
    }, [user, filtroEstado, ordenarPor, orden]);

    const cargarPedidos = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Primero obtener el id_cliente usando el UUID del usuario autenticado
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('id_cliente')
                .eq('uuid', user.id)
                .single();

            if (clienteError) {
                console.error('Error al obtener cliente:', clienteError);
                setError('Error al obtener información del cliente');
                return;
            }

            if (!clienteData) {
                setError('Cliente no encontrado');
                return;
            }

            const idCliente = clienteData.id_cliente;

            // Obtener pedidos del cliente usando el id_cliente
            const { data: pedidosData, error: pedidosError } = await supabase
                .from('pedidos')
                .select(`
                    id_pedido,
                    fecha_pedido,
                    total,
                    estado,
                    metodo_pago,
                    id_factura
                `)
                .eq('id_cliente', idCliente)
                .order('fecha_pedido', { ascending: false });

            if (pedidosError) throw pedidosError;

            if (pedidosData && pedidosData.length > 0) {
                // Obtener IDs de facturas
                const facturasIds = pedidosData
                    .filter(pedido => pedido.id_factura)
                    .map(pedido => pedido.id_factura);

                if (facturasIds.length > 0) {
                    // Obtener detalles de factura con productos
                    const { data: todosLosDetalles, error: detallesError } = await supabase
                        .from('detalles_factura')
                        .select(`
                            id_factura,
                            id_producto,
                            cantidad,
                            productos!inner (
                                nombre_producto,
                                imagen
                            )
                        `)
                        .in('id_factura', facturasIds)
                        .order('id_detalle_factura', { ascending: true });

                    if (detallesError) throw detallesError;

                    // Agrupar productos por factura
                    const productosPorFactura = new Map<number, any[]>();
                    todosLosDetalles?.forEach(detalle => {
                        if (!productosPorFactura.has(detalle.id_factura)) {
                            productosPorFactura.set(detalle.id_factura, []);
                        }
                        productosPorFactura.get(detalle.id_factura)?.push(detalle);
                    });

                    // Combinar pedidos con productos
                    const pedidosConProductos = pedidosData.map(pedido => {
                        const productos = productosPorFactura.get(pedido.id_factura || 0) || [];
                        return {
                            ...pedido,
                            productos: {
                                total_productos: productos.length,
                                items: productos.map(detalle => ({
                                    id_producto: detalle.id_producto,
                                    nombre_producto: detalle.productos.nombre_producto,
                                    imagen: detalle.productos.imagen,
                                    cantidad: detalle.cantidad,
                                    precio_unitario: 0, // No disponible en esta consulta
                                    subtotal: 0 // No disponible en esta consulta
                                }))
                            }
                        };
                    });

                    setPedidos(pedidosConProductos);
                } else {
                    setPedidos(pedidosData);
                }
            } else {
                setPedidos([]);
            }
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            setError('Error al cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    const abrirModal = (pedido: Pedido) => {
        setPedidoSeleccionado(pedido);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setPedidoSeleccionado(null);
    };

    const abrirModalRepetir = async (pedido: Pedido) => {
        if (!pedido.id_factura) return;

        try {
            // Obtener detalles del pedido con productos usando id_factura
            const { data: detallesData, error: detallesError } = await supabase
                .from('detalles_factura')
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
                        materiales_id,
                        formato,
                        piezas_por_caja,
                        superficie,
                        durabilidad,
                        colorDom,
                        color,
                        disponibilidad
                    )
                `)
                .eq('id_factura', pedido.id_factura);

            if (detallesError) throw detallesError;

            if (detallesData) {
                const productos = detallesData.map(detalle => ({
                    id_producto: detalle.productos.id_producto,
                    nombre_producto: detalle.productos.nombre_producto,
                    imagen: detalle.productos.imagen,
                    precio: detalle.productos.precio,
                    stock_actual: detalle.productos.stock_actual,
                    metros_por_caja: detalle.productos.metros_por_caja,
                    descripcion: detalle.productos.descripcion,
                    categoria_id: detalle.productos.categoria_id,
                    estilo_id: detalle.productos.estilo_id,
                    materiales_id: detalle.productos.materiales_id,
                    formato: detalle.productos.formato,
                    piezas_por_caja: detalle.productos.piezas_por_caja,
                    superficie: detalle.productos.superficie,
                    durabilidad: detalle.productos.durabilidad,
                    colorDom: detalle.productos.colorDom,
                    color: detalle.productos.color,
                    disponibilidad: detalle.productos.disponibilidad
                }));

                setProductosRepetir(productos);
                setModalRepetirAbierto(true);
            }
        } catch (error) {
            console.error('Error al obtener detalles:', error);
            alert('Error al obtener los productos del pedido');
        }
    };

    const cerrarModalRepetir = () => {
        setModalRepetirAbierto(false);
        setProductosRepetir([]);
    };

    const agregarAlCarrito = (producto: Producto) => {
        addItem(producto, 1);
    };

    const filtrarPedidos = () => {
        let pedidosFiltrados = [...pedidos];

        if (filtroEstado !== 'todos') {
            pedidosFiltrados = pedidosFiltrados.filter(pedido => 
                pedido.estado.toLowerCase() === filtroEstado.toLowerCase()
            );
        }

        // Ordenar pedidos
        pedidosFiltrados.sort((a, b) => {
            let valorA: any;
            let valorB: any;

            switch (ordenarPor) {
                case 'fecha':
                    valorA = new Date(a.fecha_pedido);
                    valorB = new Date(b.fecha_pedido);
                    break;
                case 'total':
                    valorA = a.total;
                    valorB = b.total;
                    break;
                case 'estado':
                    valorA = a.estado;
                    valorB = b.estado;
                    break;
                default:
                    valorA = new Date(a.fecha_pedido);
                    valorB = new Date(b.fecha_pedido);
            }

            if (orden === 'asc') {
                return valorA > valorB ? 1 : -1;
            } else {
                return valorA < valorB ? 1 : -1;
            }
        });

        return pedidosFiltrados;
    };

    const obtenerColorEstado = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente':
                return 'bg-yellow-100 text-yellow-800';
            case 'en proceso':
                return 'bg-blue-100 text-blue-800';
            case 'entregado':
                return 'bg-green-100 text-green-800';
            case 'cancelado':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatearFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-DO', {
            style: 'currency',
            currency: 'DOP'
        }).format(precio);
    };

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col mt-8 px-4 max-w-6xl mx-auto">
                <div className="flex items-center justify-center h-48">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col mt-8 px-4 max-w-6xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-800 text-sm">{error}</p>
                    <button 
                        onClick={cargarPedidos}
                        className="mt-2 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition-colors cursor-pointer text-sm"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    const pedidosFiltrados = filtrarPedidos();

    return (
        <div className="w-full h-full flex flex-col mt-8 px-4 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
                    <p className="text-gray-600 mt-1.5 text-sm">Gestiona y revisa el historial de tus pedidos</p>
                </div>
            </div>

            {/* Recomendaciones Personalizadas */}
            <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="text-center mb-3">
                    <h2 className="text-base font-semibold text-gray-900 mb-1">Recomendaciones Personalizadas</h2>
                    <p className="text-xs text-gray-600">Productos que podrían interesarte</p>
                </div>
                <RecomendacionesInteligentes />
            </div>

            {/* Sección de Filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Filtrar por Estado
                        </label>
                        <select
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="todos">Todos los estados</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en proceso">En Proceso</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Ordenar por
                        </label>
                        <select
                            value={ordenarPor}
                            onChange={(e) => setOrdenarPor(e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="fecha">Fecha</option>
                            <option value="total">Total</option>
                            <option value="estado">Estado</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                            Orden
                        </label>
                        <select
                            value={orden}
                            onChange={(e) => setOrden(e.target.value as 'asc' | 'desc')}
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            <option value="desc">Descendente</option>
                            <option value="asc">Ascendente</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Lista de Pedidos */}
            {pedidosFiltrados.length === 0 ? (
                <div className="text-center py-8">
                    <FaHistory className="mx-auto h-10 w-10 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pedidos</h3>
                    <p className="mt-1 text-xs text-gray-500">
                        Aún no has realizado ningún pedido. ¡Comienza a comprar!
                    </p>
                    <div className="mt-4">
                        <Link
                            to="/productos"
                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                        >
                            <FaShoppingCart className="mr-1.5" />
                            Ver Productos
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {pedidosFiltrados.map((pedido) => (
                        <div key={pedido.id_pedido} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="text-base font-semibold text-gray-900">
                                            Pedido #{pedido.id_pedido}
                                        </h3>
                                        <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${obtenerColorEstado(pedido.estado)}`}>
                                            {pedido.estado}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {formatearFecha(pedido.fecha_pedido)}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Método de pago: {pedido.metodo_pago}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                                    <span className="text-xl font-bold text-gray-900">
                                        {formatearPrecio(pedido.total)}
                                    </span>
                                </div>
                            </div>

                            {/* Información de Productos */}
                            {pedido.productos && (
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-medium text-gray-900">Productos del Pedido</h4>
                                        <span className="text-xs text-gray-500">
                                            {pedido.productos.total_productos} producto{pedido.productos.total_productos !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    {/* Mostrar primer producto y contador */}
                                    {pedido.productos.items.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                            <img
                                                src={pedido.productos.items[0].imagen || '/placeholder-image.svg'}
                                                alt={pedido.productos.items[0].nombre_producto}
                                                className="w-12 h-12 object-cover rounded-md"
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 text-sm">
                                                    {pedido.productos.items[0].nombre_producto}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    Cantidad: {pedido.productos.items[0].cantidad}
                                                </p>
                                                {pedido.productos.total_productos > 1 && (
                                                    <p className="text-xs text-gray-600">
                                                        Y {pedido.productos.total_productos - 1} artículo{pedido.productos.total_productos - 1 !== 1 ? 's' : ''} más
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Botones de Acción */}
                            <div className="flex flex-wrap gap-1.5 mt-4">
                                <button
                                    onClick={() => abrirModal(pedido)}
                                    className="inline-flex items-center px-2.5 py-1.5 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                    <FaEye className="mr-1.5" />
                                    Ver Detalles
                                </button>
                                <button
                                    onClick={() => abrirModalRepetir(pedido)}
                                    className="inline-flex items-center px-2.5 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors cursor-pointer"
                                >
                                    <FaShoppingCart className="mr-1.5" />
                                    Repetir Pedido
                                </button>
                                {pedido.id_factura && (
                                    <Link
                                        to={`/factura/${pedido.id_factura}`}
                                        className="inline-flex items-center px-2.5 py-1.5 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
                                    >
                                        <FaFileInvoice className="mr-1.5" />
                                        Ver Factura
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Detalles */}
            {modalAbierto && pedidoSeleccionado && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
                    <div className="bg-white rounded-lg max-w-xl w-full max-h-[85vh] overflow-y-auto">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Detalles del Pedido #{pedidoSeleccionado.id_pedido}
                                </h2>
                                <button
                                    onClick={cerrarModal}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Fecha del Pedido</p>
                                        <p className="text-xs text-gray-900">{formatearFecha(pedidoSeleccionado.fecha_pedido)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Estado</p>
                                        <p className="text-xs text-gray-900">{pedidoSeleccionado.estado}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Método de Pago</p>
                                        <p className="text-xs text-gray-900">{pedidoSeleccionado.metodo_pago}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Total</p>
                                        <p className="text-xs text-gray-900">{formatearPrecio(pedidoSeleccionado.total)}</p>
                                    </div>
                                </div>

                                {pedidoSeleccionado.productos && (
                                    <div>
                                        <h3 className="text-base font-medium text-gray-900 mb-2">Productos</h3>
                                        <div className="space-y-2">
                                            {pedidoSeleccionado.productos.items.map((producto, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-md">
                                                    <img
                                                        src={producto.imagen || '/placeholder-image.svg'}
                                                        alt={producto.nombre_producto}
                                                        className="w-10 h-10 object-cover rounded-md"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900 text-sm">{producto.nombre_producto}</p>
                                                        <p className="text-xs text-gray-600">Cantidad: {producto.cantidad}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Repetir Pedido */}
            {modalRepetirAbierto && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3">
                    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[85vh] overflow-y-auto">
                        <div className="p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-900">Repetir Pedido</h2>
                                <button
                                    onClick={cerrarModalRepetir}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {productosRepetir.map((producto, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                                        <img
                                            src={producto.imagen || '/placeholder-image.svg'}
                                            alt={producto.nombre_producto}
                                            className="w-full h-24 object-cover rounded-md mb-2"
                                        />
                                        <h3 className="font-medium text-gray-900 mb-1.5 text-sm">{producto.nombre_producto}</h3>
                                        <p className="text-xs text-gray-600 mb-1.5">{producto.descripcion}</p>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-base font-bold text-gray-900">
                                                {formatearPrecio(producto.precio)}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                Stock: {producto.stock_actual}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => agregarAlCarrito(producto)}
                                            disabled={!producto.disponibilidad || producto.stock_actual <= 0}
                                            className={`w-full px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                                                producto.disponibilidad && producto.stock_actual > 0
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {producto.disponibilidad && producto.stock_actual > 0
                                                ? 'Agregar al Carrito'
                                                : 'No Disponible'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PedidosInt;
