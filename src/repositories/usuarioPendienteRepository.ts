import type { UsuarioPendienteDto } from '@/dtos/UsuarioPendienteDto';
import { enStore, STORE_USUARIOS_PENDIENTES } from './indexedDb';

/** Cola de altas de usuario hechas sin conexión (IndexedDB, base `vestigia`). */
export interface UsuarioPendienteRepository {
  /** En orden de creación. */
  findAll(): Promise<UsuarioPendienteDto[]>;
  save(pendiente: UsuarioPendienteDto): Promise<void>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
}

const enCola = <T>(modo: IDBTransactionMode, operacion: (store: IDBObjectStore) => IDBRequest<T>) =>
  enStore(STORE_USUARIOS_PENDIENTES, modo, operacion);

export const idbUsuarioPendienteRepository: UsuarioPendienteRepository = {
  async findAll() {
    const todas = await enCola<UsuarioPendienteDto[]>('readonly', (store) => store.getAll());
    return todas.sort((a, b) => a.creadaEn.localeCompare(b.creadaEn));
  },

  async save(pendiente) {
    await enCola('readwrite', (store) => store.put(pendiente));
  },

  async remove(id) {
    await enCola('readwrite', (store) => store.delete(id));
  },

  async clear() {
    await enCola('readwrite', (store) => store.clear());
  },
};
