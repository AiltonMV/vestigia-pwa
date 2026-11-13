import { useState, type InputHTMLAttributes } from 'react';
import styles from './PasswordInput.module.css';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { id: string };

/** Campo de contraseña con un botón para mostrarla u ocultarla. */
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={styles.wrapper}>
      <input {...props} type={visible ? 'text' : 'password'} />
      <button
        type="button"
        className={styles.toggle}
        aria-controls={props.id}
        aria-pressed={visible}
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        onClick={() => setVisible((actual) => !actual)}
      >
        {visible ? 'Ocultar' : 'Mostrar'}
      </button>
    </div>
  );
}
