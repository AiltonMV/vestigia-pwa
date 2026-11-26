import type { PasswordCifradaDto } from '@/dtos/UsuarioPendienteDto';
import {
  idbClaveCifradoRepository,
  type ClaveCifradoRepository,
} from '@/repositories/claveCifradoRepository';

export interface CifradoLocal {
  cifrar(texto: string): Promise<PasswordCifradaDto>;
  /** Falla si la clave ya no existe o el dato fue alterado. */
  descifrar(cifrado: PasswordCifradaDto): Promise<string>;
  borrarClave(): Promise<void>;
}

const IV_BYTES = 12;

/**
 * AES-GCM de 256 bits con una `CryptoKey` no extraíble guardada en IndexedDB. Protege contra
 * quien lea el volcado de la base; no protege contra un XSS en esta misma página, que podría
 * pedirle a la clave que descifre.
 */
export function createCifradoLocal(claves: ClaveCifradoRepository): CifradoLocal {
  let enCurso: Promise<CryptoKey> | undefined;

  const crearClave = async () => {
    const clave = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
      'encrypt',
      'decrypt',
    ]);
    await claves.save(clave);
    return clave;
  };

  // Compartir la promesa evita que dos altas simultáneas creen claves distintas.
  const obtenerClave = () => {
    enCurso ??= claves
      .find()
      .then((existente) => existente ?? crearClave())
      .catch((error: unknown) => {
        enCurso = undefined;
        throw error;
      });
    return enCurso;
  };

  return {
    async cifrar(texto) {
      const clave = await obtenerClave();
      const iv = crypto.getRandomValues(new Uint8Array(IV_BYTES));
      const datos = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        clave,
        new TextEncoder().encode(texto),
      );
      return { iv, datos };
    },

    async descifrar({ iv, datos }) {
      const clave = await claves.find();
      if (!clave) throw new Error('No hay clave de cifrado');
      const claro = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, clave, datos);
      return new TextDecoder().decode(claro);
    },

    async borrarClave() {
      enCurso = undefined;
      await claves.clear();
    },
  };
}

export const cifradoLocal = createCifradoLocal(idbClaveCifradoRepository);
