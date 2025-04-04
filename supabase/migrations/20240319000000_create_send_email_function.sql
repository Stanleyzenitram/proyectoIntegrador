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
    api_key text := current_setting('app.settings.resend_api_key', true);
    request_body json;
BEGIN
    -- Construct the request body
    IF attachment_content IS NOT NULL AND attachment_name IS NOT NULL THEN
        request_body := json_build_object(
            'from', 'Venta Cerámicas <onboarding@resend.dev>',
            'to', to_email,
            'subject', email_subject,
            'html', html_content,
            'attachments', json_build_array(
                json_build_object(
                    'filename', attachment_name,
                    'content', attachment_content
                )
            )
        );
    ELSE
        request_body := json_build_object(
            'from', 'Venta Cerámicas <onboarding@resend.dev>',
            'to', to_email,
            'subject', email_subject,
            'html', html_content
        );
    END IF;

    -- Make the HTTP request to Resend API
    SELECT content::json INTO result
    FROM http((
        'POST',
        'https://api.resend.com/emails',
        ARRAY[http_header('Authorization', 'Bearer ' || api_key)],
        'application/json',
        request_body::text
    )::http_request);

    RETURN result;
END;
$$; 