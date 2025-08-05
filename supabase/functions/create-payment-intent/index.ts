import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  // Manejar solicitudes OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Verificar si la solicitud es POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Método no permitido" }), {
        status: 405,
        headers: corsHeaders,
      });
    }

    // Obtener datos del body de la solicitud
    const { amount, currency, userId } = await req.json();

    // Validar parámetros
    if (!amount || !currency || !userId) {
      return new Response(JSON.stringify({ error: "Faltan parámetros requeridos" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Simular un PaymentIntent (para pruebas sin Stripe)
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log("PaymentIntent simulado creado:", {
      amount,
      currency,
      userId,
      clientSecret: mockClientSecret
    });

    // Devolver el clientSecret simulado
    return new Response(
      JSON.stringify({ 
        clientSecret: mockClientSecret,
        status: "requires_payment_method"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    // Manejo de errores
    console.error("Error en el proceso de pago:", error);
    return new Response(JSON.stringify({ error: "Error en el servidor" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
