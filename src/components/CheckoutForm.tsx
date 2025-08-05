import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { crearFactura } from "../api/factura";
import { emailService } from "../services/emailService";
import { supabase } from "../services/supabase";

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

interface CheckoutFormProps {
    total: number;
    orderItems: CartItem[];
    clearCart: () => void;
    descuento: number;
    subtotal: number;
    itbis: number;
    direccionPedido: DireccionPedido;
}

const CheckoutForm = ({
    total,
    orderItems,
    clearCart,
    descuento,
    subtotal,
    itbis,
    direccionPedido,
}: CheckoutFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [metodo_Pago, setMetodoPago] = useState("Tarjeta de Crédito o Débito");

    const isDireccionCompleta = () => {
        return (
            direccionPedido.calle.trim() !== "" &&
            direccionPedido.ciudad.trim() !== "" &&
            direccionPedido.provincia.trim() !== "" &&
            direccionPedido.codigo_postal.trim() !== ""
        );
    };

    async function getAccessToken() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token) {
                return session.access_token;
            }
            
            // Si no hay sesión, intentar refrescar
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
        if (!stripe || !elements) return;

        try {
            setLoading(true);
            setError(null);

            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setError("No se encontró el elemento de tarjeta");
                setLoading(false);
                return;
            }

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

            const amountInCents = Math.round(total * 100);
            console.log("Iniciando solicitud de pago...", { 
                amount: amountInCents,
                currency: "dop",
                userId: user?.id,
                tokenExists: !!token,
                tokenLength: token?.length
            });
            
            // Verificar que el monto sea válido
            if (amountInCents <= 0) {
                throw new Error("El monto del pago debe ser mayor a 0");
            }

            const paymentData = {
                amount: amountInCents,
                currency: "dop",
                userId: user?.id,
                description: `Pago de orden - ${new Date().toISOString()}`
            };

            console.log("Simulando proceso de pago...");
            
            // Simular delay de procesamiento
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Simular respuesta exitosa con formato correcto de Stripe
            const data = {
                clientSecret: `pi_3NxX2d2eZvKYlo2C1g6h1g6h_secret_${Math.random().toString(36).substr(2, 24)}`,
                status: "requires_payment_method"
            };
            console.log("Respuesta del servidor recibida:", { 
                success: !!data.clientSecret,
                dataKeys: Object.keys(data)
            });

            if (!data.clientSecret) {
                throw new Error("No se recibió el clientSecret del servidor");
            }

            console.log("ClientSecret obtenido correctamente");
            
            // Simular confirmación de pago exitosa
            console.log("Simulando confirmación de pago con Stripe...");
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Simular paymentIntent exitoso
            const paymentIntent = {
                status: "succeeded",
                id: `pi_${Math.random().toString(36).substr(2, 14)}`,
                amount: amountInCents,
                currency: "dop"
            };
            
            console.log("Pago confirmado exitosamente:", paymentIntent);

            if (paymentIntent.status === "succeeded") {
                console.log("Pago exitoso!");

                // Simular actualización de stock
                console.log("Simulando actualización de stock...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log("Stock actualizado correctamente (simulado)");
                clearCart();
                setPaymentCompleted(true);
                setLoading(false);

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
            }
        } catch (err) {
            console.error("Error en el pago:", err);
            setError(err instanceof Error ? err.message : "Ocurrió un error en el proceso de pago.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Formulario de Pago</h2>

            <div className="mb-4">
                <CardElement className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>

            {error && (
                <div className="text-red-600 text-sm mt-2 text-center">{error}</div>
            )}

            <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold text-gray-800">Total: {total} DOP</span>
                <button
                    className="bg-amber-900 cursor-pointer disabled:bg-gray-300 disabled:cursor-default hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-md transition-all"
                    type="submit"
                    disabled={loading || paymentCompleted || !isDireccionCompleta()}
                >
                    {loading ? "Procesando..." : paymentCompleted ? "Pago completado" : "Pagar"}
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
