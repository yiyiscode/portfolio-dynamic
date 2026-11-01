import React, { createContext, useContext } from 'react';
import { useScrollStore, useLangStore } from '../store/stores';
import { STATE_COUNT } from '../types';
import type { L } from '../types';

// Plateau behaviour: a section stays fully visible near its index, then fades out quickly.
export function useSectionOpacity(index: number, visibleRange = 0.45) {
  const scrollProgress = useScrollStore((s) => s.scrollProgress);
  const distance = Math.abs(scrollProgress * (STATE_COUNT - 1) - index);
  const plateau = visibleRange * 0.45;
  if (distance < plateau) return 1;
  if (distance < visibleRange) {
    const n = (distance - plateau) / (visibleRange - plateau);
    return Math.max(0, 1 - n * n);
  }
  return 0;
}

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return { lang, t: (o: L) => o[lang] };
}

// 區塊是否已完全顯示（不透明）。未完全顯示時，內部清單不攔截滾輪，讓頁面先捲進來。
const SettledContext = createContext(true);

export const ScrollableContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const settled = useContext(SettledContext);
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!settled) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const atTop = scrollTop <= 0, atBottom = Math.abs(scrollHeight - clientHeight - scrollTop) <= 1;
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) return;
    e.stopPropagation(); // let the inner list scroll before the page does
  };
  return (
    <div {...(settled ? { 'data-lenis-prevent': true } : {})} className={`overflow-y-auto custom-scrollbar flex-1 min-h-0 ${className || ''}`} onWheel={handleWheel}>
      {children}
    </div>
  );
};

export const Section: React.FC<{ index: number; children: React.ReactNode }> = ({ index, children }) => {
  const opacity = useSectionOpacity(index);
  if (opacity < 0.01) return null;
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none p-4 md:p-12 pt-24 md:pt-32 transition-opacity duration-75"
      style={{ opacity }}
    >
      <div className="max-w-6xl w-full h-full max-h-[85vh] pointer-events-auto dark:text-slate-100 text-slate-800 flex flex-col transition-colors duration-500 relative z-10">
        <SettledContext.Provider value={opacity >= 0.99}>{children}</SettledContext.Provider>
      </div>
    </div>
  );
};

export const ClarityHeader: React.FC<{ id: string; hint: string }> = ({ id, hint }) => (
  <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-4 mb-2 md:mb-4 opacity-80 shrink-0">
    <h2 className="dark:text-blue-400 text-blue-600 text-sm md:text-base font-mono tracking-widest">{id}</h2>
    <span className="hidden md:inline dark:text-slate-600 text-slate-400 font-mono text-base">//</span>
    <span className="text-slate-500 font-mono text-xs md:text-sm uppercase tracking-wider">{hint}</span>
  </div>
);

export const gradientText =
  'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-400 dark:via-cyan-400 dark:to-teal-400 bg-clip-text text-transparent';
export const hoverGradientText =
  'group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:via-cyan-600 group-hover:to-teal-600 dark:group-hover:from-blue-400 dark:group-hover:via-cyan-400 dark:group-hover:to-teal-400 group-hover:bg-clip-text group-hover:text-transparent';
export const cardScrim =
  'absolute inset-0 bg-gradient-to-b from-[var(--elevation-overlay-from)] to-[var(--elevation-overlay-to)] z-0 pointer-events-none transition-colors duration-500';
export const panel =
  'bg-slate-50 dark:bg-slate-950/90 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl transition-colors duration-500';

export const Tag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="text-xs md:text-sm font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded">
    {children}
  </span>
);

export const AsOf: React.FC = () => {
  const { lang } = useT();
  return <span className="ml-1 text-xs font-mono text-cyan-600 dark:text-cyan-400">({lang === 'zh' ? '截至 2026-10-15' : 'as of 2026-10-15'})</span>;
};

export const period = (start: string, end: string | null, present: string) =>
  `${start.replace('-', '/')} – ${end ? end.replace('-', '/') : present}`;
