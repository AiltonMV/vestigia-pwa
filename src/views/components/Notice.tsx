import { useEffect } from 'react';
import { cx } from '@/views/utils/cx';
import styles from './Notice.module.css';

const AUTO_CLOSE_MS = 6000;

interface NoticeProps {
  tone: 'info' | 'exito' | 'error';
  text: string;
  onClose: () => void;
}

/** Aviso flotante; los de éxito e info se cierran solos, los de error esperan al usuario. */
export function Notice({ tone, text, onClose }: NoticeProps) {
  useEffect(() => {
    if (tone === 'error') return;
    const timer = window.setTimeout(onClose, AUTO_CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [tone, text, onClose]);

  return (
    <div className={cx(styles.notice, styles[tone])} role={tone === 'error' ? 'alert' : 'status'}>
      <p className={styles.text}>{text}</p>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar aviso">
        ×
      </button>
    </div>
  );
}
