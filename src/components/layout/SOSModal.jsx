import { useEffect, useRef, useCallback, useState } from "react";
import Icon from "../ui/Icon";

/**
 * SOSModal — Emergency contact modal for desktop/tablet devices
 *
 * Accessibility:
 *  - Focus-trapped inside the modal when open
 *  - Closes on Escape key
 *  - aria-modal="true", role="dialog"
 *  - Large, high-contrast typography
 *  - "Copy location" button
 *
 * On mobile: The SOS button directly triggers tel: link instead of this modal.
 */

const EMERGENCY_CONTACTS = [
  {
    name: "Cấp cứu Y tế",
    number: "115",
    tel: "tel:115",
    description: "Xe cấp cứu, cấp cứu y tế",
  },
  {
    name: "Công an",
    number: "113",
    tel: "tel:113",
    description: "Trình báo khẩn cấp",
  },
  {
    name: "Tổng đài Bảo trợ Xã hội",
    number: "111",
    tel: "tel:111",
    description: "Bảo vệ quyền trẻ em, NKT",
  },
];

export default function SOSModal({ isOpen, onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [locationCopied, setLocationCopied] = useState(false);

  // ── Focus trap: focus close button on open ──
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // ── Close on Escape key ──
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
      // Trap focus inside modal
      if (e.key === "Tab") {
        const focusable = modalRef.current?.querySelectorAll(
          'button, a[href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // ── Copy current location ──
  const handleCopyLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const text = `Tọa độ: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\nGoogle Maps: https://www.google.com/maps?q=${latitude},${longitude}`;
        try {
          await navigator.clipboard.writeText(text);
          setLocationCopied(true);
          setTimeout(() => setLocationCopied(false), 3000);
        } catch {
          // Fallback for older browsers
          prompt("Sao chép tọa độ:", text);
        }
      },
      () => {
        alert(
          "Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí trong trình duyệt."
        );
      }
    );
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="sos-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sos-modal-content" ref={modalRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-secondary text-on-secondary rounded-lg flex items-center justify-center">
              <Icon name="sos" size="text-3xl" />
            </div>
            <h2
              id="sos-modal-title"
              className="text-headline-md font-bold text-secondary dark:text-secondary-fixed-dim"
            >
              Liên hệ Khẩn cấp
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-lg
                       text-on-surface-variant hover:bg-surface-variant
                       transition-colors focus-visible:ring-4 focus-visible:ring-primary"
            aria-label="Đóng cửa sổ khẩn cấp"
          >
            <Icon name="close" size="text-2xl" />
          </button>
        </div>

        {/* Emergency contacts list */}
        <ul className="space-y-4 mb-6" role="list" aria-label="Danh sách số khẩn cấp">
          {EMERGENCY_CONTACTS.map((contact) => (
            <li key={contact.number}>
              <a
                href={contact.tel}
                className="flex items-center gap-4 p-4 rounded-xl
                           border-2 border-outline-variant
                           hover:border-secondary hover:bg-secondary-fixed
                           transition-all group
                           focus-visible:ring-4 focus-visible:ring-secondary"
              >
                <div
                  className="w-14 h-14 bg-error-container text-on-error-container
                             rounded-full flex items-center justify-center flex-shrink-0
                             group-hover:scale-110 transition-transform"
                >
                  <Icon name="call" size="text-2xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-on-surface text-lg">
                    {contact.name}
                  </p>
                  <p className="text-secondary font-bold text-2xl">
                    {contact.number}
                  </p>
                  <p className="text-on-surface-variant text-sm">
                    {contact.description}
                  </p>
                </div>
                <Icon
                  name="arrow_forward"
                  className="text-secondary opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </li>
          ))}
        </ul>

        {/* Copy Location button */}
        <button
          onClick={handleCopyLocation}
          className="w-full flex items-center justify-center gap-2
                     bg-primary-fixed text-on-primary-fixed
                     font-semibold py-4 rounded-xl
                     hover:bg-primary-fixed-dim
                     transition-all
                     focus-visible:ring-4 focus-visible:ring-primary
                     min-h-btn"
          aria-live="polite"
        >
          <Icon name={locationCopied ? "check_circle" : "my_location"} />
          {locationCopied
            ? "Đã sao chép tọa độ!"
            : "Sao chép vị trí hiện tại"}
        </button>

        <p className="text-center text-sm text-on-surface-variant mt-4">
          Nhấn vào số điện thoại để gọi trực tiếp
        </p>
      </div>
    </div>
  );
}
