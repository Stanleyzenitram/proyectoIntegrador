import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabase';
import { FaFileInvoice, FaHistory, FaShoppingCart, FaEye, FaTrash, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import RecomendacionesInteligentes from '../components/RecomendacionesInteligentes';
import { Producto } from '../types'; // Importar la interfaz global

interface Pedido {
    id_pedido: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number;
    direccion_entrega?: string;
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

interface DetalleFactura {
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    productos: Producto[]; 
}

interface ProductoEnRepetirModal extends Producto {
    cantidad: number;
    precio_unitario: number; 
    subtotal: number;
}

const PedidosInt = () => {
    const { user } = useAuth();
    const { addItem, setDeliveryAddress } = useCart();
    const navigate = useNavigate();
    
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);
    const [modalRepetirAbierto, setModalRepetirAbierto] = useState(false);
    const [productosRepetir, setProductosRepetir] = useState<ProductoEnRepetirModal[]>([]);
    const [pedidoSeleccionadoRepetir, setPedidoSeleccionadoRepetir] = useState<Pedido | null>(null);
    const [displayMode, setDisplayMode] = useState<'cajas' | 'metros'>('cajas');
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [ordenarPor, setOrdenarPor] = useState<string>('fecha');
    const [orden, setOrden] = useState<'asc' | 'desc'>('desc');
    
    // Ref para controlar si ya se cargaron los pedidos inicialmente
    const pedidosCargadosRef = useRef(false);

    useEffect(() => {
        // Solo cargar pedidos si no se han cargado antes y hay un usuario
        if (user && !pedidosCargadosRef.current) {
            cargarPedidos();
            pedidosCargadosRef.current = true;
        }
    }, [user]);

    // Efecto separado para filtros y ordenamiento (sin recargar desde la base de datos)
    useEffect(() => {
        // Solo ejecutar si ya hay pedidos cargados
        if (pedidosCargadosRef.current && pedidos.length > 0) {
            // Los filtros se aplican localmente, no necesitan recargar desde la BD
        }
    }, [filtroEstado, ordenarPor, orden, pedidos.length]);

    // Función para recargar manualmente los pedidos
    const recargarPedidos = () => {
        pedidosCargadosRef.current = false;
        cargarPedidos();
    };

    // Efecto para detectar cuando el usuario regresa a la página
    useEffect(() => {
        const handleFocus = () => {
            // Solo recargar si han pasado más de 5 minutos desde la última carga
            const ultimaCarga = localStorage.getItem('ultimaCargaPedidos');
            if (ultimaCarga) {
                const tiempoTranscurrido = Date.now() - parseInt(ultimaCarga);
                const cincoMinutos = 5 * 60 * 1000; // 5 minutos en milisegundos
                
                if (tiempoTranscurrido > cincoMinutos) {
                    recargarPedidos();
                }
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, []);

    const cargarPedidos = async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Guardar timestamp de la carga
            localStorage.setItem('ultimaCargaPedidos', Date.now().toString());

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
        try {
            setLoading(true);
            setError(null);
            
            // Reset display mode
            setDisplayMode('cajas');
            
            // Obtener detalles de la factura
            const { data: detallesData, error: detallesError } = await supabase
                .from('detalles_factura')
                .select(`
                    cantidad,
                    precio_unitario,
                    subtotal,
                    id_producto
                `)
                .eq('id_factura', pedido.id_factura);

            if (detallesError) {
                throw new Error(`Error al obtener detalles: ${detallesError.message}`);
            }

            if (!detallesData || detallesData.length === 0) {
                throw new Error('No se encontraron detalles para esta factura');
            }

            console.log('Detalles obtenidos:', detallesData);

            // Obtener los IDs de productos únicos
            const idsProductos = [...new Set(detallesData.map(detalle => detalle.id_producto))];
            
            // Obtener información completa de los productos
            const { data: productosData, error: productosError } = await supabase
                .from('productos')
                .select(`
                    id_producto,
                    nombre_producto,
                    imagen,
                    stock_actual,
                    precio,
                    metros_por_caja,
                    descripcion,
                    id_categoria,
                    id_estilo,
                    id_materiales,
                    formato,
                    piezas_por_caja,
                    superficie,
                    durabilidad,
                    colorDom,
                    disponibilidad
                `)
                .in('id_producto', idsProductos);

            if (productosError) {
                throw new Error(`Error al obtener productos: ${productosError.message}`);
            }

            if (!productosData || productosData.length === 0) {
                throw new Error('No se encontraron productos para esta factura');
            }

            console.log('Productos obtenidos:', productosData);

            // Combinar los datos de detalles_factura con los productos
            const productosCombinados: ProductoEnRepetirModal[] = detallesData.map(detalle => {
                const producto = productosData.find(p => p.id_producto === detalle.id_producto);
                if (producto) {
                    return {
                        ...producto,
                        cantidad: detalle.cantidad,
                        precio_unitario: detalle.precio_unitario,
                        subtotal: detalle.subtotal,
                        // Asegurar que el precio base se mantenga para el carrito
                        precio: producto.precio
                    };
                }
                return null;
            }).filter(Boolean) as ProductoEnRepetirModal[];

            console.log('Productos combinados:', productosCombinados);

            setProductosRepetir(productosCombinados);
            setPedidoSeleccionadoRepetir(pedido);
            setModalRepetirAbierto(true);
        } catch (error) {
            console.error('Error al abrir modal repetir:', error);
            setError(`Error al cargar los productos del pedido: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        } finally {
            setLoading(false);
        }
    };

    const cerrarModalRepetir = () => {
        setModalRepetirAbierto(false);
        setProductosRepetir([]);
        setPedidoSeleccionadoRepetir(null);
        setDisplayMode('cajas');
    };



    const calcularTotalRepetir = () => {
        if (!productosRepetir.length) return { subtotal: 0, itbis: 0, total: 0 };
        
        const subtotal = productosRepetir.reduce((sum, producto) => sum + producto.subtotal, 0);
        const itbis = subtotal * 0.18;
        const total = subtotal + itbis;
        
        return { subtotal, itbis, total };
    };

    const actualizarCantidad = (index: number, nuevaCantidad: number) => {
        if (nuevaCantidad >= 1 && nuevaCantidad <= productosRepetir[index].stock_actual) {
            const productosActualizados = [...productosRepetir];
            productosActualizados[index] = {
                ...productosActualizados[index],
                cantidad: nuevaCantidad,
                subtotal: nuevaCantidad * productosActualizados[index].precio_unitario
            };
            setProductosRepetir(productosActualizados);
        }
    };

    const confirmarPedidoRepetido = async () => {
        if (!pedidoSeleccionadoRepetir) return;
        
        console.log('Confirmando pedido repetido con productos:', productosRepetir);
        
        // Agregar todos los productos del modal al carrito con sus cantidades actuales
        let productosAgregados = 0;
        const totalProductos = productosRepetir.length;
        
        // Usar for...of para poder usar await
        for (const producto of productosRepetir) {
            // Validar que el producto tenga los datos necesarios
            if (!producto.id_producto || !producto.nombre_producto || !producto.precio) {
                console.error('Producto inválido en confirmarPedidoRepetido:', producto);
                continue;
            }
            
            // Validar que la cantidad sea válida
            if (!producto.cantidad || isNaN(producto.cantidad) || producto.cantidad < 1) {
                console.error('Cantidad inválida en confirmarPedidoRepetido:', producto.cantidad);
                continue;
            }
            
            // Extraer solo los datos del Producto base, sin las propiedades adicionales
            const productoBase: Producto = {
                id_producto: producto.id_producto,
                nombre_producto: producto.nombre_producto,
                imagen: producto.imagen || '',
                stock_actual: producto.stock_actual || 0,
                precio: producto.precio,
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
            };
            
            console.log('Agregando producto al carrito:', { productoBase, cantidad: producto.cantidad });
            try {
                await addItem(productoBase, producto.cantidad);
                productosAgregados++;
                console.log(`Producto ${producto.nombre_producto} agregado exitosamente`);
            } catch (error) {
                console.error(`Error al agregar producto ${producto.nombre_producto}:`, error);
            }
        }
        
        console.log(`Se agregaron exitosamente ${productosAgregados} de ${totalProductos} productos al carrito`);
        
        // Procesar y guardar la dirección de entrega del pedido
        if (pedidoSeleccionadoRepetir.direccion_entrega) {
            try {
                // Intentar parsear la dirección si está en formato JSON
                let direccionParseada;
                try {
                    direccionParseada = JSON.parse(pedidoSeleccionadoRepetir.direccion_entrega);
                } catch {
                    // Si no es JSON, asumir que es un string simple
                    direccionParseada = {
                        calle: pedidoSeleccionadoRepetir.direccion_entrega,
                        ciudad: '',
                        provincia: '',
                        codigo_postal: '',
                        referencia: '',
                        pais: 'Republica Dominicana'
                    };
                }
                
                // Guardar la dirección en el contexto del carrito
                setDeliveryAddress(direccionParseada);
                console.log('Dirección del pedido cargada:', direccionParseada);
                
            } catch (error) {
                console.error('Error al procesar la dirección del pedido:', error);
            }
        }
        
        // Cerrar el modal
        cerrarModalRepetir();
        
        // Redirigir a la página de inicio (home)
        navigate('/');
    };

    const agregarAlCarrito = (producto: Producto) => {
        addItem(producto, 1);
    };

    const getDisplayQuantity = (producto: ProductoEnRepetirModal) => {
        if (producto.metros_por_caja) {
            if (displayMode === 'metros') {
                return `${(producto.cantidad * (producto.metros_por_caja || 0)).toFixed(2)} m²`;
            }
            return `${producto.cantidad} cajas`;
        }
        return producto.cantidad;
    };

    const getUOM = (producto: ProductoEnRepetirModal) => {
        if (producto.metros_por_caja) {
            return (
                <select
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value as 'cajas' | 'metros')}
                    className="text-sm border border-gray-300 rounded px-2 py-1 bg-white"
                >
                    <option value="cajas">Cajas</option>
                    <option value="metros">Metros²</option>
                </select>
            );
        }
        return "Unidad";
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
                        onClick={recargarPedidos}
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
                <div className="mt-3 sm:mt-0">
                    <button
                        onClick={recargarPedidos}
                        className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer text-sm"
                        title="Actualizar pedidos"
                    >
                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Actualizar
                    </button>
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
                            to="/"
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
                    <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            {/* Breadcrumb */}
                            <div className="text-sm text-gray-600 mb-4">
                                <span className="hover:text-amber-600 cursor-pointer">INICIO</span>
                                <span className="mx-2">›</span>
                                <span className="hover:text-amber-600 cursor-pointer">PEDIDOS</span>
                                <span className="mx-2">›</span>
                                <span className="text-gray-900">REPETIR PEDIDO</span>
                            </div>

                            {/* Header */}
                            <div className="flex justify-between items-center mb-6">
                                <h1 className="text-3xl font-bold text-amber-600">Volver a pedir</h1>
                                <button
                                    onClick={cerrarModalRepetir}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer p-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="flex gap-6">
                                {/* Contenido principal */}
                                <div className="flex-1">
                                    {/* Sección de Productos */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Productos</h2>
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Header de la tabla */}
                                            <div className="grid grid-cols-5 bg-gray-50 py-3 px-4 text-sm font-medium text-gray-700 border-b">
                                                <div className="col-span-2">Producto</div>
                                                <div className="text-center">Precio</div>
                                                <div className="text-center">Cantidad</div>
                                                <div className="text-center">UOM</div>
                                                <div className="text-right">Total</div>
                                            </div>
                                            
                                            {/* Productos */}
                                            {productosRepetir.map((producto, index) => (
                                                <div key={index} className="grid grid-cols-5 items-center py-4 px-4 border-b border-gray-100 hover:bg-gray-50">
                                                    {/* Producto */}
                                                    <div className="col-span-2 flex items-center space-x-3">
                                                        <img
                                                            src={producto.imagen || '/placeholder-image.svg'}
                                                            alt={producto.nombre_producto}
                                                            className="w-12 h-12 object-cover rounded-md"
                                                        />
                                                        <div>
                                                            <h3 className="font-medium text-gray-900 text-sm">{producto.nombre_producto}</h3>
                                                            <p className="text-xs text-gray-500">Artículo #{producto.id_producto}</p>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Precio */}
                                                    <div className="text-center">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            RD$ {producto.precio_unitario.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Cantidad */}
                                                    <div className="text-center">
                                                        <div className="flex items-center justify-center space-x-2">
                                                            <button 
                                                                onClick={() => actualizarCantidad(index, producto.cantidad - 1)}
                                                                className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 cursor-pointer"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="text-sm">{getDisplayQuantity(producto)}</span>
                                                            <button 
                                                                onClick={() => actualizarCantidad(index, producto.cantidad + 1)}
                                                                className="w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-gray-800 cursor-pointer"
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                            (STOCK: {producto.stock_actual} cajas)
                                                        </p>
                                                        {producto.metros_por_caja && displayMode === 'cajas' && (
                                                            <p className="text-xs text-gray-500">
                                                                ({(producto.cantidad * (producto.metros_por_caja || 0)).toFixed(2)} m² totales)
                                                            </p>
                                                        )}
                                                        <div className="mt-1">
                                                            <input
                                                                type="number"
                                                                value={producto.cantidad}
                                                                onChange={(e) => actualizarCantidad(index, Math.max(1, parseInt(e.target.value) || 1))}
                                                                className="w-16 text-center text-xs border border-gray-300 rounded px-1 py-0.5"
                                                                min="1"
                                                                max={producto.stock_actual}
                                                            />
                                                        </div>
                                                    </div>
                                                    
                                                    {/* UOM */}
                                                    <div className="text-center">
                                                        {getUOM(producto)}
                                                    </div>
                                                    
                                                    {/* Total */}
                                                    <div className="text-right">
                                                        <span className="text-sm font-bold text-gray-900">
                                                            RD$ {producto.subtotal.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Botón agregar producto */}
                                        <div className="mt-4">
                                            <button 
                                                onClick={() => alert('Funcionalidad para agregar productos adicionales próximamente')}
                                                className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center cursor-pointer"
                                            >
                                                <span className="mr-1">+</span>
                                                Agregar producto
                                            </button>
                                        </div>
                                    </div>

                                    {/* Sección de Recomendaciones Inteligentes */}
                                    <div className="mb-8">
                                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recomendaciones Personalizadas</h2>
                                        <RecomendacionesInteligentes 
                                            contextProducts={productosRepetir}
                                            compact={true}
                                        />
                                    </div>
                                </div>

                                {/* Sidebar derecho - Resumen del pedido */}
                                <div className="w-80 flex-shrink-0">
                                    <div className="bg-gray-50 rounded-lg p-6 sticky top-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h3>
                                        
                                        {/* Desglose de costos */}
                                        <div className="space-y-3 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="font-medium">RD$ {calcularTotalRepetir().subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">ITBIS 18%:</span>
                                                <span className="font-medium">RD$ {calcularTotalRepetir().itbis.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                                <span className="text-gray-900">Total incl. ITBIS:</span>
                                                <span className="text-amber-600">RD$ {calcularTotalRepetir().total.toFixed(2)}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Dirección de entrega */}
                                        <div className="mb-6">
                                            <h4 className="font-medium text-gray-900 mb-2">Dirección de entrega</h4>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {pedidoSeleccionadoRepetir?.direccion_entrega || 'Dirección no especificada'}
                                            </p>
                                            <button 
                                                onClick={() => alert('Funcionalidad para cambiar dirección próximamente')}
                                                className="text-amber-600 hover:text-amber-700 text-sm font-medium cursor-pointer"
                                            >
                                                Cambiar Dirección
                                            </button>
                                        </div>
                                        
                                        {/* Botón confirmar */}
                                        <button 
                                            onClick={confirmarPedidoRepetido}
                                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-3 px-4 rounded-lg font-semibold text-lg transition-colors cursor-pointer"
                                        >
                                            CONFIRMAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PedidosInt;
