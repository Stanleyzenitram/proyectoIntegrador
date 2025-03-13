    import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
    import Stripe from "https://esm.sh/stripe?target=deno&no-check";

    // Configura Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
    apiVersion: "2023-10-16",
    });

    serve(async (req) => {
    const headers = {
        "Access-Control-Allow-Origin": "*", // Permitir solicitudes desde cualquier origen
        "Access-Control-Allow-Methods": "POST, OPTIONS", // Permitir métodos POST y OPTIONS
        "Access-Control-Allow-Headers": "Content-Type, Authorization", // Permitir estos encabezados
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
        const { amount, currency } = await req.json();

        // Validar parámetros
        if (!amount || !currency) {
        return new Response(JSON.stringify({ error: "Faltan parámetros" }), {
            status: 400,
            headers,
        });
        }

        // Crear el PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        });

        console.log("PaymentIntent creado:", paymentIntent);

        // Devolver el clientSecret del PaymentIntent
        return new Response(
        JSON.stringify({ clientSecret: paymentIntent.client_secret }),
        {
            status: 200,
            headers: {
            "Content-Type": "application/json",
            ...headers, // Incluir encabezados CORS
            },
        }
        );
    } catch (error) {
        // Manejo de errores
        console.error("Error en el proceso de Stripe:", error);
        return new Response(JSON.stringify({ error: "Error en el servidor" }), {
        status: 500,
        headers,
        });
    }
    });
