import { Copy, ExternalLink, MessageCircle } from "lucide-react";
import { showSuccess } from "../../../../components/swalHelper";
import { copyTextToClipboard } from "../../../../utils/copyToClipboard";
import { trackOnboardingShareAction } from "../../../../lib/onboarding/analytics";
import type { OnboardingShareAction } from "../../../../lib/onboarding/types";

type StoreShareActionsProps = {
  storeUrl: string;
  onShareAction?: (action: OnboardingShareAction) => void;
  compact?: boolean;
};

const primaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#6A3CB1] px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#5a32a0] transition-colors disabled:opacity-50";
const secondaryBtn =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#E2DAFF] bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-[#6A3CB1] hover:bg-[#F5F1FF] transition-colors disabled:opacity-50";

export default function StoreShareActions({
  storeUrl,
  onShareAction,
  compact = false,
}: StoreShareActionsProps) {
  const disabled = !storeUrl;

  const handleCopy = async () => {
    if (!storeUrl) return;
    const ok = await copyTextToClipboard(storeUrl);
    if (ok) {
      showSuccess("Link copied!", "Your store link is ready to share.");
    } else {
      showSuccess("Store link", storeUrl);
    }
    trackOnboardingShareAction("copy");
    onShareAction?.("copy");
  };

  const handleOpen = () => {
    if (!storeUrl) return;
    window.open(storeUrl, "_blank", "noopener,noreferrer");
    trackOnboardingShareAction("open");
    onShareAction?.("open");
  };

  const handleWhatsApp = () => {
    if (!storeUrl) return;
    const text = encodeURIComponent(`Shop my store online: ${storeUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    trackOnboardingShareAction("whatsapp");
    onShareAction?.("whatsapp");
  };

  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "" : "mt-1"}`}>
      <button type="button" className={primaryBtn} disabled={disabled} onClick={() => void handleCopy()}>
        <Copy size={14} />
        Copy Link
      </button>
      <button type="button" className={secondaryBtn} disabled={disabled} onClick={handleOpen}>
        <ExternalLink size={14} />
        Open Store
      </button>
      <button type="button" className={secondaryBtn} disabled={disabled} onClick={handleWhatsApp}>
        <MessageCircle size={14} />
        Share on WhatsApp
      </button>
    </div>
  );
}
