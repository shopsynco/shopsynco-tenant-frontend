import axiosInstance from "../../store/refreshToken/tokenUtils";

export type PlatformSupportSenderRole = "tenant" | "owner";

export interface PlatformSupportMessageRow {
  id: string;
  sender: string | null;
  sender_name: string;
  sender_email: string | null;
  sender_role: PlatformSupportSenderRole;
  content: string;
  date_added: string;
}

export interface PlatformSupportThreadRow {
  id: string;
  tenant_schema?: string;
  tenant_name?: string;
  subject: string;
  is_resolved: boolean;
  tenant_unread: number;
  owner_unread: number;
  last_message_at: string | null;
  date_added: string;
  last_message_preview?: string;
  messages?: PlatformSupportMessageRow[];
}

export async function getPlatformSupportConversation(
  tenantSlug: string,
): Promise<PlatformSupportThreadRow> {
  const slug = tenantSlug.trim().toLowerCase();
  const { data } = await axiosInstance.get<{ thread: PlatformSupportThreadRow }>(
    `api/tenants/${encodeURIComponent(slug)}/platform-support/conversation/`,
  );
  return data.thread;
}

export async function postPlatformSupportMessage(
  tenantSlug: string,
  content: string,
): Promise<void> {
  const slug = tenantSlug.trim().toLowerCase();
  await axiosInstance.post(`api/tenants/${encodeURIComponent(slug)}/platform-support/messages/`, {
    content,
  });
}
