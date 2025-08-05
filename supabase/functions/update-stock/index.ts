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
    const { orderItems } = await req.json();

    // Validar parámetros
    if (!orderItems || !Array.isArray(orderItems)) {
      return new Response(JSON.stringify({ error: "orderItems es requerido y debe ser un array" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log("Actualizando stock para items:", orderItems);

    // Simular actualización de stock (para pruebas)
    const updatedItems = orderItems.map((item: any) => ({
      id_producto: item.id_producto,
      cantidad_vendida: item.quantity,
      stock_anterior: "simulado",
      stock_nuevo: "simulado"
    }));

    console.log("Stock actualizado simulado:", updatedItems);

    // Devolver respuesta exitosa
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Stock actualizado correctamente",
        updatedItems
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
    console.error("Error al actualizar stock:", error);
    return new Response(JSON.stringify({ error: "Error en el servidor" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
