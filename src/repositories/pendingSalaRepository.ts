import type { NuevaSalaDto } from '@/dtos/SalaDto';

const DB_NAME = 'vestigia';
const DB_VERSION = 1;
const STORE = 'salasPendientes';

/** Alta pendiente: el cuerpo del POST con su UUID ya generado y cuándo se guardó. */
export interface PendingSala {
  sala: NuevaSalaDto;
  /** Orden de reenvío. */
  guardadaEn: number;
}

export interface PendingSalaRepository {
  add(sala: NuevaSalaDto): Promise<void>;
  /** Pendientes en el orden en que se guardaron. */
  findAll(): Promise<PendingSala[]>;
  remove(id: string): Promise<void>;
}

let connection: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  connection ??= new Promise((resolve, reject) => {
    const opening = indexedDB.open(DB_NAME, DB_VERSION);
    opening.onupgradeneeded = () => {
      const store = opening.result.createObjectStore(STORE, { keyPath: 'sala.id' });
      store.createIndex('guardadaEn', 'guardadaEn');
    };
    opening.onsuccess = () => resolve(opening.result);
    opening.onerror = () => {
      connection = null;
      reject(opening.error);
    };
  });
  return connection;
}

/** Ejecuta `action` en una transacción y resuelve cuando la transacción termina. */
async function run<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const pending = action(transaction.objectStore(STORE));
    transaction.oncomplete = () => resolve(pending.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}

/** Cola offline de altas en IndexedDB (sobrevive a recargas y a cerrar la app). */
export const indexedDbPendingSalaRepository: PendingSalaRepository = {
  async add(sala) {
    await run('readwrite', (store) => store.put({ sala, guardadaEn: Date.now() }));
  },

  async findAll() {
    const all = await run<PendingSala[]>('readonly', (store) => store.index('guardadaEn').getAll());
    return all;
  },

  async remove(id) {
    await run('readwrite', (store) => store.delete(id));
  },
};
