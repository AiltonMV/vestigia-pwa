import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '@/views/utils/cx';
import styles from './Button.module.css';

interface BaseProps {
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

/** Route inside the app (React Router, no page reload). */
type RouteProps = BaseProps & AnchorProps & { to: string; href?: never };
/** Any other URL. */
type LinkProps = BaseProps & AnchorProps & { href: string; to?: never };
type NativeButtonProps = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: never; to?: never };

export type ButtonProps = RouteProps | LinkProps | NativeButtonProps;

/** Primary action. Renders a route link with `to`, a link with `href`, otherwise a button. */
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

  if (props.to !== undefined) {
    const { to, ...rest } = props as RouteProps;
    return (
      <Link className={classes} to={to} {...rest}>
        {content}
      </Link>
    );
  }
  if (props.href !== undefined) {
    return (
      <a className={classes} {...(props as LinkProps)}>
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
