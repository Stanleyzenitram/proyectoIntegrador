import { useCart } from '../context/CartContext';


interface MiniCartProps {
    onClose: () => void;
}

const MiniCart = ({ onClose }: MiniCartProps) => {
    const { items } = useCart();
  

    const handleCartClick = () => {
        onClose();
        document.getElementById('cart-button')?.click();
    };

    const handleCheckout = () => {
        onClose();
        document.getElementById('cart-button')?.click();
        setTimeout(() => {
            const checkoutBtn = document.querySelector('[data-checkout-button]');
            if (checkoutBtn) {
                (checkoutBtn as HTMLElement).click();
            }
        }, 100);
    };

    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 p-4">
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
                            <div key={item.id_producto} className="flex items-center gap-4 py-2">
                                {item.imagen && (
                                    <img 
                                        src={item.imagen} 
                                        alt={item.nombre_producto}
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                )}
                                <div className="flex-1">
                                    <h4 className="font-medium text-amber-900">{item.nombre_producto}</h4>
                                    <p className="text-sm text-amber-700">
                                        {item.quantity} Und
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      
                        <button
                            onClick={handleCheckout}
                            className="w-full bg-amber-500 hover:cursor-pointer text-white py-2 px-4 rounded hover:bg-amber-600 transition-colors text-center"
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