/** Rutas de la PWA en un solo lugar, para que los enlaces no se desfasen al cambiar una. */
export const RUTAS = {
  inicio: '/',
  libreta: '/libreta',
  /** Presentación en vivo del juego (elevator pitch), sobre la escena 3D de la portada. */
  pitch: '/pitch',
  /** Catálogo público de pueblos; se llama así desde el laboratorio de salas. */
  pueblos: '/salas',
  login: '/login',
  dashboard: '/dashboard',
  salas: '/dashboard/salas',
  sala: (id: string) => `/dashboard/salas/${id}`,
  usuarios: '/dashboard/usuarios',
} as const;

/** Prefijo con el que vivió el panel antes de `/dashboard`; se redirige para no romper enlaces. */
export const PREFIJO_PANEL_ANTERIOR = '/admin';
