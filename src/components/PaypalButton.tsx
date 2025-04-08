import { useEffect, useState } from "react";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
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

interface Props {
  amountDOP: number;
  orderItems: CartItem[];
  clearCart: () => void;
  descuento: number;
  subtotal: number;
  itbis: number;
  direccionPedido: DireccionPedido;
}

export default function PaypalButton({
  amountDOP,
  orderItems,
  clearCart,
  descuento,
  subtotal,
  itbis,
  direccionPedido,
}: Props) {
  const [amountUSD, setAmountUSD] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const metodo_Pago = "Paypal";

  const [direccionInvalida, setDireccionInvalida] = useState(false);

  const direccionEsValida = () => {
    return (
      direccionPedido.calle.trim() !== "" &&
      direccionPedido.ciudad.trim() !== "" &&
      direccionPedido.provincia.trim() !== "" &&
      direccionPedido.codigo_postal.trim() !== ""
    );
  };

  useEffect(() => {
    setDireccionInvalida(!direccionEsValida());
  }, [direccionPedido]);

  const obtenerTasaDeCambio = async () => {
    const url = `https://v6.exchangerate-api.com/v6/cf49190a18cb0a84e205aa53/latest/USD`;
    const response = await axios.get(url);
    return response.data.conversion_rates.DOP;
  };

  useEffect(() => {
    const convertirMoneda = async () => {
      try {
        const tasa = await obtenerTasaDeCambio();
        const usd = (+amountDOP / tasa).toFixed(2);
        setAmountUSD(usd);
      } catch (err) {
        console.error("Error obteniendo la tasa de cambio:", err);
      }
    };

    convertirMoneda();
  }, [amountDOP]);

  const getAccessToken = () => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const item = localStorage.getItem(key);
      try {
        const parsedItem = JSON.parse(item);
        if (parsedItem?.access_token) return parsedItem.access_token;
      } catch (_) {}
    }
    return null;
  };

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amountUSD!,
          },
        },
      ],
    });
  };

  const onApprove = async (data: any, actions: any) => {
    if (!direccionEsValida()) {
      setDireccionInvalida(true);
      alert("Por favor, completa la dirección de envío antes de continuar.");
      return;
    }

    try {
      const details = await actions.order.capture();
      alert(`Transacción completada por ${details.payer.name.given_name}`);

      if (!user?.id) throw new Error("Usuario no autenticado");

      const token = getAccessToken();

      const { data: clienteData, error: clienteError } = await supabase
        .from("clientes")
        .select("*")
        .eq("uuid", user.id)
        .single();

      if (clienteError || !clienteData)
        throw new Error("Cliente no encontrado");

      const datosFactura = {
        id: clienteData.id_cliente,
        fechaActual: new Date().toISOString().split("T")[0],
        descuento_total: Number(descuento.toFixed(2)),
        estado: "valida",
        sub_total: Number(subtotal),
        total: Number(amountDOP),
        productos: orderItems.map((item) => ({
          idProducto: Number(item.id_producto),
          cantidad: Number(item.quantity),
          precioUnit: Number(item.precio),
          subtotal: Number((item.precio * item.quantity).toFixed(2)),
          nombre_producto: item.nombre_producto,
        })),
        metodoPago: metodo_Pago,
        nombre_cliente: clienteData.nombre,
        email_cliente: clienteData.email,
        telefono_cliente: clienteData.telefono,
      };

      // 1. Actualizar stock
      const stockRes = await fetch(
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

      if (!stockRes.ok) {
        const errText = await stockRes.text();
        throw new Error(`Error al actualizar el stock: ${errText}`);
      }

      // 2. Crear factura
      const result = await crearFactura(datosFactura, direccionPedido);
      if (!result.success) throw new Error("No se pudo crear la factura");

      // 3. Enviar por correo
      if (!user.email)
        throw new Error("No se puede enviar la factura por email");
      await emailService.sendInvoice(
        user.email,
        result.idFactura.toString(),
        result.pdfContent
      );

      // 4. Limpiar carrito y redirigir
      clearCart();
      navigate(`/factura/${result.idFactura}`);
    } catch (err) {
      console.error("Error post-pago:", err);
      alert("Ocurrió un error después del pago.");
    }
  };

  const initialOptions = {
    clientId:
      "AdN2tBQb3bumKDihJAWn2wkgGdKaNfs2xubmWv6WAIF5lfofH33mY7X035Fkmj-Qi6SgL2w_e4c04YAU",
    currency: "USD",
    intent: "capture",
  };

  return (
    <div>
      {amountUSD ? (
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            fundingSource="paypal"
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "paypal",
              height: 40,
            }}
            createOrder={createOrder}
            onApprove={onApprove}
            disabled={!direccionEsValida()}
          />
          {direccionInvalida && (
            <p style={{ color: "red", marginTop: "8px" }}>
              ⚠️ Debes completar todos los campos de dirección antes de pagar.
            </p>
          )}
        </PayPalScriptProvider>
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
