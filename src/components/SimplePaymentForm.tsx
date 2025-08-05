import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { emailService } from '../services/emailService';

interface DireccionPedido {
    calle: string;
    ciudad: string;
    provincia: string;
    codigo_postal: string;
}

interface CartItem {
    id_producto: number;
    quantity: number;
    precio: number;
    descuento?: number;
    nombre_producto: string;
    imagen?: string;
}

interface SimplePaymentFormProps {
    total: number;
    orderItems: CartItem[];
    clearCart: () => void;
    descuento: number;
    subtotal: number;
    itbis: number;
    direccionPedido: DireccionPedido;
}

const SimplePaymentForm = ({
    total,
    orderItems,
    clearCart,
    descuento,
    subtotal,
    itbis,
    direccionPedido,
}: SimplePaymentFormProps) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const [metodo_Pago] = useState('Tarjeta de Crédito');
    const { user } = useAuth();
    const navigate = useNavigate();

    const isDireccionCompleta = () => {
        return (
            direccionPedido.calle.trim() !== '' &&
            direccionPedido.ciudad.trim() !== '' &&
            direccionPedido.provincia.trim() !== '' &&
            direccionPedido.codigo_postal.trim() !== ''
        );
    };

    async function getAccessToken() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                return session.access_token;
            }
            
            const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
            if (refreshedSession?.access_token) {
                return refreshedSession.access_token;
            }
            
            console.log("No se encontró token de sesión válido.");
            return null;
        } catch (error) {
            console.error("Error al obtener token:", error);
            return null;
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setLoading(true);
            setError(null);

            if (!user?.id) {
                throw new Error("Usuario no autenticado");
            }

            // Obtener el token de acceso
            const token = await getAccessToken();
            if (!token) {
                throw new Error("Error de autenticación. Por favor, inicia sesión nuevamente.");
            }

            // Verificar si el usuario existe en la tabla clientes y obtener sus datos
            let { data: clienteData, error: clienteError } = await supabase
                .from("clientes")
                .select("*")
                .eq("uuid", user.id)
                .single();

            // Si el cliente no existe, crearlo automáticamente
            if (clienteError || !clienteData) {
                console.log("Cliente no encontrado, creando nuevo registro...");
                
                const { data: newCliente, error: createError } = await supabase
                    .from("clientes")
                    .insert([
                        {
                            nombre: user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Usuario',
                            apellido: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || 'Cliente',
                            email: user.email || '',
                            telefono: user.phone || '000-000-0000',
                            direccion: 'Dirección pendiente',
                            tipo_cliente: 'Individual',
                            uuid: user.id
                        }
                    ])
                    .select()
                    .single();

                if (createError) {
                    console.error("Error al crear cliente:", createError);
                    throw new Error("Error al crear el registro del cliente");
                }

                clienteData = newCliente;
                console.log("Cliente creado exitosamente:", clienteData);
            }

            // Usar el id_cliente y los datos del cliente
            const datosFactura = {
                id: clienteData.id_cliente,
                fechaActual: new Date().toISOString().split("T")[0],
                descuento_total: Number(descuento.toFixed(2)),
                estado: "valida",
                sub_total: Number(subtotal),
                total: Number(total),
                productos: orderItems.map((item) => ({
                    idProducto: Number(item.id_producto),
                    cantidad: Number(item.quantity),
                    precioUnit: Number(item.precio),
                    subtotal: Number((item.precio * item.quantity).toFixed(2)),
                    nombre_producto: item.nombre_producto
                })),
                metodoPago: metodo_Pago,
                nombre_cliente: clienteData.nombre,
                email_cliente: clienteData.email,
                telefono_cliente: clienteData.telefono
            };

            console.log("Simulando proceso de pago...");
            
            // Simular delay de procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            console.log("Pago simulado exitoso!");

            // Simular actualización de stock
            console.log("Simulando actualización de stock...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Stock actualizado correctamente (simulado)");
            
            clearCart();
            setPaymentCompleted(true);
            setLoading(false);

            // Crear factura
            const result = await crearFactura(datosFactura, direccionPedido);
            if (result.success) {
                console.log("Factura creada con éxito, ID:", result.idFactura);
                
                // Enviar la factura por correo
                if (!user.email) {
                    console.warn("No se encontró email del usuario");
                    return;
                }

                await emailService.sendInvoice(
                    user.email,
                    result.idFactura.toString(),
                    result.pdfContent
                );
                console.log("Factura enviada por correo exitosamente");

                navigate(`/factura/${result.idFactura}`);
            } else {
                throw new Error("Error al crear la factura.");
            }
        } catch (err) {
            console.error("Error en el pago:", err);
            setError(err instanceof Error ? err.message : "Ocurrió un error en el proceso de pago.");
            setLoading(false);
        }
    };

    // Función para crear factura (simulada)
    const crearFactura = async (datosFactura: any, direccionPedido: DireccionPedido) => {
        try {
            // Simular creación de factura
            const idFactura = Math.floor(Math.random() * 10000) + 1;
            const pdfContent = "Contenido del PDF simulado";
            
            return {
                success: true,
                idFactura,
                pdfContent
            };
        } catch (error) {
            console.error("Error al crear factura:", error);
            return {
                success: false,
                error: "Error al crear la factura"
            };
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Pago Simplificado</h2>
            
            <div className="mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-700 mb-2">Resumen del Pedido</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{subtotal.toFixed(2)} DOP</span>
                        </div>
                        <div className="flex justify-between">
                            <span>ITBIS:</span>
                            <span>{itbis.toFixed(2)} DOP</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Descuento:</span>
                            <span>-{descuento.toFixed(2)} DOP</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>{total.toFixed(2)} DOP</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-700 mb-2">Información de Pago</h3>
                    <p className="text-sm text-blue-600">
                        Este es un pago simulado para pruebas. En producción, aquí se integraría con un sistema de pago real.
                    </p>
                </div>
            </div>

            {error && (
                <div className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded">{error}</div>
            )}

            <div className="flex justify-between items-center">
                <span className="text-xl font-semibold text-gray-800">Total: {total.toFixed(2)} DOP</span>
                <button
                    className="bg-green-600 cursor-pointer disabled:bg-gray-300 disabled:cursor-default hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md transition-all"
                    type="submit"
                    disabled={loading || paymentCompleted || !isDireccionCompleta()}
                >
                    {loading ? "Procesando..." : paymentCompleted ? "Pago completado" : "Pagar (Simulado)"}
                </button>
            </div>
        </form>
    );
};

export default SimplePaymentForm; 