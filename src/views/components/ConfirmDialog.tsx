import { useEffect, useRef, type ReactNode } from 'react';
import { Button } from './Button';
import styles from './ConfirmDialog.module.css';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  /** Deshabilita los botones y bloquea el cierre mientras la acción está en curso. */
  busy?: boolean;
  /** Error de la acción, mostrado dentro del modal. */
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Modal de confirmación sobre `<dialog>`: el navegador pone el foco dentro y cierra con Escape. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busy = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-labelledby="confirm-titulo"
      onCancel={(event) => {
        // Escape: lo gestiona el estado del padre, no el navegador.
        event.preventDefault();
        if (!busy) onCancel();
      }}
      onClick={(event) => {
        if (event.target === dialog.current && !busy) onCancel();
      }}
    >
      <h3 id="confirm-titulo" className={styles.titulo}>
        {title}
      </h3>
      <div className={styles.cuerpo}>{children}</div>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <div className={styles.acciones}>
        <Button type="button" className={styles.secundario} onClick={onCancel} disabled={busy}>
          Cancelar
        </Button>
        <Button type="button" onClick={onConfirm} disabled={busy}>
          {busy ? 'Liberando…' : confirmLabel}
        </Button>
      </div>
    </dialog>
  );
}
