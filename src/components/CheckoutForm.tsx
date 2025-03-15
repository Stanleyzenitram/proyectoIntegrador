import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { crearFactura } from "../api/factura";

interface CartItem {
    id_producto: string;
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
    const [error, setError] = useState(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();
    const [metodo_Pago, setMetodoPago] = useState("Tarjeta de Crédito o Débito");

    const datosFactura = {
        id: user?.id,
        fechaActual: new Date().toISOString().split("T")[0],
        descuento: descuento.toFixed(2),
        estado: "valida",
        subtotal,
        itbis,
        total,
        productos: orderItems.map((item) => ({
            idProducto: item.id_producto,
            cantidad: item.quantity,
            precioUnit: item.precio,
            subtotal: (item.precio * item.quantity).toFixed(2),
        })),
        metodoPago: metodo_Pago,
    };

    const isDireccionCompleta = () => {
        return (
            direccionPedido.calle.trim() !== "" &&
            direccionPedido.ciudad.trim() !== "" &&
            direccionPedido.provincia.trim() !== "" &&
            direccionPedido.codigo_postal.trim() !== ""
        );
    };

    function getAccessToken() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const item = localStorage.getItem(key);
            try {
                const parsedItem = JSON.parse(item);
                if (parsedItem && parsedItem.access_token) {
                    return parsedItem.access_token;
                }
            } catch (error) {}
        }
        console.log("No se encontró ningún token en localStorage.");
        return null;
    }

    const token = getAccessToken();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        try {
            const amountInCents = Math.round(total * 100);
            const response = await fetch(
                "https://pdokbwzmygythqtjroje.supabase.co/functions/v1/create-payment-intent",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ amount: amountInCents, currency: "dop" }),
                }
            );

            if (!response.ok) {
                throw new Error("Error al obtener el clientSecret");
            }

            const { clientSecret } = await response.json();
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                { payment_method: { card: cardElement } }
            );

            if (error) {
                throw new Error(error.message);
            }

            if (paymentIntent.status === "succeeded") {
                console.log("Pago exitoso!");

                const updateResponse = await fetch(
                    "https://pdokbwzmygythqtjroje.supabase.co/functions/v1/update-stock",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({ orderItems }),
                    }
                );

                if (!updateResponse.ok) {
                    throw new Error("Error al actualizar el stock");
                }

                console.log("Stock actualizado correctamente");
                clearCart();
                setPaymentCompleted(true);
                setLoading(false);

                const result = await crearFactura(datosFactura, direccionPedido);
                if (result.success) {
                    console.log("Factura creada con éxito, ID:", result.idFactura);
                    navigate(`/factura/${result.idFactura}`);
                } else {
                    throw new Error("Error al crear la factura.");
                }
            }
        } catch (error) {
            console.error("Error en el pago:", error);
            setError(error.message || "Ocurrió un error en el proceso de pago.");
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
