import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAmbientSound } from '@/hooks/useAmbientSound';
import { KONAMI_CODE, useKeySequence, useRepeatedTap } from '@/hooks/useSecretSequence';
import { chapterService, type ChapterService } from '@/services/chapterService';
import { useStoryController } from './useStoryController';

/** Hidden way into the rooms: the Konami code, or tapping the logo this many times on touch. */
const SALAS_PATH = '/salas';
const LOGO_TAPS = 5;
/** How long the "frequency found" transition shows before leaving. */
const SECRET_TRANSITION_MS = 1100;

export function useLandingController(service: ChapterService = chapterService) {
  const story = useStoryController(service);
  const { clock } = story;
  const sound = useAmbientSound(clock);
  const navigate = useNavigate();
  const [openingSalas, setOpeningSalas] = useState(false);
  const openSalas = useCallback(() => setOpeningSalas(true), []);
  useKeySequence(KONAMI_CODE, openSalas);
  const tapLogo = useRepeatedTap(LOGO_TAPS, openSalas);

  useEffect(() => {
    if (!openingSalas) return;
    const delay = clock.frame.reducedMotion ? 0 : SECRET_TRANSITION_MS;
    const timer = window.setTimeout(() => navigate(SALAS_PATH), delay);
    return () => window.clearTimeout(timer);
  }, [openingSalas, clock, navigate]);

  return { ...story, sound, openingSalas, tapLogo };
}
