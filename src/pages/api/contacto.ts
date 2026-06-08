import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  const data = await request.json();
  const { nombre, email, telefono, asunto, mensaje } = data;

  // Validación básica
  if (!nombre || !email || !asunto || !mensaje) {
    return new Response(
      JSON.stringify({ error: 'Todos los campos requeridos deben estar completos' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Por ahora solo confirmamos que llegaron los datos
  console.log('Formulario recibido:', { nombre, email, telefono, asunto, mensaje });

  return new Response(
    JSON.stringify({ success: true, message: 'Mensaje recibido correctamente' }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};