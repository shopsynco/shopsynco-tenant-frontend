/**
 * Copy text to the clipboard with Clipboard API + execCommand fallback.
 * Works when Permissions Policy blocks navigator.clipboard on some hosts.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  const value = String(text ?? "").trim();
  if (!value) return false;

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      /* try fallback */
    }
  }

  if (typeof document === "undefined") return false;

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "2em";
    textarea.style.height = "2em";
    textarea.style.padding = "0";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
