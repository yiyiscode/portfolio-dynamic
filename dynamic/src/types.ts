export type L = { zh: string; en: string };
export type Lang = 'zh' | 'en';

/** 一個捲動位置對應一個粒子形狀與一個內容區塊。 */
export enum PortfolioState {
  HERO = 0,       // 球體：聚合
  ABOUT = 1,      // 爆開的雲
  EXPERIENCE = 2, // 螺旋隧道
  PROJECTS = 3,   // 群簇
  SKILLS = 4,     // 波浪格（ASCII Ocean）
  EDUCATION = 5,  // 散落立方：發散
  CONTACT = 6,    // 奇點：再聚合
}

export const STATE_COUNT = 7;
export const SCATTER_STATE = PortfolioState.EDUCATION;
