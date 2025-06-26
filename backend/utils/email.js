const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // o 587
  secure: true, // true para 465, false para 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía un email usando Nodemailer
 * @param {Object} options
 * @param {string} options.to - Destinatario
 * @param {string} options.subject - Asunto
 * @param {string} options.html - Contenido HTML
 */
async function sendEmail({ to, subject, html }) {
  const mailOptions = {
    from: `Artesanías & Co <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };
  console.log('Enviando email a:', to, 'con asunto:', subject);
  try {
    const result = await transporter.sendMail(mailOptions);
    console.log('Email enviado correctamente:', result.response);
    return result;
  } catch (error) {
    console.error('Error enviando email:', error);
    throw error;
  }
}

module.exports = { sendEmail }; 