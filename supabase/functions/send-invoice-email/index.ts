import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";
import { generateInvoicePDF } from "../_shared/invoice-pdf.ts";

const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { invoiceId, email } = await req.json();

    // Obtener los datos de la factura
    const { data: invoice, error: invoiceError } = await supabaseClient
      .from("facturas")
      .select(`
        *,
        cliente:clientes(*),
        productos:factura_productos(*, producto:productos(*))
      `)
      .eq("id", invoiceId)
      .single();

    if (invoiceError) throw invoiceError;

    // Generar el PDF de la factura
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Enviar el correo electrónico
    const { error: emailError } = await supabaseClient.functions.invoke("send-email", {
      body: {
        to: email,
        subject: `Factura #${invoice.numero_factura} - ${invoice.cliente.nombre}`,
        text: `Gracias por su compra. Adjunto encontrará su factura #${invoice.numero_factura}.`,
        attachments: [{
          filename: `factura-${invoice.numero_factura}.pdf`,
          content: pdfBuffer.toString("base64"),
          contentType: "application/pdf"
        }]
      }
    });

    if (emailError) throw emailError;

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
}); 