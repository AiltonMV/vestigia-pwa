import { useSesionController } from '@/controllers/useSesionController';
import { useUsuariosController } from '@/controllers/useUsuariosController';
import { ConnectionStatus } from '@/views/components/ConnectionStatus';
import { LabLayout } from '@/views/components/LabLayout';
import { ListSection } from '@/views/components/ListSection';
import { Notice } from '@/views/components/Notice';
import { SesionActual } from '@/views/components/SesionActual';
import { UsuarioCard } from '@/views/components/UsuarioCard';
import { UsuarioForm } from '@/views/components/UsuarioForm';
import styles from './UsuariosPage.module.css';

/** Administradores del backend. Solo se abre con sesión (ver `RutaProtegida`). */
export function UsuariosPage() {
  const { usuarios, estado, errorCarga, online, guardando, aviso, cerrarAviso, guardar, recargar } =
    useUsuariosController();
  const { sesion, saliendo, cerrarSesion } = useSesionController();

  return (
    <LabLayout
      title="Usuarios"
      eyebrow="Vestigia · Administración"
      status={
        <div className={styles.estado}>
          <ConnectionStatus online={online} pendientes={0} sincronizando={false} />
          {sesion && (
            <SesionActual
              nombre={sesion.usuario.nombre}
              onCerrar={() => void cerrarSesion()}
              saliendo={saliendo}
            />
          )}
        </div>
      }
      aside={<UsuarioForm onSubmit={guardar} guardando={guardando} />}
      notice={aviso && <Notice tone={aviso.tono} text={aviso.texto} onClose={cerrarAviso} />}
    >
      <ListSection
        id="usuarios"
        title="Usuarios registrados"
        items={usuarios}
        getKey={(usuario) => usuario.id}
        renderItem={(usuario) => <UsuarioCard usuario={usuario} />}
        estado={estado}
        onRetry={recargar}
        loadingTitle="Cargando usuarios…"
        errorText={errorCarga}
        emptyTitle="Todavía no hay usuarios"
        emptyText="Agrega el primero con el formulario."
      />
    </LabLayout>
  );
}
