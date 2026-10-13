import { useMemo } from 'react';
import { cx } from '@/views/utils/cx';
import styles from './RevealText.module.css';

export const REVEAL_STEP_MS = 45;

interface RevealTextProps {
  text: string;
  /** Exact substring of `text` to emphasise. */
  highlight?: string;
  visible: boolean;
  /** Milliseconds before the first word starts appearing. */
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
}

interface Piece {
  text: string;
  highlighted: boolean;
}

function splitPieces(text: string, highlight?: string): Piece[] {
  const start = highlight ? text.indexOf(highlight) : -1;
  const segments: Piece[] =
    highlight && start >= 0
      ? [
          { text: text.slice(0, start), highlighted: false },
          { text: highlight, highlighted: true },
          { text: text.slice(start + highlight.length), highlighted: false },
        ]
      : [{ text, highlighted: false }];

  // Keep whitespace as separate pieces so punctuation stays glued to its word.
  return segments.flatMap(({ text: segment, highlighted }) =>
    segment
      .split(/(\s+)/)
      .filter(Boolean)
      .map((piece) => ({ text: piece, highlighted })),
  );
}

/** Text that appears word by word, sharpening out of a blur. */
export function RevealText({
  text,
  highlight,
  visible,
  delay = 0,
  as: Tag = 'p',
  className,
}: RevealTextProps) {
  const pieces = useMemo(() => splitPieces(text, highlight), [text, highlight]);
  let wordIndex = 0;

  return (
    <Tag className={cx(styles.text, visible && styles.visible, className)}>
      <span className={styles.srOnly}>{text}</span>
      {pieces.map((piece, i) => {
        if (/^\s+$/.test(piece.text)) return piece.text;
        const order = wordIndex++;
        return (
          <span
            key={i}
            aria-hidden
            className={cx(styles.word, piece.highlighted && styles.highlight)}
            style={{ transitionDelay: visible ? `${delay + order * REVEAL_STEP_MS}ms` : '0ms' }}
          >
            {piece.text}
          </span>
        );
      })}
    </Tag>
  );
}
