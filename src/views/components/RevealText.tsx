import { useMemo } from 'react';
import { REVEAL } from '@/hooks/useChapterReveal';
import { cx } from '@/views/utils/cx';
import styles from './RevealText.module.css';

interface RevealTextProps {
  text: string;
  /** Exact substring of `text` to emphasise. */
  highlight?: string;
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

/**
 * Text split into words that a parent can animate one by one (see `useChapterReveal`).
 * Screen readers get the plain sentence.
 */
export function RevealText({ text, highlight, as: Tag = 'p', className }: RevealTextProps) {
  const pieces = useMemo(() => splitPieces(text, highlight), [text, highlight]);

  return (
    <Tag className={cx(styles.text, className)}>
      <span className="sr-only">{text}</span>
      {pieces.map((piece, i) =>
        /^\s+$/.test(piece.text) ? (
          piece.text
        ) : (
          <span
            key={i}
            aria-hidden
            className={cx(styles.word, piece.highlighted && styles.highlight)}
            {...{ [REVEAL.word]: '' }}
          >
            {piece.text}
          </span>
        ),
      )}
    </Tag>
  );
}
