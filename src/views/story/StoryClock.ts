import { clamp01, smooth } from '@/views/utils/math';
import { FINALE, glitchAt, localProgress, sketchAt } from './timeline';

/** Below this width the layout stacks: text under the scene, fewer notes. */
export const WIDE_MIN_WIDTH = 720;

/** Which side of the screen a chapter's text sits on, so the scene can make room for it. */
export type StorySide = -1 | 0 | 1;

export interface StoryBeat {
  start: number;
  end: number;
  side: StorySide;
  /** The cover is not a text chapter: it doesn't push the scene nor darken the screen. */
  cover: boolean;
}

export interface ScreenPoint {
  x: number;
  y: number;
}

/** Everything that moves with the story, recomputed once per animation frame. */
export interface StoryFrame {
  /** Seconds since the clock started. */
  time: number;
  delta: number;
  /** Scroll progress with inertia, 0 → 1. */
  progress: number;
  /** How much the progress moved this frame. */
  motion: number;
  /** 0 = stormy night, 1 = notebook page. */
  sketch: number;
  glitch: number;
  /** 0 → 1 as the finale settles in. */
  finale: number;
  /** Finale heartbeat shared by the lamp and the sky. */
  pulse: number;
  /** Lightning brightness, decays after each bolt. */
  flash: number;
  /** True only on the frame a bolt strikes. */
  lightning: boolean;
  /** -1 text on the left … 1 text on the right. */
  side: number;
  /** How much chapter text is on screen. */
  textVisibility: number;
  activeIndex: number;
  reducedMotion: boolean;
  width: number;
  height: number;
  /** Scene points projected to the screen by the 3D scene each frame. */
  anchors: { lamp: ScreenPoint; base: ScreenPoint; top: ScreenPoint; measureX: number };
}

export type FrameListener = (frame: StoryFrame) => void;

const INERTIA = 5.5;
const MAX_DELTA = 0.05;
const firstFlashIn = () => 6 + Math.random() * 6;
const nextFlashIn = () => 7 + Math.random() * 9;

/**
 * Single animation loop of the landing: turns the page scroll into a smoothed story progress
 * and derived values. Renderers (the 3D scene) run first each frame, then the DOM listeners,
 * so text and notes always match the image on screen.
 */
export class StoryClock {
  readonly frame: StoryFrame;
  private beats: StoryBeat[] = [];
  private readonly renderers = new Set<FrameListener>();
  private readonly listeners = new Set<FrameListener>();
  private raf = 0;
  private last = 0;
  private started = false;
  private maxScroll = 1;
  private nextFlash = firstFlashIn();

  constructor() {
    this.frame = {
      time: 0,
      delta: 0,
      progress: 0,
      motion: 0,
      sketch: 0,
      glitch: 0,
      finale: 0,
      pulse: 0,
      flash: 0,
      lightning: false,
      side: 0,
      textVisibility: 0,
      activeIndex: 0,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      width: window.innerWidth,
      height: window.innerHeight,
      anchors: { lamp: { x: 0, y: 0 }, base: { x: 0, y: 0 }, top: { x: 0, y: 0 }, measureX: 0 },
    };
  }

  setBeats(beats: StoryBeat[]) {
    this.beats = beats;
    this.measure();
  }

  start() {
    window.addEventListener('resize', this.measure);
    this.measure();
    this.started = false;
    this.raf = requestAnimationFrame(this.tick);
  }

  stop() {
    window.removeEventListener('resize', this.measure);
    cancelAnimationFrame(this.raf);
  }

  /** Called first on every frame (the 3D scene). */
  onRender(listener: FrameListener) {
    this.renderers.add(listener);
    return () => void this.renderers.delete(listener);
  }

  /** Called after the renderers on every frame (DOM updates). */
  subscribe(listener: FrameListener) {
    this.listeners.add(listener);
    return () => void this.listeners.delete(listener);
  }

  scrollTo(progress: number) {
    window.scrollTo({
      top: clamp01(progress) * this.maxScroll,
      behavior: this.frame.reducedMotion ? 'auto' : 'smooth',
    });
  }

  private measure = () => {
    this.frame.width = window.innerWidth;
    this.frame.height = window.innerHeight;
    this.maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };

  private tick = (now: number) => {
    this.raf = requestAnimationFrame(this.tick);
    const f = this.frame;
    const target = clamp01(window.scrollY / this.maxScroll);

    if (!this.started) {
      // Start where the page already is (e.g. after a reload) instead of gliding from the top.
      this.started = true;
      this.last = now;
      f.progress = target;
    }
    const dt = Math.min(MAX_DELTA, (now - this.last) / 1000);
    this.last = now;
    f.time += dt;
    f.delta = dt;

    const previous = f.progress;
    f.progress = f.reducedMotion
      ? target
      : previous + (target - previous) * (1 - Math.exp(-dt * INERTIA));
    f.motion = Math.abs(f.progress - previous);

    const p = f.progress;
    f.sketch = sketchAt(p);
    f.glitch = glitchAt(p) * (f.reducedMotion ? 0.3 : 1);
    f.finale = smooth(FINALE, 0.97, p);
    f.pulse = f.finale * Math.pow(0.5 + 0.5 * Math.sin(f.time * 2.4), 6);
    this.updateLightning(dt);
    this.updateBeats(p);

    for (const render of this.renderers) render(f);
    for (const listener of this.listeners) listener(f);
  };

  private updateLightning(dt: number) {
    const f = this.frame;
    f.lightning = false;
    if (f.reducedMotion) return;
    this.nextFlash -= dt;
    if (this.nextFlash <= 0 && f.sketch < 0.2) {
      f.flash = 1;
      f.lightning = true;
      this.nextFlash = nextFlashIn();
    }
    f.flash *= Math.exp(-dt * (f.flash > 0.5 ? 9 : 4));
    // A second, weaker flicker right after the bolt.
    if (f.flash > 0.3 && Math.random() < 0.08) f.flash = 0.9;
  }

  private updateBeats(p: number) {
    const f = this.frame;
    let active = 0;
    let side = 0;
    let text = 0;
    this.beats.forEach((beat, index) => {
      if (p >= beat.start) active = index;
      if (beat.cover) return;
      const lp = localProgress(p, beat.start, beat.end);
      const stays = beat.end > 1;
      side += beat.side * smooth(-0.05, 0.15, lp) * (1 - smooth(0.85, 1.05, lp));
      text = Math.max(text, smooth(-0.02, 0.08, lp) * (stays ? 1 : 1 - smooth(0.85, 1, lp)));
    });
    f.activeIndex = active;
    f.side = side;
    f.textVisibility = text;
  }
}
