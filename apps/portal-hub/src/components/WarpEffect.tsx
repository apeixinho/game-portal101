import { AnimatePresence, motion } from "framer-motion";

interface WarpEffectProps {
  readonly active: boolean;
}

/**
 * Brief radial flash when the user crosses from the intro into the solar
 * system. Pure CSS gradient — no extra geometry on the GPU.
 */
export function WarpEffect({ active }: WarpEffectProps): JSX.Element {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="warp-flash"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1.2 }}
          exit={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
    </AnimatePresence>
  );
}
