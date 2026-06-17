import { useEffect, useCallback } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import useTTSFocusHandler from "../../hooks/useTTSFocusHandler";
import AccessibilitySidebar from "./AccessibilitySidebar";
import Header from "./Header";
import Footer from "./Footer";
import ChatbotPanel from "../chatbot/ChatbotPanel";

/**
 * MainLayout — Shell component wrapping all pages
 *
 * Structure:
 *  [AccessibilitySidebar]  [Main Content Area]
 *  (fixed, 80px)           (flex-1)
 *                            ├─ Skip-to-content link
 *                            ├─ Header (sticky)
 *                            ├─ <main> with <Outlet/>
 *                            └─ Footer
 *  [ChatbotPanel] (fixed bottom-right, toggleable)
 *
 * Features:
 *  - Skip-to-content link (first focusable, visible on Tab)
 *  - Global TTS focus/hover handler (via useTTSFocusHandler hook)
 *  - Keyboard-nav focus order: Sidebar → Header → Main → Footer → ChatbotFAB
 */
export default function MainLayout() {
  const { state, speakText } = useAccessibility();
  const location = useLocation();
  const isMapPage = location.pathname === "/ban-do";

  // ── Mount global TTS focus/hover listeners when screenReader is active ──
  useTTSFocusHandler();

  // ── Skip-to-content handler ──
  // When the skip link is activated, move focus to #main-content
  // so screen readers and keyboard users land directly on content.
  const handleSkipClick = useCallback((e) => {
    e.preventDefault();
    const main = document.getElementById("main-content");
    if (main) {
      main.focus();
      main.scrollIntoView({ behavior: "smooth" });
      if (state.screenReader) {
        speakText("Đã chuyển đến nội dung chính");
      }
    }
  }, [state.screenReader, speakText]);

  // ── Announce page load for screen reader users ──
  useEffect(() => {
    if (state.screenReader) {
      // Small delay to let the page render first
      const timer = setTimeout(() => {
        speakText("Chào mừng bạn đến với Hoà Nhập. Nhấn Tab để điều hướng.");
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []); // Only on mount

  return (
    <div className="min-h-screen flex">
      {/* Fixed accessibility sidebar */}
      <AccessibilitySidebar />

      {/* Main content wrapper — offset by sidebar width */}
      <div className="flex-1 flex flex-col w-full min-h-screen pl-sidebar-width">
        {/* Skip-to-content link (WCAG 2.2 requirement)
            Absolutely positioned off-screen until focused via Tab.
            On focus: slides into view at top of viewport.
            On Enter: programmatically focuses #main-content. */}
        <a
          href="#main-content"
          className="skip-link"
          onClick={handleSkipClick}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSkipClick(e);
          }}
        >
          Chuyển đến nội dung chính
        </a>

        {/* Sticky header with navigation */}
        <Header />

        {/* Page content rendered by React Router */}
        <main
          id="main-content"
          className="flex-grow flex flex-col"
          role="main"
          tabIndex={-1}
          aria-label="Nội dung chính"
        >
          <Outlet />
        </main>

        {/* Footer */}
        {!isMapPage && <Footer />}
      </div>

      {/* Chatbot panel with FAB toggle */}
      <ChatbotPanel />
    </div>
  );
}
