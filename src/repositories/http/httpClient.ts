import { API_URL } from '@/config/apiConfig';
import type { ApiErrorDto, ApiFieldErrorDto } from '@/dtos/ApiErrorDto';

/** Límite por petición, para no dejar la pantalla esperando sin fin. */
const TIMEOUT_MS = 10_000;

/** El servidor respondió con un error (400, 404, 500…). */
export class ApiError extends Error {
  readonly status: number;
  /** Código de error del backend; `null` en los errores que no definen uno. */
  readonly codigo: string | null;
  readonly details: ApiFieldErrorDto[];

  constructor(status: number, body: Partial<ApiErrorDto> | null) {
    // Un 5xx no trae un mensaje útil para el usuario.
    super(
      status >= 500 ? 'Algo salió mal. Inténtalo más tarde.' : (body?.message ?? `Error ${status}`),
    );
    this.name = 'ApiError';
    this.status = status;
    this.codigo = body?.codigo ?? null;
    this.details = body?.details ?? [];
  }
}

/** No hubo respuesta: sin red, servidor apagado, URL mal, CORS o se agotó el tiempo. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('No hay conexión con el servidor', { cause });
    this.name = 'NetworkError';
  }
}

export interface HttpResponse<T> {
  status: number;
  data: T;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // p. ej. el 403 de CORS, que es texto plano ("Invalid CORS request").
    return null;
  }
}

/**
 * `fetch` con JSON que separa los errores del servidor de los fallos de red. Si quien llama
 * cancela con su `signal` (p. ej. el componente se desmontó), relanza el `AbortError` tal cual:
 * no es un error que mostrar.
 */
export async function request<T>(path: string, init: RequestInit = {}): Promise<HttpResponse<T>> {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
    });
  } catch (cause) {
    if (init.signal?.aborted) throw cause;
    throw new NetworkError(cause);
  }
  const body = await readJson(response);
  if (!response.ok) throw new ApiError(response.status, body as Partial<ApiErrorDto> | null);
  return { status: response.status, data: body as T };
}

/** `true` si el error viene de cancelar la petición a propósito. */
export const isAbort = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';
