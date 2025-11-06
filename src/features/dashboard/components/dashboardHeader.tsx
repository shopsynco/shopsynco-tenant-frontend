import { useState, useEffect } from "react";
import { Bell, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/Name-Logo.png";
import { fetchUserProfile } from "../../../api/auth/authapi";

export default function Header() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // ✅ Load cached user info first for instant UI
  const [userData, setUserData] = useState({
    user_name: localStorage.getItem("user_name") || "User",
    user_email: localStorage.getItem("user_email") || "user@email.com",
  });

  const navigate = useNavigate();

  // ✅ Fetch user info from API once component mounts
  useEffect(() => {
    const getProfile = async () => {
      try {
        const data = await fetchUserProfile();
        if (data?.user_name && data?.user_email) {
          setUserData({
            user_name: data.user_name,
            user_email: data.user_email,
          });

          // ✅ Cache for future loads
          localStorage.setItem("user_name", data.user_name);
          localStorage.setItem("user_email", data.user_email);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };

    getProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const notifications = [
    {
      title: "New Feature Available",
      text: "Explore Smart Analytics – now in your dashboard.",
      time: "1 hour ago",
    },
    {
      title: "Payment Method Updated",
      text: "Your saved payment details were successfully updated.",
      time: "3 hours ago",
    },
  ];

  return (
    <>
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 relative">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="ShopSynco" className="h-8" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4 relative">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#6A3CB1] rounded-full"></span>
            </button>

            {/* Desktop Notification Dropdown */}
            {notifOpen && (
              <div className="hidden lg:block absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Notifications
                  </h3>
                  <button className="text-xs text-[#6A3CB1] hover:underline font-medium">
                    Clear All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.text}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-100 transition bg-gray-50"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  {userData.user_name}
                </p>
                <p className="text-xs text-gray-500">{userData.user_email}</p>
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
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg py-2 border border-gray-100 z-50">
                <button
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
      </header>

      {/* MOBILE NOTIFICATION PAGE */}
      {notifOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto lg:hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotifOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
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
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
              </h3>
            </div>
            <button className="text-sm text-[#6A3CB1] hover:underline font-medium">
              Clear All
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {notifications.map((n, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:bg-gray-50"
              >
                <p className="font-semibold text-gray-800">{n.title}</p>
                <p className="text-sm text-gray-500 mt-1">{n.text}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">{n.time}</span>
                  <button className="text-xs text-[#6A3CB1] font-medium hover:underline">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
