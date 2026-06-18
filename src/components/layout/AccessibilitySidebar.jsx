import { useState, useCallback, useEffect } from "react";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import { useLanguage } from "../../contexts/LanguageContext";
import Icon from "../ui/Icon";
import SOSModal from "./SOSModal";

/**
 * AccessibilitySidebar — Fixed left toolbar (80px wide)
 *
 * Contains 7 accessibility tool buttons as specified in DESIGN.md:
 * 1. Đọc nội dung (TTS toggle)
 * 2. Tăng chữ (increase font scale)
 * 3. Giảm chữ (decrease font scale)
 * 4. Tương phản (high contrast toggle)
 * 5. Giao diện tối (dark mode toggle)
 * 6. Điều hướng (keyboard nav toggle)
 * 7. SOS (emergency — pinned to bottom)
 *
 * Each button is 64×64px with aria-label and aria-pressed (for toggles).
 * Tab order flows top-to-bottom within the sidebar.
 */

export default function AccessibilitySidebar() {
  const {
    state,
    increaseFontScale,
    decreaseFontScale,
    toggleDarkMode,
    toggleHighContrast,
    toggleScreenReader,
    toggleKeyboardNav,
  } = useAccessibility();
  const { t, language } = useLanguage();

  const [sosModalOpen, setSosModalOpen] = useState(false);

  const handleSOS = useCallback(() => {
    setSosModalOpen(true);
  }, []);

  // Active state styling for toggle buttons
  const activeClasses =
    "bg-primary text-on-primary shadow-md";
  const inactiveClasses =
    "text-on-surface-variant/70 dark:text-gray-500 hover:bg-surface-variant dark:hover:bg-white/5 hover:text-primary dark:hover:text-inverse-primary";

  return (
    <>
      <aside
        aria-label={language === "en" ? "Accessibility Toolbar" : "Thanh công cụ trợ năng"}
        className="accessibility-sidebar fixed left-0 top-0 h-full w-sidebar-width z-50
                   glass-header
                   border-r border-outline-variant/30 dark:border-white/5
                   shadow-xl shadow-black/[0.03]
                   flex flex-col items-center py-6 space-y-2
                   theme-transition"
      >
        {/* Tool 1: Read Content (TTS) */}
        <button
          onClick={toggleScreenReader}
          aria-label={t("sidebar_read_desc")}
          aria-pressed={state.screenReader}
          className={`sidebar-tool-btn group transition-all duration-200 rounded-xl ${
            state.screenReader ? activeClasses : inactiveClasses
          }`}
        >
          <Icon
            name="volume_up"
            size="text-2xl"
            className="group-hover:scale-110 transition-transform"
          />
          <span className="icon-label">
            {t("sidebar_read")}
          </span>
        </button>

        {/* Tool 2: Increase Font Size */}
        <button
          onClick={increaseFontScale}
          aria-label={`${t("sidebar_increase_desc")}. ${t("font_scale_current")}: ${Math.round(state.fontScale * 100)}%`}
          className={`sidebar-tool-btn group transition-all duration-200 rounded-xl ${inactiveClasses}`}
          disabled={state.fontScale >= 2.0}
        >
          <Icon
            name="text_increase"
            size="text-2xl"
            className="group-hover:scale-110 transition-transform"
          />
          <span className="icon-label">
            {t("sidebar_increase")}
          </span>
        </button>

        {/* Tool 3: Decrease Font Size */}
        <button
          onClick={decreaseFontScale}
          aria-label={`${t("sidebar_decrease_desc")}. ${t("font_scale_current")}: ${Math.round(state.fontScale * 100)}%`}
          className={`sidebar-tool-btn group transition-all duration-200 rounded-xl ${inactiveClasses}`}
          disabled={state.fontScale <= 0.8}
        >
          <Icon
            name="text_decrease"
            size="text-2xl"
            className="group-hover:scale-110 transition-transform"
          />
          <span className="icon-label">
            {t("sidebar_decrease")}
          </span>
        </button>

        {/* Tool 4: High Contrast */}
        <button
          onClick={toggleHighContrast}
          aria-label={t("sidebar_contrast_desc")}
          aria-pressed={state.highContrast}
          className={`sidebar-tool-btn group transition-all duration-200 rounded-xl ${
            state.highContrast ? activeClasses : inactiveClasses
          }`}
        >
          <Icon
            name="contrast"
            size="text-2xl"
            className="group-hover:scale-110 transition-transform"
          />
          <span className="icon-label">
            {t("sidebar_contrast")}
          </span>
        </button>

        {/* Tool 5: Dark Mode */}
        <button
          onClick={toggleDarkMode}
          aria-label={t("sidebar_dark_desc")}
          aria-pressed={state.darkMode}
          className={`sidebar-tool-btn group transition-all duration-200 rounded-xl ${
            state.darkMode ? activeClasses : inactiveClasses
          }`}
        >
          <Icon
            name="dark_mode"
            size="text-2xl"
            className="group-hover:scale-110 transition-transform"
          />
          <span className="icon-label">
            {t("sidebar_dark")}
          </span>
        </button>



        {/* Spacer — pushes SOS to bottom */}
        <div className="flex-grow" aria-hidden="true" />

        {/* Tool 7: SOS Emergency (pinned to bottom) */}
        <button
          onClick={handleSOS}
          aria-label={t("sidebar_sos_desc")}
          className="sidebar-tool-btn group
                     bg-gradient-to-b from-red-600 to-red-700
                     text-white
                     hover:from-red-500 hover:to-red-600
                     shadow-lg shadow-red-600/20
                     rounded-xl"
        >
          <Icon
            name="sos"
            size="text-2xl"
            className="font-bold group-hover:scale-110 transition-transform"
          />
          <span className="icon-label font-bold">{t("sidebar_sos")}</span>
        </button>
      </aside>

      {/* SOS Modal (desktop only) */}
      <SOSModal
        isOpen={sosModalOpen}
        onClose={() => setSosModalOpen(false)}
      />
    </>
  );
}
