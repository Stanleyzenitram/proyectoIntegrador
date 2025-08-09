import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { FaArrowUp, FaArrowDown, FaMinus, FaInfoCircle } from 'react-icons/fa';

interface ProductoComparacion {
    id_producto: number;
    nombre_producto: string;
    imagen: string;
    precio_actual: number;
    precio_anterior: number;
    cantidad: number;
    subtotal_actual: number;
    subtotal_anterior: number;
    stock_actual: number;
    disponible: boolean;
    variacion_porcentual: number;
    variacion_absoluta: number;
}

interface ComparadorPreciosProps {
    idFactura: number;
    productos: any[];
    onPreciosActualizados: (productos: ProductoComparacion[]) => void;
}

export default function ComparadorPrecios({ idFactura, productos, onPreciosActualizados }: ComparadorPreciosProps) {
    const [productosComparacion, setProductosComparacion] = useState<ProductoComparacion[]>([]);
    const [loading, setLoading] = useState(true);
    const [resumen, setResumen] = useState({
        total_anterior: 0,
        total_actual: 0,
        ahorro_total: 0,
        productos_con_descuento: 0,
        productos_mas_caros: 0
    });

    useEffect(() => {
        if (idFactura && productos.length > 0) {
            compararPrecios();
        }
    }, [idFactura, productos]);

    const compararPrecios = async () => {
        try {
            setLoading(true);

            // Obtener precios actuales de los productos
            const productosIds = productos.map(p => p.id_producto);
            const { data: productosActuales } = await supabase
                .from('productos')
                .select('id_producto, precio, stock_actual')
                .in('id_producto', productosIds);

            if (!productosActuales) return;

            // Crear mapa de precios actuales
            const preciosActuales = new Map(
                productosActuales.map(p => [p.id_producto, p])
            );

            // Calcular comparaciones
            const comparaciones = productos.map(producto => {
                const productoActual = preciosActuales.get(producto.id_producto);
                const precioActual = productoActual?.precio || producto.precio_unitario;
                const stockActual = productoActual?.stock_actual || 0;
                
                const precioAnterior = producto.precio_unitario;
                const cantidad = producto.cantidad;
                
                const subtotalActual = precioActual * cantidad;
                const subtotalAnterior = precioAnterior * cantidad;
                
                const variacionAbsoluta = precioActual - precioAnterior;
                const variacionPorcentual = precioAnterior > 0 
                    ? ((precioActual - precioAnterior) / precioAnterior) * 100 
                    : 0;

                return {
                    id_producto: producto.id_producto,
                    nombre_producto: producto.nombre_producto,
                    imagen: producto.imagen,
                    precio_actual: precioActual,
                    precio_anterior: precioAnterior,
                    cantidad: cantidad,
                    subtotal_actual: subtotalActual,
                    subtotal_anterior: subtotalAnterior,
                    stock_actual: stockActual,
                    disponible: stockActual >= cantidad,
                    variacion_porcentual: variacionPorcentual,
                    variacion_absoluta: variacionAbsoluta
                };
            });

            setProductosComparacion(comparaciones);

            // Calcular resumen
            const totalAnterior = comparaciones.reduce((sum, p) => sum + p.subtotal_anterior, 0);
            const totalActual = comparaciones.reduce((sum, p) => sum + p.subtotal_actual, 0);
            const ahorroTotal = totalAnterior - totalActual;
            const productosConDescuento = comparaciones.filter(p => p.variacion_porcentual < 0).length;
            const productosMasCaros = comparaciones.filter(p => p.variacion_porcentual > 0).length;

            setResumen({
                total_anterior: totalAnterior,
                total_actual: totalActual,
                ahorro_total: ahorroTotal,
                productos_con_descuento: productosConDescuento,
                productos_mas_caros: productosMasCaros
            });

            onPreciosActualizados(comparaciones);

        } catch (error) {
            console.error('Error al comparar precios:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVariacionIcon = (variacion: number) => {
        if (variacion > 0) {
            return <FaArrowUp className="text-red-500" />;
        } else if (variacion < 0) {
            return <FaArrowDown className="text-green-500" />;
        } else {
            return <FaMinus className="text-gray-400" />;
        }
    };

    const getVariacionColor = (variacion: number) => {
        if (variacion > 0) {
            return 'text-red-600 bg-red-100';
        } else if (variacion < 0) {
            return 'text-green-600 bg-green-100';
        } else {
            return 'text-gray-600 bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-amber-900"></div>
                    <span className="ml-3 text-gray-600">Comparando precios...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-6">
                <FaInfoCircle className="text-amber-600 mr-3 text-xl" />
                <h3 className="text-lg font-semibold text-gray-900">
                    Comparación de Precios
                </h3>
            </div>

            {/* Resumen de la comparación */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                        RD${resumen.total_anterior.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Anterior</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                        RD${resumen.total_actual.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Total Actual</div>
                </div>
                
                <div className="text-center">
                    <div className={`text-2xl font-bold ${resumen.ahorro_total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {resumen.ahorro_total >= 0 ? '+' : ''}RD${resumen.ahorro_total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-600">Diferencia</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {resumen.productos_con_descuento}
                    </div>
                    <div className="text-sm text-gray-600">Más Baratos</div>
                </div>
                
                <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                        {resumen.productos_mas_caros}
                    </div>
                    <div className="text-sm text-gray-600">Más Caros</div>
                </div>
            </div>

            {/* Tabla de comparación */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Producto</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Cantidad</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Precio Anterior</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Precio Actual</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Variación</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Subtotal Anterior</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Subtotal Actual</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-700">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {productosComparacion.map((producto, index) => (
                            <tr key={producto.id_producto} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                {/* Producto */}
                                <td className="py-3 px-4">
                                    <div className="flex items-center">
                                        <img
                                            src={producto.imagen || '/placeholder-image.svg'}
                                            alt={producto.nombre_producto}
                                            className="w-12 h-12 object-cover rounded-md mr-3"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = '/placeholder-image.svg';
                                            }}
                                        />
                                        <div>
                                            <div className="font-medium text-gray-900 text-sm">
                                                {producto.nombre_producto}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                ID: {producto.id_producto}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Cantidad */}
                                <td className="py-3 px-4 text-center">
                                    <span className="font-medium text-gray-900">
                                        {producto.cantidad}
                                    </span>
                                </td>

                                {/* Precio Anterior */}
                                <td className="py-3 px-4 text-center">
                                    <span className="text-gray-600">
                                        RD${producto.precio_anterior.toFixed(2)}
                                    </span>
                                </td>

                                {/* Precio Actual */}
                                <td className="py-3 px-4 text-center">
                                    <span className="font-medium text-gray-900">
                                        RD${producto.precio_actual.toFixed(2)}
                                    </span>
                                </td>

                                {/* Variación */}
                                <td className="py-3 px-4 text-center">
                                    <div className="flex items-center justify-center space-x-2">
                                        {getVariacionIcon(producto.variacion_porcentual)}
                                        <span className={`text-sm font-medium px-2 py-1 rounded-full ${getVariacionColor(producto.variacion_porcentual)}`}>
                                            {producto.variacion_porcentual > 0 ? '+' : ''}
                                            {producto.variacion_porcentual.toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {producto.variacion_absoluta > 0 ? '+' : ''}
                                        RD${producto.variacion_absoluta.toFixed(2)}
                                    </div>
                                </td>

                                {/* Subtotal Anterior */}
                                <td className="py-3 px-4 text-center">
                                    <span className="text-gray-600">
                                        RD${producto.subtotal_anterior.toFixed(2)}
                                    </span>
                                </td>

                                {/* Subtotal Actual */}
                                <td className="py-3 px-4 text-center">
                                    <span className="font-medium text-gray-900">
                                        RD${producto.subtotal_actual.toFixed(2)}
                                    </span>
                                </td>

                                {/* Estado */}
                                <td className="py-3 px-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            producto.disponible 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {producto.disponible ? 'Disponible' : 'Sin Stock'}
                                        </span>
                                        {!producto.disponible && (
                                            <span className="text-xs text-red-600 mt-1">
                                                Stock: {producto.stock_actual}
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Leyenda */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Leyenda:</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center">
                        <FaArrowDown className="text-green-500 mr-2" />
                        <span className="text-green-700">Precio bajó (Ahorro)</span>
                    </div>
                    <div className="flex items-center">
                        <FaArrowUp className="text-red-500 mr-2" />
                        <span className="text-red-700">Precio subió (Incremento)</span>
                    </div>
                    <div className="flex items-center">
                        <FaMinus className="text-gray-400 mr-2" />
                        <span className="text-gray-700">Precio sin cambios</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
