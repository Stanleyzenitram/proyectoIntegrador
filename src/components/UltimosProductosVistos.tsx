import React, { useState, useEffect } from 'react';
import { Eye, Loader2, Clock } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import type { Producto } from '../types/index';

interface UltimosProductosVistosProps {
    onProductClick: (product: Producto) => void;
    maxProductos?: number;
}

const UltimosProductosVistos: React.FC<UltimosProductosVistosProps> = ({ 
    onProductClick, 
    maxProductos = 6 
}) => {
    const { user } = useAuth();
    const [productosVistos, setProductosVistos] = useState<Producto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            fetchUltimosProductosVistos();
        } else {
            setProductosVistos([]);
            setLoading(false);
        }
    }, [user]);

    const fetchUltimosProductosVistos = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!user) {
                setProductosVistos([]);
                return;
            }

            // Obtener los últimos productos vistos del usuario
            const { data: historialVistos, error: historialError } = await supabase
                .from('historial_productos_vistos')
                .select('producto_id, fecha_vista')
                .eq('usuario_id', user.id)
                .order('fecha_vista', { ascending: false })
                .limit(maxProductos * 2); // Obtener más para poder filtrar

            if (historialError) {
                console.error('Error al obtener historial de productos vistos:', historialError);
                setError('Error al cargar productos vistos');
                return;
            }

            if (!historialVistos || historialVistos.length === 0) {
                setProductosVistos([]);
                return;
            }

            // Obtener los IDs únicos de productos (eliminar duplicados)
            const productosIds = [...new Set(historialVistos.map(h => h.producto_id))].slice(0, maxProductos);

            // Obtener los detalles de los productos
            const { data: productos, error: productosError } = await supabase
                .from('productos')
                .select(`
                    *,
                    categorias(id_categoria, nombre_categoria),
                    estilos(id_estilo, nombre_estilo),
                    materiales(id_materiales, nombre_materiales)
                `)
                .in('id_producto', productosIds)
                .eq('disponibilidad', true)
                .order('id_producto', { ascending: false });

            if (productosError) {
                console.error('Error al obtener productos:', productosError);
                setError('Error al cargar productos');
                return;
            }

            // Ordenar productos según el orden del historial
            const productosOrdenados = productosIds
                .map(id => productos?.find(p => p.id_producto === id))
                .filter(Boolean) as Producto[];

            setProductosVistos(productosOrdenados);

        } catch (err) {
            console.error('Error al obtener últimos productos vistos:', err);
            setError('Error al cargar productos vistos');
        } finally {
            setLoading(false);
        }
    };

    const calcularPrecioConDescuento = (precio: number, descuento?: number) => {
        if (!descuento) return precio;
        return precio * (1 - descuento / 100);
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Sin stock', color: 'text-red-600' };
        if (stock <= 3) return { text: 'Stock bajo', color: 'text-yellow-600' };
        return { text: 'Disponible', color: 'text-green-600' };
    };

    const formatearFecha = (fecha: string) => {
        const fechaObj = new Date(fecha);
        const ahora = new Date();
        const diferencia = ahora.getTime() - fechaObj.getTime();
        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor(diferencia / (1000 * 60 * 60));
        const minutos = Math.floor(diferencia / (1000 * 60));

        if (dias > 0) return `Hace ${dias} día${dias > 1 ? 's' : ''}`;
        if (horas > 0) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
        if (minutos > 0) return `Hace ${minutos} minuto${minutos > 1 ? 's' : ''}`;
        return 'Hace un momento';
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200 mb-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-purple-600 mr-2" />
                    <span className="text-gray-600">Cargando productos vistos recientemente...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-lg border border-red-200 mb-6">
                <div className="flex items-center justify-center py-8">
                    <span className="text-red-600">{error}</span>
                </div>
            </div>
        );
    }

    if (productosVistos.length === 0) {
        return (
            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-lg border border-gray-200 mb-6">
                <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                        <Eye className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay productos vistos recientemente</h3>
                        <p className="text-sm text-gray-700">
                            Los productos que veas aparecerán aquí para un acceso rápido.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border border-purple-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Eye className="h-6 w-6 text-purple-600 mr-2" />
                    <h2 className="text-xl font-bold text-purple-900">Vistos recientemente</h2>
                    <span className="ml-2 text-sm text-gray-600 bg-purple-100 px-2 py-1 rounded-full">
                        {productosVistos.length} productos
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {productosVistos.map((producto, index) => {
                    const precioFinal = calcularPrecioConDescuento(producto.precio, producto.descuento);
                    const stockStatus = getStockStatus(producto.stock_actual);

                    return (
                        <div 
                            key={producto.id_producto} 
                            className="bg-white p-3 rounded-lg shadow-sm flex flex-col h-full justify-between hover:shadow-md transition-shadow relative"
                        >
                            {/* Badge de "Reciente" */}
                            <div className="absolute top-1 left-1 bg-purple-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                Reciente
                            </div>

                            <div>
                                {producto.imagen && (
                                    <div 
                                        onClick={() => onProductClick(producto)}
                                        className="cursor-pointer transition-opacity hover:opacity-80 mb-2"
                                    >
                                        <img
                                            src={producto.imagen}
                                            alt={producto.nombre_producto}
                                            className="w-full h-24 object-cover rounded"
                                        />
                                    </div>
                                )}
                                
                                <h3 
                                    onClick={() => onProductClick(producto)}
                                    className="text-xs font-medium mb-2 cursor-pointer hover:text-purple-500 line-clamp-2"
                                >
                                    {producto.nombre_producto}
                                </h3>
                            </div>
                            
                            <div>
                                <div className="mb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex flex-col">
                                            {producto.descuento ? (
                                                <>
                                                    <span className="text-gray-500 line-through text-xs">
                                                        RD${producto.precio.toFixed(2)}
                                                    </span>
                                                    <span className="font-bold text-red-600 text-sm">
                                                        RD${precioFinal.toFixed(2)}
                                                    </span>
                                                    <span className="text-xs text-green-600 font-medium">
                                                        {producto.descuento}% OFF
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="font-bold text-sm">
                                                    RD${producto.precio.toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-xs ${stockStatus.color}`}>
                                            {stockStatus.text}
                                        </span>
                                    </div>
                                </div>

                                {/* Información adicional */}
                                <div className="mb-2">
                                    {producto.categorias?.nombre_categoria && (
                                        <div className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded mb-1">
                                            {producto.categorias.nombre_categoria}
                                        </div>
                                    )}
                                    {producto.materiales?.nombre_materiales && (
                                        <div className="text-xs text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                            {producto.materiales.nombre_materiales}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => onProductClick(producto)}
                                    disabled={producto.stock_actual === 0}
                                    className={`w-full py-1.5 px-2 rounded text-xs ${
                                        producto.stock_actual > 0
                                            ? 'bg-purple-500 hover:bg-purple-600 text-white'
                                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {producto.stock_actual > 0 ? 'Ver Detalles' : 'Sin Stock'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    Productos que has visto recientemente para un acceso rápido
                </p>
            </div>
        </div>
    );
};

export default UltimosProductosVistos; 