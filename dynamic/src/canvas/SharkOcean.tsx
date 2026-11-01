import { useEffect, useRef } from 'react';
import { OceanEngine } from '../ascii-sharks';
import { useScrollStore, useThemeStore, prefersReducedMotion } from '../store/stores';
import { PortfolioState, STATE_COUNT } from '../types';

// ASCII sharks and fish schools (ascii-sharks, MIT, stackedlol) swim behind every section in
// the dark theme, so there is one shark style across the site. The canvas is screen-blended, so
// its black water vanishes and only the animals show over the lattice; near the SKILLS scene a
// black backdrop fades in to make the full ocean. The light theme has no sharks or fish at all.
const RANGE = 0.9; // distance, in section units, over which the SKILLS backdrop fades in/out

export function SharkOcean() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const engine = new OceanEngine(canvas);
    return () => engine.destroy();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!, backdrop = backdropRef.current!, layer = layerRef.current!;
    const dark = theme === 'dark';
    layer.style.mixBlendMode = 'screen';
    const apply = (progress: number) => {
      const d = Math.abs(progress * (STATE_COUNT - 1) - PortfolioState.SKILLS);
      const near = Math.max(0, 1 - d / RANGE); // 0..1, peaks in the SKILLS scene
      backdrop.style.opacity = String(dark ? near * 0.75 : 0);
      layer.style.display = dark ? 'block' : 'none'; // hidden canvas also pauses the engine
      layer.style.opacity = String(0.5 + 0.35 * near); // calmer behind headings outside SKILLS
    };
    apply(useScrollStore.getState().scrollProgress);
    return useScrollStore.subscribe((s) => apply(s.scrollProgress));
  }, [theme]);

  return (
    <>
      <div ref={backdropRef} className="fixed inset-0 z-[4] pointer-events-none bg-black" style={{ opacity: 0 }} aria-hidden="true" />
      <div ref={layerRef} className="fixed inset-0 z-[5] pointer-events-none" style={{ display: 'none' }} aria-hidden="true">
        <canvas
          ref={canvasRef}
          className="block w-full h-full"
          style={{ fontFamily: '"JetBrains Mono", ui-monospace, Consolas, monospace' }}
        />
      </div>
    </>
  );
}
