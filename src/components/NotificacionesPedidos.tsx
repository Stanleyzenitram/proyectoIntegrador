import React, { useState, useEffect } from 'react';
import { FaBell, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { obtenerNotificaciones, marcarNotificacionComoLeida, marcarTodasComoLeidas } from '../api/notificaciones';

interface Notificacion {
    id: number;
    id_usuario: number;
    tipo: string;
    titulo: string;
    mensaje: string;
    leido: boolean;
    fecha: string;
}

interface NotificacionesPedidosProps {
    className?: string;
}

const NotificacionesPedidos: React.FC<NotificacionesPedidosProps> = ({ className = '' }) => {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [notificacionesPedidos, setNotificacionesPedidos] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const [noLeidas, setNoLeidas] = useState(0);
    const [tablaExiste, setTablaExiste] = useState(true);
    const [idCliente, setIdCliente] = useState<number | null>(null);

    useEffect(() => {
        const obtenerIdCliente = async () => {
            if (user) {
                try {
                    const { data, error } = await supabase
                        .from('clientes')
                        .select('id_cliente')
                        .eq('uuid', user.id)
                        .single();
                    
                    if (error) throw error;
                    if (data) {
                        setIdCliente(data.id_cliente);
                    }
                } catch (error) {
                    console.error('Error al obtener ID del cliente:', error);
                    setError('No se pudo obtener la información del cliente');
                }
            }
        };

        obtenerIdCliente();
    }, [user]);

    useEffect(() => {
        const verificarTabla = async () => {
            try {
                const { error } = await supabase
                    .from('notificaciones')
                    .select('id')
                    .limit(1);
                
                if (error && error.message.includes('does not exist')) {
                    console.error('La tabla notificaciones no existe:', error);
                    setTablaExiste(false);
                    setLoading(false);
                    setError('La tabla de notificaciones no está configurada. Por favor, contacta al administrador.');
                    return false;
                }
                
                return true;
            } catch (error) {
                console.error('Error al verificar la tabla:', error);
                setTablaExiste(false);
                setLoading(false);
                setError('Error al verificar la tabla de notificaciones.');
                return false;
            }
        };

        const inicializarNotificaciones = async () => {
            const tablaOK = await verificarTabla();
            if (!tablaOK) return;

            if (idCliente) {
                cargarNotificaciones();
                
                const subscription = supabase
                    .channel('notificaciones_pedidos_changes')
                    .on(
                        'postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'notificaciones',
                            filter: `id_usuario=eq.${idCliente}`
                        },
                        (payload: any) => {
                            const nuevaNotificacion = payload.new as Notificacion;
                            
                            if (nuevaNotificacion.tipo === 'cambio_estado_pedido') {
                                setNotificaciones(prev => [nuevaNotificacion, ...prev]);
                                setNotificacionesPedidos(prev => [nuevaNotificacion, ...prev]);
                                setNoLeidas(prev => prev + 1);
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    subscription.unsubscribe();
                };
            }
        };

        if (idCliente) {
            inicializarNotificaciones();
        }
    }, [idCliente]);

    const cargarNotificaciones = async () => {
        try {
            setLoading(true);
            
            if (!idCliente) {
                setError('No se pudo obtener la información del cliente');
                return;
            }
            
            const resultado = await obtenerNotificaciones(idCliente);
            
            if (resultado.error) {
                throw new Error(resultado.error);
            }
            
            const todasNotificaciones = resultado.data || [];
            
            const notificacionesDePedidos = todasNotificaciones.filter(
                n => n.tipo === 'cambio_estado_pedido'
            );
            
            setNotificaciones(todasNotificaciones);
            setNotificacionesPedidos(notificacionesDePedidos);
            setNoLeidas(notificacionesDePedidos.filter(n => !n.leido).length);
        } catch (error: any) {
            console.error('Error al cargar notificaciones:', error);
            setError(error.message || 'No se pudieron cargar las notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const marcarComoLeida = async (id: number) => {
        try {
            const resultado = await marcarNotificacionComoLeida(id);
            
            if (!resultado.success) {
                throw new Error(resultado.error || 'Error al marcar como leída');
            }
            
            setNotificaciones(prev => 
                prev.map(n => n.id === id ? { ...n, leido: true } : n)
            );
            setNotificacionesPedidos(prev => 
                prev.map(n => n.id === id ? { ...n, leido: true } : n)
            );
            setNoLeidas(prev => Math.max(0, prev - 1));
        } catch (error: any) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const marcarTodasLasNotificacionesComoLeidas = async () => {
        try {
            if (!idCliente) return;
            
            const resultado = await marcarTodasComoLeidas(idCliente);
            
            if (!resultado.success) {
                throw new Error(resultado.error || 'Error al marcar todas como leídas');
            }
            
            setNotificaciones(prev => 
                prev.map(n => ({ ...n, leido: true }))
            );
            setNotificacionesPedidos(prev => 
                prev.map(n => ({ ...n, leido: true }))
            );
            setNoLeidas(0);
        } catch (error: any) {
            console.error('Error al marcar todas las notificaciones como leídas:', error);
        }
    };

    const formatearFecha = (fechaStr: string) => {
        try {
            const fecha = new Date(fechaStr);
            if (isNaN(fecha.getTime())) {
                return 'Fecha no válida';
            }
            
            const ahora = new Date();
            const diferencia = ahora.getTime() - fecha.getTime();
            const minutos = Math.floor(diferencia / (1000 * 60));
            const horas = Math.floor(diferencia / (1000 * 60 * 60));
            const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
            
            if (minutos < 60) {
                return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
            } else if (horas < 24) {
                return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
            } else if (dias < 7) {
                return `Hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
            } else {
                return fecha.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    const extraerNumeroPedido = (titulo: string): string | null => {
        const match = titulo.match(/#(\d+)/);
        return match ? match[1] : null;
    };

    if (!tablaExiste) {
        return (
            <div className={`${className}`}>
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-amber-900 flex items-center">
                            <FaBell className="mr-2" /> Notificaciones de Pedidos
                        </h2>
                    </div>
                    <div className="p-4 text-center text-amber-800 bg-amber-50 rounded-lg">
                        <p>La funcionalidad de notificaciones está en mantenimiento. Estará disponible próximamente.</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!idCliente) {
        return (
            <div className={`${className}`}>
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-amber-900 flex items-center">
                            <FaBell className="mr-2" /> Notificaciones de Pedidos
                        </h2>
                    </div>
                    <div className="p-4 text-center text-amber-800 bg-amber-50 rounded-lg">
                        <p>Cargando información del cliente...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`${className}`}>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-amber-900 flex items-center">
                        <FaBell className="mr-2" /> Notificaciones de Pedidos
                    </h2>
                    {noLeidas > 0 && (
                        <button 
                            onClick={marcarTodasLasNotificacionesComoLeidas}
                            className="text-sm text-amber-900 hover:text-amber-700 transition"
                        >
                            Marcar todas como leídas
                        </button>
                    )}
                </div>
                
                {loading ? (
                    <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-900 mx-auto"></div>
                        <p className="mt-2">Cargando notificaciones...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500">
                        {error}
                    </div>
                ) : notificacionesPedidos.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        No tienes notificaciones de pedidos
                    </div>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notificacionesPedidos.map((notificacion) => (
                            <div 
                                key={notificacion.id} 
                                className={`p-3 border rounded-lg ${!notificacion.leido ? 'bg-amber-50 border-amber-200' : 'border-gray-200'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-medium text-gray-800">{notificacion.titulo}</h4>
                                    {!notificacion.leido && (
                                        <button 
                                            onClick={() => marcarComoLeida(notificacion.id)}
                                            className="text-amber-900 hover:text-amber-700"
                                            title="Marcar como leída"
                                        >
                                            <FaCheckCircle size={16} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{notificacion.mensaje}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <p className="text-xs text-gray-500">{formatearFecha(notificacion.fecha)}</p>
                                    {extraerNumeroPedido(notificacion.titulo) && (
                                        <a 
                                            href={`/pedido/${extraerNumeroPedido(notificacion.titulo)}`}
                                            className="text-xs text-amber-900 hover:text-amber-700"
                                        >
                                            Ver pedido
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificacionesPedidos; 