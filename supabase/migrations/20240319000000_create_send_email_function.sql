-- Create the send_email function
CREATE OR REPLACE FUNCTION public.send_email(
    to_email text,
    email_subject text,
    html_content text,
    attachment_name text DEFAULT NULL,
    attachment_content text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    api_key text := 're_123456789'; -- API key directamente en el código (solo para pruebas)
    request_body json;
BEGIN
    -- En desarrollo, siempre enviamos a tu correo
    request_body := json_build_object(
        'from', 'Venta Cerámicas <onboarding@resend.dev>',
        'to', ARRAY['josuemorel58@gmail.com'], -- Ahora enviamos como array
        'subject', '[TEST] ' || email_subject,
        'html', html_content
    );

    -- Log para depuración
    RAISE NOTICE 'Intentando enviar correo con: %', request_body;

    -- Make the HTTP request to Resend API
    SELECT content::json INTO result
    FROM http((
        'POST',
        'https://api.resend.com/emails',
        ARRAY[http_header('Authorization', 'Bearer ' || api_key)],
        'application/json',
        request_body::text
    )::http_request);

    -- Log del resultado
    RAISE NOTICE 'Resultado del envío: %', result;

    RETURN result;
END;
$$; 