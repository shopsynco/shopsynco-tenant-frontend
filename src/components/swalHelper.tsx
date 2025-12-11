// src/utils/swal.ts
import Swal from "sweetalert2";

type Callback = () => void;

const PAGE_GRADIENT =
  "linear-gradient(112deg, rgba(255,255,255,0) 0%, rgba(113,156,191,0.20) 98.3%)";

function ensureGlobalStyles() {
  if (document.getElementById("custom-swal-styles")) return;
  const style = document.createElement("style");
  style.id = "custom-swal-styles";
  style.innerHTML = `
    .swal2-custom-popup {
      background: transparent !important;
      box-shadow: none !important;
      padding: 0 !important;
    }

    .swal2-container.custom-swal-backdrop {
      background: ${PAGE_GRADIENT} !important;
      backdrop-filter: blur(14px) !important;
      -webkit-backdrop-filter: blur(14px) !important;
    }

    .swal-card {
      width: 360px;
      max-width: calc(100vw - 48px);
      padding: 28px 28px 32px;
      border-radius: 20px;
      box-shadow: 0 15px 40px rgba(0,0,0,0.08);
      text-align: center;
      background: rgba(255,255,255,0.85) !important;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      background-clip: padding-box;
      font-family: Raleway, Inter, sans-serif;
    }

    @media (max-width:420px) {
      .swal-card { width: 300px; padding: 20px; border-radius: 14px; }
    }
  `;
  document.head.appendChild(style);
}

export function showSuccess(title: string, message: string, onClose?: Callback) {
  ensureGlobalStyles();

  Swal.fire({
    html: `
      <div class="swal-card" role="dialog" aria-labelledby="swal-title" aria-describedby="swal-sub">
        <div style="width:84px;height:84px;margin:8px auto 18px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(133,204,132,0.16)">
          <div style="font-size:36px;color:#2fa84f">✔</div>
        </div>
        <h2 id="swal-title" style="margin:6px 0 4px;font-size:20px;font-weight:600;color:#27445a">${title}</h2>
        <p id="swal-sub" style="margin:0 0 8px;font-size:14px;color:#5f7385">${message}</p>
        <button id="swal-ok-btn" style="display:inline-block;margin-top:14px;width:85%;padding:12px;border-radius:12px;background:#719CBF;color:#fff;font-weight:600;border:none;cursor:pointer;box-shadow:0 6px 14px rgba(87,129,163,0.18)">ok</button>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    padding: 0,
    background: "transparent",
    customClass: { popup: "swal2-custom-popup" },
    didOpen: () => {
      const container = document.querySelector(".swal2-container") as HTMLElement | null;
      if (container) {
        container.classList.add("custom-swal-backdrop");
        // inline apply as extra defense
        container.style.background = PAGE_GRADIENT;
        container.style.setProperty("backdrop-filter", "blur(14px)");
        container.style.setProperty("-webkit-backdrop-filter", "blur(14px)");
      }

      const btn = document.getElementById("swal-ok-btn");
      btn?.addEventListener("click", () => {
        if (container) {
          container.classList.remove("custom-swal-backdrop");
          container.style.background = "";
          container.style.removeProperty("backdrop-filter");
          container.style.removeProperty("-webkit-backdrop-filter");
        }
        Swal.close();
        if (onClose) onClose();
      });
    },
  });
}

export function showError(title: string, message: string, onClose?: Callback) {
  ensureGlobalStyles();

  Swal.fire({
    html: `
      <div class="swal-card" role="dialog" aria-labelledby="swal-title" aria-describedby="swal-sub">
        <div style="width:84px;height:84px;margin:8px auto 18px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,84,84,0.09)">
          <div style="font-size:36px;color:#ff5b5b">!</div>
        </div>
        <h2 id="swal-title" style="margin:6px 0 4px;font-size:20px;font-weight:600;color:#27445a">${title}</h2>
        <p id="swal-sub" style="margin:0 0 8px;font-size:14px;color:#5f7385">${message}</p>
        <button id="swal-ok-btn" style="display:inline-block;margin-top:14px;width:85%;padding:12px;border-radius:12px;background:#ff6b6b;color:#fff;font-weight:600;border:none;cursor:pointer;box-shadow:0 6px 14px rgba(255,107,107,0.14)">OK</button>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    padding: 0,
    background: "transparent",
    customClass: { popup: "swal2-custom-popup" },
    didOpen: () => {
      const container = document.querySelector(".swal2-container") as HTMLElement | null;
      if (container) {
        container.classList.add("custom-swal-backdrop");
        container.style.background = PAGE_GRADIENT;
        container.style.setProperty("backdrop-filter", "blur(14px)");
        container.style.setProperty("-webkit-backdrop-filter", "blur(14px)");
      }

      const btn = document.getElementById("swal-ok-btn");
      btn?.addEventListener("click", () => {
        if (container) {
          container.classList.remove("custom-swal-backdrop");
          container.style.background = "";
          container.style.removeProperty("backdrop-filter");
          container.style.removeProperty("-webkit-backdrop-filter");
        }
        Swal.close();
        if (onClose) onClose();
      });
    },
  });
}

export function showWarning(title: string, message: string, onClose?: Callback) {
  ensureGlobalStyles();

  Swal.fire({
    html: `
      <div class="swal-card" role="dialog" aria-labelledby="swal-title" aria-describedby="swal-sub">
        <div style="width:84px;height:84px;margin:8px auto 18px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,193,7,0.15)">
          <div style="font-size:36px;color:#ffa000">⚠</div>
        </div>
        <h2 id="swal-title" style="margin:6px 0 4px;font-size:20px;font-weight:600;color:#27445a">${title}</h2>
        <p id="swal-sub" style="margin:0 0 8px;font-size:14px;color:#5f7385">${message}</p>
        <button id="swal-ok-btn" style="display:inline-block;margin-top:14px;width:85%;padding:12px;border-radius:12px;background:#ffa000;color:#fff;font-weight:600;border:none;cursor:pointer;box-shadow:0 6px 14px rgba(255,160,0,0.18)">OK</button>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    padding: 0,
    background: "transparent",
    customClass: { popup: "swal2-custom-popup" },
    didOpen: () => {
      const container = document.querySelector(".swal2-container") as HTMLElement | null;
      if (container) {
        container.classList.add("custom-swal-backdrop");
        container.style.background = PAGE_GRADIENT;
        container.style.setProperty("backdrop-filter", "blur(14px)");
        container.style.setProperty("-webkit-backdrop-filter", "blur(14px)");
      }

      const btn = document.getElementById("swal-ok-btn");
      btn?.addEventListener("click", () => {
        if (container) {
          container.classList.remove("custom-swal-backdrop");
          container.style.background = "";
          container.style.removeProperty("backdrop-filter");
          container.style.removeProperty("-webkit-backdrop-filter");
        }
        Swal.close();
        if (onClose) onClose();
      });
    },
  });
}