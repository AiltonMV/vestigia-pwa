import { useEffect, useRef } from 'react';

/** A drop that clings to the glass until it is heavy enough to run. */
interface Drop {
  x: number;
  y: number;
  r: number;
  moving: boolean;
  /** Seconds before it tries to run again, or before its pace changes while running. */
  wait: number;
  pace: number;
  drift: number;
  /** Distance run since the last bead it left behind. */
  trail: number;
}

/** Fine mist on the glass, and the beads a running drop leaves behind. */
interface Bead {
  x: number;
  y: number;
  r: number;
}

const TAU = Math.PI * 2;
const MAX_DROPS = 40;
const MAX_BEADS = 700;
/** Sizes are in px of a 1280 px wide screen and scale with the canvas. */
const HEAVY = 6.5;
const LIGHT = 4;

const random = (min: number, max: number) => min + Math.random() * (max - min);

function newDrop(width: number, height: number, unit: number): Drop {
  return {
    x: random(0, width),
    y: random(-height * 0.05, height * 0.9),
    r: (3 + Math.random() ** 2.5 * 10) * unit,
    moving: false,
    wait: random(1, 6),
    pace: 1,
    drift: 0,
    trail: 0,
  };
}

function newBead(width: number, height: number, unit: number): Bead {
  return { x: random(0, width), y: random(0, height), r: random(0.6, 2) * unit };
}

function drawDrop(ctx: CanvasRenderingContext2D, drop: Drop) {
  const { r } = drop;
  ctx.save();
  ctx.translate(drop.x, drop.y);
  // Running drops stretch along their path.
  ctx.scale(1, drop.moving ? 1.22 : 1.06);
  const body = ctx.createRadialGradient(-r * 0.25, -r * 0.3, r * 0.05, 0, 0, r);
  body.addColorStop(0, 'rgb(255 252 244 / 0.14)');
  body.addColorStop(0.7, 'rgb(158 171 182 / 0.05)');
  body.addColorStop(1, 'rgb(158 171 182 / 0.24)');
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
  // The lower rim catches the light like a lens.
  ctx.strokeStyle = 'rgb(215 209 198 / 0.28)';
  ctx.lineWidth = Math.max(0.6, r * 0.12);
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.86, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
  // A warm glint, the only light in the room.
  ctx.fillStyle = 'rgb(255 236 190 / 0.5)';
  ctx.beginPath();
  ctx.arc(-r * 0.35, -r * 0.4, r * 0.16, 0, TAU);
  ctx.fill();
  ctx.restore();
}

/**
 * Rain on a window pane: drops cling, swell, and run down in fits and starts, swallowing the
 * mist in their way and leaving a trail of beads. Still frame when motion is reduced.
 */
export function GlassDrops({ running, className }: { running: boolean; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !running) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let unit = 1;
    let drops: Drop[] = [];
    let beads: Bead[] = [];

    const fill = () => {
      drops = Array.from({ length: MAX_DROPS * 0.6 }, () => newDrop(width, height, unit));
      beads = Array.from({ length: MAX_BEADS * 0.6 }, () => newBead(width, height, unit));
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      unit = width / 1280;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgb(158 171 182 / 0.16)';
      ctx.beginPath();
      for (const bead of beads) {
        ctx.moveTo(bead.x + bead.r, bead.y);
        ctx.arc(bead.x, bead.y, bead.r, 0, TAU);
      }
      ctx.fill();
      for (const drop of drops) drawDrop(ctx, drop);
    };

    const step = (dt: number) => {
      if (
        drops.filter((drop) => drop.r > HEAVY * unit * 0.5).length < MAX_DROPS &&
        Math.random() < dt * 8
      ) {
        drops.push(newDrop(width, height, unit));
      }
      for (let i = 0; i < 3 && beads.length < MAX_BEADS; i++) {
        if (Math.random() < dt * 20) beads.push(newBead(width, height, unit));
      }

      for (const drop of drops) {
        drop.wait -= dt;
        if (!drop.moving) {
          // Condensation slowly feeds every drop until it runs.
          drop.r += 0.12 * unit * dt;
          if (drop.wait <= 0) {
            drop.moving = drop.r > HEAVY * unit;
            drop.wait = drop.moving ? random(0.1, 0.4) : random(0.5, 2.5);
          }
          continue;
        }
        if (drop.wait <= 0) {
          // Glass is never even: the drop hesitates, rushes, and now and then halts.
          drop.wait = random(0.1, 0.45);
          drop.pace = random(0.25, 1.7);
          if (Math.random() < 0.07) {
            drop.moving = false;
            drop.wait = random(0.3, 1.6);
            continue;
          }
        }
        const speed = (drop.r / unit - LIGHT) * 22 * unit * drop.pace;
        drop.drift = Math.max(
          -8 * unit,
          Math.min(8 * unit, drop.drift + random(-1, 1) * 40 * unit * dt),
        );
        const dy = speed * dt;
        drop.y += dy;
        drop.x += drop.drift * dt;
        drop.trail += dy;
        if (drop.trail > drop.r * 0.9) {
          drop.trail = 0;
          const bead = {
            x: drop.x + random(-0.3, 0.3) * drop.r,
            y: drop.y - drop.r * 0.8,
            r: drop.r * random(0.2, 0.38),
          };
          // The larger beads stay as small drops, so the path it ran stays visible.
          if (bead.r > 1.8 * unit && drops.length < MAX_DROPS * 2) {
            drops.push({
              ...bead,
              moving: false,
              wait: random(4, 12),
              pace: 1,
              drift: 0,
              trail: 0,
            });
          } else {
            beads.push(bead);
          }
          drop.r *= 0.985;
          if (drop.r < LIGHT * unit) drop.moving = false;
        }
      }

      // A running drop swallows the mist and the drops it runs into.
      for (const drop of drops) {
        if (!drop.moving) continue;
        beads = beads.filter((bead) => {
          const reach = drop.r + bead.r * 0.5;
          if ((bead.x - drop.x) ** 2 + (bead.y - drop.y) ** 2 > reach * reach) return true;
          drop.r = Math.hypot(drop.r, bead.r * 0.6);
          return false;
        });
        for (const other of drops) {
          if (other === drop || other.r === 0) continue;
          const reach = drop.r + other.r * 0.6;
          if ((other.x - drop.x) ** 2 + (other.y - drop.y) ** 2 > reach * reach) continue;
          drop.r = Math.hypot(drop.r, other.r * 0.85);
          other.r = 0;
        }
      }
      drops = drops.filter((drop) => drop.r > 0 && drop.y - drop.r < height);
      if (beads.length > MAX_BEADS) beads = beads.slice(beads.length - MAX_BEADS);
    };

    // Fires once on observe too, which lays out the first pane.
    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvas);
    if (still) return () => observer.disconnect();

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      step(Math.min((now - last) / 1000, 0.05));
      last = now;
      draw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [running]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
