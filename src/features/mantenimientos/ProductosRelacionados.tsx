import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { 
    ejecutarAnalisisProductosRelacionados, 
    obtenerProductosRelacionadosCompra 
} from '../../services/productosRelacionadosService';
import { FaCogs, FaChartLine, FaDatabase, FaPlay, FaEye, FaTrash, FaSync } from 'react-icons/fa';

interface ProductoRelacionado {
    id: number;
    idProdBase: number;
    idProdAsoc: number;
    frecuencia: number;
    created_at: string;
    producto_base?: {
        nombre_producto: string;
        imagen?: string;
    };
    producto_relacionado?: {
        nombre_producto: string;
        imagen?: string;
    };
}

export default function ProductosRelacionados() {
    const [loading, setLoading] = useState(false);
    const [analizando, setAnalizando] = useState(false);
    const [productosRelacionados, setProductosRelacionados] = useState<ProductoRelacionado[]>([]);
    const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error' | 'info'; texto: string } | null>(null);
    const [estadisticas, setEstadisticas] = useState<{
        totalRelaciones: number;
        promedioScore: number;
        maxFrecuencia: number;
        ultimaActualizacion: string | null;
    } | null>(null);

    useEffect(() => {
        cargarProductosRelacionados();
        cargarEstadisticas();
    }, []);

    const cargarProductosRelacionados = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('productosRelacionados')
                .select(`
                    *,
                    producto_base:productos!productosRelacionados_idProdBase_fkey(
                        nombre_producto,
                        imagen
                    ),
                    producto_relacionado:productos!productosRelacionados_idProdAsoc_fkey(
                        nombre_producto,
                        imagen
                    )
                `)
                .order('frecuencia', { ascending: false })
                .limit(100);

            if (error) throw error;
            setProductosRelacionados(data || []);
        } catch (error) {
            console.error('Error cargando productos relacionados:', error);
            setMensaje({
                tipo: 'error',
                texto: 'Error al cargar productos relacionados'
            });
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const { data, error } = await supabase
                .from('productosRelacionados')
                .select('frecuencia, created_at');

            if (error) throw error;

            if (data && data.length > 0) {
                const totalRelaciones = data.length;
                const promedioFrecuencia = data.reduce((sum, item) => sum + Number(item.frecuencia), 0) / totalRelaciones;
                const maxFrecuencia = Math.max(...data.map(item => item.frecuencia));
                const ultimaActualizacion = new Date(Math.max(...data.map(item => new Date(item.created_at).getTime()))).toLocaleString();

                setEstadisticas({
                    totalRelaciones,
                    promedioScore: Number(promedioFrecuencia.toFixed(2)),
                    maxFrecuencia,
                    ultimaActualizacion
                });
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    const ejecutarAnalisis = async () => {
        try {
            setAnalizando(true);
            setMensaje(null);

            const resultado = await ejecutarAnalisisProductosRelacionados();
            
            if (resultado.success) {
                setMensaje({
                    tipo: 'success',
                    texto: resultado.message
                });
                
                // Recargar datos
                await cargarProductosRelacionados();
                await cargarEstadisticas();
            } else {
                setMensaje({
                    tipo: 'error',
                    texto: resultado.message
                });
            }
        } catch (error) {
            console.error('Error ejecutando análisis:', error);
            setMensaje({
                tipo: 'error',
                texto: 'Error inesperado durante el análisis'
            });
        } finally {
            setAnalizando(false);
        }
    };

    const eliminarRelacion = async (id: number) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta relación?')) return;

        try {
            const { error } = await supabase
                .from('productos_relacionados_compra')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMensaje({
                tipo: 'success',
                texto: 'Relación eliminada exitosamente'
            });

            await cargarProductosRelacionados();
            await cargarEstadisticas();
        } catch (error) {
            console.error('Error eliminando relación:', error);
            setMensaje({
                tipo: 'error',
                texto: 'Error al eliminar la relación'
            });
        }
    };

    const desactivarRelacion = async (id: number, activo: boolean) => {
        try {
            const { error } = await supabase
                .from('productosRelacionados')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setMensaje({
                tipo: 'success',
                texto: `Relación ${!activo ? 'activada' : 'desactivada'} exitosamente`
            });

            await cargarProductosRelacionados();
        } catch (error) {
            console.error('Error actualizando relación:', error);
            setMensaje({
                tipo: 'error',
                texto: 'Error al actualizar la relación'
            });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <FaCogs className="text-amber-600" />
                            Productos Relacionados
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Análisis de productos que se compran juntos frecuentemente
                        </p>
                    </div>
                    <button
                        onClick={ejecutarAnalisis}
                        disabled={analizando}
                        className="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                        {analizando ? (
                            <>
                                <FaCogs className="animate-spin" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <FaPlay />
                                Ejecutar Análisis
                            </>
                        )}
                    </button>
                </div>

                {/* Mensajes */}
                {mensaje && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        mensaje.tipo === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                        mensaje.tipo === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                        {mensaje.texto}
                    </div>
                )}

                {/* Estadísticas */}
                {estadisticas && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2">
                                <FaDatabase className="text-blue-600" />
                                <div>
                                    <p className="text-sm text-blue-600 font-medium">Total Relaciones</p>
                                    <p className="text-2xl font-bold text-blue-800">{estadisticas.totalRelaciones}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2">
                                <FaChartLine className="text-green-600" />
                                <div>
                                    <p className="text-sm text-green-600 font-medium">Score Promedio</p>
                                    <p className="text-2xl font-bold text-green-800">{estadisticas.promedioScore}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2">
                                <FaChartLine className="text-purple-600" />
                                <div>
                                    <p className="text-sm text-purple-600 font-medium">Max Frecuencia</p>
                                    <p className="text-2xl font-bold text-purple-800">{estadisticas.maxFrecuencia}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-2">
                                <FaSync className="text-orange-600" />
                                <div>
                                    <p className="text-sm text-orange-600 font-medium">Última Actualización</p>
                                    <p className="text-sm font-bold text-orange-800">
                                        {estadisticas.ultimaActualizacion ? 
                                            new Date(estadisticas.ultimaActualizacion).toLocaleDateString() : 
                                            'N/A'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de productos relacionados */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Relaciones de Productos
                        </h3>
                        <p className="text-sm text-gray-600">
                            Productos que se compran juntos frecuentemente
                        </p>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Cargando productos relacionados...</p>
                        </div>
                    ) : productosRelacionados.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FaDatabase className="text-6xl mx-auto mb-4 text-gray-300" />
                            <p className="text-lg">No hay productos relacionados</p>
                            <p className="text-sm">Ejecuta el análisis para generar las primeras relaciones</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto Base
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Producto Relacionado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Frecuencia
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Fecha Creación
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {productosRelacionados.map((relacion) => (
                                        <tr key={relacion.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {relacion.producto_base?.imagen && (
                                                        <img 
                                                            src={relacion.producto_base.imagen} 
                                                            alt={relacion.producto_base.nombre_producto}
                                                            className="h-10 w-10 rounded-lg object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {relacion.producto_base?.nombre_producto || `ID: ${relacion.idProdBase}`}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {relacion.idProdBase}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    {relacion.producto_relacionado?.imagen && (
                                                        <img 
                                                            src={relacion.producto_relacionado.imagen} 
                                                            alt={relacion.producto_relacionado.nombre_producto}
                                                            className="h-10 w-10 rounded-lg object-cover mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {relacion.producto_relacionado?.nombre_producto || `ID: ${relacion.idProdAsoc}`}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {relacion.idProdAsoc}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {relacion.frecuencia}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {relacion.created_at ? 
                                                    new Date(relacion.created_at).toLocaleDateString() : 
                                                    'N/A'
                                                }
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => eliminarRelacion(relacion.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">¿Cómo funciona este análisis?</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Analiza todas las facturas donde se compraron 2 o más productos diferentes</li>
                        <li>• Calcula la frecuencia de compras conjuntas entre productos</li>
                        <li>• Asigna un score basado en similitud de características</li>
                        <li>• Identifica productos complementarios como cemento y cerámicas</li>
                        <li>• Se ejecuta manualmente y puede programarse para actualizaciones periódicas</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
