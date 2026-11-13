import { useState, type FormEvent } from 'react';
import {
  USUARIO_CORREO_MAX,
  USUARIO_NOMBRE_MAX,
  USUARIO_PASSWORD_MAX,
  USUARIO_PASSWORD_MIN,
  type ErroresDeUsuario,
  type NuevoUsuario,
} from '@/models/Usuario';
import { validarNuevoUsuario } from '@/services/usuarioValidation';
import { tieneErrores } from '@/services/validation';
import { fieldA11y } from '@/views/utils/fieldA11y';
import { Button } from './Button';
import { FormField } from './FormField';
import styles from './FormPanel.module.css';

const VACIO: NuevoUsuario = { nombre: '', correo: '', password: '' };

interface UsuarioFormProps {
  /** Devuelve los errores por campo, o `null` si se guardó. */
  onSubmit: (usuario: NuevoUsuario) => Promise<ErroresDeUsuario | null>;
  guardando: boolean;
}

/** Alta de un administrador: valida en el cliente y muestra junto a cada campo los errores del servidor. */
export function UsuarioForm({ onSubmit, guardando }: UsuarioFormProps) {
  const [datos, setDatos] = useState<NuevoUsuario>(VACIO);
  const [errores, setErrores] = useState<ErroresDeUsuario>({});

  const cambiar = <K extends keyof NuevoUsuario>(campo: K, valor: NuevoUsuario[K]) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => {
      const resto = { ...actuales };
      delete resto[campo];
      return resto;
    });
  };

  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    const locales = validarNuevoUsuario(datos);
    setErrores(locales);
    if (tieneErrores(locales)) return;
    const delServidor = await onSubmit(datos);
    if (delServidor) setErrores(delServidor);
    else setDatos(VACIO);
  };

  return (
    <form className={styles.form} onSubmit={enviar} noValidate>
      <h2 className={styles.title}>Nuevo administrador</h2>

      <FormField label="Nombre" htmlFor="usuario-nombre" error={errores.nombre}>
        <input
          type="text"
          {...fieldA11y('usuario-nombre', errores.nombre)}
          value={datos.nombre}
          maxLength={USUARIO_NOMBRE_MAX}
          autoComplete="name"
          onChange={(event) => cambiar('nombre', event.target.value)}
        />
      </FormField>

      <FormField label="Correo" htmlFor="usuario-correo" error={errores.correo}>
        <input
          type="email"
          {...fieldA11y('usuario-correo', errores.correo)}
          value={datos.correo}
          maxLength={USUARIO_CORREO_MAX}
          autoComplete="email"
          inputMode="email"
          onChange={(event) => cambiar('correo', event.target.value)}
        />
      </FormField>

      <FormField
        label="Contraseña"
        htmlFor="usuario-password"
        error={errores.password}
        hint={`De ${USUARIO_PASSWORD_MIN} a ${USUARIO_PASSWORD_MAX} caracteres. Pásasela a la persona: no se puede volver a consultar.`}
      >
        <input
          type="password"
          {...fieldA11y('usuario-password', errores.password)}
          value={datos.password}
          maxLength={USUARIO_PASSWORD_MAX}
          autoComplete="new-password"
          onChange={(event) => cambiar('password', event.target.value)}
        />
      </FormField>

      <div className={styles.actions}>
        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : 'Agregar usuario'}
        </Button>
      </div>
    </form>
  );
}
