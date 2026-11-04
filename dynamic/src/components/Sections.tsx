import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PortfolioState } from '../types';
import { site } from '../data/site';
import type { TimelineItem, Shot } from '../data/site';
import { meta, scrollHint } from '../data/sections';
import {
  Section, ScrollableContent, ClarityHeader, Tag, AsOf, useT, period,
  gradientText, hoverGradientText, panel,
} from './SectionUtils';
import { GlowCard } from './GlowCard';
import { useResumeUrl } from './useResume';
import { useThemeStore } from '../store/stores';

const ui = site.ui;

/* 專案截圖：縮圖固定高度、頂部對齊裁切；點開站內燈箱看完整圖，可左右切換（鍵盤 ←/→/Esc） */
const Shots: React.FC<{ img?: Shot[]; lang: 'zh' | 'en' }> = ({ img, lang }) => {
  const [open, setOpen] = useState<number | null>(null);
  const list = img ?? [];
  const nameOf = (m: Shot) => m.src.replace(/^.*\//, '').replace(/\.\w+$/, '');
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + list.length) % list.length)), [list.length]);
  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);
  if (!list.length) return null;
  const cur = open === null ? null : list[open];
  return (
    <>
      <div className="grid grid-cols-2 gap-2 mt-3">
        {list.map((m, i) => {
          const n = nameOf(m);
          const dim = site.imgMeta?.[n];
          return (
            <figure key={n} className="m-0">
              <button type="button" onClick={() => setOpen(i)} className="block w-full cursor-zoom-in" aria-label={m[lang]}>
                <img
                  src={`./img/thumb/${n}.webp`}
                  width={dim?.[0]} height={dim?.[1]}
                  alt={m[lang]} loading="lazy" decoding="async"
                  className="w-full h-[140px] md:h-[180px] object-cover object-top rounded border border-slate-200 dark:border-white/10 bg-white"
                />
              </button>
              <figcaption className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-snug">{m[lang]}</figcaption>
            </figure>
          );
        })}
      </div>
      {cur && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col items-center bg-slate-950/90" onClick={() => setOpen(null)} role="dialog" aria-modal="true">
          <div className="flex-1 w-full overflow-auto flex justify-center p-4" onClick={(e) => e.stopPropagation()}>
            <img src={`./img/full/${nameOf(cur)}.webp`} alt={cur[lang]} className="max-w-full md:max-w-[900px] h-auto self-start rounded bg-white" />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 p-3 text-sm text-slate-300" onClick={(e) => e.stopPropagation()}>
            {list.length > 1 && <button type="button" onClick={() => go(-1)} className="px-3 py-1 rounded border border-white/20 hover:border-cyan-400">←</button>}
            <span>{open! + 1} / {list.length}　{cur[lang]}</span>
            {list.length > 1 && <button type="button" onClick={() => go(1)} className="px-3 py-1 rounded border border-white/20 hover:border-cyan-400">→</button>}
            <button type="button" onClick={() => setOpen(null)} className="px-3 py-1 rounded border border-white/20 hover:border-cyan-400">✕</button>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

/* ---------- 01 HERO ---------- */
export const Hero: React.FC = () => {
  const { lang, t } = useT();
  const theme = useThemeStore((s) => s.theme);
  const m = meta(PortfolioState.HERO);
  const name = t(site.name);
  const parts = name.split(' ');
  const last = parts.length > 1 ? parts.pop() : null;
  const first = parts.join(' ');
  return (
    <Section index={PortfolioState.HERO}>
      {theme === 'light' && (
        <div
          className="pointer-events-none absolute top-[18%] -left-[6%] w-[78%] h-[420px] rounded-full blur-[18px] opacity-90 hidden md:block"
          aria-hidden="true"
          style={{ background: 'var(--hero-scrim-desktop)', zIndex: 12 }}
        />
      )}
      <div className="text-center md:text-left py-4 md:py-10 h-full flex flex-col justify-center relative z-20">
        <ClarityHeader id={m.id} hint={m.hint[lang]} />
        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-6 leading-tight">
          <span className="text-slate-800 dark:text-white">{first}</span>
          {last && <br className="md:hidden" />}
          {last && ' '}
          {last && <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#2563eb] to-[#0891b2] dark:from-blue-200 dark:via-blue-300 dark:to-cyan-300">{last}</span>}
        </h1>
        <div className="text-xl md:text-3xl font-light border-l-2 border-blue-500/30 dark:border-blue-500/50 pl-4 md:pl-6 space-y-2">
          <p className="text-[#0a0e18]/80 dark:text-slate-300/90 font-medium">{t(ui.badge)}</p>
          <p className={`${gradientText} italic tracking-wide`}>{t(ui.tag)}</p>
        </div>
        <div className="mt-8 md:mt-12 animate-bounce opacity-60 text-xs md:text-sm font-mono tracking-[0.15em] text-blue-600 dark:text-blue-300 uppercase">
          {t(scrollHint)}
        </div>
      </div>
    </Section>
  );
};

/* ---------- 02 ABOUT：只重組 data.js 既有的 tag / badge / metrics / aiNote ---------- */
export const About: React.FC = () => {
  const { lang, t } = useT();
  const m = meta(PortfolioState.ABOUT);
  return (
    <Section index={PortfolioState.ABOUT}>
      <div className="flex flex-col h-full w-full">
        <div className="shrink-0 mb-4 md:mb-6">
          <ClarityHeader id={m.id} hint={m.hint[lang]} />
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white max-w-3xl leading-tight">
            <span className={gradientText}>{t(ui.tag)}</span>
          </h3>
          <p className="mt-2 text-slate-600 dark:text-slate-400 text-base md:text-xl">{t(ui.badge)}</p>
        </div>
        <ScrollableContent>
          <div className={`${panel} p-4 md:p-8`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {site.metrics.map((x, i) => (
                <GlowCard key={i} className="p-4 md:p-5">
                  <div className="relative z-10">
                    <div className="text-4xl md:text-4xl font-bold font-mono text-blue-600 dark:text-cyan-400">{x.v}</div>
                    <p className="mt-2 text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                      {x[lang]}{x.asof && <AsOf />}
                    </p>
                  </div>
                </GlowCard>
              ))}
            </div>
            <p className="mt-6 text-sm md:text-base text-slate-500 dark:text-slate-400 border-l-2 border-cyan-500/40 pl-4">{t(ui.aiNote)}</p>
          </div>
        </ScrollableContent>
      </div>
    </Section>
  );
};

const TimelineCard: React.FC<{ x: TimelineItem }> = ({ x }) => {
  const { lang, t } = useT();
  return (
    <GlowCard className="p-4 md:p-5 hover:-translate-y-1 hover:shadow-lg" tabIndex={0} role="article">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:justify-between md:items-baseline mb-2">
          <h4 className={`group text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 leading-tight ${hoverGradientText} transition-all`}>{t(x.org)}</h4>
          <span className="text-sm font-mono text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded mt-1 md:mt-0 whitespace-nowrap border border-slate-200 dark:border-white/5 font-semibold">
            {period(x.start, x.end, ui.present[lang])}
          </span>
        </div>
        <div className="text-blue-600 dark:text-blue-400 text-sm md:text-base font-medium mb-1">{t(x.role)}</div>
        <div className="text-xs font-mono text-slate-500 mb-3">{t(x.badge)}</div>
        <ul className="list-disc pl-4 space-y-1.5 text-sm md:text-base text-slate-600 dark:text-slate-200 leading-relaxed">
          {x.bullets.map((b, i) => <li key={i}>{b[lang]}</li>)}
        </ul>
        {x.tech.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3">{x.tech.map((a) => <Tag key={a}>{a}</Tag>)}</div>}
      </div>
    </GlowCard>
  );
};

/* ---------- 03 EXPERIENCE ---------- */
export const Experience: React.FC = () => {
  const { lang } = useT();
  const m = meta(PortfolioState.EXPERIENCE);
  const work = site.timeline.filter((x) => x.k === 'work');
  return (
    <Section index={PortfolioState.EXPERIENCE}>
      <div className={`grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 md:gap-10 ${panel} p-4 md:p-8 h-full overflow-hidden`}>
        <div className="flex flex-col shrink-0 md:shrink min-h-0">
          <ClarityHeader id={m.id} hint={m.hint[lang]} />
          <h3 className="text-3xl md:text-4xl font-bold mb-2 text-slate-900 dark:text-white">
            <span className={gradientText}>{lang === 'zh' ? '實習與產學合作' : 'Internships & Industry Work'}</span>
          </h3>
          <div className="mt-auto pt-6 border-t border-slate-200 dark:border-white/10 hidden md:block">
            <h4 className="text-cyan-600 dark:text-cyan-400 font-mono mb-3 text-sm tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse" />
              {ui.certTitle[lang].toUpperCase()}
            </h4>
            <ul className="space-y-3">
              {site.certs.map((c, i) => (
                <li key={i} className="border-l-2 border-slate-300 dark:border-white/10 pl-4 text-base font-bold text-slate-800 dark:text-white">{c[lang]}</li>
              ))}
            </ul>
          </div>
        </div>
        <ScrollableContent className="space-y-3 pr-2">
          {work.map((x, i) => <TimelineCard key={i} x={x} />)}
        </ScrollableContent>
      </div>
    </Section>
  );
};

/* ---------- 04 PROJECTS ---------- */
export const Projects: React.FC = () => {
  const { lang, t } = useT();
  const m = meta(PortfolioState.PROJECTS);
  return (
    <Section index={PortfolioState.PROJECTS}>
      <div className="flex flex-col h-full w-full">
        <div className="mb-4 md:mb-6 shrink-0">
          <ClarityHeader id={m.id} hint={m.hint[lang]} />
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white"><span className={gradientText}>{t(ui.projTitle)}</span></h3>
        </div>
        <ScrollableContent className="pb-3">
          <div className={`${panel} p-2 md:p-3`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
              {site.projects.map((p, i) => (
                <GlowCard key={i} className="p-4 md:p-5">
                  <div className="relative z-10">
                    <div className="text-xs font-mono tracking-widest text-cyan-600 dark:text-cyan-400">{p.cat}</div>
                    <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-1">{t(p.title)}</h4>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">{t(p.sub)}</div>
                    {p.metrics.length > 0 && (
                      <div className="flex flex-wrap gap-x-5 gap-y-2 mb-3">
                        {p.metrics.map((x, j) => (
                          <div key={j}>
                            <div className="font-mono font-bold text-blue-600 dark:text-cyan-400 text-xl">{x.v}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 max-w-[11rem]">{x[lang]}{x.asof && <AsOf />}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-wrap items-center gap-1 text-xs font-mono text-slate-500 mb-3">
                      {p.flow[lang].map((s, j) => (
                        <React.Fragment key={j}>
                          {j > 0 && <span className="text-cyan-500">→</span>}
                          <span className="border border-slate-200 dark:border-white/10 rounded px-1.5 py-0.5">{s}</span>
                        </React.Fragment>
                      ))}
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {p.bullets.map((b, j) => <li key={j}>{b[lang]}{b.asof && <AsOf />}</li>)}
                    </ul>
                    <div className="flex flex-wrap gap-1.5 mt-3">{p.tech.map((a) => <Tag key={a}>{a}</Tag>)}</div>
                    <Shots img={p.img} lang={lang} />
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm font-mono text-blue-600 dark:text-cyan-400 hover:underline underline-offset-4">
                        {ui.github[lang]} ↗
                      </a>
                    )}
                  </div>
                </GlowCard>
              ))}
            </div>
            <h4 className="font-mono text-sm tracking-widest text-slate-500 mt-5 mb-2 px-1">{ui.moreTitle[lang].toUpperCase()}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
              {site.more.map((x, i) => (
                <GlowCard key={i} className="p-4">
                  <div className="relative z-10">
                    <h5 className="text-base font-bold text-slate-800 dark:text-slate-100">{t(x.title)}</h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">{t(x.desc)}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">{x.tech.map((a) => <Tag key={a}>{a}</Tag>)}</div>
                    <Shots img={x.img} lang={lang} />
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>
        </ScrollableContent>
      </div>
    </Section>
  );
};

/* ---------- 05 SKILLS ---------- */
export const Skills: React.FC = () => {
  const { lang, t } = useT();
  const m = meta(PortfolioState.SKILLS);
  const all = site.stack.flatMap((g) => g.i);
  return (
    <Section index={PortfolioState.SKILLS}>
      <div className="flex flex-col h-full w-full">
        <div className="mb-4 md:mb-6 shrink-0">
          <ClarityHeader id={m.id} hint={m.hint[lang]} />
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white"><span className={gradientText}>{t(ui.stack)}</span></h3>
        </div>
        <ScrollableContent>
          <div className={`${panel} !bg-slate-50/95 dark:!bg-black/75 p-4 md:p-6`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {site.stack.map((g, i) => (
                <GlowCard key={i} className="p-4">
                  <div className="relative z-10">
                    <div className="text-sm font-mono text-slate-500 mb-2">{t(g.l)}</div>
                    <div className="flex flex-wrap gap-1.5">{g.i.map((a) => <Tag key={a}>{a}</Tag>)}</div>
                  </div>
                </GlowCard>
              ))}
            </div>
            <div className="mt-5 overflow-hidden mask-gradient" aria-hidden="true">
              <div className="marquee-track flex gap-6 w-max font-mono text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {[...all, ...all].map((a, i) => <span key={i}>{a}</span>)}
              </div>
            </div>
          </div>
        </ScrollableContent>
      </div>
    </Section>
  );
};

/* ---------- 06 EDUCATION（發散那一幕） ---------- */
export const Education: React.FC = () => {
  const { lang } = useT();
  const m = meta(PortfolioState.EDUCATION);
  const edu = site.timeline.filter((x) => x.k === 'edu');
  const awards = site.timeline.filter((x) => x.k === 'award');
  return (
    <Section index={PortfolioState.EDUCATION}>
      <div className="flex flex-col h-full w-full">
        <div className="mb-4 md:mb-6 shrink-0">
          <ClarityHeader id={m.id} hint={m.hint[lang]} />
          <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            <span className={gradientText}>{lang === 'zh' ? '學歷與競賽' : 'Education & Competitions'}</span>
          </h3>
        </div>
        <ScrollableContent className="pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 items-start">
            <div className="space-y-3">
              <h4 className="font-mono text-sm tracking-widest text-slate-500 px-1">{lang === 'zh' ? '學歷' : 'EDUCATION'}</h4>
              {edu.map((x, i) => <TimelineCard key={i} x={x} />)}
            </div>
            <div className="space-y-3">
              <h4 className="font-mono text-sm tracking-widest text-slate-500 px-1">{lang === 'zh' ? '競賽' : 'COMPETITIONS'}</h4>
              {awards.map((x, i) => <TimelineCard key={i} x={x} />)}
            </div>
          </div>
        </ScrollableContent>
      </div>
    </Section>
  );
};

/* ---------- 07 CONTACT（再聚合） ---------- */
export const Contact: React.FC = () => {
  const { lang, t } = useT();
  const m = meta(PortfolioState.CONTACT);
  const resume = useResumeUrl();
  return (
    <Section index={PortfolioState.CONTACT}>
      <div className="text-center w-full h-full flex flex-col justify-center">
        <div className="shrink-0 mb-8 md:mb-12">
          <ClarityHeader id={m.id} hint={m.hint[lang]} />
          <h3 className="text-4xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 dark:from-white dark:to-slate-500 leading-tight">
            {t(ui.contactTitle)}
          </h3>
          <p className="mt-4 text-base md:text-lg text-slate-500 dark:text-slate-400">{t(ui.contactSub)}</p>
        </div>
        <div className="flex flex-col items-center gap-6 md:gap-8 font-mono text-base">
          <a href={`mailto:${site.email}`} className="relative group inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-500 to-teal-500 rounded blur opacity-25 group-hover:opacity-75 transition-opacity duration-500" />
            <div className="relative border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black text-slate-700 dark:text-slate-300 px-6 py-3 md:px-8 md:py-4 text-base md:text-xl rounded">
              <span className={`${hoverGradientText} transition-all break-all`}>{site.email}</span>
            </div>
          </a>
          <a href={`https://${site.github}`} target="_blank" rel="noreferrer" className="text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white text-base md:text-xl hover:underline decoration-blue-500/50 underline-offset-4">
            {site.github}
          </a>
          {resume && (
            <a href={resume} download className="text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white text-base md:text-xl hover:underline decoration-blue-500/50 underline-offset-4">
              {t(ui.resume)}
            </a>
          )}
        </div>
      </div>
    </Section>
  );
};
