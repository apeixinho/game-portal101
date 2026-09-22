/**
 * Planet catalogue — verbatim port of the original Portal do Prof. Ricardo
 * Hub (portaldoprofricardo.vercel.app, asset bundle index-DII-Z8ID.js).
 *
 * IDs, taglines, palettes, orbits and icons are reproduced exactly. URLs
 * fall through to the original Vercel/Render endpoints when no env override
 * is set (see `src/lib/links.ts`) so each planet has a working destination
 * before its Juno Satellite is ready.
 */

export interface PlanetPalette {
  readonly primary: string;
  readonly secondary: string;
  readonly emissive: string;
}

export interface PlanetOrbit {
  /** Distance from the sun, in scene units. */
  readonly radius: number;
  /** Initial angle in radians (offset along the orbit). */
  readonly angle: number;
  /** Angular velocity in radians/second. */
  readonly speed: number;
  /** Z-axis tilt of the orbital plane, in radians. */
  readonly tilt: number;
  /** 1 = counter-clockwise, -1 = clockwise. */
  readonly direction: 1 | -1;
}

export interface Planet {
  readonly id: string;
  readonly title: string;
  readonly tagline: string;
  /** Fallback URL — overridden by the matching `PUBLIC_URL_*` env var when present. */
  readonly url: string;
  readonly palette: PlanetPalette;
  readonly ring: boolean;
  readonly orbit: PlanetOrbit;
  readonly size: number;
  readonly subject: string;
  readonly icon: string;
}

export const PLANETS: readonly Planet[] = [
  {
    id: "descobrimentos",
    title: "Rota dos Descobrimentos",
    tagline: "Navega os mares do Oceano Atlântico com os navegadores portugueses",
    url: "https://rota-dos-descobrimentos.vercel.app",
    palette: { primary: "#2aa7ff", secondary: "#0a4d8c", emissive: "#8fd3ff" },
    ring: true,
    orbit: { radius: 7.5, angle: Math.PI * 1.14, speed: 0.04, tilt: 0.25, direction: 1 },
    size: 1.05,
    subject: "História",
    icon: "⛵",
  },
  {
    id: "arraial-digital",
    title: "Arraial Digital",
    tagline: "Um arraial açoriano cheio de desafios digitais",
    url: "https://arraial-digital.vercel.app",
    palette: { primary: "#ff7a2b", secondary: "#c22b5f", emissive: "#ffd08a" },
    ring: false,
    orbit: { radius: 4.3, angle: Math.PI * 0.29, speed: 0.085, tilt: 0.55, direction: -1 },
    size: 0.78,
    subject: "TIC / Literacia Digital",
    icon: "🎪",
  },
  {
    id: "arraial-matematica",
    title: "Arraial da Matemática",
    tagline: "Matemática em jogos festivos ao estilo popular",
    url: "https://arraial-da-matematica.vercel.app",
    palette: { primary: "#a56bff", secondary: "#3e1e7a", emissive: "#dab8ff" },
    ring: false,
    orbit: { radius: 6.3, angle: Math.PI * 0.86, speed: 0.055, tilt: -0.5, direction: 1 },
    size: 0.9,
    subject: "Matemática",
    icon: "🧮",
  },
  {
    id: "arraial-3d",
    title: "Arraial da Matemática 3D",
    tagline: "A festa da matemática, agora em três dimensões",
    url: "https://arraialdamatematica3d.onrender.com",
    palette: { primary: "#32e8d0", secondary: "#0a4d5b", emissive: "#9ff7ec" },
    ring: true,
    orbit: { radius: 8.5, angle: Math.PI * 1.43, speed: 0.032, tilt: 0.75, direction: -1 },
    size: 0.98,
    subject: "Matemática · 3D",
    icon: "✨",
  },
  {
    id: "caracois",
    title: "Caracóis da Matemática",
    tagline: "Espirais, sequências e corridas lentas mas certeiras",
    url: "https://caracoisdamatematica.vercel.app",
    palette: { primary: "#6ed75a", secondary: "#274d1a", emissive: "#d2ff9a" },
    ring: false,
    orbit: { radius: 3.2, angle: 0, speed: 0.12, tilt: 0.4, direction: 1 },
    size: 0.7,
    subject: "Matemática",
    icon: "🐌",
  },
  {
    id: "expedicao",
    title: "Expedição Ciência",
    tagline: "Explora a ciência como um verdadeiro investigador",
    url: "https://expedicaociencia.onrender.com",
    palette: { primary: "#f5d442", secondary: "#6b4b0a", emissive: "#fff1a6" },
    ring: false,
    orbit: { radius: 5.3, angle: Math.PI * 0.57, speed: 0.07, tilt: -0.65, direction: -1 },
    size: 0.85,
    subject: "Ciência",
    icon: "🔬",
  },
  {
    id: "estudio-hardware",
    title: "Estúdio Hardware",
    tagline: "Explora as peças do teu computador e descobre como funcionam",
    url: "https://estudiohardware.vercel.app/estudio-hardware-tic.html",
    palette: { primary: "#3b82f6", secondary: "#1b2a6b", emissive: "#9fc4ff" },
    ring: false,
    orbit: { radius: 6.9, angle: Math.PI * 0.43, speed: 0.05, tilt: 0.55, direction: 1 },
    size: 0.88,
    subject: "TIC · Hardware",
    icon: "🖥️",
  },
  {
    id: "aibot",
    title: "AI Bot Academy",
    tagline: "Aprende Inteligência Artificial a construir o teu bot",
    url: "https://aibotacademy.vercel.app",
    palette: { primary: "#ff4ed8", secondary: "#2b0a4d", emissive: "#ffb3f1" },
    ring: true,
    orbit: { radius: 9.8, angle: Math.PI * 1.71, speed: 0.025, tilt: -0.45, direction: 1 },
    size: 1.1,
    subject: "IA e Pensamento Computacional",
    icon: "🤖",
  },
];
