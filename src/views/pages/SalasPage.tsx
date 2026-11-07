import { useEffect, useRef } from 'react';
import { useSalasController } from '@/controllers/useSalasController';
import { ConnectionStatus } from '@/views/components/ConnectionStatus';
import { LabLayout } from '@/views/components/LabLayout';
import { ListSection } from '@/views/components/ListSection';
import { Notice } from '@/views/components/Notice';
import { SalaCard } from '@/views/components/SalaCard';
import { SalaForm } from '@/views/components/SalaForm';

export function SalasPage() {
  const {
    salas,
    estado,
    errorCarga,
    online,
    pendientes,
    guardando,
    sincronizando,
    aviso,
    cerrarAviso,
    editando,
    editar,
    cancelarEdicion,
    guardar,
    eliminar,
    recargar,
  } = useSalasController();
  const formulario = useRef<HTMLElement>(null);

  // En pantallas angostas el formulario queda bajo el listado: se lleva a la vista al editar.
  useEffect(() => {
    if (editando) formulario.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editando]);

  return (
    <LabLayout
      title="Salas"
      status={
        <ConnectionStatus online={online} pendientes={pendientes} sincronizando={sincronizando} />
      }
      asideRef={formulario}
      aside={
        // La key vuelve a montar el formulario al cambiar de sala, con sus datos iniciales.
        <SalaForm
          key={editando?.id ?? 'nueva'}
          sala={editando}
          onSubmit={guardar}
          onCancel={editando ? cancelarEdicion : undefined}
          guardando={guardando}
        />
      }
      notice={aviso && <Notice tone={aviso.tono} text={aviso.texto} onClose={cerrarAviso} />}
    >
      <ListSection
        id="salas"
        title="Listado"
        items={salas}
        getKey={(sala) => sala.id}
        renderItem={(sala) => (
          <SalaCard
            sala={sala}
            online={online}
            editing={editando?.id === sala.id}
            onEdit={editar}
            onDelete={eliminar}
          />
        )}
        estado={estado}
        onRetry={recargar}
        loadingTitle="Cargando salas…"
        errorText={errorCarga}
        emptyTitle="Todavía no hay salas"
        emptyText="Crea la primera con el formulario."
      />
    </LabLayout>
  );
}
