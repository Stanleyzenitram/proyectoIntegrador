import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

// Configura Supabase
const supabaseUrl = "https://pdokbwzmygythqtjroje.supabase.co"; // Reemplaza con tu URL de Supabase
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY"); // Asegúrate de que esta variable esté configurada
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // Manejar solicitudes OPTIONS (preflight)
    if (req.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers,
        });
    }

    try {
        // Verificar si la solicitud es POST
        if (req.method !== "POST") {
            return new Response(JSON.stringify({ error: "Método no permitido" }), {
                status: 405,
                headers,
            });
        }

        // Obtener datos del body de la solicitud
        const { orderItems } = await req.json();

        // Validar parámetros
        if (!orderItems || !Array.isArray(orderItems)) {
            return new Response(JSON.stringify({ error: "Faltan parámetros" }), {
                status: 400,
                headers,
            });
        }

        // Validar que cada item en orderItems tenga los campos correctos
        for (const item of orderItems) {
            const { id_producto, quantity } = item; // Cambiar productId por id_producto

            // Validar que id_producto y quantity sean números válidos
            if (typeof id_producto !== 'number' || typeof quantity !== 'number') {
                return new Response(JSON.stringify({ error: "Parametros inválidos" }), {
                    status: 400,
                    headers,
                });
            }

            // Verificar que los valores sean mayores que 0
            if (id_producto <= 0 || quantity <= 0) {
                return new Response(JSON.stringify({ error: "Valores no válidos" }), {
                    status: 400,
                    headers,
                });
            }

            // Obtener el stock actual del producto
            const { data: product, error: fetchError } = await supabase
                .from("productos")
                .select("stock_actual")
                .eq("id_producto", id_producto) // Cambiar productId por id_producto
                .single();

            if (fetchError) {
                console.error("Error al obtener el producto:", fetchError);
                throw fetchError;
            }

            // Calcular el nuevo stock
            const newStock = product.stock_actual - quantity;

            // Verificar si el nuevo stock es válido
            if (newStock < 0) {
                return new Response(JSON.stringify({ error: "Stock insuficiente" }), {
                    status: 400,
                    headers,
                });
            }

            // Actualizar el stock en la base de datos
            const { error: updateError } = await supabase
                .from("productos")
                .update({ stock_actual: newStock })
                .eq("id_producto", id_producto); // Cambiar productId por id_producto

            if (updateError) {
                console.error("Error al actualizar el stock:", updateError);
                throw updateError;
            }

            console.log(`Stock del producto ${id_producto} actualizado a ${newStock}`);
        }

        // Devolver una respuesta exitosa
        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
        });
    } catch (error) {
        console.error("Error al actualizar el stock:", error);
        return new Response(JSON.stringify({ error: "Error en el servidor" }), {
            status: 500,
            headers,
        });
    }
});
