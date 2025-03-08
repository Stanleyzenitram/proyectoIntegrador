import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import axios from "https://esm.sh/axios@1.4.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const PAYPAL_API = "https://api-m.sandbox.paypal.com"; // Cambiar a producción si es necesario
const CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const SECRET = Deno.env.get("PAYPAL_SECRET");

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!CLIENT_ID || !SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Faltan variables de entorno");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const getAccessToken = async () => {
  try {
    const response = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, "grant_type=client_credentials", {
      auth: { username: CLIENT_ID, password: SECRET },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log("Access token obtenido:", response.data.access_token); // Log
    return response.data.access_token;
  } catch (error) {
    console.error("Error al obtener el token de acceso:", error.response?.data || error.message); 
    throw new Error("Error al obtener el token de acceso de PayPal.");
  }
};

const capturePayment = async (accessToken: string, orderId: string) => {
    try {
      console.log("Capturando pago para el orderId:", orderId); // Log
  
      const response = await axios.post(
        `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      console.log("Respuesta de PayPal:", response.data); // Log
  
      // Verifica el estado del pago
      if (response.data.status === "COMPLETED") {
        console.log("Pago completado exitosamente:", response.data);
        return response.data;
      } else {
        throw new Error("El pago no se completó.");
      }
    } catch (error) {
      console.error("Error al capturar el pago para el orderId:", orderId, error.response?.data || error.message);
      throw new Error("Error al capturar el pago.");
    }
  };
  
  // Asegúrate de que la actualización del stock se ejecute después de un pago exitoso.
  const updateStock = async (orderItems: any[]) => {
    try {
      for (const item of orderItems) {
        const { id_producto, quantity } = item;
  
        // Obtener el stock actual
        const { data, error } = await supabase
          .from("productos")
          .select("stock")
          .eq("id_producto", id_producto)
          .single();
  
        if (error || !data) {
          console.error("Error obteniendo stock para id_producto:", id_producto, error);
          throw new Error("No se pudo obtener el stock del producto.");
        }
  
        const nuevoStock = data.stock - quantity;
  
        // Actualizar el stock en la base de datos
        const { error: updateError } = await supabase
          .from("productos")
          .update({ stock: nuevoStock })
          .eq("id_producto", id_producto);
  
        if (updateError) {
          console.error("Error actualizando stock para id_producto:", id_producto, updateError);
          throw new Error("No se pudo actualizar el stock.");
        }
  
        console.log(`Stock actualizado para id_producto: ${id_producto}, nuevo stock: ${nuevoStock}`);
      }
    } catch (error) {
      console.error("Error al actualizar el stock:", error.message);
      throw new Error("No se pudo actualizar el stock.");
    }
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
    const { orderId, orderItems } = await req.json();
    const accessToken = await getAccessToken();
    const payment = await capturePayment(accessToken, orderId);

    if (payment.status === "COMPLETED") {
      await updateStock(orderItems);
    }

    return new Response(JSON.stringify(payment), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    console.error("Error general en el proceso de pago:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
