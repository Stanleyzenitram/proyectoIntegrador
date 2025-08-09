import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

interface ProductoDisponibilidad {
    id_producto: number;
    nombre_producto: string;
    imagen: string;
    cantidad_solicitada: number;
    stock_actual: number;
    disponible: boolean;
    stock_insuficiente: boolean;
    agotado: boolean;
    metros_por_caja: number;
    cajas_disponibles: number;
    cajas_necesarias: number;
    metros_disponibles: number;
    metros_necesarios: number;
}

interface VerificadorDisponibilidadProps {
    productos: any[];
    onDisponibilidadActualizada: (productos: ProductoDisponibilidad[]) => void;
}

export default function VerificadorDisponibilidad({ productos, onDisponibilidadActualizada }: VerificadorDisponibilidadProps) {
    const [productosDisponibilidad, setProductosDisponibilidad] = useState<ProductoDisponibilidad[]>([]);
    const [loading, setLoading] = useState(true);
    const [resumen, setResumen] = useState({
        total_productos: 0,
        disponibles: 0,
        stock_insuficiente: 0,
        agotados: 0,
        metros_disponibles: 0,
        metros_necesarios: 0
    });

    useEffect(() => {
        if (productos.length > 0) {
            verificarDisponibilidad();
        }
    }, [productos]);

    const verificarDisponibilidad = async () => {
        try {
            setLoading(true);

            // Obtener stock actual de los productos
            const productosIds = productos.map(p => p.id_producto);
            const { data: productosStock } = await supabase
                .from('productos')
                .select('id_producto, stock_actual, metros_por_caja')
                .in('id_producto', productosIds);

            if (!productosStock) return;

            // Crear mapa de stock actual
            const stockActual = new Map(
                productosStock.map(p => [p.id_producto, p])
            );

            // Verificar disponibilidad de cada producto
            const verificaciones = productos.map(producto => {
                const productoStock = stockActual.get(producto.id_producto);
                const stockActualProducto = productoStock?.stock_actual || 0;
                const metrosPorCaja = productoStock?.metros_por_caja || producto.metros_por_caja || 1;
                
                const cantidadSolicitada = producto.cantidad;
                const metrosNecesarios = cantidadSolicitada * (producto.metros_por_caja || metrosPorCaja);
                const metrosDisponibles = stockActualProducto * metrosPorCaja;
                
                const cajasNecesarias = Math.ceil(metrosNecesarios / metrosPorCaja);
                const cajasDisponibles = Math.floor(metrosDisponibles / metrosPorCaja);
                
                const disponible = stockActualProducto >= cantidadSolicitada;
                const stockInsuficiente = stockActualProducto > 0 && stockActualProducto < cantidadSolicitada;
                const agotado = stockActualProducto === 0;

                return {
                    id_producto: producto.id_producto,
                    nombre_producto: producto.nombre_producto,
                    imagen: producto.imagen,
                    cantidad_solicitada: cantidadSolicitada,
                    stock_actual: stockActualProducto,
                    disponible: disponible,
                    stock_insuficiente: stockInsuficiente,
                    agotado: agotado,
                    metros_por_caja: metrosPorCaja,
                    cajas_disponibles: cajasDisponibles,
                    cajas_necesarias: cajasNecesarias,
                    metros_disponibles: metrosDisponibles,
                    metros_necesarios: metrosNecesarios
                };
            });

            setProductosDisponibilidad(verificaciones);

            // Calcular resumen
            const totalProductos = verificaciones.length;
            const disponibles = verificaciones.filter(p => p.disponible).length;
            const stockInsuficiente = verificaciones.filter(p => p.stock_insuficiente).length;
            const agotados = verificaciones.filter(p => p.agotado).length;
            const metrosDisponibles = verificaciones.reduce((sum, p) => sum + p.metros_disponibles, 0);
            const metrosNecesarios = verificaciones.reduce((sum, p) => sum + p.metros_necesarios, 0);

            setResumen({
                total_productos: totalProductos,
                disponibles: disponibles,
                stock_insuficiente: stockInsuficiente,
                agotados: agotados,
                metros_disponibles: metrosDisponibles,
                metros_necesarios: metrosNecesarios
            });

            onDisponibilidadActualizada(verificaciones);

        } catch (error) {
            console.error('Error al verificar disponibilidad:', error);
        } finally {
            setLoading(false);
        }
    };

    const getEstadoIcon = (producto: ProductoDisponibilidad) => {
        if (producto.disponible) {
            return <FaCheckCircle className="text-green-500 text-xl" />;
        } else if (producto.stock_insuficiente) {
            return <FaExclamationTriangle className="text-yellow-500 text-xl" />;
        } else {
            return <FaTimesCircle className="text-red-500 text-xl" />;
        }
    };

    const getEstadoColor = (producto: ProductoDisponibilidad) => {
        if (producto.disponible) {
            return 'bg-green-100 text-green-800';
        } else if (producto.stock_insuficiente) {
            return 'bg-yellow-100 text-yellow-800';
        } else {
            return 'bg-red-100 text-red-800';
        }
    };

    const getEstadoTexto = (producto: ProductoDisponibilidad) => {
        if (producto.disponible) {
            return 'Disponible';
        } else if (producto.stock_insuficiente) {
            return 'Stock Insuficiente';
        } else {
            return 'Agotado';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-900"></div>
                    <span className="ml-3 text-gray-600">Verificando disponibilidad...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
                <FaInfoCircle className="text-amber-600 mr-3 text-xl" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Verificación de Disponibilidad
                </h3>
            </div>

            {/* Resumen de disponibilidad */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                        {resumen.total_productos}
                    </div>
                    <div className="text-sm text-gray-600">Total</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {resumen.disponibles}
                    </div>
                    <div className="text-sm text-green-600">Disponibles</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                        {resumen.stock_insuficiente}
                    </div>
                    <div className="text-sm text-yellow-600">Stock Bajo</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {resumen.agotados}
                    </div>
                    <div className="text-sm text-red-600">Agotados</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {resumen.metros_necesarios.toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-600">m² Necesarios</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {resumen.metros_disponibles.toFixed(1)}
                    </div>
                    <div className="text-sm text-blue-600">m² Disponibles</div>
                </div>
            </div>

            {/* Lista de productos */}
            <div className="space-y-4">
                {productosDisponibilidad.map((producto, index) => (
                    <div key={producto.id_producto} className={`border rounded-lg p-4 ${
                        producto.disponible ? 'border-green-200 bg-green-50' :
                        producto.stock_insuficiente ? 'border-yellow-200 bg-yellow-50' :
                        'border-red-200 bg-red-50'
                    }`}>
                        <div className="flex items-start space-x-4">
                            {/* Imagen del producto */}
                            <div className="flex-shrink-0">
                                <img
                                    src={producto.imagen || '/placeholder-image.svg'}
                                    alt={producto.nombre_producto}
                                    className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = '/placeholder-image.svg';
                                    }}
                                />
                            </div>

                            {/* Información del producto */}
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-900 text-sm mb-1">
                                            {producto.nombre_producto}
                                        </h4>
                                        <div className="text-xs text-gray-500 mb-2">
                                            ID: {producto.id_producto}
                                        </div>
                                        
                                        {/* Estado y stock */}
                                        <div className="flex items-center space-x-4 mb-3">
                                            <div className="flex items-center space-x-2">
                                                {getEstadoIcon(producto)}
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(producto)}`}>
                                                    {getEstadoTexto(producto)}
                                                </span>
                                            </div>
                                            
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Stock:</span> {producto.stock_actual} cajas
                                            </div>
                                            
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">Solicitado:</span> {producto.cantidad_solicitada} cajas
                                            </div>
                                        </div>

                                        {/* Información de metros */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Metros por caja:</span>
                                                <p className="text-gray-600">{producto.metros_por_caja} m²</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Cajas necesarias:</span>
                                                <p className="text-gray-600">{producto.cajas_necesarias}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Cajas disponibles:</span>
                                                <p className="text-gray-600">{producto.cajas_disponibles}</p>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Metros totales:</span>
                                                <p className="text-gray-600">
                                                    {producto.metros_necesarios.toFixed(1)} m²
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Alertas específicas */}
                                {producto.stock_insuficiente && (
                                    <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
                                        <div className="flex items-center">
                                            <FaExclamationTriangle className="text-yellow-600 mr-2" />
                                            <div className="text-sm text-yellow-800">
                                                <strong>Stock insuficiente:</strong> Solo tienes {producto.stock_actual} cajas disponibles 
                                                de las {producto.cantidad_solicitada} que necesitas. 
                                                Te faltan {producto.cantidad_solicitada - producto.stock_actual} cajas.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {producto.agotado && (
                                    <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-md">
                                        <div className="flex items-center">
                                            <FaTimesCircle className="text-red-600 mr-2" />
                                            <div className="text-sm text-red-800">
                                                <strong>Producto agotado:</strong> Este producto no está disponible actualmente. 
                                                Considera buscar alternativas o esperar a que se reponga el stock.
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {producto.disponible && (
                                    <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-md">
                                        <div className="flex items-center">
                                            <FaCheckCircle className="text-green-600 mr-2" />
                                            <div className="text-sm text-green-800">
                                                <strong>Producto disponible:</strong> Tienes suficiente stock para completar tu pedido.
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recomendaciones */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Recomendaciones:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    {resumen.agotados > 0 && (
                        <li>• {resumen.agotados} producto(s) están agotados. Considera buscar alternativas.</li>
                    )}
                    {resumen.stock_insuficiente > 0 && (
                        <li>• {resumen.stock_insuficiente} producto(s) tienen stock insuficiente. Ajusta las cantidades.</li>
                    )}
                    {resumen.disponibles === resumen.total_productos && (
                        <li>• ¡Excelente! Todos los productos están disponibles para tu pedido.</li>
                    )}
                    <li>• Los precios mostrados son los actuales del mercado.</li>
                    <li>• El stock se verifica en tiempo real.</li>
                </ul>
            </div>
        </div>
    );
}
