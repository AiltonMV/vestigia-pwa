import { enStore, STORE_CLAVES } from './indexedDb';

const CLAVE_USUARIOS = 'usuarios';

/** Guarda la `CryptoKey` (no extraíble) con la que se cifran las contraseñas de la cola. */
export interface ClaveCifradoRepository {
  find(): Promise<CryptoKey | undefined>;
  save(clave: CryptoKey): Promise<void>;
  clear(): Promise<void>;
}

export const idbClaveCifradoRepository: ClaveCifradoRepository = {
  find: () =>
    enStore<CryptoKey | undefined>(STORE_CLAVES, 'readonly', (store) => store.get(CLAVE_USUARIOS)),
  async save(clave) {
    await enStore(STORE_CLAVES, 'readwrite', (store) => store.put(clave, CLAVE_USUARIOS));
  },
  async clear() {
    await enStore(STORE_CLAVES, 'readwrite', (store) => store.clear());
  },
};
