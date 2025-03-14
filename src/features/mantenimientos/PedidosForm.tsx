import { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { FaFileInvoice, FaShippingFast, FaCheckCircle, FaTimesCircle, FaHistory, FaUser, FaBell } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

interface Cliente {
    nombre: string;
    apellido: string;
    email: string;
}

interface Pedido {
    id_pedido: number;
    id_cliente: number;
    fecha_pedido: string;
    total: number;
    estado: string;
    metodo_pago: string;
    id_factura: number | null;
    clientes?: Cliente;
}

interface HistorialEstado {
    id: number;
    id_pedido: number;
    estado: string;
    fecha_cambio: string;
    comentario: string;
    usuario_id: string;
}

export default function PedidosForm() {
    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filtro, setFiltro] = useState<string>('todos');
    const [actualizando, setActualizando] = useState(false);
    const [historialModalOpen, setHistorialModalOpen] = useState(false);
    const [historialEstados, setHistorialEstados] = useState<HistorialEstado[]>([]);
    const [pedidoHistorial, setPedidoHistorial] = useState<number | null>(null);
    const [viendoFactura, setViendoFactura] = useState(false);
    const [clienteLogueado, setClienteLogueado] = useState<boolean>(false);
    const [clienteInfo, setClienteInfo] = useState<{nombre?: string, id?: number} | null>(null);
    const [notificaciones, setNotificaciones] = useState<any[]>([]);
    const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
    
    const location = useLocation();
    
    useEffect(() => {
        // Verificar si estamos viendo una factura basado en la URL
        setViendoFactura(location.pathname.includes('/factura'));
        
        // Verificar si hay un cliente logueado
        verificarClienteLogueado();
        
        cargarPedidos();
        
        // Suscribirse a cambios en tiempo real de notificaciones
        if (clienteInfo?.id) {
            const subscription = supabase
                .channel('notificaciones')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notificaciones',
                        filter: `id_usuario=eq.${clienteInfo.id}`
                    },
                    (payload) => {
                        console.log('Nueva notificación recibida:', payload);
                        setNotificaciones(prev => [payload.new, ...prev]);
                    }
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [location.pathname, clienteInfo?.id]);
    
    const verificarClienteLogueado = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // Obtener información del cliente desde la base de datos
                const { data, error } = await supabase
                    .from('clientes')
                    .select('id_cliente, nombre')
                    .eq('id_usuario', user.id)
                    .single();
                
                if (data) {
                    setClienteLogueado(true);
                    setClienteInfo({
                        nombre: data.nombre,
                        id: data.id_cliente
                    });
                } else {
                    setClienteLogueado(false);
                    setClienteInfo(null);
                }
            } else {
                setClienteLogueado(false);
                setClienteInfo(null);
            }
        } catch (error) {
            console.error('Error al verificar cliente:', error);
            setClienteLogueado(false);
            setClienteInfo(null);
        }
    };

    const cargarPedidos = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('pedidos')
                .select(`
                    *,
                    clientes (
                        nombre,
                        apellido,
                        email
                    )
                `)
                .order('fecha_pedido', { ascending: false });

            if (error) throw error;
            setPedidos(data || []);
        } catch (error: any) {
            console.error('Error al obtener los pedidos:', error);
            setError(error.message || 'No se pudieron cargar los pedidos');
        } finally {
            setLoading(false);
        }
    };

    const cargarHistorialEstados = async (idPedido: number) => {
        try {
            const { data, error } = await supabase
                .from('historial_estados_pedido')
                .select('*')
                .eq('id_pedido', idPedido)
                .order('fecha_cambio', { ascending: false });

            if (error) throw error;
            setHistorialEstados(data || []);
            setPedidoHistorial(idPedido);
            setHistorialModalOpen(true);
        } catch (error: any) {
            console.error('Error al obtener el historial:', error);
            alert('Error al cargar el historial de estados');
        }
    };

    const cambiarEstadoPedido = async (idPedido: number, nuevoEstado: string, comentario: string = '') => {
        try {
            setActualizando(true);
            
            // Obtener el usuario actual
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) {
                console.error('Error al obtener usuario:', userError);
                throw new Error('Error de autenticación');
            }
            if (!user) {
                throw new Error('Usuario no autenticado');
            }

            // Verificar si el usuario tiene permisos de administrador
            const { data: userRole, error: roleError } = await supabase
                .from('usuarios')
                .select('rol')
                .eq('id_usuario', user.id)
                .single();

            if (roleError) {
                console.error('Error al verificar rol:', roleError);
                // Si hay error al verificar el rol, permitimos continuar
                console.log('No se pudo verificar el rol del usuario, continuando con la operación');
            } else if (!userRole || userRole.rol !== 'admin') {
                throw new Error('No tienes permisos para realizar esta acción');
            }

            // Actualizar el estado del pedido
            const { error: pedidoError } = await supabase
                .from('pedidos')
                .update({ estado: nuevoEstado })
                .eq('id_pedido', idPedido);

            if (pedidoError) {
                console.error('Error al actualizar pedido:', pedidoError);
                throw new Error('Error al actualizar el estado del pedido');
            }

            // Obtener el id_cliente para la notificación
            const { data: pedidoData, error: pedidoDataError } = await supabase
                .from('pedidos')
                .select('id_cliente')
                .eq('id_pedido', idPedido)
                .single();

            if (pedidoDataError) {
                console.error('Error al obtener datos del pedido:', pedidoDataError);
                throw new Error('Error al obtener datos del pedido');
            }

            // Registrar en el historial usando una función RPC
            const { error: historialError } = await supabase.rpc('insertar_historial_estado', {
                p_id_pedido: idPedido,
                p_estado: nuevoEstado,
                p_comentario: comentario,
                p_usuario_id: user.id
            });

            if (historialError) {
                console.error('Error al insertar historial:', historialError);
                throw new Error('Error al registrar el historial');
            }

            // Crear notificación para el cliente
            const { error: notificacionError } = await supabase
                .from('notificaciones')
                .insert([
                    {
                        id_usuario: pedidoData.id_cliente,
                        tipo: 'cambio_estado_pedido',
                        titulo: `Actualización de estado - Pedido #${idPedido}`,
                        mensaje: `Tu pedido #${idPedido} ha sido actualizado al estado: ${nuevoEstado}`,
                        fecha: new Date().toISOString(),
                        leido: false
                    }
                ]);

            if (notificacionError) {
                console.error('Error al crear la notificación:', notificacionError);
                // Continuamos sin la notificación
                console.log('No se pudo crear la notificación');
            }

            await cargarPedidos();
            alert('Estado actualizado correctamente');
        } catch (error: any) {
            console.error('Error completo:', error);
            alert(`Error al actualizar el estado: ${error.message}`);
        } finally {
            setActualizando(false);
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

    // Filtrar pedidos según el estado seleccionado
    const pedidosFiltrados = filtro === 'todos' 
        ? pedidos 
        : pedidos.filter(pedido => pedido.estado.toLowerCase() === filtro);

    // Función para cargar notificaciones
    const cargarNotificaciones = async () => {
        if (!clienteInfo?.id) return;
        
        try {
            const { data, error } = await supabase
                .from('notificaciones')
                .select('*')
                .eq('id_usuario', clienteInfo.id)
                .order('fecha', { ascending: false });

            if (error) throw error;
            setNotificaciones(data || []);
        } catch (error) {
            console.error('Error al cargar notificaciones:', error);
        }
    };

    // Función para marcar notificación como leída
    const marcarNotificacionLeida = async (idNotificacion: number) => {
        try {
            const { error } = await supabase
                .from('notificaciones')
                .update({ leido: true })
                .eq('id', idNotificacion);

            if (error) throw error;

            setNotificaciones(prev =>
                prev.map(notif =>
                    notif.id === idNotificacion ? { ...notif, leido: true } : notif
                )
            );
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    return (
        <div className="h-full flex flex-col pt-6">
            {/* Menú de navegación superior */}
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-500 text-sm">
                        <Link to="/" className="hover:text-amber-900 transition-colors">
                            INICIO
                        </Link>
                        <span className="mx-2">&gt;</span>
                        {viendoFactura ? (
                            <>
                                <Link to="/pedidos" className="hover:text-amber-900 transition-colors">
                                    PEDIDOS
                                </Link>
                                <span className="mx-2">&gt;</span>
                                <span className="text-amber-900 font-medium">FACTURA</span>
                            </>
                        ) : (
                            <span className="text-amber-900 font-medium">PEDIDOS</span>
                        )}
                    </div>
                    
                    {clienteLogueado && clienteInfo && (
                        <div className="flex items-center text-sm text-amber-900">
                            <FaUser className="mr-2" />
                            <span className="font-medium">{clienteInfo.nombre}</span>
                            <Link to="/mi-cuenta" className="ml-4 text-gray-600 hover:text-amber-900 transition-colors">
                                Mi Cuenta
                            </Link>
                            {/* Botón de notificaciones */}
                            <div className="relative ml-4">
                                <button
                                    onClick={() => setMostrarNotificaciones(!mostrarNotificaciones)}
                                    className="text-gray-600 hover:text-amber-900 transition-colors relative"
                                >
                                    <FaBell size={18} />
                                    {notificaciones.some(n => !n.leido) && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                            {notificaciones.filter(n => !n.leido).length}
                                        </span>
                                    )}
                                </button>
                                
                                {/* Panel de notificaciones */}
                                {mostrarNotificaciones && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200">
                                            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notificaciones.length === 0 ? (
                                                <div className="p-4 text-gray-500 text-center">
                                                    No hay notificaciones
                                                </div>
                                            ) : (
                                                notificaciones.map((notif) => (
                                                    <div
                                                        key={notif.id}
                                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                                            !notif.leido ? 'bg-amber-50' : ''
                                                        }`}
                                                        onClick={() => marcarNotificacionLeida(notif.id)}
                                                    >
                                                        <p className="text-sm text-gray-900">{notif.mensaje}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(notif.fecha).toLocaleString()}
                                                        </p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {notificaciones.length > 0 && (
                                            <div className="p-4 border-t border-gray-200">
                                                <button
                                                    onClick={() => setMostrarNotificaciones(false)}
                                                    className="text-sm text-amber-900 hover:text-amber-700"
                                                >
                                                    Cerrar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    setClienteLogueado(false);
                                    setClienteInfo(null);
                                }}
                                className="ml-4 text-gray-600 hover:text-amber-900 transition-colors"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">
                    {clienteLogueado ? 'Mis Pedidos' : 'Gestión de Pedidos'}
                </h1>

                {/* Filtros */}
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

                {/* Tabla de Pedidos */}
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando pedidos...</p>
                    </div>
                ) : error ? (
                    <div className="p-8 text-center text-red-500">
                        <p>{error}</p>
                    </div>
                ) : pedidosFiltrados.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-600">No hay pedidos {filtro !== 'todos' ? `con estado "${filtro}"` : ''} en este momento.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pedido #
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
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
                            <tbody className="divide-y divide-gray-200">
                                {pedidosFiltrados.map((pedido) => (
                                    <tr key={pedido.id_pedido} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">
                                                #{pedido.id_pedido}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">
                                                {pedido.clientes ? `${pedido.clientes.nombre} ${pedido.clientes.apellido}` : 'Cliente no disponible'}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {pedido.clientes?.email || ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-500">{formatearFecha(pedido.fecha_pedido)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">RD${pedido.total.toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex justify-center">
                                                <div className={`
                                                    px-4 py-2 rounded-lg font-bold text-base shadow-md inline-flex items-center
                                                    ${pedido.estado.toLowerCase() === 'pendiente' ? 'bg-yellow-200 text-yellow-800 border-2 border-yellow-400' : ''}
                                                    ${pedido.estado.toLowerCase() === 'en proceso' ? 'bg-blue-200 text-blue-800 border-2 border-blue-400' : ''}
                                                    ${pedido.estado.toLowerCase() === 'enviado' ? 'bg-green-200 text-green-800 border-2 border-green-400' : ''}
                                                    ${pedido.estado.toLowerCase() === 'entregado' ? 'bg-green-200 text-green-900 border-2 border-green-500' : ''}
                                                    ${pedido.estado.toLowerCase() === 'cancelado' ? 'bg-red-200 text-red-800 border-2 border-red-400' : ''}
                                                `}>
                                                    {pedido.estado.toLowerCase() === 'pendiente' && <FaFileInvoice className="mr-2" size={18} />}
                                                    {(pedido.estado.toLowerCase() === 'en proceso' || pedido.estado.toLowerCase() === 'enviado') && <FaShippingFast className="mr-2" size={18} />}
                                                    {pedido.estado.toLowerCase() === 'entregado' && <FaCheckCircle className="mr-2" size={18} />}
                                                    {pedido.estado.toLowerCase() === 'cancelado' && <FaTimesCircle className="mr-2" size={18} />}
                                                    {pedido.estado.toUpperCase()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{pedido.metodo_pago}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => cargarHistorialEstados(pedido.id_pedido)}
                                                    className="text-amber-600 hover:text-amber-900"
                                                    title="Ver historial"
                                                >
                                                    <FaHistory size={18} />
                                                </button>
                                                <select
                                                    onChange={(e) => {
                                                        const nuevoEstado = e.target.value;
                                                        if (nuevoEstado && nuevoEstado !== pedido.estado) {
                                                            const comentario = prompt('Ingrese un comentario para el cambio de estado:');
                                                            if (comentario !== null) {
                                                                cambiarEstadoPedido(pedido.id_pedido, nuevoEstado, comentario);
                                                            }
                                                        }
                                                    }}
                                                    className="text-sm border rounded px-2 py-1"
                                                    disabled={actualizando}
                                                >
                                                    <option value="">Cambiar estado</option>
                                                    <option value="pendiente" disabled={pedido.estado === 'pendiente'}>Pendiente</option>
                                                    <option value="en proceso" disabled={pedido.estado === 'en proceso'}>En Proceso</option>
                                                    <option value="enviado" disabled={pedido.estado === 'enviado'}>Enviado</option>
                                                    <option value="entregado" disabled={pedido.estado === 'entregado'}>Entregado</option>
                                                    <option value="cancelado" disabled={pedido.estado === 'cancelado'}>Cancelado</option>
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Historial */}
            {historialModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/20 backdrop-blur-xl">
                    <div className="bg-white/80 backdrop-blur-xl rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-amber-200 shadow-lg">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-amber-900">Historial de Estados - Pedido #{pedidoHistorial}</h2>
                            <button
                                onClick={() => setHistorialModalOpen(false)}
                                className="text-amber-900 hover:text-amber-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="space-y-6">
                            {historialEstados.map((historial) => (
                                <div key={historial.id} className="bg-white/70 backdrop-blur-xl border-l-4 border-amber-500 pl-6 p-4 rounded-r-lg shadow-sm">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-amber-900 text-lg">{historial.estado}</p>
                                            <p className="text-base text-gray-700 mt-1">{historial.comentario}</p>
                                        </div>
                                        <p className="text-base text-gray-600">
                                            {new Date(historial.fecha_cambio).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 