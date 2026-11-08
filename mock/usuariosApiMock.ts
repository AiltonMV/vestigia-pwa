import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mockPlugin, readBody, send, sendError } from './mockHttp.ts';

/**
 * In-memory `/api/v1/usuarios` that follows the backend contract (201, 400 with `details`,
 * 409 on a repeated email), so the page can be demoed before the real backend is up.
 * Enabled with `VITE_API_MOCK=true`.
 */

type Rol = 'admin' | 'jugador';

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  creado_en: string;
}

const ROLES: Rol[] = ['admin', 'jugador'];
const BASE = '/api/v1/usuarios';
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const usuarios: Usuario[] = [
  {
    id: '44444444-4444-4444-8444-444444444444',
    nombre: 'Usuario de prueba',
    correo: 'prueba@vestigia.site',
    rol: 'admin',
    creado_en: '2026-11-06T18:00:00Z',
  },
];

function validate(body: Partial<Usuario>) {
  const details: { field: string; message: string }[] = [];
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const correo = typeof body.correo === 'string' ? body.correo.trim() : '';
  if (!nombre) details.push({ field: 'nombre', message: 'es obligatorio' });
  else if (nombre.length > 100) details.push({ field: 'nombre', message: 'máximo 100 caracteres' });
  if (!correo) details.push({ field: 'correo', message: 'es obligatorio' });
  else if (!CORREO.test(correo))
    details.push({ field: 'correo', message: 'no es un correo válido' });
  if (!body.rol) details.push({ field: 'rol', message: 'es obligatorio' });
  return details;
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const path = new URL(req.url ?? '/', 'http://mock').pathname;
  if (path !== BASE) return sendError(res, path, 404, 'Ruta no encontrada');
  if (req.method === 'GET') return send(res, 200, usuarios);
  if (req.method !== 'POST') return sendError(res, path, 404, 'Ruta no encontrada');

  let body: Partial<Usuario>;
  try {
    body = (await readBody(req)) as Partial<Usuario>;
  } catch {
    return sendError(res, path, 400, 'JSON malformado o ilegible');
  }
  // Like Jackson: an unknown enum value is unreadable JSON, not a field error.
  if (body.rol !== undefined && !ROLES.includes(body.rol)) {
    return sendError(res, path, 400, 'JSON malformado o ilegible');
  }
  const details = validate(body);
  if (details.length) return sendError(res, path, 400, 'Datos inválidos', details);

  const correo = body.correo!.trim().toLowerCase();
  if (usuarios.some((usuario) => usuario.correo === correo)) {
    return sendError(res, path, 409, `Ya existe un usuario con el correo '${correo}'`);
  }
  const usuario: Usuario = {
    id: randomUUID(),
    nombre: body.nombre!.trim(),
    correo,
    rol: body.rol!,
    creado_en: new Date().toISOString(),
  };
  usuarios.unshift(usuario);
  return send(res, 201, usuario);
}

export const usuariosApiMock = () => mockPlugin('vestigia-usuarios-api-mock', BASE, handle);
