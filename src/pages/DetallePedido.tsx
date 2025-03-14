import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { FaFileInvoice, FaShippingFast, FaCheckCircle, FaHistory } from 'react-icons/fa';
import { obtenerHistorialEstados } from '../api/pedidos';

interface DetallePedido {
    id_detalle: number;
    id_pedido: number;
    id_producto: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    nombre_producto?: string;
    imagen_producto?: string;
}

interface Pedido {
    id_pedido: number;
    id_cliente: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number | null;
}

interface HistorialEstado {
    id: number;
    id_pedido: number;
    estado: string;
    fecha_cambio: string;
    comentario: string;
}

const DetallePedido = () => {
    const { id } = useParams<{ id: string }>();
    const [pedido, setPedido] = useState<Pedido | null>(null);
    const [detalles, setDetalles] = useState<DetallePedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [historialEstados, setHistorialEstados] = useState<HistorialEstado[]>([]);
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [cargandoHistorial, setCargandoHistorial] = useState(false);

    useEffect(() => {
        const fetchPedidoYDetalles = async () => {
            try {
                setLoading(true);
                
                if (!id) {
                    setError('ID de pedido no proporcionado');
                    setLoading(false);
                    return;
                }
                
                // Obtener información del pedido
                const { data: pedidoData, error: pedidoError } = await supabase
                    .from('pedidos')
                    .select('*')
                    .eq('id_pedido', id)
                    .single();
                
                if (pedidoError) throw pedidoError;
                if (!pedidoData) throw new Error('Pedido no encontrado');
                
                setPedido(pedidoData);
                
                // Obtener detalles del pedido con información del producto
                const { data: detallesData, error: detallesError } = await supabase
                    .from('detalles_pedido')
                    .select(`
                        *,
                        productos (
                            nombre_producto,
                            imagen
                        )
                    `)
                    .eq('id_pedido', id);
                
                if (detallesError) throw detallesError;
                
                // Formatear los detalles para incluir la información del producto
                const detallesFormateados = (detallesData || []).map((detalle: any) => ({
                    ...detalle,
                    nombre_producto: detalle.productos?.nombre_producto || 'Producto no disponible',
                    imagen_producto: detalle.productos?.imagen || ''
                }));
                
                setDetalles(detallesFormateados || []);
            } catch (error: any) {
                console.error('Error al obtener los detalles del pedido:', error);
                setError(error.message || 'No se pudieron cargar los detalles del pedido. Por favor, intenta de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchPedidoYDetalles();
    }, [id]);

    // Función para cargar el historial de estados
    const cargarHistorialEstados = async () => {
        if (!id) return;
        
        try {
            setCargandoHistorial(true);
            const historial = await obtenerHistorialEstados(parseInt(id));
            setHistorialEstados(historial);
            setMostrarHistorial(true);
        } catch (error: any) {
            console.error('Error al obtener el historial de estados:', error);
            alert('No se pudo cargar el historial de estados. Por favor, intenta de nuevo más tarde.');
        } finally {
            setCargandoHistorial(false);
        }
    };

    // Función para formatear la fecha
    const formatearFecha = (fechaStr: string) => {
        try {
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) {
                return 'Fecha no válida';
            }
            return fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error al formatear fecha:', error);
            return 'Fecha no válida';
        }
    };

    // Función para obtener el color según el estado
    const getEstadoColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente':
                return 'text-yellow-500';
            case 'en proceso':
                return 'text-blue-500';
            case 'enviado':
                return 'text-green-500';
            case 'entregado':
                return 'text-green-700';
            case 'cancelado':
                return 'text-red-500';
            default:
                return 'text-gray-500';
        }
    };

    // Función para obtener el icono según el estado
    const getEstadoIcon = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'pendiente':
                return <FaFileInvoice className="mr-2" />;
            case 'en proceso':
            case 'enviado':
                return <FaShippingFast className="mr-2" />;
            case 'entregado':
                return <FaCheckCircle className="mr-2" />;
            default:
                return <FaFileInvoice className="mr-2" />;
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col space-y-2 mb-6">
                <div>
                    <NavLink
                        className="text-gray-400 uppercase hover:text-amber-900 transition"
                        to="/"
                    >
                        Inicio&nbsp;&gt;
                    </NavLink>
                    <NavLink
                        className="text-gray-400 uppercase hover:text-amber-900 transition"
                        to="/pedidos"
                    >
                        Mis Pedidos&nbsp;&gt;
                    </NavLink>
                    <span className="uppercase text-amber-900">
                        Pedido #{id}
                    </span>
                </div>

                <h1 className="text-amber-900 text-3xl md:text-5xl uppercase mt-4 font-bold">
                    Detalles del Pedido #{id}
                </h1>
            </div>

            {/* Contenido principal */}
            <div className="bg-white rounded-lg shadow-md p-6">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando detalles del pedido...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        <p>{error}</p>
                    </div>
                ) : !pedido ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">Pedido no encontrado.</p>
                    </div>
                ) : (
                    <div>
                        {/* Información del pedido */}
                        <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Pedido</h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Número de Pedido</p>
                                            <p className="text-lg font-medium">#{pedido.id_pedido}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Fecha</p>
                                            <p className="text-lg">{formatearFecha(pedido.fecha_pedido)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Estado</p>
                                            <p className={`text-lg font-medium flex items-center ${getEstadoColor(pedido.estado)}`}>
                                                {getEstadoIcon(pedido.estado)}
                                                {pedido.estado}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Método de Pago</p>
                                            <p className="text-lg">{pedido.metodo_pago}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Resumen del Pedido</h2>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium">RD${(pedido.total * 0.82).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">ITBIS (18%)</span>
                                        <span className="font-medium">RD${(pedido.total * 0.18).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t border-gray-200 mt-2">
                                        <span className="text-gray-800 font-semibold">Total</span>
                                        <span className="text-xl font-bold text-amber-900">RD${pedido.total.toFixed(2)}</span>
                                    </div>
                                    
                                    {pedido.id_factura && (
                                        <div className="mt-4">
                                            <NavLink 
                                                to={`/factura/${pedido.id_factura}`} 
                                                className="block w-full text-center bg-amber-900 text-white py-2 px-4 rounded-lg hover:bg-amber-800 transition"
                                            >
                                                Ver Factura
                                            </NavLink>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Botón para ver historial de estados */}
                        <div className="mb-6">
                            <button
                                onClick={cargarHistorialEstados}
                                className="flex items-center text-amber-900 hover:text-amber-700 font-medium"
                            >
                                <FaHistory className="mr-2" />
                                Ver historial de estados
                            </button>
                        </div>

                        {/* Historial de estados */}
                        {mostrarHistorial && (
                            <div className="mb-8">
                                <h2 className="text-xl font-semibold text-gray-800 mb-4">Historial de Estados</h2>
                                
                                {cargandoHistorial ? (
                                    <div className="p-4 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                                        <p className="mt-2 text-gray-600">Cargando historial...</p>
                                    </div>
                                ) : historialEstados.length === 0 ? (
                                    <p className="text-gray-600 text-center py-4">No hay registros de cambios de estado para este pedido.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {historialEstados.map((item) => (
                                            <div key={item.id} className="border-l-4 border-amber-500 pl-4 py-2">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className={`font-medium ${getEstadoColor(item.estado)}`}>
                                                            Estado: {item.estado}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatearFecha(item.fecha_cambio)}
                                                        </p>
                                                    </div>
                                                </div>
                                                {item.comentario && (
                                                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                                        <p className="font-medium">Comentario:</p>
                                                        <p>{item.comentario}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Productos del pedido */}
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Productos</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Precio Unitario
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Cantidad
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {detalles.map((detalle) => (
                                        <tr key={detalle.id_detalle} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {detalle.imagen_producto && (
                                                        <div className="flex-shrink-0 h-10 w-10">
                                                            <img 
                                                                className="h-10 w-10 rounded-md object-cover" 
                                                                src={detalle.imagen_producto} 
                                                                alt={detalle.nombre_producto} 
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {detalle.nombre_producto}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">RD${detalle.precio_unitario.toFixed(2)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{detalle.cantidad}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">RD${detalle.subtotal.toFixed(2)}</div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetallePedido; 