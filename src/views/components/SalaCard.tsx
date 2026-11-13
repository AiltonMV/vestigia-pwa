import { Link } from 'react-router-dom';
import {
  ESCENA_LABEL,
  ESTADO_SALA_LABEL,
  type RegresoDetalle,
  type SalaResumen,
} from '@/models/SalaAdmin';
import { formatearFecha } from '@/views/utils/fecha';
import { TONO_ESTADO_SALA } from '@/views/utils/tonos';
import { Tag } from './Tag';
import styles from './SalaCard.module.css';

interface SalaCardProps {
  sala: SalaResumen;
  /** Ruta del listado, para que el detalle sepa a dónde regresar. */
  desde: string;
}

/** Resumen de una sala en el listado; toda la tarjeta abre su detalle. */
export function SalaCard({ sala, desde }: SalaCardProps) {
  const state: RegresoDetalle = { desde };
  return (
    <Link to={`/admin/salas/${sala.id}`} state={state} className={styles.card}>
      <header className={styles.header}>
        <h3 className={styles.codigo}>{sala.codigo}</h3>
        <Tag tone={TONO_ESTADO_SALA[sala.estado]}>{ESTADO_SALA_LABEL[sala.estado]}</Tag>
      </header>
      <dl className={styles.datos}>
        <div>
          <dt>Escena</dt>
          <dd>{ESCENA_LABEL[sala.escena]}</dd>
        </div>
        <div>
          <dt>Puzzles</dt>
          <dd>
            {sala.puzzlesResueltos} / {sala.puzzlesTotal}
          </dd>
        </div>
        <div>
          <dt>App</dt>
          <dd>{sala.appUnida ? 'Unida' : 'Sin unir'}</dd>
        </div>
      </dl>
      <p className={styles.meta}>Última actividad {formatearFecha(sala.ultimaActividad)}</p>
    </Link>
  );
}
