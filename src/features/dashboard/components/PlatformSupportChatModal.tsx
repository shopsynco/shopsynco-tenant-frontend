import { useCallback, useEffect, useRef, useState } from "react";
import { Send, X, RefreshCw } from "lucide-react";
import {
  getPlatformSupportConversation,
  postPlatformSupportMessage,
  type PlatformSupportMessageRow,
} from "../../../api/mainapi/platformSupportApi";
import { showError } from "../../../components/swalHelper";
import { ensureTenantStoreSlugForApi } from "../../../utils/tenantStoreSlug";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Shown in header — e.g. "Invoices" */
  topicLabel: string;
};

function formatTime(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PlatformSupportChatModal({ open, onClose, topicLabel }: Props) {
  const [messages, setMessages] = useState<PlatformSupportMessageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!open) return;
      if (!opts?.silent) setLoading(true);
      try {
        const slug = await ensureTenantStoreSlugForApi();
        if (!slug) {
          if (!opts?.silent) {
            showError("Missing store", "We could not resolve your store. Try logging in again.");
          }
          return;
        }
        const thread = await getPlatformSupportConversation(slug);
        setMessages(thread.messages ?? []);
      } catch (e: unknown) {
        console.error(e);
        if (!opts?.silent) {
          showError("Could not load chat", "Please try again in a moment.");
        }
      } finally {
        if (!opts?.silent) setLoading(false);
      }
    },
    [open],
  );

  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInput("");
      return;
    }
    void load();
    const t = window.setInterval(() => void load({ silent: true }), 5000);
    return () => window.clearInterval(t);
  }, [open, load]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      const slug = await ensureTenantStoreSlugForApi();
      if (!slug) {
        showError("Missing store", "We could not resolve your store. Try logging in again.");
        return;
      }
      await postPlatformSupportMessage(slug, text);
      setInput("");
      await load({ silent: true });
    } catch (e: unknown) {
      console.error(e);
      showError("Send failed", "Your message could not be sent. Try again.");
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4">
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-[#E2DAFF] overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-chat-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-[#F5F1FF] shrink-0">
          <div>
            <h2 id="support-chat-title" className="text-lg font-semibold text-[#6A3CB1]">
              Contact ShopSynco
            </h2>
            <p className="text-xs text-gray-500">
              {topicLabel.trim() ? `About: ${topicLabel.trim()}` : "Billing & subscription"}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="rounded-full p-2 text-gray-500 hover:bg-white/80 disabled:opacity-50"
              aria-label="Refresh messages"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-gray-500 hover:bg-white/80"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#ECE5F7]/30 min-h-[280px]">
          {loading && messages.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Loading conversation…
            </div>
          ) : messages.length === 0 ? (
            <p className="text-center text-sm text-gray-500 mt-8">
              Say hello — the ShopSynco team will reply here.
            </p>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_role === "tenant";
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                      isMine
                        ? "bg-[#6A3CB1] text-white rounded-br-md"
                        : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                    }`}
                  >
                    {!isMine && (
                      <p className="text-[10px] font-semibold text-[#7658A0] mb-0.5">ShopSynco</p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        isMine ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {formatTime(msg.date_added)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-gray-100 p-3 bg-white shrink-0">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              maxLength={8000}
              placeholder="Type a message…"
              className="flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1] outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend();
                }
              }}
              disabled={sending}
            />
            <button
              type="button"
              onClick={() => void handleSend()}
              disabled={sending || !input.trim()}
              className="p-3 rounded-xl bg-[#6A3CB1] text-white hover:bg-[#5b32a2] disabled:opacity-40"
              aria-label="Send"
            >
              {sending ? <RefreshCw size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
