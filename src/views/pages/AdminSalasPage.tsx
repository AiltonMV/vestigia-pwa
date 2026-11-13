import { useLocation } from 'react-router-dom';
import { useAdminSalasController } from '@/controllers/useAdminSalasController';
import { FILTRO_SALA_LABEL, FILTROS_SALA, type FiltroSala } from '@/models/SalaAdmin';
import { Button } from '@/views/components/Button';
import { ListSection } from '@/views/components/ListSection';
import { Paginacion } from '@/views/components/Paginacion';
import { SalaCard } from '@/views/components/SalaCard';
import { SegmentedControl } from '@/views/components/SegmentedControl';
import styles from './AdminSalasPage.module.css';

const OPCIONES = FILTROS_SALA.map((filtro) => ({
  value: filtro,
  label: FILTRO_SALA_LABEL[filtro],
}));

const VACIO: Record<FiltroSala, string> = {
  todas: 'Todavía no se ha jugado ninguna partida',
  activa: 'No hay partidas en curso',
  esperando_app: 'Ninguna sala espera a la app',
  finalizada: 'No hay partidas terminadas',
  expirada: 'No hay salas expiradas',
};

/** Pestaña Salas del panel: todas las partidas, vivas y terminadas, por páginas. */
export function AdminSalasPage() {
  const {
    salas,
    total,
    pagina,
    totalPaginas,
    filtro,
    estado,
    errorCarga,
    setFiltro,
    irAPagina,
    recargar,
  } = useAdminSalasController();
  // Para que «volver» desde el detalle regrese a este filtro y esta página.
  const { pathname, search } = useLocation();

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <SegmentedControl
          label="Filtrar salas por estado"
          options={OPCIONES}
          value={filtro}
          onChange={setFiltro}
        />
        <Button type="button" onClick={recargar} disabled={estado === 'cargando'}>
          Actualizar
        </Button>
      </div>

      <ListSection
        id="salas"
        title="Salas"
        items={salas}
        count={total}
        getKey={(sala) => sala.id}
        renderItem={(sala) => <SalaCard sala={sala} desde={pathname + search} />}
        estado={estado}
        onRetry={recargar}
        loadingTitle="Cargando salas…"
        errorText={errorCarga}
        emptyTitle={VACIO[filtro]}
        emptyText="Las salas las crea el juego de PC al empezar una partida."
      />

      <Paginacion
        pagina={pagina}
        totalPaginas={totalPaginas}
        onCambiar={irAPagina}
        deshabilitada={estado === 'cargando'}
      />
    </div>
  );
}
