import { Link } from "react-router-dom";
import Icon from "../ui/Icon";
import { useLanguage } from "../../contexts/LanguageContext";

/**
 * Footer — Premium site footer with brand info, navigation links, and social
 */

const FOOTER_LINKS = [
  { to: "/ve-chung-toi", labelKey: "about", icon: "info" },
  { to: "/dieu-khoan", labelKey: "terms", icon: "description" },
  { to: "/bao-mat", labelKey: "privacy", icon: "shield" },
  { to: "/gop-y", labelKey: "contact", icon: "mail" },
];

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      className="footer-gradient bg-[#111318] bg-dots-pattern relative overflow-hidden
                 text-gray-400 w-full mt-auto
                 border-t border-white/5 theme-transition"
      style={{ backgroundColor: "#111318" }}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-primary/10 blur-[100px] pointer-events-none" />
      <div
        className="max-w-[1440px] mx-auto px-4 md:px-margin-desktop relative z-10
                   py-12 md:py-16"
      >
        {/* ── Top: Brand + Links ── */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                <Icon name="diversity_1" size="text-2xl" className="text-primary-fixed-dim" />
              </div>
              <span className="font-extrabold text-xl text-white">Hoà Nhập</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-300">
              {t("footer_desc")}
            </p>
          </div>

          {/* Navigation Links */}
          <nav
            aria-label="Liên kết chân trang"
            className="flex flex-wrap gap-x-8 gap-y-3"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-2 text-sm text-gray-300
                           hover:text-white transition-colors duration-200
                           focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary-fixed-dim
                           rounded-md p-1 group"
              >
                <Icon name={link.icon} size="text-base"
                      className="opacity-80 group-hover:opacity-100 transition-opacity" />
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Divider ── */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-300">
            © {new Date().getFullYear()} Hoà Nhập — {t("all_rights_reserved")}.
          </p>
          <p className="text-xs text-gray-300 flex items-center gap-1">
            {t("footer_built_with")}
            <Icon name="favorite" filled size="text-xs" className="text-rose-500" />
            {t("footer_built_for")}
          </p>
        </div>
      </div>
    </footer>
  );
}
