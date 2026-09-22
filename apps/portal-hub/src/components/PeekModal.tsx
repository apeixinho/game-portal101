import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Planet } from "../data/planets";
import { resolvePlanetUrl } from "../lib/links";
import { playCue } from "../lib/audio";

interface PeekModalProps {
  readonly planet: Planet | null;
  readonly onClose: () => void;
}

/**
 * Game preview modal. Mirrors the original Hub: a gradient-bordered frame
 * embeds the destination game in an iframe with a 5s timeout. If the target
 * sets X-Frame-Options / CSP `frame-ancestors`, we switch to a "blocked"
 * fallback that nudges the user to the primary "Jogar agora →" button, which
 * opens the world in a new tab.
 *
 * CSS variables `--glow-from`, `--glow-to` and `--glow-dark` are set per
 * planet so the modal inherits the world's palette.
 */
export function PeekModal({ planet, onClose }: PeekModalProps): JSX.Element {
  const [loaded, setLoaded] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    if (!planet) return;
    setLoaded(false);
    setBlocked(false);
    const t = window.setTimeout(() => {
      setBlocked((current) => (current || !loaded ? true : current));
    }, 5500);
    return () => window.clearTimeout(t);
    // We deliberately only re-run when the planet changes; `loaded` is a
    // post-mount signal that races with the timeout above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planet?.id]);

  useEffect(() => {
    if (!planet) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [planet, onClose]);

  const url = planet ? resolvePlanetUrl(planet) : null;

  return (
    <AnimatePresence>
      {planet && url && (
        <motion.div
          className="peek-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`peek-title-${planet.id}`}
        >
          <motion.div
            className="peek"
            style={
              {
                "--glow-from": planet.palette.primary,
                "--glow-to": planet.palette.emissive,
                "--glow-dark": planet.palette.secondary,
              } as CSSProperties
            }
            initial={{ scale: 0.94, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="peek__header">
              <div className="peek__meta">
                <span className="peek__icon" aria-hidden="true">
                  {planet.icon}
                </span>
                <div>
                  <div className="peek__subject">{planet.subject}</div>
                  <h2 id={`peek-title-${planet.id}`} className="peek__title">
                    {planet.title}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="peek__close"
                onClick={onClose}
                aria-label="Fechar"
                title="Fechar"
              >
                ×
              </button>
            </header>

            <div className="peek__frame">
              <div className="peek__frame-inner">
                {!blocked && (
                  <iframe
                    key={planet.id}
                    className="peek__iframe"
                    src={url}
                    title={`Pré-visualização — ${planet.title}`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onLoad={() => setLoaded(true)}
                  />
                )}
                {!loaded && !blocked && (
                  <div className="peek__loading" aria-hidden="true">
                    <div className="peek__loading-ring" />
                    <div className="peek__loading-text">A carregar o mundo</div>
                  </div>
                )}
                {blocked && (
                  <div className="peek__blocked">
                    <div className="peek__blocked-icon" aria-hidden="true">
                      {planet.icon}
                    </div>
                    <p>Este mundo só pode ser explorado em tela inteira.</p>
                    <p className="peek__blocked-sub">
                      Clica em <b>Jogar agora</b> para abrir.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <footer className="peek__footer">
              <p className="peek__tagline">{planet.tagline}</p>
              <div className="peek__actions">
                <button
                  type="button"
                  className="peek__btn"
                  onClick={() => {
                    playCue("close");
                    onClose();
                  }}
                >
                  ← Voltar
                </button>
                <a
                  className="peek__btn peek__btn--primary"
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playCue("select")}
                >
                  Jogar agora →
                </a>
              </div>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
