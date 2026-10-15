import type { ReactNode } from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  /** `id` del control, para enlazar la etiqueta y el mensaje de error. */
  htmlFor: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

/** Etiqueta, control y mensaje de error/ayuda, con los ids que necesitan los lectores de pantalla. */
export function FormField({ label, htmlFor, error, hint, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className={styles.error} role="alert">
          {error}
        </p>
      ) : (
        hint && <p className={styles.hint}>{hint}</p>
      )}
    </div>
  );
}
