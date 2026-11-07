import type { IncomingMessage, ServerResponse } from 'node:http';
import { mockPlugin, now, readBody, send, sendError as sendErrorAt } from './mockHttp.ts';

/**
 * In-memory `/api/salas` that follows the backend contract (idempotent POST, 400 with
 * `details`, 404), so the PWA can be built and demoed before the real backend is up.
 * Enabled with `VITE_API_MOCK=true`; requests show up in DevTools → Network like real ones.
 */

type Escenario = 'pueblo' | 'faro' | 'observatorio';

interface Sala {
  id: string;
  nombre: string;
  descripcion: string | null;
  escenario: Escenario;
  activa: boolean;
  creada_en: string;
}

const ESCENARIOS: Escenario[] = ['pueblo', 'faro', 'observatorio'];
const BASE = '/api/salas';

const salas: Sala[] = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    nombre: 'Puesto del pescador',
    descripcion: 'Donde suena la radio por primera vez.',
    escenario: 'pueblo',
    activa: true,
    creada_en: '2026-10-14T09:00:00',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    nombre: 'Faro, nivel 1',
    descripcion: 'Primer fragmento de la fotografía.',
    escenario: 'faro',
    activa: true,
    creada_en: '2026-10-14T09:01:00',
  },
  {
    id: '33333333-3333-4333-8333-333333333333',
    nombre: 'Cúpula del telescopio',
    descripcion: 'Aquí se unen las dos coordenadas.',
    escenario: 'observatorio',
    activa: true,
    creada_en: '2026-10-14T09:02:00',
  },
];

const sendError = (res: ServerResponse, status: number, message: string, details?: unknown[]) =>
  sendErrorAt(res, BASE, status, message, details);

function validate(body: Partial<Sala>) {
  const details: { field: string; message: string }[] = [];
  const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';
  if (!nombre) details.push({ field: 'nombre', message: 'no debe estar vacío' });
  else if (nombre.length > 100) details.push({ field: 'nombre', message: 'máximo 100 caracteres' });
  if (!ESCENARIOS.includes(body.escenario as Escenario)) {
    details.push({ field: 'escenario', message: 'debe ser pueblo, faro u observatorio' });
  }
  if (typeof body.id !== 'string' || !body.id)
    details.push({ field: 'id', message: 'es obligatorio' });
  return details;
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://mock');
  const id = url.pathname.slice(BASE.length + 1) || null;
  const found = id ? salas.find((sala) => sala.id === id) : undefined;

  if (req.method === 'GET' && !id) return send(res, 200, salas);
  if (req.method === 'GET')
    return found ? send(res, 200, found) : sendError(res, 404, 'Sala no encontrada');

  if (req.method === 'POST' && !id) {
    let body: Partial<Sala>;
    try {
      body = (await readBody(req)) as Partial<Sala>;
    } catch {
      return sendError(res, 400, 'JSON malformado');
    }
    const details = validate(body);
    if (details.length) return sendError(res, 400, 'Datos inválidos', details);
    // Idempotent: the same id never creates a second row.
    const existing = salas.find((sala) => sala.id === body.id);
    if (existing) return send(res, 200, existing);
    const sala: Sala = {
      id: body.id!,
      nombre: body.nombre!.trim(),
      descripcion: body.descripcion?.trim() || null,
      escenario: body.escenario!,
      activa: body.activa ?? true,
      creada_en: now(),
    };
    salas.push(sala);
    return send(res, 201, sala);
  }

  if (req.method === 'PUT' && found) {
    let body: Partial<Sala>;
    try {
      body = (await readBody(req)) as Partial<Sala>;
    } catch {
      return sendError(res, 400, 'JSON malformado o ilegible');
    }
    // The id in the path wins over the body's; creada_en never changes.
    const details = validate({ ...body, id: found.id });
    if (details.length) return sendError(res, 400, 'Datos inválidos', details);
    Object.assign(found, {
      nombre: body.nombre!.trim(),
      descripcion: body.descripcion?.trim() || null,
      escenario: body.escenario!,
      activa: body.activa ?? true,
    });
    return send(res, 200, found);
  }

  if (req.method === 'DELETE' && found) {
    salas.splice(salas.indexOf(found), 1);
    return send(res, 204);
  }
  return sendError(res, 404, 'Sala no encontrada');
}

export const salasApiMock = () => mockPlugin('vestigia-salas-api-mock', BASE, handle);
