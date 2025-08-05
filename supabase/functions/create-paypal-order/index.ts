import { serve } from "https://deno.land/std@0.131.0/http/server.ts";

const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // URL de PayPal Sandbox
const CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const SECRET = Deno.env.get("PAYPAL_SECRET");
const EXCHANGE_API_KEY = Deno.env.get("EXCHANGE_API_KEY"); // Asegúrate de guardar esta API Key en Supabase

if (!CLIENT_ID || !SECRET || !EXCHANGE_API_KEY) {
  throw new Error("Faltan las credenciales necesarias.");
}

// Obtener token de acceso de PayPal
const getAccessToken = async () => {
  try {
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(`${CLIENT_ID}:${SECRET}`)}`
      },
      body: "grant_type=client_credentials"
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error obteniendo el token de PayPal:", error.message);
    throw new Error("No se pudo obtener el token de PayPal.");
  }
};

// Obtener tasa de cambio USD -> DOP
const obtenerTasaDeCambio = async () => {
  const url = `https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/latest/USD`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data || !data.conversion_rates) {
      throw new Error("Respuesta inválida de la API de conversión.");
    }
    return data.conversion_rates.DOP;
  } catch (error) {
    console.error("Error obteniendo la tasa de cambio:", error.message);
    throw new Error("No se pudo obtener la tasa de cambio.");
  }
};

// Crear una orden en PayPal
const createOrder = async (accessToken: string, amountDOP: number) => {
  try {
    if (!amountDOP || amountDOP <= 0) {
      throw new Error("El monto debe ser mayor a 0.");
    }
    
    // Convertir DOP a USD
    const tasaDeCambio = await obtenerTasaDeCambio();
    const amountUSD = (amountDOP / tasaDeCambio).toFixed(2);
    console.log(`Creando orden de PayPal por ${amountUSD} USD...`);
    
    // Crear orden en PayPal
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: amountUSD
            },
            description: "Compra en mi tienda"
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error creando la orden de PayPal:", error.message);
    throw new Error("No se pudo crear la orden en PayPal.");
  }
};

// Servidor Edge Function
serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const { amount } = await req.json();
    if (!amount || isNaN(amount)) {
      throw new Error("Monto inválido.");
    }
    
    const accessToken = await getAccessToken();
    const order = await createOrder(accessToken, amount);
    
    return new Response(JSON.stringify(order), {
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Error en la función:", error.message);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
