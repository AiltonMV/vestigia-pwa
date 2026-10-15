import { useState, type FormEvent } from 'react';
import {
  ESCENARIO_LABEL,
  ESCENARIOS,
  NOMBRE_MAX,
  type ErroresDeCampo,
  type NuevaSala,
} from '@/models/Sala';
import { tieneErrores, validarNuevaSala } from '@/services/salaValidation';
import { Button } from './Button';
import { fieldA11y } from '@/views/utils/fieldA11y';
import { FormField } from './FormField';
import styles from './SalaForm.module.css';

const VACIA: NuevaSala = { nombre: '', descripcion: '', escenario: '', activa: true };

interface SalaFormProps {
  /** Devuelve los errores por campo, o `null` si se guardó. */
  onSubmit: (sala: NuevaSala) => Promise<ErroresDeCampo | null>;
  guardando: boolean;
}

/** Alta de sala: valida en el cliente y muestra junto a cada campo los errores del servidor. */
export function SalaForm({ onSubmit, guardando }: SalaFormProps) {
  const [datos, setDatos] = useState<NuevaSala>(VACIA);
  const [errores, setErrores] = useState<ErroresDeCampo>({});

  const cambiar = <K extends keyof NuevaSala>(campo: K, valor: NuevaSala[K]) => {
    setDatos((actuales) => ({ ...actuales, [campo]: valor }));
    setErrores((actuales) => {
      const resto = { ...actuales };
      delete resto[campo];
      return resto;
    });
  };

  const enviar = async (event: FormEvent) => {
    event.preventDefault();
    const locales = validarNuevaSala(datos);
    setErrores(locales);
    if (tieneErrores(locales)) return;
    const delServidor = await onSubmit(datos);
    if (delServidor) setErrores(delServidor);
    else setDatos(VACIA);
  };

  return (
    <form className={styles.form} onSubmit={enviar} noValidate>
      <h2 className={styles.title}>Nueva sala</h2>

      <FormField label="Nombre" htmlFor="sala-nombre" error={errores.nombre}>
        <input
          type="text"
          {...fieldA11y('sala-nombre', errores.nombre)}
          value={datos.nombre}
          maxLength={NOMBRE_MAX}
          autoComplete="off"
          onChange={(event) => cambiar('nombre', event.target.value)}
        />
      </FormField>

      <FormField
        label="Descripción"
        htmlFor="sala-descripcion"
        error={errores.descripcion}
        hint="Opcional"
      >
        <textarea
          {...fieldA11y('sala-descripcion', errores.descripcion)}
          value={datos.descripcion}
          onChange={(event) => cambiar('descripcion', event.target.value)}
        />
      </FormField>

      <FormField label="Escenario" htmlFor="sala-escenario" error={errores.escenario}>
        <select
          {...fieldA11y('sala-escenario', errores.escenario)}
          value={datos.escenario}
          onChange={(event) => cambiar('escenario', event.target.value as NuevaSala['escenario'])}
        >
          <option value="" disabled>
            Elige uno…
          </option>
          {ESCENARIOS.map((escenario) => (
            <option key={escenario} value={escenario}>
              {ESCENARIO_LABEL[escenario]}
            </option>
          ))}
        </select>
      </FormField>

      <label className={styles.toggle}>
        <input
          type="checkbox"
          checked={datos.activa}
          onChange={(event) => cambiar('activa', event.target.checked)}
        />
        Sala activa
      </label>

      <Button type="submit" disabled={guardando} className={styles.submit}>
        {guardando ? 'Guardando…' : 'Guardar sala'}
      </Button>
    </form>
  );
}
