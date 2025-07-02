const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Genera una plantilla HTML con el diseño de Artesanías & Co
 * @param {Object} options
 * @param {string} options.title - Título del email
 * @param {string} options.content - Contenido HTML del email
 * @param {string} options.footer - Contenido del footer (opcional)
 */
function generateEmailTemplate({ title, content, footer }) {
  const logoUrl = 'https://artesaniasyco.com/static/LogoIncial.png';
  const defaultFooter = `
    <p style="font-size: 0.97rem; color: #666; margin-bottom: 0;">
      ¿Tienes dudas o necesitas ayuda? Escríbenos a <a href="mailto:somos@artesaniasyco.com" style="color:#ea580c;">somos@artesaniasyco.com</a>.<br>
      ¡Gracias por confiar en nosotros y en el arte colombiano!
    </p>
  `;

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 12px #0001; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <img src='${logoUrl}' alt='Logo Artesanías & Co' style='width: 90px; margin-bottom: 12px; height: auto;'/>
        <h2 style="color: #ea580c; margin: 0; font-size: 2rem; letter-spacing: 1px;">Artesanías & Co</h2>
        ${title ? `<p style="color: #666; margin-top: 8px; font-size: 1.1rem;">${title}</p>` : ''}
      </div>
      ${content}
      <hr style="margin:28px 0; border:none; border-top:1px solid #eee;">
      ${footer || defaultFooter}
    </div>
  `;
}

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

module.exports = { enviarCorreo, generateEmailTemplate }; 