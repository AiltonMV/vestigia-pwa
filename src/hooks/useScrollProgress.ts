import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Tracks page scroll measured in viewport heights (section 0 → n-1).
 * `progressRef` updates on every scroll without re-rendering; `activeIndex` only changes
 * when the nearest section changes.
 */
export function useScrollProgress(sectionCount: number) {
  const progressRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const lastIndex = Math.max(sectionCount - 1, 0);
    const update = () => {
      const progress = window.scrollY / window.innerHeight;
      progressRef.current = progress;
      setActiveIndex(Math.min(Math.max(Math.round(progress), 0), lastIndex));
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sectionCount]);

  const scrollToSection = useCallback((index: number) => {
    window.scrollTo({ top: index * window.innerHeight, behavior: 'smooth' });
  }, []);

  return { progressRef, activeIndex, scrollToSection };
}
