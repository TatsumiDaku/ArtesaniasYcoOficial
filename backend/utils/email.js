const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envía un email usando Resend
 * @param {Object} options
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Contenido HTML
 */
async function enviarCorreo({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Artesanías & Co <somos@artesaniasyco.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
    return data;
  } catch (err) {
    console.error('Error en enviarCorreo:', err);
    throw err;
  }
}

module.exports = { enviarCorreo }; 