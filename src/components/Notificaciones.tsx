import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { FaBell, FaCheckCircle } from 'react-icons/fa';

interface Notificacion {
    id: number;
    id_usuario: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    leido: boolean;
    fecha: string;
}

const Notificaciones: React.FC = () => {
    const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const [noLeidas, setNoLeidas] = useState(0);

    useEffect(() => {
        if (user) {
            cargarNotificaciones();
            
            // Suscribirse a cambios en la tabla de notificaciones
            const subscription = supabase
                .channel('notificaciones_changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notificaciones',
                        filter: `id_usuario=eq.${user.email}`
                    },
                    (payload) => {
                        // Añadir la nueva notificación a la lista
                        const nuevaNotificacion = payload.new as Notificacion;
                        setNotificaciones(prev => [nuevaNotificacion, ...prev]);
                        setNoLeidas(prev => prev + 1);
                    }
                )
                .subscribe();

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [user]);

    const cargarNotificaciones = async () => {
        try {
            setLoading(true);
            
            if (!user) {
                setError('Usuario no autenticado');
                return;
            }
            
            const { data, error } = await supabase
                .from('notificaciones')
                .select('*')
                .eq('id_usuario', user.email)
                .order('fecha', { ascending: false })
                .limit(20);
            
            if (error) throw error;
            
            setNotificaciones(data || []);
            setNoLeidas((data || []).filter(n => !n.leido).length);
        } catch (error: any) {
            console.error('Error al cargar notificaciones:', error);
            setError(error.message || 'No se pudieron cargar las notificaciones');
        } finally {
            setLoading(false);
        }
    };

    const marcarComoLeida = async (id: number) => {
        try {
            const { error } = await supabase
                .from('notificaciones')
                .update({ leido: true })
                .eq('id', id);
            
            if (error) throw error;
            
            // Actualizar el estado local
            setNotificaciones(prev => 
                prev.map(n => n.id === id ? { ...n, leido: true } : n)
            );
            setNoLeidas(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Error al marcar notificación como leída:', error);
        }
    };

    const marcarTodasComoLeidas = async () => {
        try {
            const { error } = await supabase
                .from('notificaciones')
                .update({ leido: true })
                .eq('id_usuario', user?.email)
                .eq('leido', false);
            
            if (error) throw error;
            
            // Actualizar el estado local
            setNotificaciones(prev => 
                prev.map(n => ({ ...n, leido: true }))
            );
            setNoLeidas(0);
        } catch (error) {
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

    return (
        <div className="relative">
            {/* Botón de notificaciones */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-700 hover:text-amber-900 transition"
            >
                <FaBell size={20} />
                {noLeidas > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                        {noLeidas > 9 ? '9+' : noLeidas}
                    </span>
                )}
            </button>
            
            {/* Panel de notificaciones */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="p-3 bg-amber-900 text-white flex justify-between items-center">
                        <h3 className="font-semibold">Notificaciones</h3>
                        {noLeidas > 0 && (
                            <button 
                                onClick={marcarTodasComoLeidas}
                                className="text-xs text-white hover:text-amber-200 transition"
                            >
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">
                                Cargando notificaciones...
                            </div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">
                                {error}
                            </div>
                        ) : notificaciones.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                No tienes notificaciones
                            </div>
                        ) : (
                            <div>
                                {notificaciones.map((notificacion) => (
                                    <div 
                                        key={notificacion.id} 
                                        className={`p-3 border-b border-gray-200 hover:bg-gray-50 ${!notificacion.leido ? 'bg-amber-50' : ''}`}
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
                                        <p className="text-xs text-gray-500 mt-1">{formatearFecha(notificacion.fecha)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    
                    <div className="p-2 bg-gray-100 text-center">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-sm text-gray-600 hover:text-amber-900 transition"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notificaciones; 