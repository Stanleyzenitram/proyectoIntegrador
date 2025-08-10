import { useCart } from '../context/CartContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import CartItem from './CartItem';

interface CartProps {
    onClose: () => void;
}

const Cart = ({ onClose }: CartProps) => {
    const { items, removeItem, updateQuantity, total, totalWithDiscount, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleCheckout = () => {
        if (!user) {
            onClose();
            navigate('/login', { 
                state: { 
                    returnTo: '/checkout',
                    message: 'Por favor inicia sesión para completar tu compra' 
                } 
            });
        } else {
            onClose();
            navigate('/payment');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-100 z-50 overflow-auto">
            {/* Botón de cerrar prominente en la parte superior */}
            <div className="absolute top-4 right-4 z-10">
                <button 
                    onClick={onClose}
                    className="bg-white hover:bg-gray-100 text-gray-700 hover:text-gray-900 p-3 rounded-full shadow-lg transition-colors"
                    aria-label="Cerrar carrito"
                >
                    <FontAwesomeIcon icon={faXmark} size="lg" />
                </button>
            </div>

            <div className="container mx-auto px-4 py-6 pt-12 max-w-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">CARRITO DE COMPRAS</h1>
                    <div className="flex gap-2">
                        <button 
                            onClick={clearCart}
                            className="text-gray-500 hover:text-red-700 p-2 flex items-center"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 mr-2" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path 
                                    fillRule="evenodd" 
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                            Vaciar carrito
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <button 
                        onClick={onClose}
                        className="inline-flex items-center text-amber-600 hover:text-amber-700"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-4 w-4 mr-2" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                        <span className="text-base font-semibold">Seguir Comprando</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Carrito Vacío</h2>
                        <p className="text-gray-600 mb-4">No hay productos en tu carrito de compras.</p>
                        <button 
                            onClick={onClose}
                            className="bg-amber-500 text-white px-5 py-2 rounded hover:bg-amber-600 transition-colors"
                        >
                            Continuar comprando
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-5 py-2 border-b text-sm font-medium">
                            <div>Productos</div>
                            <div className="text-center">Precio</div>
                            <div className="text-center">Cantidad</div>
                            <div className="text-center">UOM</div>
                            <div className="text-right">Total</div>
                        </div>

                        <div className="divide-y">
                            {items.map(item => (
                                <CartItem key={item.id_producto} item={item} />
                            ))}
                        </div>

                        <div className="mt-4">
                            <div className="flex justify-end">
                                <div className="w-full md:w-64">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">RD${total.toFixed(2)}</span>
                                    </div>
                                    
                                    {total !== totalWithDiscount && (
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Descuento:</span>
                                            <span className="font-medium text-green-600">-RD${(total - totalWithDiscount).toFixed(2)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">ITBIS (18%):</span>
                                        <span className="font-medium">RD${(totalWithDiscount * 0.18).toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span className="text-gray-900">Total:</span>
                                        <span className="text-amber-600">RD${(totalWithDiscount * 1.18).toFixed(2)}</span>
                                    </div>

                                    <button
                                        onClick={handleCheckout}
                                        className="w-full mt-3 bg-amber-500 text-white py-2 px-4 rounded hover:bg-amber-600 transition-colors"
                                        data-checkout-button
                                    >
                                        Proceder al pago
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Cart; 