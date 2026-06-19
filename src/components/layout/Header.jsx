import { useState, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import Icon from "../ui/Icon";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAccessibility } from "../../contexts/AccessibilityContext";

/**
 * Header — Sticky top app bar with navigation
 */

const NAV_ITEMS = [
  { to: "/quyen-loi", labelKey: "rights" },
  { to: "/tro-cap", labelKey: "allowance" },
  { to: "/ket-noi", labelKey: "connection" },
  { to: "/ban-do", labelKey: "map" },
];

export default function Header() {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { speakText } = useAccessibility();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Mock notifications list
  const [notifications, setNotifications] = useState([
    {
      id: "notif-1",
      text: "Chào mừng bạn đến với Cổng thông tin hỗ trợ người khuyết tật Hoà Nhập.",
      textEn: "Welcome to the Hoà Nhập Support Portal for People with Disabilities.",
      date: "15/06/2026",
      read: false
    },
    {
      id: "notif-2",
      text: "Đang có đề xuất tăng mức chuẩn trợ cấp xã hội lên 500.000đ từ tháng 7/2026.",
      textEn: "A proposal is underway to raise the base social allowance to 500,000 VND starting July 2026.",
      date: "14/06/2026",
      read: false
    },
    {
      id: "notif-3",
      text: "Tài khoản của bạn đã được xác minh thành công.",
      textEn: "Your account has been successfully verified.",
      date: "13/06/2026",
      read: true
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Global escape key listener to close dropdowns
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setLangOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    speakText(language === "en" ? "All notifications marked as read." : "Đã đánh dấu tất cả thông báo là đã đọc.");
  };

  const toggleRead = (id) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        const nextState = !n.read;
        if (nextState) {
          speakText(language === "en" ? "Marked as read." : "Đã đánh dấu đã đọc.");
        }
        return { ...n, read: nextState };
      }
      return n;
    });
    setNotifications(updated);
  };

  // Switch language on mobile (toggle directly for simple UX)
  const toggleMobileLanguage = () => {
    const nextLang = language === "en" ? "vi" : "en";
    setLanguage(nextLang);
  };

  return (
    <header
      className="glass-header border-b border-outline-variant/50
                 dark:border-outline/50 w-full sticky top-0 z-[9999] theme-transition"
    >
      <div className="flex justify-between items-center px-4 md:px-margin-desktop py-3 w-full max-w-[1440px] mx-auto">
        {/* ── Logo & Brand ── */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            aria-label="Trang chủ Hoà Nhập"
            className="flex items-center gap-2 focus-visible:ring-4 focus-visible:ring-primary
                       rounded-lg p-1 transition-transform hover:scale-[1.02]"
          >
            <Icon name="diversity_1" filled size="text-4xl" className="text-primary dark:text-inverse-primary" />
            <span className="font-bold text-headline-md text-primary dark:text-inverse-primary hidden sm:block">
              Hoà Nhập
            </span>
          </Link>
        </div>

        {/* ── Desktop Navigation ── */}
        <nav aria-label={t("notifications")} className="hidden md:flex gap-2 lg:gap-6 items-center">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `font-semibold text-label-lg px-3 py-2 rounded-lg
                 transition-all duration-150 active:scale-95
                 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2
                 ${
                   isActive
                     ? "text-primary bg-primary-fixed dark:bg-on-primary-fixed-variant dark:text-primary-fixed"
                     : "text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-primary hover:bg-surface-variant dark:hover:bg-tertiary-container"
                 }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        {/* ── Action Buttons ── */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Language Selector (Desktop) */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => {
                setLangOpen(!langOpen);
                setNotifOpen(false);
                setProfileOpen(false);
              }}
              aria-label={t("language")}
              aria-expanded={langOpen}
              aria-haspopup="true"
              className={`p-2 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center focus-visible:ring-4 focus-visible:ring-primary active:scale-95 border ${
                langOpen
                  ? "bg-primary/10 border-primary text-primary"
                  : "text-on-surface-variant dark:text-tertiary-fixed-dim hover:bg-surface-variant dark:hover:bg-tertiary-container border-transparent"
              }`}
            >
              <Icon name="language" />
            </button>

            {langOpen && (
              <div
                className="absolute right-0 mt-2 w-48 glass-card
                           rounded-xl shadow-lg py-2 z-50
                           animate-[slideUp_0.15s_ease-out]"
                role="menu"
                aria-label="Menu chọn ngôn ngữ"
              >
                <button
                  onClick={() => {
                    setLanguage("vi");
                    setLangOpen(false);
                  }}
                  role="menuitem"
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-surface-variant dark:hover:bg-tertiary/20 transition-colors ${
                    language === "vi" ? "font-bold text-primary dark:text-inverse-primary" : "text-on-surface-variant"
                  }`}
                >
                  <span>Tiếng Việt (VI)</span>
                  {language === "vi" && <Icon name="check" size="text-sm" />}
                </button>
                
                <button
                  onClick={() => {
                    setLanguage("en");
                    setLangOpen(false);
                  }}
                  role="menuitem"
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-surface-variant dark:hover:bg-tertiary/20 transition-colors ${
                    language === "en" ? "font-bold text-primary dark:text-inverse-primary" : "text-on-surface-variant"
                  }`}
                >
                  <span>English (EN)</span>
                  {language === "en" && <Icon name="check" size="text-sm" />}
                </button>
              </div>
            )}
          </div>

          {/* Notifications Button & Badge (Desktop) */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setLangOpen(false);
                setProfileOpen(false);
              }}
              aria-label={t("notifications")}
              aria-expanded={notifOpen}
              aria-haspopup="true"
              className={`p-2 rounded-full transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center focus-visible:ring-4 focus-visible:ring-primary active:scale-95 border relative ${
                notifOpen
                  ? "bg-primary/10 border-primary text-primary"
                  : "text-on-surface-variant dark:text-tertiary-fixed-dim hover:bg-surface-variant dark:hover:bg-tertiary-container border-transparent"
              }`}
            >
              <Icon name="notifications" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-error text-on-error font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div
                className="absolute right-0 mt-2 w-80 glass-card
                           rounded-2xl shadow-xl py-2 z-50
                           animate-[slideUp_0.15s_ease-out]"
                role="menu"
                aria-label="Bảng thông báo"
              >
                <div className="px-4 py-2 border-b border-outline-variant/50 flex items-center justify-between">
                  <span className="font-bold text-xs text-on-surface dark:text-inverse-on-surface">
                    {t("notifications")} ({unreadCount})
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-primary dark:text-inverse-primary hover:underline"
                    >
                      {t("mark_all_read")}
                    </button>
                  )}
                </div>

                <div className="max-h-[300px] overflow-y-auto py-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => toggleRead(n.id)}
                      className={`px-4 py-3 border-b border-outline-variant/20 last:border-b-0 cursor-pointer hover:bg-surface-variant/40 dark:hover:bg-tertiary/20 transition-all flex items-start gap-2.5 ${
                        !n.read ? "bg-primary/5 dark:bg-primary-fixed-dim/5" : ""
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 ${n.read ? "opacity-0" : ""}`} />
                      <div className="space-y-1 min-w-0">
                        <p className={`text-xs leading-relaxed ${!n.read ? "font-bold text-on-surface dark:text-inverse-on-surface" : "text-on-surface-variant dark:text-tertiary-fixed-dim"}`}>
                          {language === "en" ? n.textEn : n.text}
                        </p>
                        <span className="block text-[9px] text-on-surface-variant/75 dark:text-tertiary-fixed-dim/75 font-semibold">
                          {n.date}
                        </span>
                      </div>
                    </div>
                  ))}

                  {notifications.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-on-surface-variant dark:text-tertiary-fixed-dim">
                      {t("no_notifications")}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown or Login Button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setLangOpen(false);
                  setNotifOpen(false);
                }}
                aria-label={`Tài khoản của ${user.fullName}`}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold text-label-lg
                           flex items-center justify-center transition-all duration-150 active:scale-95
                           hover:bg-primary-container hover:text-on-primary-container focus-visible:ring-4 focus-visible:ring-primary shadow-sm"
              >
                {user.fullName ? user.fullName.split(" ").pop().charAt(0).toUpperCase() : "U"}
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 glass-card
                             rounded-xl shadow-lg py-2 z-50
                             animate-[slideUp_0.15s_ease-out]"
                  role="menu"
                  aria-label="Menu tài khoản cá nhân"
                >
                  <div className="px-4 py-2 border-b border-outline-variant/50 text-sm">
                    <p className="text-on-surface-variant font-medium dark:text-tertiary-fixed-dim">{t("welcome")},</p>
                    <p className="font-bold text-on-surface truncate dark:text-on-tertiary-container">{user.fullName}</p>
                  </div>
                  
                  <Link
                    to="/ho-so"
                    onClick={() => setProfileOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-on-surface-variant dark:text-tertiary-fixed-dim
                               hover:bg-surface-variant dark:hover:bg-tertiary/20 transition-colors"
                  >
                    <Icon name="person" size="text-lg" />
                    {t("profile")}
                  </Link>


                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setProfileOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-primary dark:text-inverse-primary font-bold
                                 hover:bg-surface-variant dark:hover:bg-tertiary/20 transition-colors"
                    >
                      <Icon name="admin_panel_settings" size="text-lg" />
                      {t("admin")}
                    </Link>
                  )}
                  
                  <hr className="border-outline-variant/50 my-1" />
                  
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    role="menuitem"
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-error hover:bg-error-container/20 transition-colors"
                  >
                    <Icon name="logout" size="text-lg" />
                    {t("logout")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/dang-nhap"
              className="bg-primary text-on-primary font-bold text-label-lg
                         px-4 md:px-6 py-3 rounded-lg
                         hover:bg-primary-container hover:text-on-primary-container
                         transition-all min-h-[48px]
                         focus-visible:ring-4 focus-visible:ring-primary-container
                         active:scale-95 shadow-sm
                         inline-flex items-center gap-2"
            >
              <Icon name="login" size="text-xl" />
              <span className="hidden sm:inline">{t("login")}</span>
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu điều hướng"}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            className="md:hidden p-2 text-on-surface-variant
                       hover:bg-surface-variant rounded-lg transition-colors
                       focus-visible:ring-4 focus-visible:ring-primary
                       min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} size="text-3xl" />
          </button>
        </div>
      </div>

      {/* ── Mobile Navigation Menu ── */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav-menu"
          aria-label="Menu điều hướng di động"
          className="md:hidden border-t border-outline-variant/40 dark:border-white/10
                     glass-header
                     px-4 py-4 space-y-2
                     animate-[slideUp_0.2s_ease-out]"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block font-semibold text-label-lg px-4 py-3 rounded-lg
                 transition-colors min-h-[48px]
                 focus-visible:ring-4 focus-visible:ring-primary
                 ${
                   isActive
                     ? "text-primary bg-primary-fixed"
                     : "text-on-surface-variant hover:text-primary hover:bg-surface-variant"
                 }`
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}

          {/* Mobile-only: Language & Notifications */}
          <div className="flex gap-2 pt-2 border-t border-outline-variant">
            <button
              onClick={toggleMobileLanguage}
              aria-label={`Ngôn ngữ: ${language === "en" ? "Tiếng Anh" : "Tiếng Việt"}`}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg
                         text-on-surface-variant hover:bg-surface-variant
                         transition-colors focus-visible:ring-4 focus-visible:ring-primary
                         min-h-[48px] border border-outline-variant font-bold text-xs"
            >
              <Icon name="language" />
              <span>{language === "en" ? "English (EN)" : "Tiếng Việt (VI)"}</span>
            </button>
            
            <button
              onClick={() => {
                alert(language === "en" ? `You have ${unreadCount} unread notifications.` : `Bạn có ${unreadCount} thông báo chưa đọc.`);
                markAllAsRead();
              }}
              aria-label={`Thông báo: ${unreadCount} chưa đọc`}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg
                         text-on-surface-variant hover:bg-surface-variant
                         transition-colors focus-visible:ring-4 focus-visible:ring-primary
                         min-h-[48px] border border-outline-variant font-bold text-xs relative"
            >
              <Icon name="notifications" />
              <span>{t("notifications")} ({unreadCount})</span>
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
