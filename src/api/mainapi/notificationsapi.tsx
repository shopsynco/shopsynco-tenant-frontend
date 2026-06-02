import axiosInstance from "../../store/refreshToken/tokenUtils";

export type TenantNotificationRow = {
  id: string;
  title: string;
  message: string;
  notification_type?: string;
  created_at?: string;
  time_label?: string;
  action_url?: string;
};

export type TenantNotificationsResponse = {
  notifications: TenantNotificationRow[];
  unread_count: number;
};

const DISMISS_KEY = "tenant_dashboard_dismissed_notifications";

export function getDismissedNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

export function dismissNotificationIds(ids: string[]): void {
  const next = getDismissedNotificationIds();
  ids.forEach((id) => next.add(id));
  localStorage.setItem(DISMISS_KEY, JSON.stringify([...next]));
}

export function clearDismissedNotifications(): void {
  localStorage.removeItem(DISMISS_KEY);
}

export const fetchTenantNotifications = async (): Promise<TenantNotificationsResponse> => {
  const res = await axiosInstance.get<TenantNotificationsResponse>(
    "api/tenants/notifications/"
  );
  const data = res.data || { notifications: [], unread_count: 0 };
  const dismissed = getDismissedNotificationIds();
  const notifications = (data.notifications || []).filter(
    (row) => row?.id && !dismissed.has(row.id)
  );
  return {
    notifications,
    unread_count: notifications.length,
  };
};
