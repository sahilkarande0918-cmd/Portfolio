export type Mode = "light" | "dark";

export const getMode = (): Mode => (document.documentElement.dataset.mode === "dark" ? "dark" : "light");

export function setMode(m: Mode) {
  const apply = () => {
    document.documentElement.dataset.mode = m;
    try {
      localStorage.setItem("mode", m);
    } catch {}
    dispatchEvent(new CustomEvent("modechange", { detail: m }));
  };
  const vt = (document as Document & { startViewTransition?: (f: () => void) => unknown }).startViewTransition;
  if (vt && !matchMedia("(prefers-reduced-motion: reduce)").matches) vt.call(document, apply);
  else apply();
}

export const toggleMode = () => setMode(getMode() === "dark" ? "light" : "dark");
