/**
 * Arraial Digital game catalogue.
 *
 * Each entry maps to a self-contained vanilla HTML file in `public/`. Clicking
 * a card navigates the browser straight to that static file (see GameLayout /
 * ArraialRoute). Phase 1 shipped the first two games; Phase 2 adds the
 * remaining four Arraial Digital titles.
 */

export interface ArraialGame {
  readonly id: string;
  readonly title: string;
  readonly tagline: string;
  /** Path to the static HTML game, served from `public/`. */
  readonly href: string;
  readonly icon: string;
  /** Two-stop gradient for the card face. */
  readonly from: string;
  readonly to: string;
  readonly available: boolean;
}

export const GAMES: readonly ArraialGame[] = [
  {
    id: "escudo-digital",
    title: "Escudo Digital",
    tagline: "Defende-te das ameaças online e torna-te um herói da cibersegurança.",
    href: "/escudo-digital.html",
    icon: "🛡️",
    from: "#ff7a2b",
    to: "#c22b5f",
    available: true,
  },
  {
    id: "azulejo-binario",
    title: "Azulejo Binário",
    tagline: "Acende os azulejos certos e converte números em código binário.",
    href: "/azulejo-binario.html",
    icon: "🔢",
    from: "#3b82f6",
    to: "#2a1248",
    available: true,
  },
  {
    id: "pombo-correio-digital",
    title: "Pombo Correio Digital",
    tagline: "Aprende as boas maneiras da comunicação digital e da netiqueta.",
    href: "/pombo-correio-digital.html",
    icon: "🕊️",
    from: "#0ea5e9",
    to: "#1e3a8a",
    available: true,
  },
  {
    id: "feira-ficheiros",
    title: "Feira de Ficheiros",
    tagline: "Arruma cada ficheiro na sua banca: imagem, áudio, vídeo e mais.",
    href: "/feira-ficheiros.html",
    icon: "📁",
    from: "#f59e0b",
    to: "#7c2d12",
    available: true,
  },
  {
    id: "caca-tesouro-digital",
    title: "Caça ao Tesouro Digital",
    tagline: "Resolve as pistas digitais e segue o mapa até ao tesouro.",
    href: "/caca-tesouro-digital.html",
    icon: "🗺️",
    from: "#10b981",
    to: "#064e3b",
    available: true,
  },
  {
    id: "robo-dos-acores",
    title: "Robô dos Açores",
    tagline: "Programa o robô com setas para apanhar o ananás sem bater nas pedras.",
    href: "/robo-dos-acores.html",
    icon: "🤖",
    from: "#a855f7",
    to: "#3b0764",
    available: true,
  },
];
