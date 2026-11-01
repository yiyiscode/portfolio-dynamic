import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Lang } from '../types';

interface ScrollState {
  scrollProgress: number; // 0..1
  setScrollProgress: (p: number) => void;
  mousePosition: { x: number; y: number }; // -1..1
  setMousePosition: (x: number, y: number) => void;
}

export const useScrollStore = create<ScrollState>((set) => ({
  scrollProgress: 0,
  mousePosition: { x: 0, y: 0 },
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),
  setMousePosition: (x, y) => set({ mousePosition: { x, y } }),
}));

type Theme = 'dark' | 'light';
interface ThemeState { theme: Theme; toggleTheme: () => void }

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'portfolio-dynamic-theme' },
  ),
);

const browserLang = (): Lang =>
  typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

interface LangState { lang: Lang; toggleLang: () => void }

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: browserLang(),
      toggleLang: () => set((s) => ({ lang: s.lang === 'zh' ? 'en' : 'zh' })),
    }),
    { name: 'portfolio-dynamic-lang' },
  ),
);

export const prefersReducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
