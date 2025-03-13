
// no ees necesario ------------------------------------------------ lo deje porque ya esta creado y por si lo quieres usar 
 

import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { Plus } from 'lucide-react';    
import { useNavigate } from 'react-router-dom';
import type {Cliente} from '../types/index';

export default function Checkout() {
    const { items, total, clearCart } = useCart();
    const { user } = useAuth();
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [customerInfo, setCustomerInfo] = useState<Cliente>({
        nombre: '',
        apellido: '',
        telefono: '',
        sector: '',
        codigo_postal: '',
        detalles_direccion: '',
        tipo_documento: '',
        numero_documento: '',
        email: ''
    });

    // Verificar si el usuario está logueado
    useEffect(() => {
        if (!user) {
            navigate('/login', { 
                state: { 
                    returnTo: '/checkout',
                    message: 'Por favor inicia sesión para completar tu compra' 
                } 
            });
        }
    }, [user, navigate]);

    // Si no hay usuario, mostrar pantalla de carga mientras redirige
    if (!user) {
        return <div className="flex justify-center items-center h-screen">
            Redirigiendo al inicio de sesión...
        </div>;
    }

    // Calculamos los totales
    const subtotal = items.reduce((acc, item) => {
        const precioConDescuento = item.precio * (1 - (item.descuento || 0) / 100);
        return acc + (precioConDescuento * item.quantity);
    }, 0);
    
    const iva = subtotal * 0.18;
    const totalPedido = subtotal + iva;

    useEffect(() => {
        const fetchClienteData = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('uuid', user.id)
                    .single();

                if (error) throw error;
                setCliente(data);
                
                // Actualizar customerInfo con los datos del cliente
                if (data) {
                    setCustomerInfo({
                        nombre: data.nombre,
                        apellido: data.apellido,
                        telefono: data.telefono,
                        sector: data.sector,
                        codigo_postal: data.codigo_postal,
                        detalles_direccion: data.detalles_direccion,
                        tipo_documento: data.tipo_documento,
                        numero_documento: data.numero_documento,
                        email: data.email
                    });
                }
            } catch (error) {
                console.error('Error al cargar datos del cliente:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchClienteData();
    }, [user]);

    const handleSubmit = async () => {
        if (!cliente || !user) return;
        
        try {
            setLoading(true);

            // 1. Crear la venta
            const { data: venta, error: ventaError } = await supabase
                .from('ventas')
                .insert({
                    id_cliente: user.id,
                    total: total * 1.18,
                    fecha: new Date().toISOString(),
                })
                .select()
                .single();

            if (ventaError) throw ventaError;

            // 2. Crear los detalles de la venta
            const detallesVenta = items.map(item => ({
                id_venta: venta.id_venta,
                id_producto: item.id_producto,
                cantidad: item.quantity,
                precio_unitario: item.precio,
                subtotal: item.precio * item.quantity
            }));

            const { error: detallesError } = await supabase
                .from('detalles_venta')
                .insert(detallesVenta);

            if (detallesError) throw detallesError;

            // 3. Actualizar el stock
            for (const item of items) {
                const { data: producto } = await supabase
                    .from('productos')
                    .select('stock_actual')
                    .eq('id_producto', item.id_producto)
                    .single();

                if (producto) {
                    const nuevoStock = producto.stock_actual - item.quantity;
                    const { error: stockError } = await supabase
                        .from('productos')
                        .update({ stock_actual: nuevoStock })
                        .eq('id_producto', item.id_producto);

                    if (stockError) throw stockError;
                }
            }

            // 4. Limpiar el carrito y redirigir
            clearCart();
            navigate('/'); // Aquí podrías redirigir a una página de confirmación
            alert('¡Compra realizada con éxito!');
            
        } catch (error) {
            console.error('Error al procesar la compra:', error);
            alert('Error al procesar la compra');
        } finally {
            setLoading(false);
        }
    };

    // Verificación de items vacíos
    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 pt-32">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Carrito Vacío</h2>
                    <p className="text-gray-600 mb-6">No hay productos en tu carrito de compras.</p>
                    <a 
                        href="/" 
                        className="inline-flex items-center text-lg font-semibold text-amber-600 hover:text-amber-700"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate('/');
                        }}
                    >
                        <Plus className="w-6 h-6 mr-2" />
                        Agregar Productos
                    </a>
                </div>
            </div>
        );
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    // Verificamos que tengamos items antes de renderizar
    console.log("Items en el carrito:", items); // Para debugging

    return (
        <div className="container mx-auto px-4 py-8 pt-32">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Detalles de Venta</h1>

            {/* Información del Cliente */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Cliente</h3>
                        <p className="mt-1 text-base text-gray-500">{`${cliente?.nombre} ${cliente?.apellido}`}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Documento</h3>
                        <p className="mt-1 text-base text-gray-500">{`${cliente?.tipo_documento}: ${cliente?.numero_documento}`}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Teléfono</h3>
                        <p className="mt-1 text-base text-gray-500">{cliente?.telefono}</p>
                    </div>
                    <div className="col-span-2">
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Dirección</h3>
                        <p className="mt-1 text-base text-gray-500">{`${cliente?.sector}, ${cliente?.detalles_direccion}`}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-black uppercase tracking-wider">Código Postal</h3>
                        <p className="mt-1 text-base text-gray-500">{cliente?.codigo_postal}</p>
                    </div>
                </div>
            </div>

            {/* Línea divisoria */}
            <div className="border-b-[3px] border-black my-8"></div>

            {/* Enlace para seguir comprando */}
            <div className="mb-6 -mt-4">
                <a 
                    href="/" 
                    className="inline-flex items-center text-lg font-semibold text-amber-600 hover:text-amber-700"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-6 w-6 mr-2" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                    >
                        <path 
                            fillRule="evenodd" 
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                            clipRule="evenodd" 
                        />
                    </svg>
                    Seguir Comprando
                </a>
            </div>

            {/* Resumen del Pedido - Maximizado */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow">
                <div className="mb-6">
                    <h2 className="text-xl md:text-2xl font-semibold text-amber-600">Carrito de Compras</h2>
                    <div className="border-b-[1px] border-black mt-4"></div>
                </div>
                
                {/* Tabla de productos */}
                <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full mb-6">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 md:px-6 py-3 text-left text-sm font-bold text-black uppercase tracking-wider">Producto</th>
                                <th className="px-4 md:px-6 py-3 text-right text-sm font-bold text-black uppercase tracking-wider">Precio</th>
                                <th className="px-4 md:px-6 py-3 text-right text-sm font-bold text-black uppercase tracking-wider">Cantidad</th>
                                <th className="hidden md:table-cell px-6 py-3 text-right text-sm font-bold text-black uppercase tracking-wider">Descuento</th>
                                <th className="px-4 md:px-6 py-3 text-right text-sm font-bold text-black uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => {
                                const precioUnitario = item.precio;
                                const descuento = item.descuento || 0;
                                const precioConDescuento = precioUnitario * (1 - descuento / 100);
                                const subtotalItem = precioConDescuento * item.quantity;

                                return (
                                    <tr key={item.id_producto}>
                                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {item.imagen && (
                                                    <img 
                                                        src={item.imagen} 
                                                        alt={item.nombre_producto} 
                                                        className="w-10 h-10 md:w-12 md:h-12 object-cover rounded mr-2 md:mr-3"
                                                    />
                                                )}
                                                <span className="font-medium text-gray-900 text-sm md:text-base">
                                                    {item.nombre_producto}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right text-sm text-gray-500">
                                            RD${precioUnitario.toFixed(2)}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right text-sm text-gray-500">
                                            {item.quantity}
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4 text-right text-sm text-gray-500">
                                            {descuento > 0 ? `${descuento}%` : '-'}
                                        </td>
                                        <td className="px-4 md:px-6 py-4 text-right text-sm font-medium text-gray-900">
                                            RD${subtotalItem.toFixed(2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Resumen de totales */}
                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-end">
                        <div className="w-full md:w-64">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Subtotal:</span>
                                <span className="font-medium">RD${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">IVA (18%):</span>
                                <span className="font-medium">RD${iva.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t">
                                <span className="text-gray-900">Total:</span>
                                <span className="text-amber-600">RD${totalPedido.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Botón de confirmar venta */}
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full mt-6 bg-amber-500 text-white py-2 md:py-3 rounded-lg hover:bg-amber-600 transition-colors disabled:bg-gray-400 text-sm md:text-base"
                >
                    {loading ? 'Procesando...' : 'Confirmar Pedido'}
                </button>
            </div>
        </div>
    );
} 