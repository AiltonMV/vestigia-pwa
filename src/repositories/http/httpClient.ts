import { API_URL } from '@/config/apiConfig';
import type { ApiErrorDto, ApiFieldErrorDto } from '@/dtos/SalaDto';

/** El servidor respondió con un error (400, 404, 500…). */
export class ApiError extends Error {
  readonly status: number;
  readonly details: ApiFieldErrorDto[];

  constructor(status: number, body: Partial<ApiErrorDto> | null) {
    super(body?.message ?? `Error ${status}`);
    this.name = 'ApiError';
    this.status = status;
    this.details = body?.details ?? [];
  }
}

/** No hubo respuesta: sin conexión o servidor apagado. No es un error de datos. */
export class NetworkError extends Error {
  constructor(cause: unknown) {
    super('Sin conexión con el servidor', { cause });
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
    return null;
  }
}

/** `fetch` con JSON que separa los errores del servidor de los fallos de red. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<HttpResponse<T>> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...init.headers },
    });
  } catch (cause) {
    throw new NetworkError(cause);
  }
  const body = await readJson(response);
  if (!response.ok) throw new ApiError(response.status, body as Partial<ApiErrorDto> | null);
  return { status: response.status, data: body as T };
}
