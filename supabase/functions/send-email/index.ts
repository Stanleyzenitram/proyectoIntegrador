import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RESEND_API_KEY = 're_StZEWnjA_CKBroGopk5JGntfknH1ymhdM';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, subject, html, attachments } = await req.json();

    // Enviar correo usando la API de Resend directamente
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Venta Cerámicas <onboarding@resend.dev>',
        to: ['josuemorel58@gmail.com'], // Siempre enviamos a tu correo en desarrollo
        subject: '[TEST] ' + subject,
        html: html,
        attachments: attachments
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Error al enviar el correo');
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error al enviar correo:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
}); 