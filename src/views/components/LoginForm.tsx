import { useState, type FormEvent } from 'react';
import type { Credenciales, ErroresDeCredenciales } from '@/models/Sesion';
import { validarCredenciales } from '@/services/sesionValidation';
import { tieneErrores } from '@/services/validation';
import { fieldA11y } from '@/views/utils/fieldA11y';
import { Button } from './Button';
import { FormField } from './FormField';
import { PasswordInput } from './PasswordInput';
import styles from './FormPanel.module.css';

interface LoginFormProps {
  /** Devuelve los errores por campo, o `null` si entró. */
  onSubmit: (credenciales: Credenciales) => Promise<ErroresDeCredenciales | null>;
  entrando: boolean;
}

/** Inicio de sesión de administración con correo y contraseña. */
export function LoginForm({ onSubmit, entrando }: LoginFormProps) {
  const [datos, setDatos] = useState<Credenciales>({ correo: '', password: '' });
  const [errores, setErrores] = useState<ErroresDeCredenciales>({});

  const cambiar = (campo: keyof Credenciales, valor: string) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => {
      const resto = { ...actuales };
      delete resto[campo];
      return resto;
    });
  };

  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    const locales = validarCredenciales(datos);
    setErrores(locales);
    if (tieneErrores(locales)) return;
    const delServidor = await onSubmit(datos);
    // Tras un rechazo se borra la contraseña, como en cualquier inicio de sesión.
    if (delServidor) {
      setErrores(delServidor);
      setDatos((actuales) => ({ ...actuales, password: '' }));
    }
  };

  return (
    <form className={styles.form} onSubmit={enviar} noValidate>
      <h2 className={styles.title}>Iniciar sesión</h2>

      <FormField label="Correo" htmlFor="login-correo" error={errores.correo}>
        <input
          type="email"
          {...fieldA11y('login-correo', errores.correo)}
          value={datos.correo}
          autoComplete="username"
          inputMode="email"
          onChange={(event) => cambiar('correo', event.target.value)}
        />
      </FormField>

      <FormField label="Contraseña" htmlFor="login-password" error={errores.password}>
        <PasswordInput
          {...fieldA11y('login-password', errores.password)}
          value={datos.password}
          autoComplete="current-password"
          onChange={(event) => cambiar('password', event.target.value)}
        />
      </FormField>

      <div className={styles.actions}>
        <Button type="submit" disabled={entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </Button>
      </div>
    </form>
  );
}
