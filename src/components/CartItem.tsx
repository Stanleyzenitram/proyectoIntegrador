import { useState } from 'react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();
    const [showModal, setShowModal] = useState(false);
    const [displayMode, setDisplayMode] = useState<'cajas' | 'metros'>('cajas');

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= item.stock_actual) {
            if (item.metros_por_caja) {
                const metrosReales = newQuantity * (item.metros_por_caja || 0);
                updateQuantity(item.id_producto, newQuantity, {
                    metrosCuadrados: metrosReales,
                    cajasNecesarias: newQuantity,
                    metrosReales: metrosReales
                });
            } else {
                updateQuantity(item.id_producto, newQuantity);
            }
        }
    };

    const getDisplayQuantity = () => {
        if (item.metros_por_caja) {
            if (displayMode === 'metros') {
                return `${(item.metrosReales || 0).toFixed(2)} m²`;
            }
            return `${item.quantity} cajas`;
        }
        return item.quantity;
    };

    const getUOM = () => {
        if (item.metros_por_caja) {
            return (
                <select
                    value={displayMode}
                    onChange={(e) => setDisplayMode(e.target.value as 'cajas' | 'metros')}
                    className="bg-white border rounded px-2 py-1 text-sm"
                >
                    <option value="cajas">Cajas</option>
                    <option value="metros">Metros²</option>
                </select>
            );
        }
        return "Unidad";
    };

    const getTotal = () => {
        // El precio es por caja, así que multiplicamos directamente por la cantidad de cajas
        const precioBase = item.precio * item.quantity;
        
        // Aplicar descuento si existe
        if (item.descuento && item.descuento > 0) {
            const descuento = (precioBase * item.descuento) / 100;
            return precioBase - descuento;
        }
        return precioBase;
    };

    return (
        <>
            <div className="grid grid-cols-5 items-center py-3 border-b gap-4 text-sm">
                {/* PRODUCTO */}
                <div className="flex items-center gap-3">
                    {item.imagen && (
                        <img 
                            src={item.imagen} 
                            alt={item.nombre_producto} 
                            className="w-12 h-12 object-cover rounded"
                        />
                    )}
                    <div>
                        <h3 className="font-medium">{item.nombre_producto}</h3>
                        <p className="text-gray-500 text-xs">
                            Número de Artículo: {item.id_producto}
                        </p>
                        <div className="flex gap-3 mt-1">
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                Ver detalles
                            </button>
                            <button
                                onClick={() => removeItem(item.id_producto)}
                                className="text-red-500 hover:text-red-700"
                            >
                                Borrar
                            </button>
                        </div>
                    </div>
                </div>

                {/* PRECIO */}
                <div className="text-center">
                    <p>RD$ {item.precio.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">por caja</p>
                    {item.descuento > 0 && (
                        <p className="text-green-600 text-xs">-{item.descuento}%</p>
                    )}
                </div>

                {/* CANTIDAD */}
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleQuantityChange(item.quantity - 1)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                            disabled={item.quantity <= 1}
                        >
                            -
                        </button>
                        <span>{getDisplayQuantity()}</span>
                        <button
                            onClick={() => handleQuantityChange(item.quantity + 1)}
                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
                            disabled={item.quantity >= item.stock_actual}
                        >
                            +
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        (STOCK: {item.stock_actual} cajas)
                    </p>
                    {item.metros_por_caja && displayMode === 'cajas' && (
                        <p className="text-xs text-gray-500">
                            ({(item.metrosReales || 0).toFixed(2)} m² totales)
                        </p>
                    )}
                </div>

                {/* UOM */}
                <div className="text-center">
                    {getUOM()}
                </div>

                {/* TOTAL */}
                <div className="text-right">
                    <p>RD$ {getTotal().toFixed(2)}</p>
                </div>
            </div>

            {showModal && (
                <ProductModal 
                    product={item}
                    onClose={() => setShowModal(false)}
                    isUpdating={true}
                    currentMetros={item.metrosReales}
                />
            )}
        </>
    );
} 