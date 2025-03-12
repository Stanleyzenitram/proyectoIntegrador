import { useState } from 'react';
import { CartItem as CartItemType } from '../types';
import { useCart } from '../context/CartContext';
import ProductModal from './ProductModal';

interface CartItemProps {
    item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
    const { updateItemQuantity, removeItem } = useCart();
    const [showModal, setShowModal] = useState(false);

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity >= 1 && newQuantity <= item.stock_actual) {
            const metrosReales = newQuantity * item.metros_por_caja;
            updateItemQuantity(item.id_producto, {
                quantity: newQuantity,
                metrosCuadrados: metrosReales,
                cajasNecesarias: newQuantity,
                metrosReales: metrosReales
            });
        }
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
                                View
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
                </div>

                {/* CANTIDAD */}
                <div className="text-center">
                    <p>{item.metrosReales.toFixed(2)}</p>
                    <p className="text-xs text-gray-500">
                        (STOCK: {item.stock_actual})
                    </p>
                </div>

                {/* UOM */}
                <div className="text-center">
                    <p>Metro cuadrado</p>
                </div>

                {/* TOTAL */}
                <div className="text-right">
                    <p>RD$ {(item.precio * item.metrosReales).toFixed(2)}</p>
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