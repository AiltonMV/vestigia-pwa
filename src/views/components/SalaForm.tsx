import { useState, type FormEvent } from 'react';
import {
  ESCENARIO_LABEL,
  ESCENARIOS,
  NOMBRE_MAX,
  type ErroresDeCampo,
  type NuevaSala,
  type Sala,
} from '@/models/Sala';
import { tieneErrores, validarNuevaSala } from '@/services/salaValidation';
import { Button } from './Button';
import { fieldA11y } from '@/views/utils/fieldA11y';
import { FormField } from './FormField';
import styles from './SalaForm.module.css';

const VACIA: NuevaSala = { nombre: '', descripcion: '', escenario: '', activa: true };

const datosDe = (sala: Sala): NuevaSala => ({
  nombre: sala.nombre,
  descripcion: sala.descripcion ?? '',
  escenario: sala.escenario,
  activa: sala.activa,
});

interface SalaFormProps {
  /** Sala a editar. Sin ella, el formulario da de alta una nueva. */
  sala?: Sala;
  /** Devuelve los errores por campo, o `null` si se guardó. */
  onSubmit: (sala: NuevaSala) => Promise<ErroresDeCampo | null>;
  onCancel?: () => void;
  guardando: boolean;
}

/**
 * Alta o edición de una sala: valida en el cliente y muestra junto a cada campo los errores
 * del servidor. Para cambiar de sala, móntalo con otra `key`.
 */
export function SalaForm({ sala, onSubmit, onCancel, guardando }: SalaFormProps) {
  const [datos, setDatos] = useState<NuevaSala>(() => (sala ? datosDe(sala) : VACIA));
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
    else if (!sala) setDatos(VACIA);
  };

  return (
    <form className={styles.form} onSubmit={enviar} noValidate>
      <h2 className={styles.title}>{sala ? 'Editar sala' : 'Nueva sala'}</h2>

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

      <div className={styles.actions}>
        <Button type="submit" disabled={guardando}>
          {guardando ? 'Guardando…' : sala ? 'Guardar cambios' : 'Guardar sala'}
        </Button>
        {onCancel && (
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
