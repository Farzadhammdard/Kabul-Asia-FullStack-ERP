export function showToast(message) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("toast:show", { detail: { message } }));
}
