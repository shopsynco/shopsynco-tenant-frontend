/** ShopSynco WhatsApp Business: +91 9846668944 */
export const WHATSAPP_BUSINESS_NUMBER = "919846668944";

export function buildWhatsAppSupportUrl(message: string): string {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_BUSINESS_NUMBER}&text=${encodeURIComponent(message)}`;
}

export function openWhatsAppChat(message: string): void {
  window.open(buildWhatsAppSupportUrl(message), "_blank", "noopener,noreferrer");
}

export const SETUP_CALL_MESSAGE =
  "Hi, I would like to book a free setup call for my ShopSynco store.";

export const WHATSAPP_SUPPORT_MESSAGE = "Hi, I need help with my ShopSynco store.";
