import { useUsuariosController } from '@/controllers/useUsuariosController';
import { ListSection } from '@/views/components/ListSection';
import { Notice } from '@/views/components/Notice';
import { SplitLayout } from '@/views/components/SplitLayout';
import { UsuarioCard } from '@/views/components/UsuarioCard';
import { UsuarioForm } from '@/views/components/UsuarioForm';

/** Pestaña Usuarios del panel: los administradores y el alta de uno nuevo. */
export function UsuariosPage() {
  const { usuarios, estado, errorCarga, guardando, aviso, cerrarAviso, guardar, recargar } =
    useUsuariosController();

  return (
    <>
      <SplitLayout aside={<UsuarioForm onSubmit={guardar} guardando={guardando} />}>
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
      </SplitLayout>
      {aviso && <Notice tone={aviso.tono} text={aviso.texto} onClose={cerrarAviso} />}
    </>
  );
}
