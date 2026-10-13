import { Annotation } from './Annotation';
import styles from './NotebookNotes.module.css';

/** Screen-space scribbles in the notebook chapters: radio interference and missing coordinates. */
export function NotebookNotes({ visible }: { visible: boolean }) {
  return (
    <div className={styles.notes} aria-hidden>
      <Annotation caption="Interferencia · banda AM" visible={visible} className={styles.topLeft}>
        <svg className={styles.squiggle} viewBox="0 0 150 24">
          <path d="M2 12 q5 -10 10 0 t10 0 t8 -2 t8 4 t10 -6 t8 8 t10 -4 t8 0 t10 -8 t8 10 t10 -4 t8 2 t10 -6 t8 4 t10 -2" />
        </svg>
      </Annotation>
      <Annotation caption="Faltan piezas" visible={visible} className={styles.topRight}>
        <p className={styles.coordinates}>
          AR ___°
          <br />
          DEC ___°
        </p>
      </Annotation>
    </div>
  );
}
