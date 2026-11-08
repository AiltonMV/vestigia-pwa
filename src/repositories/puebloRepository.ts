import type { PuebloDto } from '@/dtos/PuebloDto';
import { request } from './http/httpClient';

const PUEBLOS = '/api/v1/pueblos';

export interface PuebloRepository {
  /** Los 101 pueblos en orden alfabético; los ocupados traen `libre: false`. Ruta pública, sin token. */
  findAll(signal?: AbortSignal): Promise<PuebloDto[]>;
}

export const httpPuebloRepository: PuebloRepository = {
  async findAll(signal) {
    const started = performance.now();
    const { data } = await request<PuebloDto[]>(PUEBLOS, { signal });
    console.info(
      `[Vestigia] GET ${PUEBLOS} → ${data.length} pueblos en ${Math.round(performance.now() - started)} ms`,
    );
    return data;
  },
};
