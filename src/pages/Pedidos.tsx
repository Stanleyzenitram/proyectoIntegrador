import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth, useUserRole } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { FaFileInvoice, FaShippingFast, FaCheckCircle, FaTimesCircle, FaHistory, FaBell, FaArrowLeft, FaExternalLinkAlt } from 'react-icons/fa';
import RecomendacionesInteligentes from '../components/RecomendacionesInteligentes';

interface Pedido {
    id_pedido: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number | null;
    id_cliente: number;
}

interface Notificacion {
    id: number;
    id_usuario: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    leido: boolean;
    fecha: string;
}

interface HistorialEstado {
    id: number;
    id_pedido: number;
    estado: string;
    fecha_cambio: string;
    comentario: string;
    usuario_id: string;
}

const Pedidos = () => {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<string>('todos');
    const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
    const [mostrarHistorial, setMostrarHistorial] = useState(false);
    const [historial, setHistorial] = useState<HistorialEstado[]>([]);
    const [pedidoSeleccionado, setPedidoSeleccionado] = useState<number | null>(null);
    const { user } = useAuth();
    const { userRole } = useUserRole();
    const navigate = useNavigate();
    const location = useLocation();
    const [viendoFactura, setViendoFactura] = useState(false);

    useEffect(() => {
        // Verificar si estamos viendo una factura basado en la URL
        setViendoFactura(location.pathname.includes('/factura'));
        
        if (!user) {
            navigate('/login', { 
                state: { 
                    returnTo: '/pedidos',
                    message: 'Por favor inicia sesión para ver tus pedidos' 
                } 
            });
            return;
        }

        const fetchData = async () => {
            try {
                console.log('Iniciando fetchData con user:', user);
                
                // Primero obtener el ID del cliente
                const { data: clienteData, error: clienteError } = await supabase
                    .from('clientes')
                    .select('id_cliente')
                    .eq('uuid', user.id)
                    .single();

                if (clienteError) {
                    console.error('Error al obtener cliente:', clienteError);
                    throw clienteError;
                }

                if (!clienteData) {
                    console.error('No se encontró el cliente para el UUID:', user.id);
                    throw new Error('No se encontró el cliente');
                }

                console.log('ID del cliente:', clienteData.id_cliente);

                // Obtener pedidos usando el ID del cliente
                const { data: pedidosData, error: pedidosError } = await supabase
                    .from('pedidos')
                    .select('*')
                    .eq('id_cliente', clienteData.id_cliente)
                    .order('fecha_pedido', { ascending: false });

                if (pedidosError) {
                    console.error('Error al obtener pedidos:', pedidosError);
                    throw pedidosError;
                }

                console.log('Pedidos obtenidos:', pedidosData);

                // Obtener notificaciones
                const { data: notificacionesData, error: notificacionesError } = await supabase
                    .from('notificaciones')
                    .select('*')
                    .eq('id_usuario', clienteData.id_cliente)
                    .order('fecha', { ascending: false });

                if (notificacionesError) {
                    console.error('Error al obtener notificaciones:', notificacionesError);
                    throw notificacionesError;
                }

                console.log('Notificaciones obtenidas:', notificacionesData);

                setPedidos(pedidosData || []);
                setNotificaciones(notificacionesData || []);
            } catch (error) {
                console.error('Error al cargar los datos:', error);
                setError('Error al cargar los datos. Por favor, intenta de nuevo.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user, navigate, location.pathname]);

    const marcarNotificacionLeida = async (id: number) => {
        try {
            const { error } = await supabase
                .from('notificaciones')
                .update({ leido: true })
                .eq('id', id);

            if (error) throw error;

            setNotificaciones(prev => 
                prev.map(notif => 
                    notif.id === id 
                        ? { ...notif, leido: true }
                        : notif
                )
            );
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const cargarHistorial = async (idPedido: number) => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('historial_estados_pedido')
                .select('*')
                .eq('id_pedido', idPedido)
                .order('fecha_cambio', { ascending: false });

            if (error) throw error;
            setHistorial(data || []);
            setPedidoSeleccionado(idPedido);
            setMostrarHistorial(true);
        } catch (error) {
            console.error('Error al cargar el historial:', error);
            setError('Error al cargar el historial del pedido');
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

    const pedidosFiltrados = filtro === 'todos' 
        ? pedidos 
        : pedidos.filter(pedido => pedido.estado.toLowerCase() === filtro);

    const notificacionesNoLeidas = notificaciones.filter(n => !n.leido).length;

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Menú de navegación superior */}
            <div className="bg-gray-100 py-2 px-4 mb-6 rounded-md w-full">
                <div className="flex items-center text-gray-500 text-xs">
                    <Link to="/" className="hover:text-amber-900 transition-colors uppercase">
                        INICIO
                    </Link>
                    <span className="mx-1">&gt;</span>
                    {viendoFactura ? (
                        <>
                            <Link to="/pedidos" className="hover:text-amber-900 transition-colors uppercase">
                                PEDIDOS
                            </Link>
                            <span className="mx-1">&gt;</span>
                            <span className="text-amber-900 font-medium uppercase">FACTURA</span>
                        </>
                    ) : mostrarHistorial ? (
                        <>
                            <Link to="/pedidos" className="hover:text-amber-900 transition-colors uppercase">
                                PEDIDOS
                            </Link>
                            <span className="mx-1">&gt;</span>
                            <span className="text-amber-900 font-medium uppercase">HISTORIAL</span>
                        </>
                    ) : (
                        <span className="text-amber-900 font-medium uppercase">PEDIDOS</span>
                    )}
                </div>
            </div>

            {mostrarHistorial ? (
                <div>
                    <div className="flex items-center mb-6">
                        <button
                            onClick={() => setMostrarHistorial(false)}
                            className="flex items-center text-amber-600 hover:text-amber-800 mr-4"
                        >
                            <FaArrowLeft className="mr-2" />
                            Volver a Pedidos
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Historial del Pedido #{pedidoSeleccionado}
                        </h1>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando historial...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <p>{error}</p>
                        </div>
                    ) : historial.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No hay historial disponible para este pedido.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Comentario
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {historial.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {formatearFecha(item.fecha_cambio)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`
                                                    px-2 py-1 rounded-full text-xs font-medium
                                                    ${item.estado.toLowerCase() === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                    item.estado.toLowerCase() === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                                                    item.estado.toLowerCase() === 'enviado' ? 'bg-purple-100 text-purple-800' :
                                                    item.estado.toLowerCase() === 'entregado' ? 'bg-green-100 text-green-800' :
                                                    'bg-red-100 text-red-800'}
                                                `}>
                                                    {item.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {item.comentario || 'Sin comentarios'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Mis Pedidos</h1>
                        <button
                            onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                            className="relative p-2 text-gray-600 hover:text-gray-900"
                        >
                            <FaBell className="text-xl" />
                            {notificacionesNoLeidas > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {notificacionesNoLeidas}
                                </span>
                            )}
                        </button>
                    </div>

                    {mostrarNotificaciones && (
                        <div className="mb-6 bg-white rounded-lg shadow-md p-4">
                            <h2 className="text-lg font-semibold mb-4">Notificaciones</h2>
                            <div className="space-y-4">
                                {notificaciones.length === 0 ? (
                                    <p className="text-gray-500">No hay notificaciones</p>
                                ) : (
                                    notificaciones.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-3 rounded-lg ${
                                                notif.leido ? 'bg-gray-50' : 'bg-amber-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-medium text-gray-800">{notif.titulo}</h4>
                                                    <p className="text-sm text-gray-900">{notif.mensaje}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {formatearFecha(notif.fecha)}
                                                    </p>
                                                </div>
                                                {!notif.leido && (
                                                    <button
                                                        onClick={() => marcarNotificacionLeida(notif.id)}
                                                        className="text-xs text-amber-600 hover:text-amber-800"
                                                    >
                                                        Marcar como leída
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFiltro('todos')}
                                className={`px-4 py-2 rounded-lg ${
                                    filtro === 'todos' 
                                        ? 'bg-amber-900 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Todos
                            </button>
                            <button
                                onClick={() => setFiltro('pendiente')}
                                className={`px-4 py-2 rounded-lg ${
                                    filtro === 'pendiente' 
                                        ? 'bg-amber-900 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Pendientes
                            </button>
                            <button
                                onClick={() => setFiltro('en proceso')}
                                className={`px-4 py-2 rounded-lg ${
                                    filtro === 'en proceso' 
                                        ? 'bg-amber-900 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                En Proceso
                            </button>
                            <button
                                onClick={() => setFiltro('enviado')}
                                className={`px-4 py-2 rounded-lg ${
                                    filtro === 'enviado' 
                                        ? 'bg-amber-900 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Enviados
                            </button>
                            <button
                                onClick={() => setFiltro('entregado')}
                                className={`px-4 py-2 rounded-lg ${
                                    filtro === 'entregado' 
                                        ? 'bg-amber-900 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Entregados
                            </button>
                            <button
                                onClick={() => setFiltro('cancelado')}
                                className={`px-4 py-2 rounded-lg ${
                                    filtro === 'cancelado' 
                                        ? 'bg-amber-900 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Cancelados
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                            <p>{error}</p>
                        </div>
                    ) : pedidosFiltrados.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No hay pedidos {filtro !== 'todos' ? `con estado "${filtro}"` : ''} en este momento.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Pedido #
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Estado
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Método de Pago
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {pedidosFiltrados.map((pedido) => (
                                        <tr key={pedido.id_pedido} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{pedido.id_pedido}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {formatearFecha(pedido.fecha_pedido)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    RD${pedido.total.toFixed(2)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {pedido.estado.toLowerCase() === 'pendiente' && <FaFileInvoice className="mr-2 text-yellow-500" />}
                                                    {(pedido.estado.toLowerCase() === 'en proceso' || pedido.estado.toLowerCase() === 'enviado') && <FaShippingFast className="mr-2 text-blue-500" />}
                                                    {pedido.estado.toLowerCase() === 'entregado' && <FaCheckCircle className="mr-2 text-green-500" />}
                                                    {pedido.estado.toLowerCase() === 'cancelado' && <FaTimesCircle className="mr-2 text-red-500" />}
                                                    <span className={`
                                                        px-2 py-1 rounded-full text-xs font-medium
                                                        ${pedido.estado.toLowerCase() === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                                        pedido.estado.toLowerCase() === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                                                        pedido.estado.toLowerCase() === 'enviado' ? 'bg-purple-100 text-purple-800' :
                                                        pedido.estado.toLowerCase() === 'entregado' ? 'bg-green-100 text-green-800' :
                                                        'bg-red-100 text-red-800'}
                                                    `}>
                                                        {pedido.estado}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {pedido.metodo_pago}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-4">
                                                    <button
                                                        onClick={() => navigate(`/factura/${pedido.id_factura}`)}
                                                        className="text-amber-600 hover:text-amber-800 flex items-center"
                                                        title="Ver Factura"
                                                    >
                                                        <FaFileInvoice className="mr-1" />
                                                        Factura
                                                    </button>
                                                    <button
                                                        onClick={() => cargarHistorial(pedido.id_pedido)}
                                                        className="text-amber-600 hover:text-amber-800 flex items-center"
                                                        title="Ver Historial"
                                                    >
                                                        <FaHistory className="mr-1" />
                                                        Historial
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/pedido/${pedido.id_pedido}/historial`)}
                                                        className="text-blue-600 hover:text-blue-800 flex items-center"
                                                        title="Ver Historial Completo"
                                                    >
                                                        <FaExternalLinkAlt className="mr-1" />
                                                        Historial Completo
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* Recomendaciones inteligentes - solo para usuarios no admin */}
            {user && userRole !== 'admin' && (
                <div className="mt-12">
                    <RecomendacionesInteligentes />
                </div>
            )}
        </div>
    );
};

export default Pedidos; 