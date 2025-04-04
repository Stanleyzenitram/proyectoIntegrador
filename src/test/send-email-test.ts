import { Resend } from 'resend';

async function sendTestEmail() {
  try {
    const resend = new Resend('re_StZEWnjA_CKBroGopk5JGntfknH1ymhdM');

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'josuemorel58@gmail.com',
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });

    if (error) {
      console.error('Error sending email:', error);
      return;
    }

    console.log('Email sent successfully!');
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la prueba
sendTestEmail(); 