import { supabase } from './supabase';

interface EmailAttachment {
    filename: string;
    content: string;
}

interface SendEmailParams {
    to: string;
    subject: string;
    html: string;
    attachments?: EmailAttachment[];
}

class EmailService {
    async sendEmail(params: SendEmailParams) {
        try {
            console.log('Intentando enviar correo a:', params.to);
            
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: {
                    to: params.to,
                    subject: params.subject,
                    html: params.html,
                    attachments: params.attachments
                }
            });

            if (error) {
                console.error('Error detallado al enviar correo:', error);
                throw new Error(`Error al enviar correo: ${error.message}`);
            }

            console.log('Correo enviado exitosamente:', data);
            return data;
        } catch (error: any) {
            console.error('Error en el servicio de correo:', error);
            throw new Error(`Error en el servicio de correo: ${error.message || 'Error desconocido'}`);
        }
    }

    async sendInvoice(to: string, invoiceId: string, pdfContent: string) {
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #A65D03;">¡Gracias por tu compra!</h2>
                <p>Adjunto encontrarás la factura de tu compra.</p>
                <p>Número de factura: ${invoiceId}</p>
                <p style="margin-top: 20px;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="color: #666; font-size: 12px;">
                        Este es un correo automático, por favor no responder.
                    </p>
                </div>
            </div>
        `;

        // Asegurarse de que el contenido PDF esté en base64 sin el prefijo
        const base64Content = pdfContent.includes('base64,') 
            ? pdfContent.split('base64,')[1] 
            : pdfContent;

        return this.sendEmail({
            to,
            subject: `Factura #${invoiceId} - Venta Cerámicas`,
            html: htmlContent,
            attachments: [{
                filename: `factura-${invoiceId}.pdf`,
                content: base64Content
            }]
        });
    }

    async sendOrderConfirmation(to: string, orderNumber: string, orderDetails: any) {
        return this.sendEmail({
            to,
            subject: `Confirmación de Orden #${orderNumber} - Venta Cerámicas`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #A96D00; text-align: center;">¡Gracias por tu orden!</h1>
                    <p>Tu orden #${orderNumber} ha sido confirmada.</p>
                    <h2 style="color: #555;">Detalles del pedido:</h2>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
                        <pre style="margin: 0; white-space: pre-wrap;">${JSON.stringify(orderDetails, null, 2)}</pre>
                    </div>
                    <div style="margin-top: 20px; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
                        <p style="margin: 0; color: #666;">Venta Cerámicas</p>
                        <p style="margin: 5px 0; color: #666;">Tel: (809) 123-4567</p>
                        <p style="margin: 0; color: #666;">Email: info@ventaceramicas.com</p>
                    </div>
                </div>
            `
        });
    }
}

export const emailService = new EmailService(); 