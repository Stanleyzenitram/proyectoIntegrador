import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { CartItem } from '../types';

interface MiniCartProps {
    onClose: () => void;
}

const MiniCart = ({ onClose }: MiniCartProps) => {
    const { items, removeItem, total, itemCount } = useCart();
  

    const handleCartClick = () => {
        onClose();
        document.getElementById('cart-button')?.click();
    };

    const handleViewCart = () => {
        onClose();
        // Solo abrir el carrito, no proceder al pago automáticamente
        document.getElementById('cart-button')?.click();
    };

    const getDisplayQuantity = (item: CartItem) => {
        if (item.metros_por_caja) {
            return `${item.quantity} cajas (${(item.metrosReales || 0).toFixed(2)} m²)`;
        }
        return `${item.quantity} unid.`;
    };

    const getItemTotal = (item: CartItem) => {
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
        <div className="bg-white rounded-lg shadow-xl z-50 p-4 min-w-[400px] max-w-[500px]">
            <h3 className="text-lg font-bold text-amber-900 mb-4 border-b pb-2">
                ÚLTIMOS PRODUCTOS AGREGADOS A SU CARRITO DE COMPRAS
            </h3>

            {items.length === 0 ? (
                <div className="text-center py-4">
                    <p className="text-gray-500">El carrito está vacío</p>
                </div>
            ) : (
                <>
                    <div className="max-h-64 overflow-auto space-y-4">
                        {items.slice(-3).map((item) => (
                            <div key={item.id_producto} className="flex items-center gap-4 py-2 hover:bg-gray-50 rounded-lg px-2">
                                {item.imagen && (
                                    <img 
                                        src={item.imagen} 
                                        alt={item.nombre_producto}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-amber-900 truncate">{item.nombre_producto}</h4>
                                    <p className="text-sm text-amber-700">
                                        {getDisplayQuantity(item)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <p className="font-medium text-amber-900 whitespace-nowrap">
                                        RD${getItemTotal(item).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() => removeItem(item.id_producto)}
                                        className="text-red-700 hover:text-red-800 p-1"
                                    >
                                        X
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <button
                            onClick={handleViewCart}
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2 px-4 rounded transition-colors"
                        >
                            VER CARRITO DE COMPRAS
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MiniCart; 