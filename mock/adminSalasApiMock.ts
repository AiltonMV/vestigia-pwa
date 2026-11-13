import type { IncomingMessage, ServerResponse } from 'node:http';
import { mockPlugin, send, sendError } from './mockHttp.ts';
import { autenticar } from './usuariosApiMock.ts';

/**
 * In-memory `GET /api/v1/admin/salas` (paginated, `?estado=`) and `GET /api/v1/admin/salas/{id}`
 * that follow the backend contract, so the admin panel can be demoed without the backend.
 * Uses the same session as `usuariosApiMock.ts`. Enabled with `VITE_API_MOCK=true`.
 */

type Estado = 'esperando_app' | 'activa' | 'finalizada' | 'expirada';
type EstadoPuzzle = 'bloqueado' | 'disponible' | 'en_curso' | 'resuelto';

const BASE = '/api/v1/admin/salas';
const ESTADOS: Estado[] = ['esperando_app', 'activa', 'finalizada', 'expirada'];
const PUZZLES = ['radio', 'photo', 'lookout', 'observatory'] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const haceMinutos = (minutos: number) => new Date(Date.now() - minutos * 60_000).toISOString();

/** Builds a room whose puzzles are solved in order up to `resueltos`. */
function sala(
  numero: number,
  codigo: string,
  estado: Estado,
  escena: string,
  resueltos: number,
  hace: number,
) {
  const vivo = estado === 'activa' || estado === 'esperando_app';
  const puzzles = PUZZLES.map((puzzle, indice) => {
    let estadoPuzzle: EstadoPuzzle = 'bloqueado';
    if (indice < resueltos) estadoPuzzle = 'resuelto';
    else if (indice === resueltos && estado === 'activa') estadoPuzzle = 'en_curso';
    return {
      puzzle,
      estado: estadoPuzzle,
      datos: estadoPuzzle === 'resuelto' ? { completada: true } : {},
    };
  });
  const creada = haceMinutos(hace);
  const actividad = haceMinutos(Math.max(0, hace - 20));
  const eventos = [
    { tipo: 'sala.creada', origen: 'juego', payload: { codigo }, creado_en: creada },
    ...(estado === 'esperando_app'
      ? []
      : [{ tipo: 'app.unida', origen: 'app', payload: {}, creado_en: haceMinutos(hace - 2) }]),
    ...puzzles
      .filter((puzzle) => puzzle.estado === 'resuelto')
      .map((puzzle, indice) => ({
        tipo: 'puzzle.resuelto',
        origen: 'app',
        payload: { puzzle: puzzle.puzzle },
        creado_en: haceMinutos(hace - 5 - indice * 4),
      })),
    ...(estado === 'finalizada'
      ? [{ tipo: 'sala.finalizada', origen: 'juego', payload: {}, creado_en: actividad }]
      : []),
    ...(estado === 'expirada'
      ? [{ tipo: 'sala.expirada', origen: 'servidor', payload: {}, creado_en: actividad }]
      : []),
  ];
  return {
    id: `00000000-0000-4000-8000-${String(numero).padStart(12, '0')}`,
    codigo,
    estado,
    escena_actual: escena,
    puzzles,
    descubrimientos:
      resueltos > 0
        ? [
            {
              clave: 'pescador_dialogo_completo',
              datos: {},
              origen: 'juego',
              creado_en: haceMinutos(hace - 3),
            },
          ]
        : [],
    dispositivos: { juego: vivo, app: estado === 'activa' },
    app_unida: estado !== 'esperando_app',
    creada_en: creada,
    ultima_actividad: actividad,
    expira_en: new Date(Date.parse(actividad) + 2 * 60 * 60_000).toISOString(),
    eventos,
  };
}

// Newest first, like the backend. BACALAR repeats: the live room and an older finished one.
const salas = [
  sala(1, 'BACALAR', 'activa', 'faro', 1, 25),
  sala(2, 'TULUM', 'esperando_app', 'introduccion', 0, 30),
  sala(3, 'ALAMOS', 'finalizada', 'desenlace', 4, 180),
  sala(4, 'ACULCO', 'expirada', 'pueblo', 0, 400),
  sala(5, 'BACALAR', 'finalizada', 'observatorio', 3, 1440),
];

function resumen(detalle: (typeof salas)[number]) {
  const { puzzles, descubrimientos: _d, eventos: _e, ...resto } = detalle;
  return {
    ...resto,
    puzzles_resueltos: puzzles.filter((puzzle) => puzzle.estado === 'resuelto').length,
    puzzles_total: puzzles.length,
  };
}

async function handle(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url ?? '/', 'http://mock');
  const path = url.pathname;
  if (req.method !== 'GET') return sendError(res, path, 404, 'Ruta no encontrada');
  if (!autenticar(req)) {
    return sendError(res, path, 401, 'Sesión inválida o vencida: vuelve a iniciar sesión');
  }

  if (path === BASE) {
    const estado = url.searchParams.get('estado');
    if (estado && !ESTADOS.includes(estado as Estado)) {
      return sendError(res, path, 400, `Valor inválido para 'estado'`);
    }
    const pagina = Math.max(0, Number(url.searchParams.get('pagina') ?? 0) || 0);
    const tamano = Math.min(100, Math.max(1, Number(url.searchParams.get('tamano') ?? 20) || 20));
    const filtradas = estado ? salas.filter((candidata) => candidata.estado === estado) : salas;
    return send(res, 200, {
      contenido: filtradas.slice(pagina * tamano, (pagina + 1) * tamano).map(resumen),
      pagina,
      tamano,
      total: filtradas.length,
      total_paginas: Math.ceil(filtradas.length / tamano),
    });
  }

  const id = path.slice(BASE.length + 1);
  if (!UUID.test(id)) return sendError(res, path, 400, `'${id}' no es un UUID`);
  const detalle = salas.find((candidata) => candidata.id === id);
  if (!detalle) return sendError(res, path, 404, `No existe la sala ${id}`);
  return send(res, 200, detalle);
}

export const adminSalasApiMock = () => mockPlugin('vestigia-admin-salas-api-mock', BASE, handle);
