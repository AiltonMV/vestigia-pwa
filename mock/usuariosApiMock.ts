import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mockPlugin, readBody, send, sendError } from './mockHttp.ts';

/**
 * In-memory admin login (`/api/v1/auth`) and `/api/v1/admin/usuarios` that follow the backend
 * contract (Bearer token, 401, 400 with `details`, 409 `correo_duplicado`, 429 after 5 failed
 * logins; every user is an admin, so no 403), so the page can be demoed before the real backend is up. Enabled with `VITE_API_MOCK=true`.
 * Sign in with `admin@vestigia.site` / `vestigia-admin`.
 */

type Rol = 'admin';

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  creado_en: string;
}

interface Sesion {
  usuarioId: string;
  expira: number;
}

const ROLES: Rol[] = ['admin'];
const AUTH = '/api/v1/auth';
const USUARIOS = '/api/v1/admin/usuarios';
const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESION_MS = 8 * 60 * 60 * 1000;
const MAX_INTENTOS = 5;

const usuarios: Usuario[] = [
  {
    id: '44444444-4444-4444-8444-444444444444',
    nombre: 'Administrador',
    correo: 'admin@vestigia.site',
    rol: 'admin',
    activo: true,
    creado_en: '2026-11-08T23:10:00.000000Z',
  },
];
/** Passwords live apart so they never reach a response. */
const passwords = new Map<string, string>([[usuarios[0].id, 'vestigia-admin']]);
const sesiones = new Map<string, Sesion>();
const fallidos = new Map<string, number>();

/** The user behind the `Authorization: Bearer` header, or `null` (→ 401). Shared with the other admin mocks. */
export function autenticar(req: IncomingMessage): Usuario | null {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
  const sesion = token ? sesiones.get(token) : undefined;
  if (!token || !sesion || sesion.expira <= Date.now()) return null;
  return usuarios.find((usuario) => usuario.id === sesion.usuarioId && usuario.activo) ?? null;
}

async function handleAuth(req: IncomingMessage, res: ServerResponse) {
  const path = new URL(req.url ?? '/', 'http://mock').pathname;
  if (req.method !== 'POST' && path !== `${AUTH}/yo`) {
    return sendError(res, path, 404, 'Ruta no encontrada');
  }

  if (path === `${AUTH}/login`) {
    let body: { correo?: unknown; password?: unknown };
    try {
      body = (await readBody(req)) as typeof body;
    } catch {
      return sendError(res, path, 400, 'JSON malformado o ilegible');
    }
    const correo = typeof body.correo === 'string' ? body.correo.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const details = [];
    if (!correo) details.push({ field: 'correo', message: 'es obligatorio' });
    if (!password) details.push({ field: 'password', message: 'es obligatorio' });
    if (details.length) return sendError(res, path, 400, 'Datos inválidos', details);
    if ((fallidos.get(correo) ?? 0) >= MAX_INTENTOS) {
      const message = 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo';
      return sendError(res, path, 429, message, [], 'demasiados_intentos');
    }
    const usuario = usuarios.find((candidato) => candidato.correo === correo);
    if (!usuario || !usuario.activo || passwords.get(usuario.id) !== password) {
      fallidos.set(correo, (fallidos.get(correo) ?? 0) + 1);
      return sendError(res, path, 401, 'Correo o contraseña incorrectos');
    }
    fallidos.delete(correo);
    const token = randomUUID();
    const expira = Date.now() + SESION_MS;
    sesiones.set(token, { usuarioId: usuario.id, expira });
    return send(res, 200, { token, expira_en: new Date(expira).toISOString(), usuario });
  }

  const usuario = autenticar(req);
  if (!usuario)
    return sendError(res, path, 401, 'Sesión inválida o vencida: vuelve a iniciar sesión');
  if (path === `${AUTH}/yo`) return send(res, 200, usuario);
  if (path === `${AUTH}/logout`) {
    sesiones.delete(req.headers.authorization!.slice('Bearer '.length));
    return send(res, 204);
  }
  return sendError(res, path, 404, 'Ruta no encontrada');
}

function validate(body: Record<string, unknown>) {
  const details: { field: string; message: string }[] = [];
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  const correo = typeof body.correo === 'string' ? body.correo.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!nombre) details.push({ field: 'nombre', message: 'es obligatorio' });
  else if (nombre.length > 80) details.push({ field: 'nombre', message: 'máximo 80 caracteres' });
  if (!correo) details.push({ field: 'correo', message: 'es obligatorio' });
  else if (!CORREO.test(correo))
    details.push({ field: 'correo', message: 'no es un correo válido' });
  if (!password) details.push({ field: 'password', message: 'es obligatorio' });
  else if (password.length < 8 || password.length > 72)
    details.push({ field: 'password', message: 'debe tener de 8 a 72 caracteres' });
  if (!body.rol) details.push({ field: 'rol', message: 'es obligatorio' });
  return details;
}

async function handleUsuarios(req: IncomingMessage, res: ServerResponse) {
  const path = new URL(req.url ?? '/', 'http://mock').pathname;
  if (path !== USUARIOS) return sendError(res, path, 404, 'Ruta no encontrada');
  if (!autenticar(req)) {
    return sendError(res, path, 401, 'Sesión inválida o vencida: vuelve a iniciar sesión');
  }
  if (req.method === 'GET') return send(res, 200, usuarios);
  if (req.method !== 'POST') return sendError(res, path, 404, 'Ruta no encontrada');

  let body: Record<string, unknown>;
  try {
    body = (await readBody(req)) as Record<string, unknown>;
  } catch {
    return sendError(res, path, 400, 'JSON malformado o ilegible');
  }
  // Like Jackson: an unknown enum value is unreadable JSON, not a field error.
  if (body.rol !== undefined && !ROLES.includes(body.rol as Rol)) {
    return sendError(res, path, 400, 'JSON malformado o ilegible');
  }
  const details = validate(body);
  if (details.length) return sendError(res, path, 400, 'Datos inválidos', details);

  const correo = (body.correo as string).trim().toLowerCase();
  if (usuarios.some((usuario) => usuario.correo === correo)) {
    const duplicado = [{ field: 'correo', message: 'ya está registrado' }];
    return sendError(
      res,
      path,
      409,
      'Ya hay un usuario con ese correo',
      duplicado,
      'correo_duplicado',
    );
  }
  const usuario: Usuario = {
    id: randomUUID(),
    nombre: (body.nombre as string).trim(),
    correo,
    rol: body.rol as Rol,
    activo: true,
    creado_en: new Date().toISOString(),
  };
  usuarios.push(usuario);
  passwords.set(usuario.id, body.password as string);
  return send(res, 201, usuario);
}

export const authApiMock = () => mockPlugin('vestigia-auth-api-mock', AUTH, handleAuth);
export const usuariosApiMock = () =>
  mockPlugin('vestigia-usuarios-api-mock', USUARIOS, handleUsuarios);
