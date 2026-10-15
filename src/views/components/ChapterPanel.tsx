import { REVEAL, useChapterReveal } from '@/hooks/useChapterReveal';
import type { CallToAction, ChapterAlign } from '@/models/Chapter';
import type { StoryClock } from '@/views/story/StoryClock';
import { cx } from '@/views/utils/cx';
import { ArrowIcon } from './ArrowIcon';
import { Button } from './Button';
import { RevealText } from './RevealText';
import styles from './ChapterPanel.module.css';

interface ChapterPanelProps {
  clock: StoryClock;
  /** Scroll story range the chapter is on screen. */
  start: number;
  end: number;
  eyebrow?: string;
  title?: string;
  body?: string;
  highlight?: string;
  footnote?: string;
  cta?: CallToAction;
  align: ChapterAlign;
}

/** One block of story text, revealed word by word as the reader scrolls through it. */
export function ChapterPanel({
  clock,
  start,
  end,
  eyebrow,
  title,
  body,
  highlight,
  footnote,
  cta,
  align,
}: ChapterPanelProps) {
  const root = useChapterReveal<HTMLElement>(clock, start, end);

  return (
    <article ref={root} className={cx(styles.panel, styles[align])}>
      {eyebrow && (
        <p className={styles.eyebrow} {...{ [REVEAL.lead]: '' }}>
          {eyebrow}
        </p>
      )}
      {title && <RevealText as="h2" className={styles.title} text={title} highlight={highlight} />}
      {body && <RevealText className={styles.body} text={body} />}
      {cta && (
        <Button
          href={cta.href}
          icon={<ArrowIcon />}
          className={styles.cta}
          {...{ [REVEAL.extra]: '' }}
        >
          {cta.label}
        </Button>
      )}
      {footnote && (
        <p className={styles.footnote} {...{ [REVEAL.extra]: '' }}>
          {footnote}
        </p>
      )}
    </article>
  );
}
