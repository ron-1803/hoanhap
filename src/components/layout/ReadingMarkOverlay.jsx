import { useEffect, useRef, useState } from "react";
import { useAccessibility } from "../../contexts/AccessibilityContext";

/**
 * ReadingMarkOverlay
 *
 * A visual-only reading guide for low-vision users.
 * It never receives focus and never blocks pointer/keyboard interaction.
 */
export default function ReadingMarkOverlay() {
  const { state } = useAccessibility();
  const [positionY, setPositionY] = useState(null);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!state.readingMark) {
      return undefined;
    }

    const updatePosition = (nextY) => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      frameRef.current = requestAnimationFrame(() => {
        setPositionY(nextY);
      });
    };

    const handlePointerMove = (event) => {
      updatePosition(event.clientY);
    };

    const handleTouchMove = (event) => {
      const touch = event.touches?.[0];
      if (touch) updatePosition(touch.clientY);
    };

    const handleFocusIn = (event) => {
      const target = event.target;
      if (!target || typeof target.getBoundingClientRect !== "function") return;
      const rect = target.getBoundingClientRect();
      updatePosition(rect.top + rect.height / 2);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("focusin", handleFocusIn, true);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("focusin", handleFocusIn, true);
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [state.readingMark]);

  if (!state.readingMark || positionY === null) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="reading-mark-overlay"
      style={{ top: `${positionY}px` }}
    />
  );
}
