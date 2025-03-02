import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import axios from "axios";

const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // URL de PayPal Sandbox
const CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const SECRET = Deno.env.get("PAYPAL_SECRET");

if (!CLIENT_ID || !SECRET) {
  throw new Error("Faltan las credenciales de PayPal");
}

const getAccessToken = async () => {
  const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
    auth: {
      username: CLIENT_ID,
      password: SECRET,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return response.data.access_token;
};

const createOrder = async (accessToken: string, amount: string) => {
  const response = await axios.post(
    `${PAYPAL_API}/v2/checkout/orders`,
    {
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: amount,
          },
          description: "Compra en mi tienda",
        },
      ],
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  return response.data;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { amount } = await req.json();
    const accessToken = await getAccessToken();
    const order = await createOrder(accessToken, amount);

    return new Response(JSON.stringify(order), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Permitir cualquier origen
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
