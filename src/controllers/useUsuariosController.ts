import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { RedireccionLogin } from '@/models/Sesion';
import type { ErroresDeUsuario, NuevoUsuario, Usuario } from '@/models/Usuario';
import type { Aviso, EstadoCarga } from '@/models/Vista';
import { NetworkError } from '@/repositories/http/httpClient';
import { SesionVencidaError, SinPermisoError } from '@/services/sesionService';
import {
  UsuarioInvalidoError,
  usuarioService,
  type UsuarioService,
} from '@/services/usuarioService';

function mensajeDeError(error: unknown): string {
  if (error instanceof UsuarioInvalidoError || error instanceof SinPermisoError) {
    return error.message;
  }
  if (error instanceof NetworkError) return 'Necesitas conexión para guardar el usuario.';
  return 'El servidor no pudo guardar el usuario. Intenta de nuevo.';
}

function mensajeDeCarga(error: unknown): string {
  if (error instanceof SinPermisoError) return error.message;
  if (error instanceof NetworkError) return 'No hay conexión con el servidor.';
  return 'No se pudo cargar el listado de usuarios.';
}

export function useUsuariosController(service: UsuarioService = usuarioService) {
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState<string>();
  const [aviso, setAviso] = useState<Aviso>();
  const [guardando, setGuardando] = useState(false);

  /** La sesión venció o el backend ya no acepta el token: de vuelta a /login. */
  const volverAlLogin = useCallback(() => {
    const state: RedireccionLogin = { desde: pathname, vencida: true };
    navigate('/login', { replace: true, state });
  }, [navigate, pathname]);

  const cargar = useCallback(
    () =>
      service.getUsuarios().then(
        (lista) => {
          setUsuarios(lista);
          setErrorCarga(undefined);
          setEstado('listo');
        },
        (error: unknown) => {
          if (error instanceof SesionVencidaError) return volverAlLogin();
          setErrorCarga(mensajeDeCarga(error));
          setEstado('error');
        },
      ),
    [service, volverAlLogin],
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
        // El backend lista del más antiguo al más nuevo: el nuevo va al final.
        setUsuarios((actuales) => [...actuales, usuario]);
        setAviso({ tono: 'exito', texto: `Usuario «${usuario.nombre}» agregado.` });
        return null;
      } catch (error) {
        if (error instanceof SesionVencidaError) {
          volverAlLogin();
          return {};
        }
        setAviso({ tono: 'error', texto: mensajeDeError(error) });
        return error instanceof UsuarioInvalidoError ? error.campos : {};
      } finally {
        setGuardando(false);
      }
    },
    [service, volverAlLogin],
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
