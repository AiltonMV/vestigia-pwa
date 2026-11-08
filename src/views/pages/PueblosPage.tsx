import { usePueblosController } from '@/controllers/usePueblosController';
import type { FiltroPueblo } from '@/models/Pueblo';
import { ConnectionStatus } from '@/views/components/ConnectionStatus';
import { LabLayout } from '@/views/components/LabLayout';
import { ListSection } from '@/views/components/ListSection';
import { PuebloCard } from '@/views/components/PuebloCard';
import { PueblosResumen } from '@/views/components/PueblosResumen';

const VACIO: Record<FiltroPueblo, string> = {
  todos: 'El catálogo está vacío',
  libres: 'No hay pueblos libres',
  en_partida: 'No hay partidas en curso',
};

/** Catálogo de pueblos del backend: cuáles están libres y cuáles tienen una partida en curso. */
export function PueblosPage() {
  const { pueblos, resumen, filtro, setFiltro, estado, errorCarga, online, recargar } =
    usePueblosController();

  return (
    <LabLayout
      title="Salas"
      eyebrow="Vestigia · Pueblos"
      status={<ConnectionStatus online={online} pendientes={0} sincronizando={false} />}
      aside={
        <PueblosResumen
          resumen={resumen}
          filtro={filtro}
          onFiltro={setFiltro}
          onRecargar={recargar}
          cargando={estado === 'cargando'}
        />
      }
    >
      <ListSection
        id="pueblos"
        title="Pueblos"
        items={pueblos}
        getKey={(pueblo) => pueblo.codigo}
        renderItem={(pueblo) => <PuebloCard pueblo={pueblo} />}
        estado={estado}
        onRetry={recargar}
        loadingTitle="Cargando pueblos…"
        errorText={errorCarga}
        emptyTitle={VACIO[filtro]}
      />
    </LabLayout>
  );
}
