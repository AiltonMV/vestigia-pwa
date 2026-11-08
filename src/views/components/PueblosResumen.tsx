import {
  FILTRO_PUEBLO_LABEL,
  FILTROS_PUEBLO,
  type FiltroPueblo,
  type ResumenPueblos,
} from '@/models/Pueblo';
import { Button } from './Button';
import { SegmentedControl } from './SegmentedControl';
import panel from './FormPanel.module.css';
import styles from './PueblosResumen.module.css';

const OPCIONES = FILTROS_PUEBLO.map((value) => ({ value, label: FILTRO_PUEBLO_LABEL[value] }));

interface PueblosResumenProps {
  resumen: ResumenPueblos;
  filtro: FiltroPueblo;
  onFiltro: (filtro: FiltroPueblo) => void;
  onRecargar: () => void;
  cargando: boolean;
}

/** Cuántos pueblos están libres y cuántos en partida, el filtro del listado y "Actualizar". */
export function PueblosResumen({
  resumen,
  filtro,
  onFiltro,
  onRecargar,
  cargando,
}: PueblosResumenProps) {
  return (
    <section className={panel.form} aria-labelledby="pueblos-resumen">
      <h2 id="pueblos-resumen" className={panel.title}>
        Partidas
      </h2>

      <dl className={styles.stats}>
        <div>
          <dt>En partida</dt>
          <dd className={styles.busy}>{resumen.enPartida}</dd>
        </div>
        <div>
          <dt>Libres</dt>
          <dd className={styles.free}>{resumen.libres}</dd>
        </div>
      </dl>
      <p className={styles.note}>
        Cada partida ocupa un pueblo. El nombre vuelve a quedar libre cuando la partida termina.
      </p>

      <SegmentedControl
        label="Filtrar pueblos"
        options={OPCIONES}
        value={filtro}
        onChange={onFiltro}
      />

      <div className={panel.actions}>
        <Button type="button" onClick={onRecargar} disabled={cargando}>
          {cargando ? 'Actualizando…' : 'Actualizar'}
        </Button>
      </div>
    </section>
  );
}
