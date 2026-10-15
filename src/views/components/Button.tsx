import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/views/utils/cx';
import styles from './Button.module.css';

interface BaseProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

type LinkProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type NativeButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };

export type ButtonProps = LinkProps | NativeButtonProps;

/** Primary action. Renders a link when given `href`, otherwise a button. */
export function Button({ children, icon, className, ...props }: ButtonProps) {
  const content = (
    <>
      {children}
      {icon && (
        <span className={styles.icon} aria-hidden>
          {icon}
        </span>
      )}
    </>
  );
  const classes = cx(styles.button, className);

  if (props.href !== undefined) {
    return (
      <a className={classes} {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {content}
      </a>
    );
  }
  return (
    <button
      type="button"
      className={classes}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
