import { useState } from "react";
import { X } from "lucide-react";
import {
  submitTenantFeedback,
  type TenantFeedbackCategory,
} from "../../../api/mainapi/tenantFeedbackApi";
import { showError, showSuccess } from "../../../components/swalHelper";
import { ensureTenantStoreSlugForApi } from "../../../utils/tenantStoreSlug";

const CATEGORIES: { value: TenantFeedbackCategory; label: string }[] = [
  { value: "complaint", label: "Complaint" },
  { value: "suggestion", label: "Suggestion" },
  { value: "general", label: "General feedback" },
  { value: "other", label: "Other" },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function FeedbackModal({ open, onClose }: Props) {
  const [category, setCategory] = useState<TenantFeedbackCategory>("general");
  const [body, setBody] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const trimmed = body.trim();
    if (trimmed.length < 5) {
      showError("Too short", "Please write at least a few words so we can help.");
      return;
    }
    setSubmitting(true);
    try {
      const slug = await ensureTenantStoreSlugForApi();
      if (!slug) {
        showError("Missing store", "We could not resolve your store. Try logging in again.");
        return;
      }
      await submitTenantFeedback(slug, {
        category,
        body: trimmed,
        public_display_name: displayName.trim() || undefined,
      });
      showSuccess("Thank you", "Your feedback was sent to our team for review.", () => {
        setBody("");
        setDisplayName("");
        setCategory("general");
        onClose();
      });
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { detail?: unknown; error?: string; message?: string } } };
      const d = ax.response?.data;
      let msg = "Could not submit feedback. Please try again.";
      if (typeof d?.error === "string") msg = d.error;
      else if (typeof d?.message === "string") msg = d.message;
      else if (typeof d?.detail === "string") msg = d.detail;
      showError("Submit failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-[#E2DAFF] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#F5F1FF]">
          <h2 id="feedback-modal-title" className="text-lg font-semibold text-[#6A3CB1]">
            Give feedback
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-white/80"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-gray-600">
            Share complaints, suggestions, or anything we should know. Your message is reviewed by the
            ShopSynco team before any public display.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TenantFeedbackCategory)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1] outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              maxLength={8000}
              placeholder="Describe your feedback…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1] outline-none resize-y min-h-[120px]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display name (optional)
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={120}
              placeholder="e.g. Amina — used only if your feedback is approved for the storefront"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-[#6A3CB1] outline-none"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-[#6A3CB1] text-white text-sm font-semibold hover:bg-[#5b32a2] disabled:opacity-50"
            >
              {submitting ? "Sending…" : "Submit feedback"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
