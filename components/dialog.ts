// Native <dialog> does the focus trap, inert background and Escape; these add the fade and
// give focus back to whatever opened it.
const openers = new WeakMap<HTMLDialogElement, Element | null>();

export function openDialog(d: HTMLDialogElement | null) {
  if (!d || d.open) return;
  openers.set(d, document.activeElement);
  d.showModal();
  requestAnimationFrame(() => d.classList.add("open"));
  if (!bound.has(d)) {
    bound.add(d);
    d.addEventListener("cancel", (e) => {
      e.preventDefault();
      closeDialog(d);
    });
  }
}
const bound = new WeakSet<HTMLDialogElement>();

export function closeDialog(d: HTMLDialogElement | null) {
  if (!d?.open || !d.classList.contains("open")) return;
  d.classList.remove("open");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  setTimeout(() => {
    d.close();
    d.dispatchEvent(new Event("closed"));
    (openers.get(d) as HTMLElement | null)?.focus?.({ preventScroll: true });
  }, reduce ? 0 : 380);
}
