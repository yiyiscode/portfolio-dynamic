import { useEffect, useRef } from 'react';
import { useScrollStore, useThemeStore, prefersReducedMotion } from '../store/stores';
import { PortfolioState, STATE_COUNT, SCATTER_STATE } from '../types';
import { PARTICLE_COUNT, generatePositions, opacityForState, yOffsetForState, zOffsetForState } from './morph';
import { site } from '../data/site';

// ASCII version of the morphing lattice. Particles follow the scroll-driven shape sequence
// (converge -> disperse -> converge) but are drawn as characters on a 2D canvas; every
// clicking makes a ripple. Sharks and fish live in SharkOcean.tsx.
const FOV = 35;
const CAM_Z = 12;
const GLYPHS = ['.', ':', '-', '+', '*', '#'];

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const lerp3 = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c: RGB) => `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;

const PALETTE = {
  dark: { hero: hex('#60a5fa'), blue: hex('#3b82f6'), signal: hex('#ffffff') },
  light: { hero: hex('#2563eb'), blue: hex('#2563eb'), signal: hex('#0f172a') },
};

export function AsciiLattice() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = prefersReducedMotion();
    const clusterCount = Math.max(1, site.projects.length);
    const geos = Array.from({ length: STATE_COUNT }, (_, s) => generatePositions(s, clusterCount));

    const sx = new Float32Array(PARTICLE_COUNT);
    const sy = new Float32Array(PARTICLE_COUNT);
    const bucket = new Uint8Array(PARTICLE_COUNT);

    let W = 0, H = 0, count = PARTICLE_COUNT, fs = 12, focal = 1;
    let zOff = 0, yOff = 0, opacity = 0.9, rot = 0, hoverX = 0, hoverY = 0;
    let color: RGB = [...PALETTE.dark.hero];
    let raf = 0, last = performance.now(), lastProgress = -1, dirty = true;
    const ripples: { x: number; y: number; t: number }[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const mobile = W < 768;
      count = mobile ? 1800 : PARTICLE_COUNT; // fewer, larger glyphs on phones
      fs = mobile ? 14 : 12;
      focal = H / 2 / Math.tan((FOV / 2) * (Math.PI / 180));
      dirty = true;
    };

    const onDown = (e: PointerEvent) => {
      if (reduce || (e.target as HTMLElement).closest('a,button,input,[data-no-ripple]')) return;
      ripples.push({ x: e.clientX, y: e.clientY, t: performance.now() / 1000 });
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return; // pause while the tab is in the background
      const { scrollProgress, mousePosition } = useScrollStore.getState();
      if (reduce && !dirty && scrollProgress === lastProgress) return;
      dirty = false; lastProgress = scrollProgress;

      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const time = now / 1000;
      const theme = useThemeStore.getState().theme;
      const pal = PALETTE[theme];

      const floatIndex = scrollProgress * (STATE_COUNT - 1);
      const cur = Math.min(STATE_COUNT - 1, Math.floor(floatIndex));
      const next = Math.min(cur + 1, STATE_COUNT - 1);
      const blend = floatIndex - cur;
      const a = geos[cur], b = geos[next];

      const settle = 0.2 + 0.8 * Math.min(1, Math.abs(floatIndex - Math.round(floatIndex)) * 4);

      const ease = reduce ? 1 : 0.1;
      zOff += (zOffsetForState(cur) + (zOffsetForState(next) - zOffsetForState(cur)) * blend - zOff) * ease;
      yOff += (yOffsetForState(cur) + (yOffsetForState(next) - yOffsetForState(cur)) * blend - yOff) * ease;
      const targetOp = opacityForState(cur) + (opacityForState(next) - opacityForState(cur)) * blend;
      const dim = (theme === 'light' ? 0.95 : 1) * (W < 768 ? 0.55 : 1); // keep text readable on phones
      opacity += (targetOp * dim - opacity) * ease;

      let target = pal.blue;
      if (floatIndex < 1) target = lerp3(pal.hero, pal.blue, floatIndex);
      else if (floatIndex > STATE_COUNT - 2) target = lerp3(pal.blue, pal.signal, Math.min(1, floatIndex - (STATE_COUNT - 2)));
      color = lerp3(color, target, reduce ? 1 : 0.05);

      if (!reduce) {
        hoverX += (mousePosition.x * 5 - hoverX) * 0.1;
        hoverY += (mousePosition.y * 5 - hoverY) * 0.1;
        rot += dt * 0.05 * settle;
      }

      // Swarm window around the dispersed state; peaks at SCATTER_STATE.
      let swarm = 0;
      const sd = Math.abs(floatIndex - SCATTER_STATE);
      if (sd < 0.75 && !reduce) swarm = 1 - sd / 0.75;

      const vw = (W / H) * 2 * CAM_Z * Math.tan((FOV / 2) * (Math.PI / 180));
      const scale = (vw < 7 ? 0.72 : vw < 10 ? 0.88 : 1) * 0.8;
      const cosR = Math.cos(rot), sinR = Math.sin(rot);
      const tilt = 0.7 * Math.max(0, 1 - Math.abs(floatIndex - PortfolioState.SKILLS));
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      const cx = W / 2, cy = H / 2;

      for (let i = 0; i < count; i++) {
        const k = i * 3;
        let x = a[k] + (b[k] - a[k]) * blend;
        let y = a[k + 1] + (b[k + 1] - a[k + 1]) * blend;
        let z = a[k + 2] + (b[k + 2] - a[k + 2]) * blend;

        if (!reduce && (cur === PortfolioState.ABOUT || next === PortfolioState.ABOUT)) {
          x += Math.sin(time + i) * 0.02 * (1 - Math.min(1, Math.abs(floatIndex - PortfolioState.ABOUT))) * settle;
        }
        if (swarm > 0.01) {
          x += (Math.sin(time * 0.5 + i * 0.1) * 0.5 + hoverX * 0.5) * swarm;
          y += (Math.cos(time * 0.3 + i * 0.1) * 0.5 - hoverY * 0.5) * swarm;
        }
        if (!reduce && floatIndex > STATE_COUNT - 2) {
          const v = 0.05 * settle * (floatIndex - (STATE_COUNT - 2));
          x += (Math.random() - 0.5) * v; y += (Math.random() - 0.5) * v; z += (Math.random() - 0.5) * v;
        }

        z += zOff;
        y += yOff;
        x *= scale; y *= scale; z *= scale;
        const rx = x * cosR + z * sinR;
        const rz0 = -x * sinR + z * cosR;
        // The ocean grid is tilted toward the camera so the water surface reads as a surface.
        const y1 = y * cosT - rz0 * sinT;
        const rz = y * sinT + rz0 * cosT;
        y = y1;

        const depth = CAM_Z - rz;
        if (depth < 0.5) { bucket[i] = 255; continue; }
        const s = focal / depth;
        sx[i] = cx + rx * s;
        sy[i] = cy - y * s;
        bucket[i] = Math.min(GLYPHS.length - 1, Math.max(0, Math.floor(((rz + 8) / 16) * GLYPHS.length)));
      }

      // Ripples push glyphs radially outward as a ring expands from the click.
      const nowS = now / 1000;
      for (let r = ripples.length - 1; r >= 0; r--) if (nowS - ripples[r].t > 3) ripples.splice(r, 1);
      if (ripples.length) {
        for (const rp of ripples) {
          const age = nowS - rp.t, ring = age * 420, fade = Math.exp(-age * 1.4);
          for (let i = 0; i < count; i++) {
            if (bucket[i] === 255) continue;
            const dx = sx[i] - rp.x, dy = sy[i] - rp.y, d = Math.hypot(dx, dy) || 1;
            const w = Math.exp(-((d - ring) ** 2) / 2400) * fade * 16;
            sx[i] += (dx / d) * w; sy[i] += (dy / d) * w;
          }
        }
      }

      ctx.clearRect(0, 0, W, H);
      ctx.font = `${fs}px "JetBrains Mono", ui-monospace, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = css(color);
      for (let bk = 0; bk < GLYPHS.length; bk++) {
        ctx.globalAlpha = Math.min(1, opacity * (0.25 + (0.75 * bk) / (GLYPHS.length - 1)));
        const g = GLYPHS[bk];
        for (let i = 0; i < count; i++) {
          if (bucket[i] === bk) ctx.fillText(g, sx[i], sy[i]);
        }
      }

      ctx.globalAlpha = 1;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', onDown);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onDown);
    };
  }, []);

  return <canvas ref={ref} className="block w-full h-full" aria-hidden="true" />;
}
