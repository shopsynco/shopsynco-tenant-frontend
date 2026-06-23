import { useState, useEffect, useRef } from "react";
import {
  Bell,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/Name-Logo.png";
import { fetchUserProfile } from "../../../api/auth/authapi";
import {
  dismissNotificationIds,
  fetchTenantNotifications,
  type TenantNotificationRow,
} from "../../../api/mainapi/notificationsapi";
import { ensureTenantStoreSlugForApi } from "../../../utils/tenantStoreSlug";
import FeedbackModal from "./FeedbackModal";

export default function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [notifications, setNotifications] = useState<TenantNotificationRow[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const [userData, setUserData] = useState({
    full_name: localStorage.getItem("full_name")?.trim() || "User",
    email: localStorage.getItem("email") || "user@email.com",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (data && data?.user?.full_name && data?.user?.email) {
          const cleanName = data.user.full_name.trim();
          setUserData({ full_name: cleanName, email: data.user.email });
          localStorage.setItem("full_name", cleanName);
          localStorage.setItem("email", data.user.email);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    void getProfile();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      try {
        setNotificationsLoading(true);
        await ensureTenantStoreSlugForApi();
        const data = await fetchTenantNotifications();
        if (!cancelled) {
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setNotificationsLoading(false);
      }
    };

    void loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (profileRef.current && target && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && target && !notifRef.current.contains(target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleClearAll = () => {
    const ids = notifications.map((n) => n.id).filter(Boolean);
    if (ids.length) dismissNotificationIds(ids);
    setNotifications([]);
    setNotifOpen(false);
  };

  const handleNotificationClick = (notification: TenantNotificationRow) => {
    if (notification.action_url) {
      navigate(notification.action_url);
      setNotifOpen(false);
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const mobileMenuItems = [
    {
      label: "Manage Billing",
      icon: CreditCard,
      onClick: () => {
        closeMenu();
        navigate("/manage-billing");
      },
    },
    {
      label: "View Invoices",
      icon: FileText,
      onClick: () => {
        closeMenu();
        navigate("/invoice");
      },
    },
    {
      label: "Give Us Feedback",
      icon: MessageSquare,
      onClick: () => {
        closeMenu();
        setFeedbackOpen(true);
      },
    },
    {
      label: "Logout",
      icon: LogOut,
      onClick: () => {
        closeMenu();
        handleLogout();
      },
    },
  ];

  const renderNotificationList = () => {
    if (notificationsLoading) {
      return (
        <div className="px-4 py-6 text-sm text-gray-500 text-center">
          Loading notifications...
        </div>
      );
    }

    if (notifications.length === 0) {
      return (
        <div className="px-4 py-6 text-sm text-gray-500 text-center">
          No new notifications right now.
        </div>
      );
    }

    return notifications.map((n) => (
      <button
        key={n.id}
        type="button"
        onClick={() => handleNotificationClick(n)}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
      >
        <p className="font-semibold text-gray-900">{n.title}</p>
        <p className="text-xs text-gray-500 mt-1">{n.message}</p>
        <p className="text-[11px] text-gray-400 mt-1">{n.time_label || "Recently"}</p>
      </button>
    ));
  };

  const notificationButton = (
    <button
      type="button"
      onClick={() => {
        setNotifOpen((open) => !open);
        setProfileOpen(false);
        setMenuOpen(false);
      }}
      className="p-2 rounded-full hover:bg-gray-100 relative"
      aria-expanded={notifOpen}
      aria-haspopup="true"
      aria-label="Notifications"
    >
      <Bell size={20} className="text-[#6A3CB1] lg:text-gray-600" />
      {notifications.length > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#6A3CB1] rounded-full" />
      )}
    </button>
  );

  return (
    <>
      <header className="px-4 sm:px-6 py-4 bg-white border-b border-gray-200 relative z-40">
        {/* Mobile top bar */}
        <div className="flex lg:hidden items-center w-full">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(true);
                setNotifOpen(false);
              }}
              className="p-2 rounded-lg border border-[#E6DCF4] text-[#6B4A94] hover:bg-[#F6F1FB]"
              aria-label="Open menu"
            >
              <Menu size={20} strokeWidth={2} aria-hidden />
            </button>
            <img src={logo} alt="ShopSynco" className="h-8" />
          </div>

          <div ref={notifRef} className="ml-auto shrink-0">
            {notificationButton}
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <img src={logo} alt="ShopSynco" className="h-8" />
          </div>

          <div className="flex items-center gap-4 relative">
            <div ref={notifRef} className="relative">
              {notificationButton}

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                    <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-xs text-[#6A3CB1] hover:underline font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">{renderNotificationList()}</div>
                </div>
              )}
            </div>

            <div ref={profileRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((open) => !open);
                  setNotifOpen(false);
                }}
                className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-100 transition bg-gray-50"
              >
                <div className="text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate max-w-[160px] md:max-w-none">
                    {userData.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[160px] md:max-w-none">
                    {userData.email}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white shadow-md rounded-lg py-2 border border-gray-100 z-50">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate("/legal/terms");
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Terms &amp; policies
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile side navigation */}
      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            aria-label="Close menu overlay"
            onClick={closeMenu}
          />
          <aside
            className="fixed top-0 left-0 bottom-0 z-[60] w-[min(292px,78vw)] bg-[#6A3CB1] lg:hidden flex flex-col shadow-xl"
            aria-label="Quick Access menu"
          >
            <div className="flex w-full items-center justify-start gap-3 border-b border-white/20 px-5 py-5">
              <button
                type="button"
                onClick={closeMenu}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10"
                aria-label="Close menu"
              >
                <X size={24} strokeWidth={2} aria-hidden />
              </button>
              <h2 className="m-0 shrink-0 text-left text-[16px] font-semibold leading-none text-white">
                Quick Access
              </h2>
            </div>

            <nav className="flex flex-col gap-3 p-5">
              {mobileMenuItems.map(({ label, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="flex w-full items-center gap-3 rounded-lg border border-white px-4 py-3 text-left text-[14px] font-medium text-white transition hover:bg-white/10"
                >
                  <Icon size={24} strokeWidth={1.75} className="shrink-0" aria-hidden />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </aside>
        </>
      )}

      {notifOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto lg:hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
                aria-label="Close notifications"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
            </div>
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-[#6A3CB1] hover:underline font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex flex-col gap-4">{renderNotificationList()}</div>
        </div>
      )}

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  );
}
