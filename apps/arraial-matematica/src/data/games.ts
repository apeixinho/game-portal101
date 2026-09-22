/**
 * Arraial da Matemática game catalogue.
 *
 * Each entry maps to a self-contained vanilla HTML file in `public/`. Clicking
 * a card navigates the browser straight to that static file. Phase 1 shipped
 * the first two single-player-vs-CPU games; Phase 2 adds four more titles.
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
    id: "puxa-a-corda",
    title: "Puxa a Corda",
    tagline: "Responde depressa e puxa a corda para o teu lado antes do adversário!",
    href: "/puxa-a-corda.html",
    icon: "🪢",
    from: "#a56bff",
    to: "#3e1e7a",
    available: true,
  },
  {
    id: "corrida-caracois",
    title: "Corrida de Caracóis",
    tagline: "Cada resposta certa faz o teu caracol avançar. Chega primeiro à meta!",
    href: "/corrida-caracois.html",
    icon: "🐌",
    from: "#6ed75a",
    to: "#274d1a",
    available: true,
  },
  {
    id: "sardinhas-na-grelha",
    title: "Sardinhas na Grelha",
    tagline: "Toca nas sardinhas certas antes do tempo acabar: pares, múltiplos e mais.",
    href: "/sardinhas-na-grelha.html",
    icon: "🐟",
    from: "#f97316",
    to: "#7c2d12",
    available: true,
  },
  {
    id: "concertina-matematica",
    title: "Concertina Matemática",
    tagline: "Descobre o número que falta na sequência ao ritmo da concertina.",
    href: "/concertina-matematica.html",
    icon: "🪗",
    from: "#a56bff",
    to: "#3e1e7a",
    available: true,
  },
  {
    id: "malha-numerica",
    title: "Malha Numérica",
    tagline: "Lança a malha e acerta na posição certa do número na reta.",
    href: "/malha-numerica.html",
    icon: "🥏",
    from: "#22d3ee",
    to: "#155e75",
    available: true,
  },
  {
    id: "olaria-magica",
    title: "Olaria Mágica",
    tagline: "Pinta as peças de barro e domina as frações na roda do oleiro.",
    href: "/olaria-magica.html",
    icon: "🏺",
    from: "#e07a3f",
    to: "#7c2d12",
    available: true,
  },
];
