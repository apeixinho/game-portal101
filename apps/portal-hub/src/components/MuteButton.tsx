import { toggleMuted, useMuted } from "../lib/audio";

/** Round mute toggle pinned bottom-left, matching the original Hub. */
export function MuteButton(): JSX.Element {
  const muted = useMuted();
  return (
    <button
      type="button"
      className="mute-btn"
      onClick={toggleMuted}
      aria-pressed={muted}
      aria-label={muted ? "Ativar som" : "Desativar som"}
      title={muted ? "Ativar som" : "Desativar som"}
    >
      <span aria-hidden="true">{muted ? "🔇" : "🔊"}</span>
    </button>
  );
}
