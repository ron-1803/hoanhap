import { useState, useEffect, useRef } from "react";
import Icon from "../ui/Icon";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAccessibility } from "../../contexts/AccessibilityContext";

export default function WelcomeGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { t, language } = useLanguage();
  const { speakText } = useAccessibility();
  const modalRef = useRef(null);

  useEffect(() => {
    // Check if the user has seen the guide before
    const hasSeenGuide = localStorage.getItem("hasSeenWelcomeGuide");
    if (!hasSeenGuide) {
      // Delay opening to allow initial TTS or animations to settle
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("hasSeenWelcomeGuide", "true");
  };

  useEffect(() => {
    if (!isOpen) return;

    // Focus trap logic
    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const originalFocus = document.activeElement;

    if (firstElement) {
      setTimeout(() => firstElement.focus(), 50);
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    modal.addEventListener("keydown", handleKeyDown);
    return () => {
      modal.removeEventListener("keydown", handleKeyDown);
      if (originalFocus) {
        originalFocus.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface dark:bg-tertiary border-2 border-outline dark:border-outline-variant w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] theme-transition"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/50 bg-primary text-on-primary">
          <h2 id="welcome-modal-title" className="font-bold text-xl md:text-2xl leading-snug">
            {language === "en" ? "Welcome to Accessible Vietnam Support Hub" : "Chào mừng đến với Hoà Nhập"}
          </h2>
          <button
            onClick={handleClose}
            aria-label={language === "en" ? "Close guide" : "Đóng hộp thoại hướng dẫn"}
            className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors accessibility-focus"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <p className="text-body-lg text-on-surface dark:text-inverse-on-surface leading-relaxed">
            {language === "en"
              ? "This portal is designed to support People with Disabilities. Here is a quick guide on how to use it:"
              : "Cổng thông tin này được thiết kế đặc biệt để hỗ trợ Người Khuyết Tật. Dưới đây là hướng dẫn nhanh cách sử dụng:"}
          </p>

          <ul className="space-y-4">
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Icon name="gavel" />
              </div>
              <div>
                <strong className="block text-on-surface dark:text-inverse-on-surface font-bold">
                  {language === "en" ? "Rights & Policies" : "Quyền lợi & Chính sách"}
                </strong>
                <span className="text-on-surface-variant dark:text-surface-dim">
                  {language === "en"
                    ? "Look up legal documents and rights that apply to you."
                    : "Tra cứu các văn bản luật pháp và quyền lợi dành riêng cho bạn."}
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Icon name="calculate" />
              </div>
              <div>
                <strong className="block text-on-surface dark:text-inverse-on-surface font-bold">
                  {language === "en" ? "Social Allowance" : "Trợ cấp xã hội"}
                </strong>
                <span className="text-on-surface-variant dark:text-surface-dim">
                  {language === "en"
                    ? "Calculate the monthly allowance you might receive based on your condition."
                    : "Tính toán và xem hướng dẫn làm thủ tục nhận trợ cấp xã hội hàng tháng."}
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Icon name="diversity_3" />
              </div>
              <div>
                <strong className="block text-on-surface dark:text-inverse-on-surface font-bold">
                  {language === "en" ? "Community Forum" : "Cộng đồng & Kết nối"}
                </strong>
                <span className="text-on-surface-variant dark:text-surface-dim">
                  {language === "en"
                    ? "Connect with others, ask questions, or offer help."
                    : "Kết nối với mọi người, chia sẻ câu chuyện và tìm kiếm sự giúp đỡ."}
                </span>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Icon name="settings_accessibility" />
              </div>
              <div>
                <strong className="block text-on-surface dark:text-inverse-on-surface font-bold">
                  {language === "en" ? "Accessibility Tools" : "Công cụ Hỗ trợ Tiếp cận"}
                </strong>
                <span className="text-on-surface-variant dark:text-surface-dim">
                  {language === "en"
                    ? "Use the floating menu on the right to toggle High Contrast, Text Size, or Screen Reader."
                    : "Sử dụng menu nổi bên phải để bật chế độ tương phản cao, phóng to chữ hoặc đọc màn hình."}
                </span>
              </div>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-outline-variant/50 flex justify-end">
          <button
            onClick={handleClose}
            className="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary-fixed transition-colors accessibility-focus shadow-md hover:shadow-lg"
          >
            {language === "en" ? "Got it! Don't show again" : "Đã hiểu! Không hiển thị lại"}
          </button>
        </div>
      </div>
    </div>
  );
}
