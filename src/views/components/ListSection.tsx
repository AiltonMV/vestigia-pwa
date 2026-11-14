import type { ReactNode } from 'react';
import type { EstadoCarga } from '@/models/Vista';
import { Button } from './Button';
import { StatusMessage } from './StatusMessage';
import styles from './ListSection.module.css';

interface ListSectionProps<T> {
  /** Prefijo de los ids (accesibilidad). */
  id: string;
  title: string;
  items: T[];
  /** Total que se muestra junto al título; por defecto, cuántos elementos hay. */
  count?: number;
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  estado: EstadoCarga;
  onRetry: () => void;
  loadingTitle: string;
  errorText?: string;
  emptyTitle: string;
  emptyText?: string;
}

/**
 * Listado con sus estados de carga, error y vacío. Los elementos se muestran aunque haya
 * error (p. ej. los guardados en el dispositivo cuando no hay conexión).
 */
export function ListSection<T>({
  id,
  title,
  items,
  count = items.length,
  getKey,
  renderItem,
  estado,
  onRetry,
  loadingTitle,
  errorText,
  emptyTitle,
  emptyText,
}: ListSectionProps<T>) {
  const titleId = `${id}-titulo`;
  return (
    <section className={styles.list} aria-labelledby={titleId} aria-busy={estado === 'cargando'}>
      <h2 id={titleId} className={styles.title}>
        {title} {estado !== 'cargando' && <span className={styles.count}>{count}</span>}
      </h2>

      {estado === 'cargando' && <StatusMessage title={loadingTitle} />}

      {estado === 'error' && (
        <StatusMessage
          tone="error"
          title="No se pudo cargar el listado"
          action={
            <Button type="button" onClick={onRetry}>
              Reintentar
            </Button>
          }
        >
          {errorText}
        </StatusMessage>
      )}

      {estado === 'listo' && items.length === 0 && (
        <StatusMessage title={emptyTitle}>{emptyText}</StatusMessage>
      )}

      {items.length > 0 && (
        <ul className={styles.grid}>
          {items.map((item) => (
            <li key={getKey(item)}>{renderItem(item)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
