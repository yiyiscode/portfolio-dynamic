import React from 'react';
import { motion } from 'framer-motion';
import { Home, User, Briefcase, FolderOpen, Code2, GraduationCap, Send } from 'lucide-react';
import { useScrollStore, useThemeStore, useLangStore } from '../store/stores';
import { PortfolioState, STATE_COUNT } from '../types';
import { sections } from '../data/sections';
import { site } from '../data/site';
import { useResumeUrl } from './useResume';

const icons: Record<number, React.ReactNode> = {
  [PortfolioState.HERO]: <Home size={16} />,
  [PortfolioState.ABOUT]: <User size={16} />,
  [PortfolioState.EXPERIENCE]: <Briefcase size={16} />,
  [PortfolioState.PROJECTS]: <FolderOpen size={16} />,
  [PortfolioState.SKILLS]: <Code2 size={16} />,
  [PortfolioState.EDUCATION]: <GraduationCap size={16} />,
  [PortfolioState.CONTACT]: <Send size={16} />,
};

export const FloatingNav: React.FC<{ onNavigate: (i: number) => void }> = ({ onNavigate }) => {
  const progress = useScrollStore((s) => s.scrollProgress);
  const { theme, toggleTheme } = useThemeStore();
  const { lang, toggleLang } = useLangStore();
  const resume = useResumeUrl();
  const current = Math.min(STATE_COUNT - 1, Math.max(0, Math.round(progress * (STATE_COUNT - 1))));

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-5xl px-4 pointer-events-none">
      <div className="relative bg-white/90 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-full pl-2 pr-2 py-2 pointer-events-auto shadow-[0_10px_26px_rgba(15,23,42,0.12)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex items-center transition-colors duration-500">
        <nav aria-label="sections" className="flex-1 flex items-center gap-1 md:gap-2 overflow-x-auto no-scrollbar mask-gradient px-1 md:px-4">
          {sections.map((s) => {
            const active = current === s.index;
            return (
              <button
                key={s.index}
                onClick={() => onNavigate(s.index)}
                aria-current={active ? 'true' : undefined}
                className={`relative px-2 md:px-3 py-2 text-sm md:text-base font-mono transition-all duration-300 whitespace-nowrap rounded-md shrink-0 ${
                  active
                    ? 'text-slate-900 dark:text-white bg-slate-200/50 dark:bg-white/10 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {active && <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />}
                <span className={`flex items-center gap-2 ${active ? 'pl-3' : ''}`}>
                  <span className="md:hidden flex items-center" aria-label={s.nav[lang]}>{icons[s.index]}</span>
                  <span className="hidden md:inline">{s.nav[lang]}</span>
                </span>
              </button>
            );
          })}
        </nav>

        <div className="w-px h-6 bg-slate-300 dark:bg-white/10 mx-0.5 md:mx-2 shrink-0" />

        <a
          href={`https://${site.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs md:text-sm font-mono font-bold text-slate-700 dark:text-slate-200 px-3 py-1.5 md:py-2 rounded-full bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 transition-colors shrink-0"
        >
          GitHub
        </a>

        {resume && (
          <a
            href={resume}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline ml-2 text-sm font-mono font-bold text-slate-700 dark:text-slate-200 px-3 py-2 rounded-full bg-slate-100 dark:bg-black/40 hover:bg-slate-200 dark:hover:bg-black/60 border border-slate-200 dark:border-white/10 transition-colors shrink-0"
          >
            {lang === 'zh' ? '檢視履歷' : 'View Resume'}
          </a>
        )}

        <button
          onClick={toggleLang}
          className="ml-2 px-2.5 py-1.5 text-sm font-mono font-bold rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors shrink-0"
          aria-label="Switch language"
        >
          {lang === 'zh' ? 'EN' : '中'}
        </button>

        <button
          onClick={toggleTheme}
          className="ml-1 p-2 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-400 transition-colors shrink-0"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <div className="absolute bottom-0 left-6 right-6 h-[1.5px] bg-slate-200 dark:bg-white/5 overflow-hidden rounded-full pointer-events-none">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 shadow-[0_0_15px_var(--color-glow)]"
            style={{ width: '100%', scaleX: progress, transformOrigin: 'left' }}
          />
        </div>
      </div>
    </div>
  );
};
