import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSalasController } from '@/controllers/useSalasController';
import { Button } from '@/views/components/Button';
import { ConnectionStatus } from '@/views/components/ConnectionStatus';
import { Notice } from '@/views/components/Notice';
import { SalaCard } from '@/views/components/SalaCard';
import { SalaForm } from '@/views/components/SalaForm';
import { StatusMessage } from '@/views/components/StatusMessage';
import styles from './SalasPage.module.css';

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
    <div className={styles.page}>
      <header className={styles.header}>
        <Link to="/" className={styles.back}>
          ← Volver al faro
        </Link>
        <div className={styles.heading}>
          <p className={styles.eyebrow}>Vestigia · Laboratorio</p>
          <h1 className={styles.title}>Salas</h1>
        </div>
        <ConnectionStatus online={online} pendientes={pendientes} sincronizando={sincronizando} />
      </header>

      <main className={styles.layout}>
        <section
          className={styles.list}
          aria-labelledby="salas-titulo"
          aria-busy={estado === 'cargando'}
        >
          <h2 id="salas-titulo" className={styles.sectionTitle}>
            Listado {estado !== 'cargando' && <span className={styles.count}>{salas.length}</span>}
          </h2>

          {estado === 'cargando' && <StatusMessage title="Cargando salas…" />}

          {estado === 'error' && (
            <StatusMessage
              tone="error"
              title="No se pudo cargar el listado"
              action={
                <Button type="button" onClick={recargar}>
                  Reintentar
                </Button>
              }
            >
              {errorCarga}
            </StatusMessage>
          )}

          {estado === 'listo' && salas.length === 0 && (
            <StatusMessage title="Todavía no hay salas">
              Crea la primera con el formulario.
            </StatusMessage>
          )}

          {salas.length > 0 && (
            <ul className={styles.grid}>
              {salas.map((sala) => (
                <li key={sala.id}>
                  <SalaCard
                    sala={sala}
                    online={online}
                    editing={editando?.id === sala.id}
                    onEdit={editar}
                    onDelete={eliminar}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside ref={formulario} className={styles.form}>
          {/* La key vuelve a montar el formulario al cambiar de sala, con sus datos iniciales. */}
          <SalaForm
            key={editando?.id ?? 'nueva'}
            sala={editando}
            onSubmit={guardar}
            onCancel={editando ? cancelarEdicion : undefined}
            guardando={guardando}
          />
        </aside>
      </main>

      {aviso && <Notice tone={aviso.tono} text={aviso.texto} onClose={cerrarAviso} />}
    </div>
  );
}
