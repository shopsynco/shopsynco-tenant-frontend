// src/utils/swal.ts
import Swal from 'sweetalert2';

type Callback = () => void;

/**
 * showSuccess: displays your custom success Swal
 * @param title - headline text
 * @param message - body message
 * @param onClose - optional callback when OK clicked / closed
 */
export function showSuccess(title: string, message: string, onClose?: Callback) {
  Swal.fire({
    html: `
      <div class="swal-card">
        <div class="swal-icon-circle">
          <div class="swal-icon-inner">✔</div>
        </div>
        <h2 class="swal-title">${title}</h2>
        <p class="swal-sub">${message}</p>
        <button id="swal-ok-btn" class="swal-btn-primary mt-4">OK</button>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => {
      const btn = document.getElementById('swal-ok-btn');
      btn?.addEventListener('click', () => {
        Swal.close();
        if (onClose) onClose();
      });
    },
  });
}

/**
 * showError: displays your custom error Swal
 */
export function showError(title: string, message: string, onClose?: Callback) {
  Swal.fire({
    html: `
      <div class="swal-card">
        <div class="swal-error-icon-circle">
          <div class="swal-error-icon-inner">!</div>
        </div>
        <h2 class="swal-title">${title}</h2>
        <p class="swal-sub">${message}</p>
        <button id="swal-ok-btn" class="swal-btn-primary mt-4">OK</button>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false,
    didOpen: () => {
      const btn = document.getElementById('swal-ok-btn');
      btn?.addEventListener('click', () => {
        Swal.close();
        if (onClose) onClose();
      });
    },
  });
}
