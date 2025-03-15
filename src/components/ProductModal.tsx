import { useState, useEffect } from 'react';
import { Producto } from '../types';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

interface ProductModalProps {
    product: Producto;
    onClose: () => void;
    isUpdating?: boolean;
    currentMetros?: number;
}

export default function ProductModal({ product, onClose, isUpdating = false, currentMetros }: ProductModalProps) {
    console.log("Modal renderizando con producto:", product);
    const [selectionMode, setSelectionMode] = useState<'metros' | 'cajas'>('metros');
    const [metrosDeseados, setMetrosDeseados] = useState(currentMetros || product.metros_por_caja);
    const [cajasDeseadas, setCajasDeseadas] = useState(1);
    const { addItem, updateQuantity } = useCart();
    const navigate = useNavigate();

    // Función para calcular metros cuadrados por pieza con validación
    const calcularMetrosPorPieza = (formato: string | undefined): number => {
        if (!formato) return 0;
        const [ancho, largo] = formato.split('x').map(Number);
        if (!ancho || !largo) return 0;
        return (ancho * largo) / 10000;
    };

    // Cálculos básicos
    const metrosPorPieza = calcularMetrosPorPieza(product.formato);
    const piezasPorCaja = product.metros_por_caja ? Math.round(product.metros_por_caja / metrosPorPieza) : 0;
    const metrosMaximos = product.stock_actual * (product.metros_por_caja || 0);

    // Función para calcular el precio total
    const calcularPrecioTotal = () => {
        const precioBase = product.precio * cajasDeseadas;

        // Aplicar descuento si existe
        if (product.descuento && product.descuento > 0) {
            const descuento = (precioBase * product.descuento) / 100;
            return precioBase - descuento;
        }

        return precioBase;
    };

    // Actualizar cálculos basados en el modo de selección
    useEffect(() => {
        if (selectionMode === 'cajas') {
            setMetrosDeseados(cajasDeseadas * (product.metros_por_caja || 0));
        } else {
            const cajasNecesarias = Math.ceil(metrosDeseados / (product.metros_por_caja || 1));
            setCajasDeseadas(cajasNecesarias);
            // Actualizar metros deseados para reflejar el número real de metros basado en cajas completas
            setMetrosDeseados(cajasNecesarias * (product.metros_por_caja || 0));
        }
    }, [selectionMode, cajasDeseadas, metrosDeseados, product.metros_por_caja]);

    const handleMetrosChange = (metros: number) => {
        if (metros < (product.metros_por_caja || 0)) return;
        const cajasRequeridas = Math.ceil(metros / (product.metros_por_caja || 1));
        
        if (cajasRequeridas <= product.stock_actual) {
            const metrosReales = cajasRequeridas * (product.metros_por_caja || 0);
            setMetrosDeseados(metrosReales);
            setCajasDeseadas(cajasRequeridas);
        }
    };

    const handleCajasChange = (cajas: number) => {
        if (cajas >= 1 && cajas <= product.stock_actual) {
            setCajasDeseadas(cajas);
            setMetrosDeseados(cajas * (product.metros_por_caja || 0));
        }
    };

    const handleAddToCart = () => {
        const metrosReales = cajasDeseadas * (product.metros_por_caja || 0);
        const precioTotal = calcularPrecioTotal();
        
        if (isUpdating) {
            updateQuantity(product.id_producto, cajasDeseadas, {
                metrosCuadrados: metrosDeseados,
                cajasNecesarias: cajasDeseadas,
                metrosReales: metrosReales,
                precioTotal: precioTotal
            });
        } else {
            addItem(product, cajasDeseadas, {
                metrosCuadrados: metrosDeseados,
                cajasNecesarias: cajasDeseadas,
                metrosReales: metrosReales,
                precioTotal: precioTotal
            });
        }
        onClose();
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { text: 'Sin stock', color: 'text-red-600' };
        if (stock <= 3) return { text: 'Stock bajo', color: 'text-yellow-600' };
        return { text: 'Disponible', color: 'text-green-600' };
    };

    const stockStatus = getStockStatus(product.stock_actual || 0);

    const handlePrintDetail = () => {
        navigate(`/product-print/${product.id_producto}`, { 
            state: { product } 
        });
    };

    // Verificar que el producto tenga los datos necesarios
    if (!product.metros_por_caja || !product.formato) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
                <div className="relative bg-white p-6 rounded-lg max-w-2xl w-full mx-4 shadow-xl">
                    <div className="text-center">
                        <p className="text-red-600">
                            Error: Producto no configurado correctamente
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Fondo semi-transparente con efecto de desenfoque */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Contenido del modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{product.nombre_producto}</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="sr-only">Cerrar</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="relative">
                            {product.imagen && (
                                <img
                                    src={product.imagen}
                                    alt={product.nombre_producto}
                                    className="w-full h-64 object-cover rounded-lg shadow-md"
                                />
                            )}
                        </div>

                        <div className="bg-white rounded-lg">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">Detalles del producto</h3>
                                    <p className="mt-1 text-sm text-gray-500">{product.descripcion}</p>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Precio por metro:</span>
                                        <span className="font-medium">RD${(product.precio / product.metros_por_caja).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Metros por caja:</span>
                                        <span className="font-medium">{product.metros_por_caja} m²</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-600">Piezas por caja:</span>
                                        <span className="font-medium">{piezasPorCaja} piezas</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">Stock disponible:</span>
                                        <span className="font-medium">{product.stock_actual} cajas</span>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex gap-4 mb-4">
                                        <button
                                            onClick={() => setSelectionMode('metros')}
                                            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                                selectionMode === 'metros'
                                                    ? 'bg-amber-500 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Por metros
                                        </button>
                                        <button
                                            onClick={() => setSelectionMode('cajas')}
                                            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                                                selectionMode === 'cajas'
                                                    ? 'bg-amber-500 text-white shadow-md'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            Por cajas
                                        </button>
                                    </div>

                                    {selectionMode === 'metros' ? (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700">
                                                ¿Cuántos metros cuadrados necesitas?
                                                <span className="text-sm text-gray-500 ml-2">
                                                    (Máximo: {metrosMaximos.toFixed(2)} m²)
                                                </span>
                                            </label>
                                            <div className="flex items-center mt-2">
                                                <button 
                                                    onClick={() => handleMetrosChange(metrosDeseados - product.metros_por_caja)}
                                                    className="px-3 py-1 border rounded-l bg-white hover:bg-gray-100 transition-colors"
                                                    disabled={cajasDeseadas <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={metrosDeseados.toFixed(2)}
                                                    onChange={(e) => handleMetrosChange(parseFloat(e.target.value) || product.metros_por_caja)}
                                                    className="w-24 text-center border-y bg-white"
                                                    min={product.metros_por_caja}
                                                    max={metrosMaximos}
                                                    step={product.metros_por_caja}
                                                />
                                                <button 
                                                    onClick={() => handleMetrosChange(metrosDeseados + product.metros_por_caja)}
                                                    className="px-3 py-1 border rounded-r bg-white hover:bg-gray-100 transition-colors"
                                                    disabled={cajasDeseadas >= product.stock_actual}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <label className="block text-sm font-medium text-gray-700">
                                                ¿Cuántas cajas necesitas?
                                                <span className="text-sm text-gray-500 ml-2">
                                                    (Stock disponible: {product.stock_actual} cajas)
                                                </span>
                                            </label>
                                            <div className="flex items-center mt-2">
                                                <button 
                                                    onClick={() => handleCajasChange(cajasDeseadas - 1)}
                                                    className="px-3 py-1 border rounded-l bg-white hover:bg-gray-100 transition-colors"
                                                    disabled={cajasDeseadas <= 1}
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    value={cajasDeseadas}
                                                    onChange={(e) => handleCajasChange(parseInt(e.target.value) || 1)}
                                                    className="w-24 text-center border-y bg-white"
                                                    min={1}
                                                    max={product.stock_actual}
                                                />
                                                <button 
                                                    onClick={() => handleCajasChange(cajasDeseadas + 1)}
                                                    className="px-3 py-1 border rounded-r bg-white hover:bg-gray-100 transition-colors"
                                                    disabled={cajasDeseadas >= product.stock_actual}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <p>Total de cajas: <span className="font-medium">{cajasDeseadas}</span></p>
                                        <p>Total de metros cuadrados: <span className="font-medium">{metrosDeseados.toFixed(2)} m²</span></p>
                                        <div className="mt-2">
                                            <p className="text-gray-600 font-medium">Precio por caja: RD${product.precio.toFixed(2)}</p>
                                            <p className="text-gray-600 text-sm">Metros cuadrados por caja: {product.metros_por_caja} m²</p>
                                            <p className="text-gray-600 text-sm">Piezas por caja: {piezasPorCaja} piezas</p>
                                            {product.descuento && product.descuento > 0 && (
                                                <p className="text-green-600">Descuento: {product.descuento}%</p>
                                            )}
                                            <p className="font-medium text-lg mt-1 text-amber-600">
                                                Total: RD${calcularPrecioTotal().toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        className="w-full mt-6 bg-amber-500 text-white py-3 px-4 rounded-lg hover:bg-amber-600 transition-colors shadow-md"
                                    >
                                        {isUpdating ? 'Actualizar carrito' : 'Agregar al carrito'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 