import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  if (!/^[\d\s+()\-]+$/.test(phone)) return false;
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const nombre: string = (data.nombre ?? '').toString().trim();
  const email: string = (data.email ?? '').toString().trim();
  const telefono: string = (data.telefono ?? '').toString().trim();
  const asunto: string = (data.asunto ?? '').toString().trim();
  const mensaje: string = (data.mensaje ?? '').toString().trim();

  if (!nombre || !email || !asunto || !mensaje) {
    return new Response(
      JSON.stringify({ error: 'Todos los campos requeridos deben estar completos' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!isValidEmail(email)) {
    return new Response(
      JSON.stringify({ error: 'El formato del correo electrónico no es válido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!isValidPhone(telefono)) {
    return new Response(
      JSON.stringify({ error: 'El formato del teléfono no es válido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (nombre.length > 100 || asunto.length > 150 || mensaje.length > 1000) {
    return new Response(
      JSON.stringify({ error: 'Uno o más campos exceden la longitud máxima permitida' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      host: import.meta.env.SMTP_HOST,
      port: Number(import.meta.env.SMTP_PORT),
      secure: false,
      auth: {
        user: import.meta.env.SMTP_USER,
        pass: import.meta.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Clínica Santa Catalina" <${import.meta.env.SMTP_FROM}>`,
      to: import.meta.env.SMTP_TO,
      subject: `Nuevo mensaje: ${escapeHtml(asunto)}`,
      html: `
        <h2>Nuevo mensaje desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${escapeHtml(nombre)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Teléfono:</strong> ${telefono ? escapeHtml(telefono) : 'No proporcionado'}</p>
        <p><strong>Asunto:</strong> ${escapeHtml(asunto)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escapeHtml(mensaje)}</p>
      `,
      replyTo: email,
    });

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error enviando correo:', error);
    return new Response(
      JSON.stringify({ error: 'Error al enviar el mensaje' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
