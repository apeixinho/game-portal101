/**
 * WebGL capability detection. The Hub renders a fallback HTML grid when the
 * 3D scene can't run — required for older school iPads / Chromebooks
 * (implementation plan §10 risk R4).
 */

export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ??
      canvas.getContext("webgl") ??
      canvas.getContext("experimental-webgl");
    return gl !== null;
  } catch {
    return false;
  }
}
