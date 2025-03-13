import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom"; // Importa useNavigate
import { useAuth } from "../hooks/useAuth";
import { crearFactura } from "../api/factura";

const CheckoutForm = ({ total, orderItems, clearCart }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false); // Nuevo estado para controlar el estado de la compra
    const navigate = useNavigate(); // Usamos useNavigate para la redirección

    console.log("orderItems", orderItems);

    function getAccessToken() {
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const item = localStorage.getItem(key);
            try {
                const parsedItem = JSON.parse(item);
                if (parsedItem && parsedItem.access_token) {
                    return parsedItem.access_token;
                }
            } catch (error) {
                // Ignorar JSON inválido
            }
        }
        console.log("No se encontró ningún token en localStorage.");
        return null;
    }

    const token = getAccessToken();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);

        const cardElement = elements.getElement(CardElement);

        try {
            // Multiplicar el total por 100 para convertirlo en centavos
            const amountInCents = Math.round(total * 100);

            // Crear el PaymentIntent en el backend
            const response = await fetch(
                "https://pdokbwzmygythqtjroje.supabase.co/functions/v1/create-payment-intent",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amount: amountInCents,
                        currency: "dop",
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("Error al obtener el clientSecret");
            }

            const { clientSecret } = await response.json();

            // Confirmar el pago con Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                    },
                }
            );

            if (error) {
                setError(error.message);
            } else if (paymentIntent.status === "succeeded") {
                console.log("Pago exitoso!");

                // Actualizar el stock después de un pago exitoso
                const updateResponse = await fetch("https://pdokbwzmygythqtjroje.supabase.co/functions/v1/update-stock", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        orderItems, // Enviar los productos comprados para actualizar el stock
                    }),
                });

                if (updateResponse.ok) {
                    console.log("Stock actualizado correctamente");
                    clearCart();
                    setPaymentCompleted(true); 
                    setLoading(false);
                    // Redirigir a la página de éxito después de un pago y actualización exitosos
                    navigate("/factura"); 
                } else {
                    console.error("Error al actualizar el stock");
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error("Error al procesar el pago:", error);
            setError("Ocurrió un error al procesar el pago.");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Formulario de Pago</h2>
            
            <div className="mb-4">
                <CardElement 
                    className="p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" 
                />
            </div>

            {error && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}

            <div className="flex justify-between items-center mt-4">
                <span className="text-xl font-semibold text-gray-800">Total: {total} DOP</span>
                <button
                    className="bg-amber-900 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-md transition-all"
                    type="submit"
                    disabled={loading || paymentCompleted}
                >
                    {loading ? "Procesando..." : paymentCompleted ? "Pago completado" : "Pagar"}
                </button>
            </div>
        </form>
    );
};

export default CheckoutForm;
