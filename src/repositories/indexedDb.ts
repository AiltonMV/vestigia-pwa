const DB_NAME = 'vestigia';
const DB_VERSION = 1;

export const STORE_USUARIOS_PENDIENTES = 'usuariosPendientes';
export const STORE_CLAVES = 'clavesCifrado';

let conexion: Promise<IDBDatabase> | undefined;

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const apertura = indexedDB.open(DB_NAME, DB_VERSION);
    apertura.onupgradeneeded = () => {
      const db = apertura.result;
      db.createObjectStore(STORE_USUARIOS_PENDIENTES, { keyPath: 'id' });
      db.createObjectStore(STORE_CLAVES);
    };
    apertura.onsuccess = () => resolve(apertura.result);
    apertura.onerror = () => reject(apertura.error);
  });
}

function base(): Promise<IDBDatabase> {
  conexion ??= abrir().catch((error: unknown) => {
    conexion = undefined;
    throw error;
  });
  return conexion;
}

/** Ejecuta una operación en una transacción y espera a que quede confirmada en disco. */
export async function enStore<T>(
  nombre: string,
  modo: IDBTransactionMode,
  operacion: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await base();
  return new Promise((resolve, reject) => {
    const transaccion = db.transaction(nombre, modo);
    const peticion = operacion(transaccion.objectStore(nombre));
    transaccion.oncomplete = () => resolve(peticion.result);
    transaccion.onerror = () => reject(transaccion.error);
    transaccion.onabort = () => reject(transaccion.error);
  });
}
