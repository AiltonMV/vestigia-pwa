import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, Plugin } from 'vite';

/** Shared helpers for the in-memory API mocks (see `salasApiMock.ts`, `usuariosApiMock.ts`). */

export const now = () => new Date().toISOString().slice(0, 19);

const REASON: Record<number, string> = { 400: 'Bad Request', 404: 'Not Found', 409: 'Conflict' };

export function send(res: ServerResponse, status: number, body?: unknown) {
  res.statusCode = status;
  if (body === undefined) return res.end();
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/** Same error body as the backend's `ApiExceptionHandler`. */
export function sendError(
  res: ServerResponse,
  path: string,
  status: number,
  message: string,
  details: unknown[] = [],
) {
  const error = REASON[status] ?? 'Internal Server Error';
  send(res, status, { timestamp: now(), status, error, message, path, details });
}

export async function readBody(req: IncomingMessage): Promise<unknown> {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw);
}

type Handler = (req: IncomingMessage, res: ServerResponse) => Promise<unknown>;

/** Serves `handle` under `base` in `vite` (dev) and `vite preview`, so the Service Worker can be tested too. */
export function mockPlugin(name: string, base: string, handle: Handler): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    if (!req.url?.startsWith(base)) return next();
    // Small delay so loading states and network timings are visible.
    setTimeout(
      () => void handle(req, res).catch(() => sendError(res, base, 500, 'Error del mock')),
      250,
    );
  };
  return {
    name,
    configureServer: (server) => void server.middlewares.use(middleware),
    configurePreviewServer: (server) => void server.middlewares.use(middleware),
  };
}
