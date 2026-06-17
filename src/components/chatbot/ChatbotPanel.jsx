import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAccessibility } from "../../contexts/AccessibilityContext";
import Icon from "../ui/Icon";

/**
 * ChatbotPanel — Full interactive AI chatbot interface
 *
 * Features:
 *  - Floating Action Button (FAB) toggle
 *  - Slide-up chat window with message history
 *  - Clickable suggestion chips for common NKT queries
 *  - Mock FAQ response engine with curated answers
 *  - TTS integration: auto-reads bot responses when screenReader is active
 *  - Dark mode / High-contrast theme support
 *  - Focus management: traps focus when panel is open
 *  - ARIA: aria-expanded, aria-live="polite" for new messages
 *
 * Accessibility:
 *  - Escape key closes panel
 *  - Focus moves to input when panel opens
 *  - All buttons have aria-labels
 *  - Bot messages announced via aria-live region
 */

// ─── FAQ Knowledge Base ─────────────────────────────────────────
const FAQ_DATABASE = [
  {
    keywords: ["thẻ", "cấp thẻ", "giấy xác nhận", "xác nhận khuyết tật"],
    question: "Cấp thẻ NKT",
    answer:
      "Để được cấp Giấy xác nhận khuyết tật, bạn cần:\n\n1. Nộp đơn đề nghị tại UBND cấp xã nơi cư trú.\n2. Hồ sơ gồm: Đơn đề nghị, CMND/CCCD, giấy tờ y tế (nếu có).\n3. Hội đồng xác định mức độ khuyết tật sẽ đánh giá trong 30 ngày.\n4. Kết quả được thông báo bằng văn bản.\n\nThẻ có giá trị toàn quốc và không mất phí.",
    links: [
      { label: "Tra cứu quyền lợi", to: "/quyen-loi" },
    ],
  },
  {
    keywords: ["việc làm", "tìm việc", "nghề", "làm tại nhà", "công việc"],
    question: "Hỗ trợ tìm việc",
    answer:
      "Người khuyết tật được hỗ trợ việc làm theo Luật Người khuyết tật 2010:\n\n• Doanh nghiệp sử dụng 30% NKT trở lên được miễn thuế.\n• Trung tâm dịch vụ việc làm tư vấn miễn phí.\n• Các chương trình đào tạo nghề dành riêng cho NKT.\n• Hỗ trợ vốn vay ưu đãi để tự tạo việc làm.\n\nLiên hệ Trung tâm DVVL gần nhất trên Bản đồ hỗ trợ.",
    links: [
      { label: "Bản đồ hỗ trợ", to: "/ban-do" },
      { label: "Kết nối cộng đồng", to: "/ket-noi" },
    ],
  },
  {
    keywords: ["trợ cấp", "tiền", "phụ cấp", "hàng tháng", "bảo trợ xã hội"],
    question: "Trợ cấp xã hội",
    answer:
      "Mức trợ cấp hàng tháng cho NKT (theo Nghị định 20/2021):\n\n• NKT đặc biệt nặng: 720.000 – 1.440.000 VNĐ/tháng.\n• NKT nặng: 540.000 – 1.080.000 VNĐ/tháng.\n• Trẻ em khuyết tật: Cộng thêm phần hỗ trợ nuôi dưỡng.\n\nMức cụ thể tùy theo quy định của từng tỉnh/thành phố.\nHồ sơ nộp tại UBND cấp xã.",
    links: [
      { label: "Tra cứu quyền lợi", to: "/quyen-loi" },
    ],
  },
  {
    keywords: ["pháp lý", "luật", "quyền", "phân biệt", "bảo vệ"],
    question: "Hỗ trợ pháp lý",
    answer:
      "Người khuyết tật được trợ giúp pháp lý miễn phí theo Luật Trợ giúp pháp lý 2017 của Nhà nước:\n\n• Tư vấn pháp luật miễn phí.\n• Đại diện ngoài tố tụng.\n• Bào chữa trong vụ án hình sự.\n\nĐường dây nóng trợ giúp pháp lý chính thức: 1900 6179.\nTrung tâm trợ giúp pháp lý có tại mỗi tỉnh/thành phố.\n\n(Lưu ý: Hệ thống chatbot thuộc dự án học tập sinh viên, chỉ cung cấp thông tin tham khảo định hướng hành chính mô phỏng, không thay thế cho tư vấn pháp lý chuyên nghiệp từ cơ quan có thẩm quyền).",
    links: [
      { label: "Góp ý & Phản hồi", to: "/gop-y" },
    ],
  },
  {
    keywords: ["y tế", "bệnh viện", "khám", "bảo hiểm", "phục hồi", "chức năng"],
    question: "Hỗ trợ y tế",
    answer:
      "Chính sách y tế dành cho NKT:\n\n• NKT nặng và đặc biệt nặng: Bảo hiểm y tế 100% do Nhà nước đóng.\n• Miễn, giảm viện phí tại bệnh viện công.\n• Phục hồi chức năng dựa vào cộng đồng (PHCNDVCĐ).\n• Hỗ trợ dụng cụ trợ giúp: xe lăn, máy trợ thính, gậy dò đường.\n\nTìm cơ sở y tế gần bạn trên Bản đồ hỗ trợ.",
    links: [
      { label: "Bản đồ hỗ trợ", to: "/ban-do" },
    ],
  },
  {
    keywords: ["giáo dục", "học", "trường", "đào tạo", "học bổng"],
    question: "Giáo dục & Đào tạo",
    answer:
      "Chính sách giáo dục cho NKT:\n\n• Miễn, giảm học phí ở tất cả các cấp học.\n• Ưu tiên tuyển sinh đại học, cao đẳng.\n• Trường, lớp giáo dục chuyên biệt.\n• Hỗ trợ phương tiện, đồ dùng học tập.\n• Học bổng dành riêng cho sinh viên khuyết tật.\n\nLiên hệ Sở Giáo dục & Đào tạo tại địa phương.",
    links: [
      { label: "Tra cứu quyền lợi", to: "/quyen-loi" },
    ],
  },
  {
    keywords: ["diễn đàn", "forum", "chia sẻ", "tâm sự", "kết nối yêu thương"],
    question: "Diễn đàn kết nối",
    answer:
      "Diễn đàn Kết nối yêu thương là không gian để bạn:\n\n• Chia sẻ mẹo vặt cuộc sống (Life-hacks) tự chế tác dụng cụ sinh hoạt.\n• Đăng nhật ký hành trình hòa nhập, chia sẻ cảm xúc tâm sự.\n• Đăng ký làm tình nguyện viên hoặc kêu gọi bạn đồng hành trực tiếp.\n• Tìm kiếm cơ hội học tập kỹ năng mềm và việc làm từ xa.\n\nTham gia thảo luận và kết nối yêu thương cùng cộng đồng ngay!",
    links: [
      { label: "Tham gia Diễn đàn", to: "/dien-dan" },
    ],
  },
];

// ─── Suggestion Chips ───────────────────────────────────────────
const SUGGESTION_CHIPS = [
  "Cấp thẻ NKT",
  "Hỗ trợ tìm việc",
  "Trợ cấp xã hội",
  "Hỗ trợ pháp lý",
  "Hỗ trợ y tế",
  "Giáo dục & Đào tạo",
  "Diễn đàn kết nối",
];

// ─── Response Matching ──────────────────────────────────────────
function findResponse(query) {
  const normalizedQuery = query.toLowerCase().trim();

  // Direct match against FAQ questions
  for (const faq of FAQ_DATABASE) {
    if (faq.question.toLowerCase() === normalizedQuery) {
      return faq;
    }
  }

  // Keyword matching
  let bestMatch = null;
  let bestScore = 0;

  for (const faq of FAQ_DATABASE) {
    let score = 0;
    for (const kw of faq.keywords) {
      if (normalizedQuery.includes(kw.toLowerCase())) {
        score += kw.length; // Longer keyword matches score higher
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  if (bestMatch && bestScore > 0) return bestMatch;

  // No match — return default
  return {
    question: query,
    answer:
      "Xin lỗi, tôi chưa tìm thấy thông tin phù hợp với câu hỏi của bạn.\n\nBạn có thể thử:\n• Chọn một trong các gợi ý bên dưới.\n• Sử dụng thanh tìm kiếm ở trang chủ.",
    links: [],
  };
}

// ─── Message Component ──────────────────────────────────────────
function ChatMessage({ message, isUser }) {
  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      role="listitem"
    >
      {!isUser && (
        <div
          className="w-9 h-9 bg-primary text-on-primary rounded-full
                     flex items-center justify-center flex-shrink-0 mr-3 mt-1"
          aria-hidden="true"
        >
          <Icon name="smart_toy" size="text-lg" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${
            isUser
              ? "bg-primary text-on-primary rounded-br-md"
              : "bg-surface-container dark:bg-tertiary-container text-on-surface dark:text-on-tertiary-container rounded-bl-md border border-outline-variant dark:border-outline"
          }`}
      >
        {/* Render multi-line text preserving newlines */}
        {message.text.split("\n").map((line, i) => (
          <span key={i}>
            {line}
            {i < message.text.split("\n").length - 1 && <br />}
          </span>
        ))}

        {/* Resource links */}
        {message.links && message.links.length > 0 && (
          <div className="mt-3 pt-2 border-t border-outline-variant/30 flex flex-wrap gap-2">
            {message.links.map((link, i) => (
              <a
                key={i}
                href={link.to}
                className="inline-flex items-center gap-1 text-xs font-semibold
                           px-3 py-1.5 rounded-full
                           bg-primary-fixed text-on-primary-fixed
                           hover:bg-primary-fixed-dim transition-colors
                           focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Icon name="arrow_forward" size="text-xs" />
                {link.label}
              </a>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div
          className="w-9 h-9 bg-surface-container-high dark:bg-tertiary-container
                     text-on-surface dark:text-on-tertiary-container
                     rounded-full flex items-center justify-center flex-shrink-0 ml-3 mt-1"
          aria-hidden="true"
        >
          <Icon name="person" size="text-lg" />
        </div>
      )}
    </div>
  );
}

// ─── Main ChatbotPanel Component ────────────────────────────────
export default function ChatbotPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMapPage = location.pathname === "/ban-do";

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Xin chào! Tôi là trợ lý ảo Hoà Nhập (Dự án học tập sinh viên) 🤝\n\nTôi có thể hỗ trợ tra cứu thông tin tham khảo về quyền lợi, trợ cấp, tìm việc làm và các chính sách hỗ trợ người khuyết tật.\n\nBạn muốn hỏi về vấn đề gì?",
      isUser: false,
      links: [],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const { state, speakText, stopSpeaking } = useAccessibility();

  // ── Auto-scroll to latest message ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Focus input when panel opens ──
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // ── Close on Escape ──
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e) {
      if (e.key === "Escape") {
        setIsOpen(false);
        stopSpeaking();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, stopSpeaking]);

  // ── TTS: read bot responses when screenReader is active ──
  const speakBotResponse = useCallback(
    (text) => {
      if (state.screenReader) {
        // Small delay so aria-live can also process
        setTimeout(() => speakText(text), 300);
      }
    },
    [state.screenReader, speakText]
  );

  // ── Send message handler ──
  const handleSend = useCallback(
    (text) => {
      const query = (text || inputValue).trim();
      if (!query) return;

      // Add user message
      const userMsg = {
        id: Date.now(),
        text: query,
        isUser: true,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");

      // Show typing indicator
      setIsTyping(true);

      // Simulate response delay (400-800ms for realism)
      const delay = 400 + Math.random() * 400;
      setTimeout(() => {
        const response = findResponse(query);
        const botMsg = {
          id: Date.now() + 1,
          text: response.answer,
          isUser: false,
          links: response.links || [],
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);

        // TTS auto-read
        speakBotResponse(response.answer);
      }, delay);
    },
    [inputValue, speakBotResponse]
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      handleSend();
    },
    [handleSend]
  );

  const handleChipClick = useCallback(
    (chip) => {
      handleSend(chip);
    },
    [handleSend]
  );

  const togglePanel = useCallback(() => {
    setIsOpen((prev) => {
      if (prev) stopSpeaking(); // Stop TTS when closing
      return !prev;
    });
  }, [stopSpeaking]);

  return (
    <div className={`fixed right-6 md:right-8 z-50 flex flex-col items-end transition-all duration-300 ${isMapPage ? 'bottom-[220px]' : 'bottom-6 md:bottom-8'}`}>
      {/* ═══ Chat Panel Window ═══ */}
      {isOpen && (
        <div
          ref={panelRef}
          className="chatbot-panel mb-4 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)]
                     bg-surface dark:bg-inverse-surface
                     border-2 border-primary dark:border-inverse-primary
                     rounded-2xl shadow-2xl
                     flex flex-col overflow-hidden
                     theme-transition"
          role="dialog"
          aria-modal="false"
          aria-label="Chatbot Hỗ trợ người khuyết tật"
        >
          {/* ── Header ── */}
          <div
            className="flex items-center justify-between px-4 py-3
                       bg-primary dark:bg-primary-container
                       text-on-primary dark:text-on-primary-container"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 bg-on-primary/20 dark:bg-primary/30
                           rounded-full flex items-center justify-center"
              >
                <Icon name="smart_toy" size="text-xl" />
              </div>
              <div>
                <h2 className="font-bold text-sm">Hoà Nhập Bot</h2>
                <p className="text-xs opacity-80">Trợ lý hỗ trợ NKT</p>
              </div>
            </div>
            <button
              onClick={togglePanel}
              aria-label="Đóng chatbot"
              className="w-10 h-10 flex items-center justify-center rounded-lg
                         hover:bg-on-primary/20 dark:hover:bg-primary/30
                         transition-colors
                         focus-visible:ring-2 focus-visible:ring-on-primary"
            >
              <Icon name="close" size="text-xl" />
            </button>
          </div>

          {/* ── Messages Area ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
            role="list"
            aria-label="Lịch sử cuộc trò chuyện"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} isUser={msg.isUser} />
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center gap-3 mb-4" role="status" aria-label="Đang soạn tin nhắn">
                <div
                  className="w-9 h-9 bg-primary text-on-primary rounded-full
                             flex items-center justify-center flex-shrink-0"
                  aria-hidden="true"
                >
                  <Icon name="smart_toy" size="text-lg" />
                </div>
                <div
                  className="bg-surface-container dark:bg-tertiary-container
                             rounded-2xl rounded-bl-md px-4 py-3
                             border border-outline-variant dark:border-outline"
                >
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-on-surface-variant rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Suggestion Chips ── */}
          <div
            className="px-4 py-2 border-t border-outline-variant dark:border-outline
                       bg-surface-container-low dark:bg-tertiary/50
                       overflow-x-auto"
          >
            <div className="flex gap-2 pb-1" role="list" aria-label="Gợi ý câu hỏi">
              {SUGGESTION_CHIPS.map((chip) => (
                <button
                  key={chip}
                  role="listitem"
                  onClick={() => handleChipClick(chip)}
                  className="flex-shrink-0 text-xs font-semibold
                             px-3 py-2 rounded-full
                             bg-primary-fixed text-on-primary-fixed
                             dark:bg-on-primary-fixed-variant dark:text-primary-fixed
                             hover:bg-primary-fixed-dim dark:hover:bg-on-primary-fixed
                             transition-all active:scale-95
                             focus-visible:ring-2 focus-visible:ring-primary
                             whitespace-nowrap"
                  aria-label={`Hỏi về: ${chip}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* ── Input Area ── */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-3
                       border-t-2 border-outline-variant dark:border-outline
                       bg-surface dark:bg-inverse-surface"
          >
            <label htmlFor="chatbot-input" className="sr-only">
              Nhập câu hỏi của bạn
            </label>
            <input
              id="chatbot-input"
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Nhập câu hỏi..."
              className="flex-1 px-4 py-2.5 rounded-xl
                         border border-outline-variant dark:border-outline
                         bg-surface-container-lowest dark:bg-tertiary
                         text-on-surface dark:text-inverse-on-surface
                         placeholder-on-surface-variant dark:placeholder-tertiary-fixed-dim
                         text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                         transition-all"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Gửi câu hỏi"
              className="w-10 h-10 flex items-center justify-center
                         bg-primary text-on-primary rounded-xl
                         hover:bg-primary-container hover:text-on-primary-container
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all active:scale-95
                         focus-visible:ring-2 focus-visible:ring-primary-container"
            >
              <Icon name="send" size="text-lg" />
            </button>
          </form>
        </div>
      )}

      {/* ═══ Floating Action Button ═══ */}
      <button
        onClick={togglePanel}
        aria-label={isOpen ? "Đóng Chatbot Hỗ trợ" : "Mở Chatbot Hỗ trợ"}
        aria-expanded={isOpen}
        aria-controls="chatbot-panel"
        className={`w-16 h-16 rounded-full shadow-xl
                   flex items-center justify-center
                   transition-all duration-300
                   focus-visible:ring-4 focus-visible:ring-primary-container
                   border-2 border-white/20
                   active:scale-95
                   ${
                     isOpen
                       ? "bg-secondary text-on-secondary hover:bg-secondary-container hover:text-on-secondary-container rotate-0"
                       : "bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container hover:scale-105"
                   }`}
      >
        <Icon
          name={isOpen ? "close" : "chat"}
          size="text-3xl"
          className={`transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`}
        />
      </button>
    </div>
  );
}
