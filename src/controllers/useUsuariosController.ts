import { useCallback, useEffect, useRef, useState } from 'react';
import { useVolverAlLogin } from '@/hooks/useVolverAlLogin';
import type { ErroresDeUsuario, NuevoUsuario, Usuario } from '@/models/Usuario';
import type { Aviso, EstadoCarga } from '@/models/Vista';
import { NetworkError } from '@/repositories/http/httpClient';
import { SesionVencidaError, SinPermisoError } from '@/services/sesionService';
import {
  UsuarioInvalidoError,
  usuarioService,
  type UsuarioService,
} from '@/services/usuarioService';
import { usePendientesUsuarios } from './usePendientesUsuarios';

function mensajeDeError(error: unknown): string {
  if (error instanceof UsuarioInvalidoError || error instanceof SinPermisoError) {
    return error.message;
  }
  if (error instanceof NetworkError) return 'No se pudo guardar el usuario. Intenta de nuevo.';
  return 'El servidor no pudo guardar el usuario. Intenta de nuevo.';
}

function mensajeDeCarga(error: unknown): string {
  if (error instanceof SinPermisoError) return error.message;
  if (error instanceof NetworkError) return 'No hay conexión con el servidor.';
  return 'No se pudo cargar el listado de usuarios.';
}

export function useUsuariosController(service: UsuarioService = usuarioService) {
  const volverAlLogin = useVolverAlLogin();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estado, setEstado] = useState<EstadoCarga>('cargando');
  const [errorCarga, setErrorCarga] = useState<string>();
  const [aviso, setAviso] = useState<Aviso>();
  const [guardando, setGuardando] = useState(false);
  const { pendientes, sincronizando } = usePendientesUsuarios();
  const sincronizabaAntes = useRef(sincronizando);

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

  // Al terminar de enviar las altas en cola, el listado debe incluirlas.
  useEffect(() => {
    if (sincronizabaAntes.current && !sincronizando) void cargar();
    sincronizabaAntes.current = sincronizando;
  }, [sincronizando, cargar]);

  /** Devuelve los errores por campo, o `null` si se guardó. */
  const guardar = useCallback(
    async (datos: NuevoUsuario): Promise<ErroresDeUsuario | null> => {
      setGuardando(true);
      try {
        const resultado = await service.createUsuario(datos);
        if (resultado.tipo === 'encolado') {
          setAviso({
            tono: 'info',
            texto: `Sin conexión: «${resultado.pendiente.nombre}» quedó guardado en este dispositivo y se enviará al volver la red.`,
          });
          return null;
        }
        // El backend lista del más antiguo al más nuevo: el nuevo va al final.
        setUsuarios((actuales) => [...actuales, resultado.usuario]);
        setAviso({ tono: 'exito', texto: `Usuario «${resultado.usuario.nombre}» agregado.` });
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
    pendientes,
    estado,
    errorCarga,
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
