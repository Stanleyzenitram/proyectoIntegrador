import { useEffect, useState } from "react";
import axios from "axios";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { crearFactura } from "../api/factura";
import { emailService } from "../services/emailService";



interface Props {
  amountDOP: string;
}

interface PaypalButtonComponentProps {
  amountUSD: string;
}

const PaypalButtonComponent = ({ amountUSD }: PaypalButtonComponentProps) => {
  const navigate = useNavigate();
  
  const initialOptions = {
    clientId: "AdN2tBQb3bumKDihJAWn2wkgGdKaNfs2xubmWv6WAIF5lfofH33mY7X035Fkmj-Qi6SgL2w_e4c04YAU",
    currency: "USD",
    intent: "capture",
  };

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amountUSD,
          },
        },
      ],
    });
  };

  const onApprove = (data: any, actions: any) => {
    return actions.order.capture().then((details: any) => {
      navigate(`/factura}`);
      alert(`Transacción completada por ${details.payer.name.given_name}`);
    });
  };

  return (
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
      />
    </PayPalScriptProvider>
  );
};

export default function PaypalButton({ amountDOP }: Props) {
  const [amountUSD, setAmountUSD] = useState<string | null>(null);

  const obtenerTasaDeCambio = async () => {
    const url = `https://v6.exchangerate-api.com/v6/cf49190a18cb0a84e205aa53/latest/USD`;

    try {
      const response = await axios.get(url);
      if (!response.data || !response.data.conversion_rates) {
        throw new Error("Respuesta inválida de la API de conversión.");
      }
      return response.data.conversion_rates.DOP;
    } catch (error: any) {
      console.error("Error obteniendo la tasa de cambio:", error.message);
      throw new Error("No se pudo obtener la tasa de cambio.");
    }
  };

  useEffect(() => {
    const convertirMoneda = async () => {
      try {
        const tasa = await obtenerTasaDeCambio();
        const usd = (+amountDOP / tasa).toFixed(2);
        setAmountUSD(usd);
        console.log(`Creando orden de PayPal por ${usd} USD...`);
      } catch (err) {
        console.error("Error en la conversión:", err);
      }
    };

    convertirMoneda();
  }, [amountDOP]);

  return (
    <div>
      {amountUSD ? (
        <PaypalButtonComponent amountUSD={amountUSD} />
      ) : (
        <p>Cargando...</p>
      )}
    </div>
  );
}
