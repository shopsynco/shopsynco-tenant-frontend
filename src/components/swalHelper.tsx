// src/utils/swalHelpers.ts
import Swal from "sweetalert2";

/**
 * Small helper to open a custom-styled Swal popup that looks like your success card.
 * @param title - big heading text
 * @param message - small subtitle text (can contain simple HTML)
 * @param ctaText - text for primary button (optional)
 * @param onCta - callback executed when CTA clicked (optional)
 */
export function showSuccessCard({
  title,
  message,
  ctaText = "OK",
  onCta,
}: {
  title: string;
  message?: string;
  ctaText?: string;
  onCta?: () => void;
}) {
  Swal.fire({
    html: `
      <div class="swal-card">
        <div class="swal-icon-circle"><div class="swal-icon-inner">✓</div></div>
        <h1 class="swal-title">${title}</h1>
        ${message ? `<p class="swal-sub">${message}</p>` : ""}
        <div style="margin-top:18px;">
          <button id="swal-primary-cta" class="swal-btn-primary">${ctaText}</button>
        </div>
      </div>
    `,
    showConfirmButton: false,
    background: "transparent",
    didOpen: () => {
      const btn = document.getElementById("swal-primary-cta");
      if (btn) {
        btn.addEventListener("click", () => {
          Swal.close();
          if (onCta) onCta();
        });
      }
    },
    customClass: {
      popup: "swal-popup-wrapper",
    },
  });
}

/**
 * Error card popup — same style but for errors
 */
export function showErrorCard({
  title,
  message,
  ctaText = "Close",
  onCta,
}: {
  title: string;
  message?: string;
  ctaText?: string;
  onCta?: () => void;
}) {
  Swal.fire({
    html: `
      <div class="swal-card">
        <div class="swal-error-icon-circle"><div class="swal-error-icon-inner">!</div></div>
        <h1 class="swal-title">${title}</h1>
        ${message ? `<p class="swal-sub">${message}</p>` : ""}
        <div style="margin-top:18px;">
          <button id="swal-error-cta" class="swal-btn-primary">${ctaText}</button>
        </div>
      </div>
    `,
    showConfirmButton: false,
    background: "transparent",
    didOpen: () => {
      const btn = document.getElementById("swal-error-cta");
      if (btn) {
        btn.addEventListener("click", () => {
          Swal.close();
          if (onCta) onCta();
        });
      }
    },
    customClass: {
      popup: "swal-popup-wrapper",
    },
  });
}

/**
 * Show multiple validation errors (from API). Displays a combined message as a list,
 * and then also optionally highlight single-field messages inside the form using returned data.
 * @param errors - Record<string,string[]>
 */
export function showValidationErrors(errors: Record<string, string[]>) {
  const html = Object.entries(errors)
    .map(([key, arr]) => `<strong>${key}:</strong> ${arr.join(", ")}`)
    .join("<br/>");

  Swal.fire({
    html: `
      <div class="swal-card">
        <h1 class="swal-title">Validation error</h1>
        <div class="swal-sub" style="text-align:left; max-height:220px; overflow:auto;">
          ${html}
        </div>
        <div style="margin-top:18px;">
          <button id="swal-validation-ok" class="swal-btn-primary">OK</button>
        </div>
      </div>
    `,
    showConfirmButton: false,
    background: "transparent",
    didOpen: () => {
      const btn = document.getElementById("swal-validation-ok");
      if (btn) btn.addEventListener("click", () => Swal.close());
    },
    customClass: { popup: "swal-popup-wrapper" },
  });
}
