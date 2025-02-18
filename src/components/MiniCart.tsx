import { useCart } from '../context/CartContext';

const MiniCart = () => {
    const { items, totalWithDiscount } = useCart();

    if (items.length === 0) {
        return (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl p-4">
                <p className="text-gray-500 text-center">Carrito vacío</p>
            </div>
        );
    }

    return (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl">
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Carrito</h3>
                <div className="max-h-60 overflow-auto">
                    {items.map((item) => (
                        <div key={item.id_producto} className="flex items-center gap-2 py-2 border-b">
                            {item.imagen && (
                                <img 
                                    src={item.imagen} 
                                    alt={item.nombre_producto}
                                    className="w-12 h-12 object-cover rounded"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {item.nombre_producto}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {item.quantity} x RD${item.precio.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-semibold">
                        <span>Total (ITBIS inc.):</span>
                        <span>RD${(totalWithDiscount * 1.18).toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MiniCart; 