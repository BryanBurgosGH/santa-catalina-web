import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { nombre, email, telefono, asunto, mensaje } = data;

  if (!nombre || !email || !asunto || !mensaje) {
    return new Response(
      JSON.stringify({ error: 'Todos los campos requeridos deben estar completos' }),
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
      subject: `Nuevo mensaje: ${asunto}`,
      html: `
        <h2>Nuevo mensaje desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefono || 'No proporcionado'}</p>
        <p><strong>Asunto:</strong> ${asunto}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${mensaje}</p>
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