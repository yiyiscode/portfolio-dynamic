import type { L } from '../types';
import { PortfolioState } from '../types';

// 版面用的介面文字（區塊標號、導覽名稱），不含任何經歷事實。
export interface SectionMeta { index: PortfolioState; id: string; hint: L; nav: L }

export const sections: SectionMeta[] = [
  { index: PortfolioState.HERO, id: '01 / INIT', hint: { zh: '作品集初始化', en: 'Portfolio Initialization' }, nav: { zh: '首頁', en: 'Intro' } },
  { index: PortfolioState.ABOUT, id: '02 / ABOUT', hint: { zh: '簡介與重點數字', en: 'Overview & Highlights' }, nav: { zh: '簡介', en: 'About' } },
  { index: PortfolioState.EXPERIENCE, id: '03 / EXPERIENCE', hint: { zh: '工作與實習經歷', en: 'Work & Internships' }, nav: { zh: '經歷', en: 'Experience' } },
  { index: PortfolioState.PROJECTS, id: '04 / PROJECTS', hint: { zh: '精選作品', en: 'Selected Work' }, nav: { zh: '作品', en: 'Projects' } },
  { index: PortfolioState.SKILLS, id: '05 / SKILLS', hint: { zh: '技術堆疊', en: 'Tech Stack' }, nav: { zh: '技能', en: 'Skills' } },
  { index: PortfolioState.EDUCATION, id: '06 / EDUCATION', hint: { zh: '學歷與競賽', en: 'Education & Competitions' }, nav: { zh: '學歷', en: 'Education' } },
  { index: PortfolioState.CONTACT, id: '07 / CONTACT', hint: { zh: '與我聯絡', en: 'Get in Touch' }, nav: { zh: '聯絡', en: 'Contact' } },
];

export const meta = (i: PortfolioState) => sections[i];

export const scrollHint: L = { zh: '向下捲動 ↓', en: 'SCROLL ↓' };
