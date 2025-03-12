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
                    returnTo: '/checkout', //aqui tienes que cambiar a la pagina de checkout cuando termines el proceso de compra
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
            <Header />

            <div className="container mx-auto px-4 py-8 pt-32">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">CARRITO DE COMPRAS</h1>
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
                                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                            Vaciar carrito
                        </button>
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 p-2"
                        >
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                    </div>
                </div>

                {/* Enlace para seguir comprando */}
                <div className="mb-6">
                    <button 
                        onClick={onClose}
                        className="inline-flex items-center text-amber-600 hover:text-amber-700"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5 mr-2" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                        <span className="text-lg font-semibold">Seguir Comprando</span>
                    </button>
                </div>

                {items.length === 0 ? (
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Carrito Vacío</h2>
                        <p className="text-gray-600 mb-6">No hay productos en tu carrito de compras.</p>
                        <button 
                            onClick={onClose}
                            className="bg-amber-500 text-white px-6 py-2 rounded hover:bg-amber-600 transition-colors"
                        >
                            Continuar comprando
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Encabezados */}
                        <div className="grid grid-cols-5 py-2 border-b text-sm font-medium">
                            <div>Productos</div>
                            <div className="text-center">Precio</div>
                            <div className="text-center">Cantidad</div>
                            <div className="text-center">UOM</div>
                            <div className="text-right">Total</div>
                        </div>

                        {/* Lista de items */}
                        <div className="divide-y">
                            {items.map(item => (
                                <CartItem key={item.id_producto} item={item} />
                            ))}
                        </div>

                        {/* Resumen de totales */}
                        <div className="border-t pt-4 mt-4">
                            <div className="flex justify-end">
                                <div className="w-full md:w-64">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-medium">RD${total.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Nuevo renglón de descuento */}
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Descuento:</span>
                                        <span className="font-medium text-green-600">-RD${(total - totalWithDiscount).toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">ITBIS (18%):</span>
                                        <span className="font-medium">RD${(totalWithDiscount * 0.18).toFixed(2)}</span>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                        <span className="text-gray-900">Total (ITBIS inc.):</span>
                                        <span className="text-amber-600">RD${(totalWithDiscount * 1.18).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Botón de finalizar compra */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                        className={`
                            px-8 py-3 rounded-lg transition-colors
                            ${items.length === 0 
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                                : 'bg-amber-500 text-white hover:bg-amber-600'
                            }
                        `}
                    >
                        {items.length === 0 
                            ? 'Carrito Vacío'
                            : user 
                                ? 'FINALIZAR COMPRA' 
                                : 'INICIAR SESIÓN PARA COMPRAR'
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart; 