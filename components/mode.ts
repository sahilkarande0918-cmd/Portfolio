export type Mode = "light" | "dark";

export const getMode = (): Mode => (document.documentElement.dataset.mode === "dark" ? "dark" : "light");

// the mode the latest pull asked for, until its view transition has applied it: rapid pulls must each flip
// from that, not from the attribute a still-pending transition hasn't changed yet
let next: Mode | undefined;

export function setMode(m: Mode) {
  next = m;
  const apply = () => {
    if (next === m) next = undefined;
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

export const toggleMode = () => setMode((next ?? getMode()) === "dark" ? "light" : "dark");
