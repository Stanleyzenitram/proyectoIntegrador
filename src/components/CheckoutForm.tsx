import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

const CheckoutForm = ({ total }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener el token de acceso desde localStorage
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

    if (!token) {
      setError("No se ha encontrado el token de acceso.");
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    try {
      // Multiplicar el total por 100 para convertirlo en centavos
      const amountInCents = Math.round(total * 100);

      const response = await fetch("https://pdokbwzmygythqtjroje.supabase.co/functions/v1/create-payment-intent", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInCents, // Enviar el monto en centavos
          currency: "usd",
        }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener el clientSecret");
      }

      const { clientSecret } = await response.json();

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        console.error("Error de pago:", error.message);
        setError(error.message);
      } else if (paymentIntent.status === "succeeded") {
        console.log("Pago exitoso!");
        setLoading(false);
        setError(null);
        // Aquí podrías redirigir al usuario a una página de éxito o mostrar un mensaje de éxito.
      }
    } catch (error) {
      console.error("Error al obtener el clientSecret:", error);
      setLoading(false);
      setError("Ocurrió un error al procesar el pago.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <CardElement />
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button
        className="bg-amber-900 hover:bg-amber-700 text-white mt-5"
        type="submit"
        disabled={!stripe || loading}
      >
        {loading ? "Procesando..." : "Pagar"}
      </button>
    </form>
  );
};

export default CheckoutForm;
