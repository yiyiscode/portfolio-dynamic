import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useScrollStore, useThemeStore, useLangStore, prefersReducedMotion } from './store/stores';
import { AsciiLattice } from './canvas/AsciiLattice';
import { SharkOcean } from './canvas/SharkOcean';
import { FloatingNav } from './components/FloatingNav';
import { Hero, About, Experience, Projects, Skills, Education, Contact } from './components/Sections';
import { STATE_COUNT } from './types';

const ease = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

const App: React.FC = () => {
  const setScrollProgress = useScrollStore((s) => s.setScrollProgress);
  const setMousePosition = useScrollStore((s) => s.setMousePosition);
  const theme = useThemeStore((s) => s.theme);
  const lang = useLangStore((s) => s.lang);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.lang = lang === 'zh' ? 'zh-Hant' : 'en';
  }, [theme, lang]);

  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const progress = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(limit > 0 ? Math.max(0, Math.min(1, window.scrollY / limit)) : 0);
    };

    // 偏好減少動態時不用平滑捲動，直接用瀏覽器原生捲動。
    if (prefersReducedMotion()) {
      window.addEventListener('scroll', progress, { passive: true });
      progress();
      return () => window.removeEventListener('scroll', progress);
    }

    const lenis = new Lenis({ duration: 1.5, smoothWheel: true, easing: ease });
    lenisRef.current = lenis;
    lenis.on('scroll', ({ scroll, limit }: { scroll: number; limit: number }) =>
      setScrollProgress(limit > 0 ? Math.max(0, Math.min(1, scroll / limit)) : 0));
    let raf = requestAnimationFrame(function loop(time) {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    });
    return () => { lenis.destroy(); cancelAnimationFrame(raf); lenisRef.current = null; };
  }, [setScrollProgress]);

  useEffect(() => {
    const move = (e: MouseEvent) =>
      setMousePosition((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, [setMousePosition]);

  // 僅開發模式：?p=0.5 直接跳到捲動進度，方便截圖檢查各個形狀。
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const p = Number(new URLSearchParams(location.search).get('p'));
    if (p > 0) setTimeout(() => window.scrollTo(0, p * (document.documentElement.scrollHeight - window.innerHeight)), 200);
  }, []);

  const scrollToSection = (index: number) => {
    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo((index / (STATE_COUNT - 1)) * lenis.limit, { duration: 2.0, easing: ease });
    } else {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: (index / (STATE_COUNT - 1)) * limit });
    }
  };

  return (
    <div className={`${theme} relative w-full min-h-screen`}>
      <div className="fixed inset-0 bg-bg-light dark:bg-bg-dark transition-colors duration-700 z-[-1]" />
      <FloatingNav onNavigate={scrollToSection} />
      <div className="fixed inset-0 z-0 pointer-events-none"><AsciiLattice /></div>
      <SharkOcean />
      <main className="fixed inset-0 z-10 pointer-events-none">
        <Hero /><About /><Experience /><Projects /><Skills /><Education /><Contact />
      </main>
      <div style={{ height: '700vh' }} />
    </div>
  );
};

export default App;
