import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { FaArrowLeft } from 'react-icons/fa';

interface HistorialEstado {
    id: number;
    id_pedido: number;
    estado: string;
    fecha_cambio: string;
    comentario: string;
    usuario_id: string;
}

const HistorialPedido = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [historial, setHistorial] = useState<HistorialEstado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cargarHistorial = async () => {
            try {
                const { data, error } = await supabase
                    .from('historial_estados_pedido')
                    .select('*')
                    .eq('id_pedido', id)
                    .order('fecha_cambio', { ascending: false });

                if (error) throw error;
                setHistorial(data || []);
            } catch (error) {
                console.error('Error al cargar el historial:', error);
                setError('Error al cargar el historial del pedido');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            cargarHistorial();
        }
    }, [id]);

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

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/pedidos')}
                    className="flex items-center text-amber-600 hover:text-amber-800 mr-4"
                >
                    <FaArrowLeft className="mr-2" />
                    Volver a Pedidos
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                    Historial del Pedido #{id}
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
    );
};

export default HistorialPedido; 