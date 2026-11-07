import { useCallback, useEffect, useState } from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { ErroresDeUsuario, NuevoUsuario, Usuario } from '@/models/Usuario';
import type { Aviso, EstadoCarga } from '@/models/Vista';
import { NetworkError } from '@/repositories/http/httpClient';
import {
  UsuarioInvalidoError,
  usuarioService,
  type UsuarioService,
} from '@/services/usuarioService';

function mensajeDeError(error: unknown): string {
  if (error instanceof UsuarioInvalidoError) return error.message;
  if (error instanceof NetworkError) return 'Necesitas conexión para guardar el usuario.';
  return 'El servidor no pudo guardar el usuario. Intenta de nuevo.';
}

export function useUsuariosController(service: UsuarioService = usuarioService) {
  const online = useOnlineStatus();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState<string>();
  const [aviso, setAviso] = useState<Aviso>();
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(
    () =>
      service.getUsuarios().then(
        (lista) => {
          setUsuarios(lista);
          setErrorCarga(undefined);
          setEstado('listo');
        },
        (error: unknown) => {
          setErrorCarga(
            error instanceof NetworkError
              ? 'No hay conexión con el servidor.'
              : 'No se pudo cargar el listado de usuarios.',
          );
          setEstado('error');
        },
      ),
    [service],
  );

  useEffect(() => {
    void cargar();
  }, [cargar]);

  /** Devuelve los errores por campo, o `null` si se guardó. */
  const guardar = useCallback(
    async (datos: NuevoUsuario): Promise<ErroresDeUsuario | null> => {
      setGuardando(true);
      try {
        const usuario = await service.createUsuario(datos);
        // El backend lista del más reciente al más antiguo: el nuevo va primero.
        setUsuarios((actuales) => [usuario, ...actuales]);
        setAviso({ tono: 'exito', texto: `Usuario «${usuario.nombre}» agregado.` });
        return null;
      } catch (error) {
        setAviso({ tono: 'error', texto: mensajeDeError(error) });
        return error instanceof UsuarioInvalidoError ? error.campos : {};
      } finally {
        setGuardando(false);
      }
    },
    [service],
  );

  return {
    usuarios,
    estado,
    errorCarga,
    online,
    guardando,
    aviso,
    cerrarAviso: () => setAviso(undefined),
    guardar,
    recargar: () => {
      setEstado('cargando');
      void cargar();
    },
  };
}
