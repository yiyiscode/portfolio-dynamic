// 唯讀轉換 ../assets/data.js（window.SITE 全域腳本）-> src/data/site.json。
// 文案只有一個來源；本腳本不修改 data.js。
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, '../../assets/data.js');
const out = resolve(here, '../src/data/site.json');

const window = {};
runInNewContext(readFileSync(src, 'utf8'), { window });
if (!window.SITE) throw new Error('data.js 沒有定義 window.SITE');

// 圖片尺寸（img-meta.js 的 window.IMG_META）併入 site.json，用來預留版面
const metaFile = resolve(here, '../../assets/img-meta.js');
if (existsSync(metaFile)) {
  const w = {};
  runInNewContext(readFileSync(metaFile, 'utf8'), { window: w });
  window.SITE.imgMeta = w.IMG_META || {};
}
// 縮圖與大圖唯讀複製到 public/img（build 時進 dist；public/img 不進 git）
for (const d of ['thumb', 'full']) {
  const from = resolve(here, '../../assets/img', d);
  if (existsSync(from)) cpSync(from, resolve(here, '../public/img', d), { recursive: true });
}

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(window.SITE, null, 2) + '\n', 'utf8');
console.log(`synced ${src} -> ${out}`);
