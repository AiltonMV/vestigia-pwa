import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Starts every page at the top. The story pages read the scroll as progress: without this,
 * leaving the landing from its last chapter would open the next page already at the end.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    // Braces matter: newer browsers return a Promise from scrollTo, and an effect may only
    // return its cleanup function.
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
