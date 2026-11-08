import { useUsuariosController } from '@/controllers/useUsuariosController';
import { ConnectionStatus } from '@/views/components/ConnectionStatus';
import { LabLayout } from '@/views/components/LabLayout';
import { ListSection } from '@/views/components/ListSection';
import { Notice } from '@/views/components/Notice';
import { UsuarioCard } from '@/views/components/UsuarioCard';
import { UsuarioForm } from '@/views/components/UsuarioForm';

export function UsuariosPage() {
  const { usuarios, estado, errorCarga, online, guardando, aviso, cerrarAviso, guardar, recargar } =
    useUsuariosController();

  return (
    <LabLayout
      title="Usuarios"
      eyebrow="Vestigia · Administración"
      status={<ConnectionStatus online={online} pendientes={0} sincronizando={false} />}
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
