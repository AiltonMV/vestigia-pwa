import type { IncomingMessage, ServerResponse } from 'node:http';
import { mockPlugin, send, sendError } from './mockHttp.ts';

/**
 * In-memory `GET /api/v1/pueblos` that follows the backend contract (`?disponibles=true`,
 * 400 for an invalid value), so the page can be demoed without the backend.
 * Enabled with `VITE_API_MOCK=true`. Only a few codes from the backend docs: the real
 * catalog has 101 and lives in the backend.
 */

interface Pueblo {
  codigo: string;
  libre: boolean;
}

const BASE = '/api/v1/pueblos';

const pueblos: Pueblo[] = [
  { codigo: 'ACAXOCHITLAN', libre: true },
  { codigo: 'ACULCO', libre: true },
  { codigo: 'AHUACATLAN', libre: true },
  { codigo: 'ALAMOS', libre: false },
  { codigo: 'BACALAR', libre: false },
];

const VERDADEROS = ['true', '1', 'yes', 'on'];
const FALSOS = ['false', '0', 'no', 'off', ''];

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://mock');
  if (url.pathname !== BASE || req.method !== 'GET') {
    return sendError(res, url.pathname, 404, 'Ruta no encontrada');
  }
  const disponibles = url.searchParams.get('disponibles')?.toLowerCase();
  if (disponibles === undefined || FALSOS.includes(disponibles)) return send(res, 200, pueblos);
  if (VERDADEROS.includes(disponibles)) {
    return send(
      res,
      200,
      pueblos.filter((pueblo) => pueblo.libre),
    );
  }
  return sendError(res, BASE, 400, "Valor inválido para 'disponibles'");
}

export const pueblosApiMock = () => mockPlugin('vestigia-pueblos-api-mock', BASE, handle);
