import { useState, useRef, useEffect } from "react";
import Icon from "../components/ui/Icon";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function NewsPage() {
  const { speakText } = useAccessibility();
  const videoRef = useRef(null);

  // Tab categorization
  const [activeCategory, setActiveCategory] = useState("all");

  // Video state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [captionsOn, setCaptionsOn] = useState(true);

  // Articles data loaded from Firestore
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "articles"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setArticles(list);
    });
    return unsubscribe;
  }, []);

  // Video script & transcript database
  const transcriptData = [
    { start: 0, end: 4, text: "Xin chào quý vị và các bạn đang theo dõi video hướng dẫn của Cổng thông tin Hoà Nhập." },
    { start: 4, end: 10, text: "Hôm nay, chúng tôi sẽ hướng dẫn các bạn quy trình chuẩn bị hồ sơ đề nghị hưởng trợ cấp xã hội hàng tháng." },
    { start: 10, end: 15, text: "Bước đầu tiên là chuẩn bị tờ khai đăng ký theo Mẫu số 01 của Nghị định 20." },
    { start: 15, end: 20, text: "Kế tiếp, quý vị cần chuẩn bị bản sao Giấy xác nhận mức độ khuyết tật do Ủy ban nhân dân xã cấp." },
    { start: 20, end: 25, text: "Cuối cùng, mang toàn bộ hồ sơ nộp trực tiếp tại Bộ phận Một cửa xã, phường hoặc nộp online." },
    { start: 25, end: 30, text: "Chúc quý vị thực hiện thành công và nhận được đầy đủ các quyền lợi an sinh xã hội." }
  ];

  // Current caption text to display overlay
  const [currentCaption, setCurrentCaption] = useState("");

  // Update playback indicators
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const time = videoRef.current.currentTime;
    setCurrentTime(time);

    // Find active caption line
    const match = transcriptData.find(line => time >= line.start && time < line.end);
    setCurrentCaption(match ? match.text : "");
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(err => console.log(err));
    }
    setIsPlaying(!isPlaying);
  };

  // Jump to specific transcript timestamp (Interactive Transcript)
  const jumpToTime = (seconds) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      videoRef.current.play().catch(err => console.log(err));
      setIsPlaying(true);
    }
    speakText(`Đang phát video từ giây thứ ${seconds}. Nội dung: ${transcriptData.find(line => line.start === seconds)?.text || ""}`);
  };

  // Document downloads list
  const documents = [
    {
      id: "doc-allowance",
      title: "Tờ khai đề nghị trợ giúp xã hội (Mẫu 01)",
      description: "Ban hành kèm theo Nghị định số 20/2021/NĐ-CP ngày 15/03/2021 của Chính phủ.",
      format: "PDF (240 KB)",
    },
    {
      id: "doc-disability",
      title: "Đơn đề nghị xác định mức độ khuyết tật (Mẫu 02)",
      description: "Dùng để nộp cho Hội đồng xác định mức độ khuyết tật cấp xã phường.",
      format: "PDF (180 KB)",
    },
    {
      id: "doc-health",
      title: "Đơn đề nghị cấp thẻ Bảo hiểm y tế miễn phí",
      description: "Dành riêng cho đối tượng người khuyết tật nặng và đặc biệt nặng.",
      format: "PDF (150 KB)",
    },
  ];

  // Filtered articles
  const filteredArticles = articles.filter(art => activeCategory === "all" || art.category === activeCategory);

  const handleReadArticleTitle = (title) => {
    speakText(`Bài viết: ${title}. Nhấp để xem chi tiết.`);
  };

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-24 animate-[fadeIn_0.2s_ease-out]">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[260px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 mix-blend-overlay">
          <img
            alt="Đồ họa hình ảnh tin tức sự kiện"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-10">
          <div className="max-w-3xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              Tin tức & Bài viết hướng dẫn
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed">
              Cung cấp kiến thức pháp lý, cẩm nang sức khỏe và các hướng dẫn trực quan bằng video có transcript hỗ trợ đầy đủ thiết bị đọc màn hình.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-gutter grid grid-cols-1 lg:grid-cols-3 gap-10 mt-12">
        {/* ─── Cột 1 & 2: Video Player & Article Grid ─── */}
        <div className="lg:col-span-2 space-y-12">
          {/* Section: Video Player */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 md:p-8 shadow-sm theme-transition">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary mb-6 flex items-center gap-3">
              <Icon name="video_library" className="text-primary dark:text-inverse-primary" />
              Video hướng dẫn thủ tục trực quan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Media Player Column */}
              <div className="md:col-span-2 space-y-4">
                <div className="relative aspect-video bg-black rounded-2xl overflow-hidden group shadow-lg border border-outline-variant">
                  <video
                    ref={videoRef}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
                    className="w-full h-full object-contain"
                  />

                  {/* Caption Overlay */}
                  {captionsOn && currentCaption && (
                    <div className="absolute bottom-12 left-4 right-4 bg-black/80 text-white text-center px-4 py-2 rounded-lg text-sm font-semibold pointer-events-none tracking-wide z-10 border border-white/10">
                      {currentCaption}
                    </div>
                  )}

                  {/* Accessible Control Bar Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 to-black/10 px-4 py-3 flex items-center justify-between gap-4">
                    <button
                      onClick={togglePlay}
                      aria-label={isPlaying ? "Tạm dừng video" : "Phát video"}
                      className="text-white hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-primary p-1 rounded"
                    >
                      <Icon name={isPlaying ? "pause" : "play_arrow"} size="text-2xl" />
                    </button>

                    <span className="text-white text-xs font-mono">
                      {Math.floor(currentTime)}s / {Math.floor(duration || 30)}s
                    </span>

                    <button
                      onClick={() => setCaptionsOn(!captionsOn)}
                      aria-label={captionsOn ? "Tắt phụ đề" : "Bật phụ đề"}
                      className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                        captionsOn
                          ? "bg-primary text-on-primary border-primary"
                          : "text-white/60 border-white/20 hover:border-white/50"
                      }`}
                    >
                      CC
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-surface-container-low dark:bg-tertiary-container/30 rounded-xl p-3 border border-outline-variant/50">
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
                    <strong>Đang phát:</strong> Hướng dẫn đăng ký trợ cấp xã hội (Nghị định 20/2021). Nhấn các dòng hội thoại bên phải để tua nhanh tới thời điểm cần xem.
                  </p>
                </div>
              </div>

              {/* Interactive Transcript Column */}
              <div className="bg-surface-container-high dark:bg-tertiary-container rounded-2xl p-4 border border-outline flex flex-col h-[300px] md:h-auto overflow-y-auto">
                <h3 className="text-xs font-bold text-on-surface dark:text-inverse-on-surface uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-outline-variant pb-2">
                  <Icon name="subtitles" size="text-sm" />
                  Bản ghi phụ đề tương tác
                </h3>

                <div className="space-y-3 overflow-y-auto flex-1 pr-1" role="list">
                  {transcriptData.map((line) => {
                    const isActive = currentTime >= line.start && currentTime < line.end;
                    return (
                      <button
                        key={line.start}
                        onClick={() => jumpToTime(line.start)}
                        aria-label={`Nhảy tới giây thứ ${line.start}: ${line.text}`}
                        className={`w-full text-left p-2 rounded-xl text-xs transition-all leading-relaxed accessibility-focus ${
                          isActive
                            ? "bg-primary text-on-primary font-bold shadow-sm"
                            : "hover:bg-surface-container-low dark:hover:bg-tertiary text-on-surface-variant dark:text-tertiary-fixed-dim"
                        }`}
                        role="listitem"
                      >
                        <span className="block text-[10px] uppercase font-bold opacity-75 mb-0.5 font-mono">
                          Giây {line.start}
                        </span>
                        {line.text}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Support Articles Grid */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface flex items-center gap-3">
                <Icon name="article" className="text-primary dark:text-inverse-primary" />
                Cẩm nang & Bài viết mới
              </h2>

              {/* Categories Tabs */}
              <div className="flex flex-wrap gap-2" role="tablist" aria-label="Lọc chuyên mục bài viết">
                {[
                  { id: "all", label: "Tất cả" },
                  { id: "phap-luat", label: "Pháp luật" },
                  { id: "suc-khoe", label: "Y tế & Sức khỏe" },
                  { id: "doi-song", label: "Đời sống" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    role="tab"
                    aria-selected={activeCategory === tab.id}
                    className={`text-xs font-bold px-3.5 py-2 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-primary ${
                      activeCategory === tab.id
                        ? "bg-primary text-on-primary shadow-sm"
                        : "bg-surface-container hover:bg-surface-container-high dark:bg-tertiary-container dark:hover:bg-tertiary text-on-surface-variant dark:text-tertiary-fixed-dim"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl overflow-hidden shadow-sm theme-transition flex flex-col group hover:border-primary transition-all"
                >
                  <div className="relative aspect-[16/10] bg-surface-container-high overflow-hidden">
                    <img
                      src={art.image}
                      alt={`Ảnh minh họa cho: ${art.title}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary text-on-primary">
                      {art.category === "phap-luat" ? "Chính sách" : art.category === "suc-khoe" ? "Y tế" : "Đời sống"}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant dark:text-tertiary-fixed-dim font-bold mb-2">
                      <span>{art.date}</span>
                      <span>•</span>
                      <span>{art.readTime}</span>
                    </div>

                    <h3 className="font-bold text-base text-on-surface dark:text-inverse-on-surface group-hover:text-primary leading-snug line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed mt-2 line-clamp-3">
                      {art.summary}
                    </p>

                    <div className="mt-auto pt-4 flex items-center justify-between">
                      <button
                        onClick={() => speakText(`Xem chi tiết bài viết: ${art.title}`)}
                        className="text-xs font-bold text-primary dark:text-inverse-primary hover:underline flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-primary rounded p-1"
                      >
                        Đọc tiếp
                        <Icon name="arrow_forward" size="text-xs" />
                      </button>

                      <button
                        onClick={() => handleReadArticleTitle(art.title)}
                        aria-label={`Nghe đọc tiêu đề bài viết: ${art.title}`}
                        className="p-2 text-on-surface-variant dark:text-tertiary-fixed-dim hover:text-primary hover:bg-surface-variant/30 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <Icon name="volume_up" size="text-sm" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              {filteredArticles.length === 0 && (
                <div className="sm:col-span-2 text-center py-12 text-on-surface-variant dark:text-tertiary-fixed-dim">
                  Không tìm thấy bài viết nào trong danh mục này.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── Cột 3: Resources Downloads & Tips ─── */}
        <div className="space-y-10">
          {/* Section: Resource Downloads */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition">
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface mb-4 flex items-center gap-2">
              <Icon name="download" className="text-primary" />
              Biểu mẫu tải về (PDF)
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mb-6 leading-relaxed">
              Tải các văn bản pháp luật, biểu mẫu hồ sơ xin hưởng chế độ bảo trợ xã hội trực tiếp bằng máy tính của bạn.
            </p>

            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-surface-container-low dark:bg-tertiary/40 border border-outline-variant/40 rounded-2xl p-4 flex items-start justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-xs font-bold text-on-surface dark:text-inverse-on-surface truncate leading-normal">
                      {doc.title}
                    </h3>
                    <p className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed line-clamp-2">
                      {doc.description}
                    </p>
                    <span className="inline-block text-[10px] bg-surface-variant dark:bg-tertiary-container text-on-surface-variant dark:text-on-tertiary-container px-2 py-0.5 rounded font-bold mt-2">
                      {doc.format}
                    </span>
                  </div>

                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      speakText(`Đã tải xuống tài liệu: ${doc.title}`);
                      alert(`Đã tải xuống thành công: ${doc.title}`);
                    }}
                    aria-label={`Tải xuống tài liệu ${doc.title}`}
                    className="p-3 bg-primary text-on-primary rounded-xl hover:bg-primary-container hover:text-on-primary-container shadow-sm flex items-center justify-center focus-visible:ring-2 focus-visible:ring-primary active:scale-95 transition-all shrink-0"
                  >
                    <Icon name="download" size="text-base" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Extra info tips */}
          <div className="bg-primary/5 dark:bg-primary-fixed-dim/5 border border-primary/20 rounded-3xl p-6 theme-transition space-y-4">
            <h3 className="text-sm font-bold text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="lightbulb" />
              Mẹo tiếp cận (Accessibility Tips)
            </h3>
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
              Bạn có thể sử dụng phím tắt <strong>Tab</strong> để di chuyển nhanh giữa các dòng hội thoại trong Bản ghi phụ đề video. Nhấn <strong>Space</strong> hoặc <strong>Enter</strong> để tua nhanh video đến thời điểm hội thoại tương ứng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

