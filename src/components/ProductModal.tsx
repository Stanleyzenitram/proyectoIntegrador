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
    const { addItem, updateItemQuantity } = useCart();
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
    const metrosMaximos = product.stock_actual * product.metros_por_caja;

    // Actualizar cálculos basados en el modo de selección
    useEffect(() => {
        if (selectionMode === 'cajas') {
            setMetrosDeseados(cajasDeseadas * product.metros_por_caja);
        } else {
            setCajasDeseadas(Math.ceil(metrosDeseados / product.metros_por_caja));
        }
    }, [selectionMode, cajasDeseadas, metrosDeseados, product.metros_por_caja]);

    const handleMetrosChange = (metros: number) => {
        if (metros < product.metros_por_caja) return;
        const cajasRequeridas = Math.ceil(metros / product.metros_por_caja);
        
        if (cajasRequeridas <= product.stock_actual) {
            setMetrosDeseados(metros);
            setCajasDeseadas(cajasRequeridas);
        }
    };

    const handleCajasChange = (cajas: number) => {
        if (cajas >= 1 && cajas <= product.stock_actual) {
            setCajasDeseadas(cajas);
            setMetrosDeseados(cajas * product.metros_por_caja);
        }
    };

    const handleAddToCart = () => {
        const metrosReales = cajasDeseadas * product.metros_por_caja;
        
        const itemToAdd = {
            ...product,
            quantity: cajasDeseadas,
            metrosCuadrados: metrosDeseados,
            cajasNecesarias: cajasDeseadas,
            metrosReales: metrosReales
        };

        if (isUpdating) {
            updateItemQuantity(product.id_producto, itemToAdd);
        } else {
            addItem(itemToAdd);
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
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay semi-transparente */}
            <div 
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="relative bg-white p-6 rounded-lg max-w-2xl w-full mx-4 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold">{product.nombre_producto}</h2>
                    <div className="flex gap-2">
                      
                        <button 
                            onClick={onClose} 
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {product.imagen && (
                            <img 
                                src={product.imagen} 
                                alt={product.nombre_producto} 
                                className="w-full rounded-lg"
                            />
                        )}
                    </div>

                    <div>
                        <div className="mb-4">
                            <p className="text-2xl font-bold text-amber-600">
                                RD${product.precio.toFixed(2)}
                            </p>
                            <p className="text-sm text-gray-500">
                                Precio por Metro cuadrado (No incluye ITBIS)
                            </p>
                        </div>

                        <div className="mb-4 space-y-2">
                            <p className="text-sm text-gray-600">
                                Formato: {product.formato} cm
                            </p>
                            <p className="text-sm text-gray-600">
                                m² por caja: {product.metros_por_caja}
                            </p>
                            <p className="text-sm text-gray-600">
                                Piezas por caja: {piezasPorCaja}
                            </p>
                            <p className="text-sm text-gray-600">
                                Estado: 
                                <span className={`ml-2 font-medium ${stockStatus.color}`}>
                                    {stockStatus.text}
                                </span>
                            </p>
                        </div>

                        <div className="mb-4">
                            <div className="flex gap-4 mb-4">
                                <button
                                    onClick={() => setSelectionMode('metros')}
                                    className={`px-4 py-2 rounded ${
                                        selectionMode === 'metros' 
                                            ? 'bg-orange-500 text-white' 
                                            : 'bg-gray-100'
                                    }`}
                                >
                                    Por metros cuadrados
                                </button>
                                <button
                                    onClick={() => setSelectionMode('cajas')}
                                    className={`px-4 py-2 rounded ${
                                        selectionMode === 'cajas' 
                                            ? 'bg-orange-500 text-white' 
                                            : 'bg-gray-100'
                                    }`}
                                >
                                    Por cajas
                                </button>
                            </div>

                            {selectionMode === 'metros' ? (
                                // Control de metros cuadrados
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        ¿Cuántos metros cuadrados necesitas?
                                        <span className="text-sm text-gray-500 ml-2">
                                            (Máximo: {metrosMaximos.toFixed(2)} m²)
                                        </span>
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <button 
                                            onClick={() => handleMetrosChange(metrosDeseados - product.metros_por_caja)}
                                            className="px-3 py-1 border rounded-l bg-gray-100"
                                            disabled={metrosDeseados <= product.metros_por_caja}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={metrosDeseados}
                                            onChange={(e) => handleMetrosChange(parseFloat(e.target.value) || product.metros_por_caja)}
                                            className="w-24 text-center border-y"
                                            min={product.metros_por_caja}
                                            max={metrosMaximos}
                                            step={0.01}
                                        />
                                        <button 
                                            onClick={() => handleMetrosChange(metrosDeseados + product.metros_por_caja)}
                                            className="px-3 py-1 border rounded-r bg-gray-100"
                                            disabled={cajasDeseadas >= product.stock_actual}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // Control de cajas
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        ¿Cuántas cajas necesitas?
                                        <span className="text-sm text-gray-500 ml-2">
                                            (Stock disponible: {product.stock_actual} cajas)
                                        </span>
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <button 
                                            onClick={() => handleCajasChange(cajasDeseadas - 1)}
                                            className="px-3 py-1 border rounded-l bg-gray-100"
                                            disabled={cajasDeseadas <= 1}
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            value={cajasDeseadas}
                                            onChange={(e) => handleCajasChange(parseInt(e.target.value) || 1)}
                                            className="w-24 text-center border-y"
                                            min={1}
                                            max={product.stock_actual}
                                        />
                                        <button 
                                            onClick={() => handleCajasChange(cajasDeseadas + 1)}
                                            className="px-3 py-1 border rounded-r bg-gray-100"
                                            disabled={cajasDeseadas >= product.stock_actual}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-2 space-y-1">
                                <p className="text-sm text-gray-600">
                                    Cajas: {cajasDeseadas}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Metros cuadrados: {metrosDeseados.toFixed(2)} m²
                                </p>
                                <p className="text-sm font-semibold text-amber-600">
                                    Total a pagar: RD${(product.precio * metrosDeseados).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {product.color && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Color</label>
                                <select 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={product.color}
                                    disabled
                                >
                                    <option>{product.color}</option>
                                </select>
                            </div>
                        )}

                        {product.estilo && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Estilo</label>
                                <select 
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                    value={product.estilo?.nombre_estilo}
                                    disabled
                                >
                                    <option>{product.estilo?.nombre_estilo}</option>
                                </select>
                            </div>
                        )}

                        <button
                            onClick={handleAddToCart}
                            disabled={!product.disponibilidad}
                            className={`w-full py-2 px-4 rounded-lg ${
                                product.disponibilidad 
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            {product.disponibilidad 
                                ? `AGREGAR AL CARRITO (${cajasDeseadas} ${cajasDeseadas === 1 ? 'caja' : 'cajas'} - ${metrosDeseados.toFixed(2)} m²)` 
                                : 'SIN STOCK'
                            }
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
} 