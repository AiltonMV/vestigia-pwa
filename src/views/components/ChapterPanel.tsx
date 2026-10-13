import type { CallToAction, ChapterAlign } from '@/models/Chapter';
import { cx } from '@/views/utils/cx';
import { Button } from './Button';
import { countWords } from '@/views/utils/text';
import { REVEAL_STEP_MS, RevealText } from './RevealText';
import styles from './ChapterPanel.module.css';

interface ChapterPanelProps {
  eyebrow?: string;
  title?: string;
  body?: string;
  highlight?: string;
  footnote?: string;
  hint?: string;
  cta?: CallToAction;
  align: ChapterAlign;
  visible: boolean;
}

/** One block of story text: eyebrow, title, body and optional call to action. */
export function ChapterPanel({
  eyebrow,
  title,
  body,
  highlight,
  footnote,
  hint,
  cta,
  align,
  visible,
}: ChapterPanelProps) {
  const bodyDelay = countWords(title) * REVEAL_STEP_MS;

  return (
    <div className={cx(styles.panel, styles[align], visible && styles.visible)}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      {title && (
        <RevealText
          as="h2"
          className={styles.title}
          text={title}
          highlight={highlight}
          visible={visible}
        />
      )}
      {body && (
        <RevealText className={styles.body} text={body} visible={visible} delay={bodyDelay} />
      )}
      {cta && (
        <Button href={cta.href} icon="→" className={styles.cta} tabIndex={visible ? 0 : -1}>
          {cta.label}
        </Button>
      )}
      {footnote && <p className={styles.footnote}>{footnote}</p>}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
}
