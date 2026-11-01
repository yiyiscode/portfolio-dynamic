import raw from './site.json';
import type { L } from '../types';

// site.json 由 scripts/sync-data.mjs 從 ../assets/data.js 唯讀轉出，勿手改。
export interface Metric { v: string; asof?: boolean; zh: string; en: string }
export interface Bullet { zh: string; en: string; asof?: boolean }
export interface TimelineItem {
  k: 'work' | 'proj' | 'award' | 'edu';
  start: string; end: string | null;
  badge: L; org: L; role: L; bullets: Bullet[]; tech: string[];
}
export interface Shot { src: string; zh: string; en: string }
export interface Project {
  cat: string; title: L; sub: L; link: string | null;
  metrics: Metric[]; flow: { zh: string[]; en: string[] };
  bullets: Bullet[]; tech: string[]; img?: Shot[];
}
export interface More { title: L; desc: L; tech: string[]; img?: Shot[] }
export interface Site {
  name: L; email: string; github: string;
  ui: Record<string, any>;
  metrics: Metric[];
  stack: { l: L; i: string[] }[];
  certs: L[];
  timeline: TimelineItem[];
  projects: Project[];
  more: More[];
  imgMeta?: Record<string, [number, number]>;
}

export const site = raw as unknown as Site;
