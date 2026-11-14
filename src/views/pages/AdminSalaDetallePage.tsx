import { Link, useLocation, useParams } from 'react-router-dom';
import { useAdminSalaController } from '@/controllers/useAdminSalaController';
import {
  ESCENA_LABEL,
  ESTADO_PUZZLE_LABEL,
  ESTADO_SALA_LABEL,
  ORIGEN_LABEL,
  PUZZLE_LABEL,
  type RegresoDetalle,
} from '@/models/SalaAdmin';
import { Button } from '@/views/components/Button';
import { StatusMessage } from '@/views/components/StatusMessage';
import { Tag } from '@/views/components/Tag';
import { formatearFecha } from '@/views/utils/fecha';
import { TONO_ESTADO_PUZZLE, TONO_ESTADO_SALA } from '@/views/utils/tonos';
import styles from './AdminSalaDetallePage.module.css';

/** `{"puzzle": "radio"}` → `puzzle: radio`; nada si el objeto viene vacío. */
function Datos({ datos }: { datos: Record<string, unknown> }) {
  const entradas = Object.entries(datos);
  if (entradas.length === 0) return null;
  return (
    <code className={styles.datosJson}>
      {entradas.map(([clave, valor]) => `${clave}: ${JSON.stringify(valor)}`).join(' · ')}
    </code>
  );
}

const siNo = (valor: boolean) => (valor ? 'Sí' : 'No');

/** Detalle de una sala: resumen, puzzles, descubrimientos y bitácora. Solo lectura. */
export function AdminSalaDetallePage() {
  const { id = '' } = useParams();
  const regreso = useLocation().state as RegresoDetalle | null;
  const { sala, estado, errorCarga, recargar } = useAdminSalaController(id);
  const volver = regreso?.desde.startsWith('/admin/salas') ? regreso.desde : '/admin/salas';

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link to={volver} className={styles.volver}>
          ← Salas
        </Link>
        {sala && (
          <Button type="button" onClick={recargar} disabled={estado === 'cargando'}>
            Actualizar
          </Button>
        )}
      </div>

      {estado === 'cargando' && !sala && <StatusMessage title="Cargando sala…" />}

      {estado === 'error' && (
        <StatusMessage
          tone="error"
          title="No se pudo mostrar la sala"
          action={
            <Button type="button" onClick={recargar}>
              Reintentar
            </Button>
          }
        >
          {errorCarga}
        </StatusMessage>
      )}

      {sala && (
        <>
          <header className={styles.header}>
            <h2 className={styles.codigo}>{sala.codigo}</h2>
            <Tag tone={TONO_ESTADO_SALA[sala.estado]}>{ESTADO_SALA_LABEL[sala.estado]}</Tag>
          </header>

          <dl className={styles.resumen}>
            <div>
              <dt>Escena</dt>
              <dd>{ESCENA_LABEL[sala.escena]}</dd>
            </div>
            <div>
              <dt>App unida</dt>
              <dd>{siNo(sala.appUnida)}</dd>
            </div>
            <div>
              <dt>Juego conectado</dt>
              <dd>{siNo(sala.dispositivos.juego)}</dd>
            </div>
            <div>
              <dt>App conectada</dt>
              <dd>{siNo(sala.dispositivos.app)}</dd>
            </div>
            <div>
              <dt>Creada</dt>
              <dd>{formatearFecha(sala.creadaEn)}</dd>
            </div>
            <div>
              <dt>Última actividad</dt>
              <dd>{formatearFecha(sala.ultimaActividad)}</dd>
            </div>
            {(sala.estado === 'activa' || sala.estado === 'esperando_app') && (
              <div>
                <dt>Expira si nadie juega</dt>
                <dd>{formatearFecha(sala.expiraEn)}</dd>
              </div>
            )}
          </dl>

          <section className={styles.seccion} aria-labelledby="sala-puzzles">
            <h3 id="sala-puzzles" className={styles.titulo}>
              Puzzles
            </h3>
            <ul className={styles.lista}>
              {sala.puzzles.map((puzzle) => (
                <li key={puzzle.puzzle} className={styles.fila}>
                  <span className={styles.nombre}>{PUZZLE_LABEL[puzzle.puzzle]}</span>
                  <Tag tone={TONO_ESTADO_PUZZLE[puzzle.estado]}>
                    {ESTADO_PUZZLE_LABEL[puzzle.estado]}
                  </Tag>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.seccion} aria-labelledby="sala-descubrimientos">
            <h3 id="sala-descubrimientos" className={styles.titulo}>
              Descubrimientos <span className={styles.cuenta}>{sala.descubrimientos.length}</span>
            </h3>
            {sala.descubrimientos.length === 0 ? (
              <p className={styles.vacio}>Todavía no hay descubrimientos.</p>
            ) : (
              <ul className={styles.lista}>
                {sala.descubrimientos.map((descubrimiento) => (
                  <li
                    key={`${descubrimiento.clave}-${descubrimiento.creadoEn}`}
                    className={styles.fila}
                  >
                    <span className={styles.nombre}>{descubrimiento.clave}</span>
                    <Datos datos={descubrimiento.datos} />
                    <span className={styles.meta}>
                      {ORIGEN_LABEL[descubrimiento.origen]} ·{' '}
                      {formatearFecha(descubrimiento.creadoEn)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.seccion} aria-labelledby="sala-bitacora">
            <h3 id="sala-bitacora" className={styles.titulo}>
              Bitácora <span className={styles.cuenta}>{sala.eventos.length}</span>
            </h3>
            <ol className={styles.lista}>
              {sala.eventos.map((evento, indice) => (
                <li key={indice} className={styles.fila}>
                  <span className={styles.nombre}>{evento.tipo}</span>
                  <Datos datos={evento.payload} />
                  <span className={styles.meta}>
                    {ORIGEN_LABEL[evento.origen]} · {formatearFecha(evento.creadoEn)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </>
      )}
    </div>
  );
}
