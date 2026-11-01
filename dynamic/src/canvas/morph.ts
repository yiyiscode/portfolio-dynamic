import { PortfolioState, STATE_COUNT } from '../types';

// Shape sequence follows mohan.is-a.dev (MIT): sphere -> cloud -> helix -> clusters -> wave grid
// -> scattered cube -> singularity. Positions are generated here; drawing is ASCII on a 2D canvas.
export const PARTICLE_COUNT = 4000;

// Deterministic RNG so shapes are identical on every load.
function makeRng(seed: number) {
  let s = seed;
  return () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
}

const noise = (x: number, y: number, z: number) =>
  Math.sin(x * 0.5) * Math.cos(y * 0.3) * Math.sin(z * 0.7);

export function generatePositions(state: PortfolioState, clusterCount: number): Float32Array {
  const out = new Float32Array(PARTICLE_COUNT * 3);
  const rand = makeRng(1234 + state * 97);
  const golden = Math.PI * (1 + Math.sqrt(5));

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    let x = 0, y = 0, z = 0;
    const phi = Math.acos(1 - (2 * (i + 0.5)) / PARTICLE_COUNT);
    const theta = golden * (i + 0.5);

    switch (state) {
      case PortfolioState.HERO: {
        const r = 4;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        break;
      }
      case PortfolioState.ABOUT: {
        const r = 5;
        x = r * Math.sin(phi) * Math.cos(theta);
        y = r * Math.sin(phi) * Math.sin(theta);
        z = r * Math.cos(phi);
        const ns = 0.8, nd = 2.5;
        x += noise(x * ns, y * ns, i * 0.1) * nd;
        y += noise(y * ns, z * ns, i * 0.1) * nd;
        z += noise(z * ns, x * ns, i * 0.1) * nd;
        break;
      }
      case PortfolioState.EXPERIENCE: {
        const angle = i * 0.1;
        const radius = 3 + rand() * 2;
        const length = 25;
        z = (i / PARTICLE_COUNT) * length - length / 2;
        x = Math.cos(angle) * radius + (rand() - 0.5);
        y = Math.sin(angle) * radius + (rand() - 0.5);
        break;
      }
      case PortfolioState.PROJECTS: {
        const c = i % clusterCount;
        const ca = (c / clusterCount) * Math.PI * 2;
        const pr = 1.5;
        const pPhi = Math.acos(1 - 2 * rand());
        const pTheta = Math.PI * 2 * rand();
        x = Math.cos(ca) * 5 + pr * Math.sin(pPhi) * Math.cos(pTheta);
        y = Math.sin(ca) * 5 + pr * Math.sin(pPhi) * Math.sin(pTheta);
        z = pr * Math.cos(pPhi);
        break;
      }
      case PortfolioState.SKILLS: {
        // ASCII Ocean: a rolling water surface.
        const grid = Math.sqrt(PARTICLE_COUNT);
        const spacing = 0.4;
        const row = Math.floor(i / grid);
        const col = i % grid;
        x = (col - grid / 2) * spacing;
        z = (row - grid / 2) * spacing;
        y = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 1.5;
        break;
      }
      case PortfolioState.EDUCATION: {
        // Dispersed: particles scattered through a cube.
        const scatter = 12;
        x = (rand() - 0.5) * scatter;
        y = (rand() - 0.5) * scatter;
        z = (rand() - 0.5) * scatter;
        break;
      }
      case PortfolioState.CONTACT: {
        // Converged again into a tight point.
        const core = 0.05;
        x = (rand() - 0.5) * core;
        y = (rand() - 0.5) * core;
        z = (rand() - 0.5) * core;
        break;
      }
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

export const zOffsetForState = (s: number) =>
  s === PortfolioState.ABOUT || s === PortfolioState.EXPERIENCE || s === PortfolioState.SKILLS ? -3.5 : 0;

// The ocean sits low on screen so the water shows below the skills panel.
export const yOffsetForState = (s: number) => (s === PortfolioState.SKILLS ? -3 : 0);

export const opacityForState = (s: number): number => {
  switch (s) {
    case PortfolioState.HERO: return 0.9;
    case PortfolioState.ABOUT: return 0.55;
    case PortfolioState.EXPERIENCE: return 0.4;
    case PortfolioState.PROJECTS: return 0.7;
    case PortfolioState.SKILLS: return 0.85;
    case PortfolioState.EDUCATION: return 0.75;
    case PortfolioState.CONTACT: return 1.0;
    default: return 0.5;
  }
};

export { STATE_COUNT };
