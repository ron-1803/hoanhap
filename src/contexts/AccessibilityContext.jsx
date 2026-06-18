import { createContext, useContext, useEffect, useReducer, useCallback, useState, useRef } from "react";

// ─── Vietnamese voice selection logging (once per session) ──────
let voicesLoggedThisSession = false;

/* ═══════════════════════════════════════════════════════════════════
   AccessibilityContext
   ───────────────────────────────────────────────────────────────────
   Global state for all accessibility features in Hoà Nhập.
   
   Managed features:
   • fontScale    – Root font-size multiplier (0.8–2.0, step 0.1)
   • darkMode     – Tailwind "dark" class toggle
   • highContrast – Ultra-high-contrast mode (black bg, yellow/white text)
   • screenReader – TTS via Web Speech API with Vietnamese voice
   • keyboardNav  – Enhanced focus indicators for keyboard-only users
   • readingMark  – Horizontal reading guide that follows pointer/touch
   • highlightLinks – Extra-visible link styling for low-vision users
   
   TTS Strategy:
   Uses the browser's built-in Web Speech API (SpeechSynthesis).
   Automatically selects the best available Vietnamese voice with priority:
   1. Google tiếng Việt (highest quality)
   2. Microsoft tiếng Việt (Windows)
   3. Any vi-VN locale voice
   4. Any vi-* locale voice
   5. Browser default (last resort)
   
   Persistence: localStorage key "hoa-nhap-accessibility"
   ═══════════════════════════════════════════════════════════════════ */

// ─── Constants ───────────────────────────────────────────────────
const STORAGE_KEY = "hoa-nhap-accessibility";
const FONT_SCALE_MIN = 0.8;
const FONT_SCALE_MAX = 2.0;
const FONT_SCALE_STEP = 0.1;

// ─── Default State ──────────────────────────────────────────────
const defaultState = {
  fontScale: 1.0,
  darkMode: false,
  highContrast: false,
  screenReader: true,
  keyboardNav: false,
  readingMark: false,
  highlightLinks: false,
};

// ─── Load persisted state from localStorage ─────────────────────
function loadPersistedState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...defaultState,
        ...parsed,
        // Clamp fontScale to valid range
        fontScale: Math.min(
          FONT_SCALE_MAX,
          Math.max(FONT_SCALE_MIN, parsed.fontScale ?? defaultState.fontScale)
        ),
      };
    }
  } catch (err) {
    console.warn("[AccessibilityContext] Failed to load persisted state:", err);
  }
  return defaultState;
}

// ─── Persist state to localStorage ──────────────────────────────
function persistState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn("[AccessibilityContext] Failed to persist state:", err);
  }
}

// ─── Reducer Actions ────────────────────────────────────────────
const ActionTypes = {
  INCREASE_FONT_SCALE: "INCREASE_FONT_SCALE",
  DECREASE_FONT_SCALE: "DECREASE_FONT_SCALE",
  TOGGLE_DARK_MODE: "TOGGLE_DARK_MODE",
  TOGGLE_HIGH_CONTRAST: "TOGGLE_HIGH_CONTRAST",
  TOGGLE_SCREEN_READER: "TOGGLE_SCREEN_READER",
  TOGGLE_KEYBOARD_NAV: "TOGGLE_KEYBOARD_NAV",
  TOGGLE_READING_MARK: "TOGGLE_READING_MARK",
  TOGGLE_HIGHLIGHT_LINKS: "TOGGLE_HIGHLIGHT_LINKS",
  RESET: "RESET",
};

function accessibilityReducer(state, action) {
  switch (action.type) {
    case ActionTypes.INCREASE_FONT_SCALE: {
      const next = Math.min(FONT_SCALE_MAX, +(state.fontScale + FONT_SCALE_STEP).toFixed(1));
      return { ...state, fontScale: next };
    }
    case ActionTypes.DECREASE_FONT_SCALE: {
      const next = Math.max(FONT_SCALE_MIN, +(state.fontScale - FONT_SCALE_STEP).toFixed(1));
      return { ...state, fontScale: next };
    }
    case ActionTypes.TOGGLE_DARK_MODE:
      return { ...state, darkMode: !state.darkMode };
    case ActionTypes.TOGGLE_HIGH_CONTRAST:
      return { ...state, highContrast: !state.highContrast };
    case ActionTypes.TOGGLE_SCREEN_READER:
      return { ...state, screenReader: !state.screenReader };
    case ActionTypes.TOGGLE_KEYBOARD_NAV:
      return { ...state, keyboardNav: !state.keyboardNav };
    case ActionTypes.TOGGLE_READING_MARK:
      return { ...state, readingMark: !state.readingMark };
    case ActionTypes.TOGGLE_HIGHLIGHT_LINKS:
      return { ...state, highlightLinks: !state.highlightLinks };
    case ActionTypes.RESET:
      return { ...defaultState };
    default:
      return state;
  }
}

// ─── Context Creation ───────────────────────────────────────────
const AccessibilityContext = createContext(null);

// ─── Vietnamese Voice Picker ────────────────────────────────────
// Picks the best available Vietnamese voice from the browser's voice list.
// Priority: Google vi > Microsoft vi > any vi-VN > any vi-* > null
function pickVietnameseVoice(voices) {
  if (!voices || voices.length === 0) return null;

  const normalize = (lang) => lang.toLowerCase().replace("_", "-");

  // 1. Google Vietnamese (Chrome on desktop — highest quality)
  let match = voices.find((v) => {
    const lang = normalize(v.lang);
    const name = v.name.toLowerCase();
    return (lang === "vi-vn" || lang === "vi") && name.includes("google");
  });
  if (match) return match;

  // 2. Microsoft Vietnamese (Edge / Windows — good quality)
  match = voices.find((v) => {
    const lang = normalize(v.lang);
    const name = v.name.toLowerCase();
    return (lang === "vi-vn" || lang === "vi") && (name.includes("microsoft") || name.includes("hoai") || name.includes("an"));
  });
  if (match) return match;

  // 3. Any voice with lang exactly vi-VN
  match = voices.find((v) => normalize(v.lang) === "vi-vn");
  if (match) return match;

  // 4. Any voice starting with vi- or exactly vi
  match = voices.find((v) => {
    const lang = normalize(v.lang);
    return lang.startsWith("vi-") || lang === "vi";
  });
  if (match) return match;

  return null;
}

// ─── Provider Component ─────────────────────────────────────────
export function AccessibilityProvider({ children }) {
  const [state, dispatch] = useReducer(accessibilityReducer, null, loadPersistedState);

  // Store browser voices (loaded asynchronously by the browser)
  const [browserVoices, setBrowserVoices] = useState([]);
  const currentAudioRef = useRef(null);

  // Load voices from browser SpeechSynthesis
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setBrowserVoices(voices);

        // Log available Vietnamese voices once
        if (!voicesLoggedThisSession) {
          const viVoices = voices.filter((v) => {
            const lang = v.lang.toLowerCase().replace("_", "-");
            return lang.startsWith("vi");
          });
          const selected = pickVietnameseVoice(voices);
          console.log(
            "[TTS] Giọng tiếng Việt khả dụng:",
            viVoices.length > 0
              ? viVoices.map((v) => `${v.name} (${v.lang})`).join(", ")
              : "Không tìm thấy — sẽ dùng giọng mặc định"
          );
          if (selected) {
            console.log(`[TTS] Đã chọn giọng: ${selected.name} (${selected.lang})`);
          }
          voicesLoggedThisSession = true;
        }
      }
    };

    loadVoices();

    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // ── Persist state to localStorage on every change ──
  useEffect(() => {
    persistState(state);
  }, [state]);

  // ── Apply font scale to <html> via CSS variable ──
  useEffect(() => {
    document.documentElement.style.setProperty("--font-scale", state.fontScale);
  }, [state.fontScale]);

  // ── Apply dark mode class to <html> ──
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (state.darkMode) {
      cl.add("dark");
    } else {
      cl.remove("dark");
    }
  }, [state.darkMode]);

  // ── Apply high-contrast class to <html> ──
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (state.highContrast) {
      cl.add("high-contrast");
    } else {
      cl.remove("high-contrast");
    }
  }, [state.highContrast]);

  // ── Apply keyboard-nav class to <html> ──
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (state.keyboardNav) {
      cl.add("keyboard-nav");
    } else {
      cl.remove("keyboard-nav");
    }
  }, [state.keyboardNav]);

  // ── Apply reading mark class to <html> ──
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (state.readingMark) {
      cl.add("reading-mark-enabled");
    } else {
      cl.remove("reading-mark-enabled");
    }
  }, [state.readingMark]);
  // ── Apply highlighted links class to <html> ──
  useEffect(() => {
    const cl = document.documentElement.classList;
    if (state.highlightLinks) {
      cl.add("highlight-links");
    } else {
      cl.remove("highlight-links");
    }
  }, [state.highlightLinks]);

  // ── Stop speaking ──
  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  }, []);

  // ── Cancel TTS when screenReader is toggled off ──
  useEffect(() => {
    if (!state.screenReader) {
      stopSpeaking();
    }
  }, [state.screenReader, stopSpeaking]);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // ── TTS: speakText(text) ──────────────────────────────────────
  // Uses Web Speech API with optimized Vietnamese voice selection.
  // Falls back to Google Translate TTS if no Vietnamese voice is installed.
  const speakText = useCallback(
    (text, force = false) => {
      if (!text || typeof window === "undefined") return;
      
      // Bulletproof check using the latest state ref
      if (!stateRef.current?.screenReader && !force) return;

      // Interrupt any active speech
      stopSpeaking();

      try {
        const voicesList = browserVoices.length > 0
          ? browserVoices
          : (window.speechSynthesis ? window.speechSynthesis.getVoices() : []);

        const selectedVoice = pickVietnameseVoice(voicesList);

        if (selectedVoice && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "vi-VN";
          utterance.voice = selectedVoice;
          // Tuned for natural Vietnamese speech
          utterance.rate = 0.95;
          utterance.pitch = 1.05;
          utterance.volume = 1.0;

          window.speechSynthesis.speak(utterance);
        } else {
          // Fallback: Google Translate TTS via Local Vite Proxy
          // Works globally without requiring installed OS voices, avoiding CORS/Referrer blocks
          // The API has a limit of 200 characters per request
          const safeText = text.length > 200 ? text.slice(0, 197) + "..." : text;
          const url = `/api/tts?client=gtx&ie=UTF-8&tl=vi&q=${encodeURIComponent(
            safeText
          )}`;
          const audio = new Audio();
          audio.src = url;
          currentAudioRef.current = audio;
          audio.onended = () => {
            if (currentAudioRef.current === audio) {
              currentAudioRef.current = null;
            }
          };
          audio.play().catch((err) => {
            if (err.name === "AbortError") return; // Ignore play() interrupted by pause()
            console.error("[TTS Fallback] Lỗi phát âm thanh Google TTS:", err);
          });
        }
      } catch (err) {
        console.error("[TTS] Lỗi phát giọng nói:", err);
      }
    },
    [stopSpeaking, browserVoices, state?.screenReader]
  );

  const wasScreenReaderOn = useRef(state?.screenReader);
  const hasPlayedWelcome = useRef(false);

  // Announce when user manually toggles screen reader ON
  useEffect(() => {
    if (state?.screenReader && !wasScreenReaderOn.current) {
      speakText("Đã bật đọc nội dung bằng giọng nói.", true);
      hasPlayedWelcome.current = true;
    }
    wasScreenReaderOn.current = !!state?.screenReader;
  }, [state?.screenReader, speakText]);

  // When screenReader is ON from the start (default), browsers block audio
  // until first user gesture. Listen for first interaction, then speak welcome.
  useEffect(() => {
    if (!state?.screenReader || hasPlayedWelcome.current) return;

    const handleFirstInteraction = () => {
      if (hasPlayedWelcome.current) return;
      hasPlayedWelcome.current = true;
      // Small delay to let the browser fully unlock audio
      setTimeout(() => {
        if (stateRef.current?.screenReader) {
          speakText("Chào mừng bạn đến với Hoà Nhập. Chức năng đọc nội dung đã được bật sẵn. Hãy di chuột hoặc dùng phím Tab để nghe nội dung từng mục.", true);
        }
      }, 300);
      cleanup();
    };

    const cleanup = () => {
      document.removeEventListener("click", handleFirstInteraction);
      document.removeEventListener("keydown", handleFirstInteraction);
      document.removeEventListener("touchstart", handleFirstInteraction);
    };

    document.addEventListener("click", handleFirstInteraction, { once: true });
    document.addEventListener("keydown", handleFirstInteraction, { once: true });
    document.addEventListener("touchstart", handleFirstInteraction, { once: true });

    return cleanup;
  }, [state?.screenReader, speakText]);

  // ── Dispatch helpers ──────────────────────────────────────────
  const increaseFontScale = useCallback(
    () => dispatch({ type: ActionTypes.INCREASE_FONT_SCALE }),
    []
  );
  const decreaseFontScale = useCallback(
    () => dispatch({ type: ActionTypes.DECREASE_FONT_SCALE }),
    []
  );
  const toggleDarkMode = useCallback(
    () => dispatch({ type: ActionTypes.TOGGLE_DARK_MODE }),
    []
  );
  const toggleHighContrast = useCallback(
    () => dispatch({ type: ActionTypes.TOGGLE_HIGH_CONTRAST }),
    []
  );
  const toggleScreenReader = useCallback(
    () => dispatch({ type: ActionTypes.TOGGLE_SCREEN_READER }),
    []
  );
  const toggleKeyboardNav = useCallback(
    () => dispatch({ type: ActionTypes.TOGGLE_KEYBOARD_NAV }),
    []
  );
  const toggleReadingMark = useCallback(
    () => dispatch({ type: ActionTypes.TOGGLE_READING_MARK }),
    []
  );
  const toggleHighlightLinks = useCallback(
    () => dispatch({ type: ActionTypes.TOGGLE_HIGHLIGHT_LINKS }),
    []
  );
  const resetAccessibility = useCallback(
    () => dispatch({ type: ActionTypes.RESET }),
    []
  );

  const value = {
    state,
    increaseFontScale,
    decreaseFontScale,
    toggleDarkMode,
    toggleHighContrast,
    toggleScreenReader,
    toggleKeyboardNav,
    toggleReadingMark,
    toggleReadingMark,
    toggleHighlightLinks,
    resetAccessibility,
    speakText,
    stopSpeaking,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// ─── Custom Hook ────────────────────────────────────────────────
export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error(
      "useAccessibility() must be used within an <AccessibilityProvider>."
    );
  }
  return ctx;
}

export default AccessibilityContext;
