import { NavLink } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "../components/CheckoutForm";

// Cargar la clave pública de Stripe
const stripePromise = loadStripe(
    "pk_test_51R0GiIFQBuN0FbW6Hqq3PogLIiw9tp4FoGx14hsaMzy71EoUIy9ckmmBGoMbkh0s7nLZmy2Cc0lD7cRUzuzrgh3i00kbU2tfKH"
);

export default function Payment() {
    const {
        items,
        removeItem,
        total,
        tax,
        totalAmount,
        totalWithDiscount,
        subtotal,
        clearCart,
    } = useCart();
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [cardData, setCardData] = useState({
        cardNumber: "",
        cardName: "",
        expiryDate: "",
        cvv: "",
    });
    const [paymentError, setPaymentError] = useState(""); // Para manejar errores de pago

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

    const accessToken = getAccessToken();
    const PAYPAL_FUNCTION_URL =
        "https://pdokbwzmygythqtjroje.supabase.co/functions/v1/create-paypal-order";

    // Función para validar y formatear el número de tarjeta
    const formatCardNumber = (value) => {
        const cleanedValue = value.replace(/\D/g, ""); // Eliminar todo lo que no sea número
        const formattedValue = cleanedValue.match(/.{1,4}/g)?.join(" ") || ""; // Agrupar en bloques de 4
        return formattedValue.slice(0, 19); // Limitar a 16 dígitos + 3 espacios
    };

    // Función para validar y formatear la fecha de expiración
    const formatExpiryDate = (value) => {
        const cleanedValue = value.replace(/\D/g, ""); // Eliminar todo lo que no sea número
        if (cleanedValue.length > 2) {
            return `${cleanedValue.slice(0, 2)}/${cleanedValue.slice(2, 4)}`; // Formato MM/AA
        }
        return cleanedValue;
    };

    // Función para validar y formatear el CVV
    const formatCVV = (value) => {
        const cleanedValue = value.replace(/\D/g, ""); // Eliminar todo lo que no sea número
        return cleanedValue.slice(0, 4); // Limitar a 3 o 4 dígitos
    };

    // Función para validar el formulario antes de procesar el pago
    const validateCardData = () => {
        if (
            !cardData.cardNumber ||
            cardData.cardNumber.replace(/\s/g, "").length !== 16
        ) {
            setPaymentError("Número de tarjeta inválido.");
            return false;
        }
        if (!cardData.cardName || !/^[A-Za-z\s]+$/.test(cardData.cardName)) {
            setPaymentError("Nombre en la tarjeta inválido.");
            return false;
        }
        if (
            !cardData.expiryDate ||
            !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)
        ) {
            setPaymentError("Fecha de expiración inválida.");
            return false;
        }
        if (
            !cardData.cvv ||
            cardData.cvv.length < 3 ||
            cardData.cvv.length > 4
        ) {
            setPaymentError("CVV inválido.");
            return false;
        }
        return true;
    };

    const handlePayment = async () => {
        if (!selectedPayment) return;

        if (selectedPayment === "PayPal") {
            try {
                const width = 600;
                const height = 700;
                const left = (window.innerWidth - width) / 2;
                const top = (window.innerHeight - height) / 2;
                const newWindow = window.open(
                    "",
                    "PayPalPopup",
                    `width=${width},height=${height},top=${top},left=${left},resizable=no,scrollbars=yes`
                );

                const response = await fetch(PAYPAL_FUNCTION_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ amount: totalAmount.toFixed(2) }),
                });

                if (!response.ok) {
                    throw new Error("Error al crear la orden de PayPal");
                }

                const data = await response.json();
                const approveLink = data.links.find(
                    (link) => link.rel === "approve"
                )?.href;
                const orderId = data.id;
                console.log("Order ID recibido:", orderId); // Verifica que el orderId sea correcto
                if (approveLink && newWindow) {
                    newWindow.location.href = approveLink;
                    newWindow.focus();

                    // Esperar que el pago sea aprobado
                    newWindow.onload = async () => {
                        try {
                            const capturePaymentResponse = await fetch(
                                "https://pdokbwzmygythqtjroje.supabase.co/functions/v1/capture-paypal-payment",
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${accessToken}`,
                                    },
                                    body: JSON.stringify({
                                        orderId: orderId,
                                        orderItems: items,
                                    }),
                                }
                            );

                            if (!capturePaymentResponse.ok) {
                                throw new Error("Error al capturar el pago");
                            }

                            const captureData =
                                await capturePaymentResponse.json();
                            if (captureData.error) {
                                throw new Error(captureData.error);
                            } else {
                                console.log(
                                    "Pago capturado correctamente:",
                                    captureData
                                );
                                alert("Pago con PayPal realizado con éxito");
                                clearCart(); // Vaciar el carrito después del pago
                            }
                        } catch (error) {
                            console.error(
                                "Error al capturar el pago:",
                                error.message
                            );
                            setPaymentError(
                                "Error al procesar el pago con PayPal. Inténtelo de nuevo."
                            );
                        }
                    };
                } else {
                    throw new Error(
                        "No se encontró el enlace de aprobación de PayPal."
                    );
                }
            } catch (error) {
                console.error("Error en el pago:", error.message || error);
                setPaymentError(
                    "Error al procesar el pago con PayPal. Inténtelo de nuevo."
                );
            }
        } else if (selectedPayment === "Card") {
            if (!validateCardData()) return; // Validar los datos de la tarjeta

            // Simular el procesamiento del pago con tarjeta
            try {
                console.log("Procesando pago con tarjeta:", cardData);
                setTimeout(() => {
                    console.log("Pago con tarjeta procesado correctamente");
                    alert("Pago con tarjeta realizado con éxito");
                    clearCart(); // Vaciar el carrito después del pago
                }, 2000);
            } catch (error) {
                console.error("Error al procesar el pago con tarjeta:", error);
                setPaymentError(
                    "Error al procesar el pago con tarjeta. Inténtelo de nuevo."
                );
            }
        }
    };

    return (
        <div className="container mx-auto p-4">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Columna 1: Métodos de pago */}
                <div className="w-full md:w-1/2">
                    <div className="flex flex-col space-y-2">
                        <div>
                            <NavLink
                                className="text-gray-400 uppercase hover:text-amber-900 transition"
                                to="/"
                            >
                                Inicio&nbsp;&gt;
                            </NavLink>
                            <NavLink
                                className="text-gray-400 uppercase hover:text-amber-900 transition"
                                to="/"
                            >
                                Carrito&nbsp;&gt;
                            </NavLink>
                            <span className="uppercase text-amber-900">
                                Pago
                            </span>
                        </div>

                        <h1 className="text-amber-900 text-3xl md:text-5xl uppercase mt-4 font-bold">
                            Finalizar compra
                        </h1>
                        <NavLink
                            className="text-amber-900 uppercase hover:text-amber-700 transition"
                            to="/"
                        >
                            Volver al carrito
                        </NavLink>
                    </div>
                    <div className="mt-8">
                        <h2 className="uppercase text-amber-900 text-xl md:text-2xl mb-6 font-semibold">
                            Seleccionar método de pago
                        </h2>
                        <div className="metodosPago flex flex-col items-center space-y-4">
                            <label className="cursor-pointer bg-white w-full max-w-md border border-gray-200 rounded-lg p-6 flex flex-row justify-between items-center hover:shadow-lg transition-shadow">
                                <img
                                    src="https://rappicard.mx/wp-content/uploads/2024/10/logo-paypal.png"
                                    width="108"
                                    height="32"
                                    alt="PayPal"
                                />
                                <h3 className="text-gray-700 font-medium">
                                    PayPal
                                </h3>
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    id="PayPal"
                                    value="PayPal"
                                    className="w-5 h-5 accent-amber-900"
                                    onChange={() =>
                                        setSelectedPayment("PayPal")
                                    }
                                />
                            </label>
                            <label className="cursor-pointer bg-white w-full max-w-md border border-gray-200 rounded-lg p-6 flex flex-row justify-between items-center hover:shadow-lg transition-shadow">
                                <img
                                    src="https://www.mastercard.com.co/content/dam/mccom/global/logos/logo-mastercard-mobile.svg"
                                    width="108"
                                    height="32"
                                    alt="MasterCard"
                                />
                                <h3 className="text-gray-700 font-medium">
                                    Tarjeta de credito o debito
                                </h3>
                                <input
                                    type="radio"
                                    name="metodoPago"
                                    id="Card"
                                    value="Card"
                                    className="w-5 h-5 accent-amber-900"
                                    onChange={() => setSelectedPayment("Card")}
                                />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Columna 2: Resumen del carrito */}
                <div className="w-full md:w-1/2 bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
                    <h2 className="text-amber-900 text-xl md:text-2xl mb-6 font-semibold">
                        Resumen del carrito
                    </h2>
                    {items.map((item) => (
                        <div
                            key={item.id_producto}
                            className="flex justify-between items-center mb-4"
                        >
                            <div className="flex items-center">
                                <img
                                    src={item.imagen}
                                    alt={item.nombre_producto}
                                    className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg"
                                />
                                <div className="flex flex-col ml-4">
                                    <h3 className="text-amber-900 text-sm md:text-base font-medium">
                                        {item.nombre_producto}
                                    </h3>
                                    <p className="text-gray-400 text-sm">
                                        Cantidad: {item.quantity}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        Precio por m^2: ${item.precio}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeItem(item.id_producto)}
                                className="text-amber-900 cursor-pointer text-sm md:text-base hover:text-amber-700 transition"
                            >
                                Eliminar
                            </button>
                        </div>
                    ))}
                    <hr className="w-full border-t border-gray-200 my-4" />

                    <div className="flex justify-between p-1 w-full">
                        <h3 className="text-sm md:text-base text-gray-700">
                            Subtotal
                        </h3>
                        <p className="text-sm md:text-base text-gray-700">
                            RD${subtotal.toFixed(2)}
                        </p>
                    </div>

                    {items.some(item => item.descuento && item.descuento > 0) && (
                        <div className="flex justify-between p-1 w-full">
                            <h3 className="text-sm md:text-base text-gray-700">
                                Descuento
                            </h3>
                            <p className="text-sm md:text-base text-gray-700">
                                -RD${(subtotal - total).toFixed(2)}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between p-1 w-full">
                        <h3 className="text-sm md:text-base text-gray-700">
                            ITBIS (18%)
                        </h3>
                        <p className="text-sm md:text-base text-gray-700">
                            RD${tax.toFixed(2)}
                        </p>
                    </div>

                    <div className="flex justify-between p-1 w-full">
                        <h3 className="text-sm md:text-base text-gray-700 font-semibold">
                            Total
                        </h3>
                        <p className="text-sm md:text-base text-gray-700 font-semibold">
                            RD${totalAmount.toFixed(2)}
                        </p>
                    </div>

                    {/* Formulario de tarjeta o botón de PayPal */}
                    {selectedPayment === "Card" ? (
                        //frm tarjeta///////////////////////////////////////////////////////////////////////////////////////////////////////as /
                        <div className="mt-6">
                            <Elements stripe={stripePromise}>
                                <CheckoutForm
                                    total={totalAmount.toFixed(2)}
                                    orderItems={items}
                                    clearCart={clearCart}
                                    descuento={total - totalWithDiscount}
                                    subtotal={total}
                                    itbis={tax}
                                />
                            </Elements>
                        </div>
                    ) : null}

                    {/* Mostrar errores de pago */}
                    {paymentError && (
                        <div className="mt-4 text-red-600 text-sm">
                            {paymentError}
                        </div>
                    )}

                    {/* Botón de continuar */}
                    <div className="flex justify-center mt-6">
                        <button
                            className={`w-full md:w-1/2 h-12 rounded-lg transition-colors cursor-pointer ${
                                selectedPayment === "PayPal"
                                    ? "bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center gap-2"
                                    : selectedPayment === "Card"
                                    ? "hidden"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                            onClick={handlePayment}
                            disabled={!selectedPayment}
                        >
                            {selectedPayment === "PayPal" ? (
                                <>
                                    <img
                                        src="https://rappicard.mx/wp-content/uploads/2024/10/logo-paypal.png"
                                        width="64"
                                        height="20"
                                        alt="PayPal"
                                    />
                                    Continuar con PayPal
                                </>
                            ) : (
                                "Continuar"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
