import { motion } from "framer-motion";
import { CoffeeButton } from "./CoffeeButton";

interface IntroOverlayProps {
  readonly onEnter: () => void;
  readonly visible: boolean;
}

/**
 * Pre-warp intro: "Prof. Ricardo · apresenta / Universo de Jogos / Atravessa
 * o portal · explora 7 mundos" followed by the "Atravessar →" CTA. Animations
 * staged with framer-motion so the title reveals after the eyebrow.
 *
 * Copy is verbatim from the original Hub.
 */
export function IntroOverlay({ onEnter, visible }: IntroOverlayProps): JSX.Element {
  return (
    <div className="intro" aria-hidden={!visible}>
      <div className="intro__scrim" />
      <div className="intro__title">
        <motion.p
          className="intro__eyebrow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          Prof. Ricardo · apresenta
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 18, letterSpacing: "0.2em" }}
          animate={{
            opacity: visible ? 1 : 0,
            y: visible ? 0 : 18,
            letterSpacing: visible ? "0.08em" : "0.2em",
          }}
          transition={{ duration: 1.4, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Universo de Jogos
        </motion.h1>
        <motion.p
          className="intro__sub"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 10 }}
          transition={{ duration: 1, delay: 1.4 }}
        >
          Atravessa o portal · explora 7 mundos
        </motion.p>
        <motion.button
          className="intro__enter"
          onClick={onEnter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          aria-label="Atravessar o portal e entrar no universo de jogos"
        >
          <span>Atravessar</span>
          <span aria-hidden="true">→</span>
        </motion.button>
      </div>
      <div className="intro__coffee">
        <CoffeeButton variant="intro" />
      </div>
    </div>
  );
}
