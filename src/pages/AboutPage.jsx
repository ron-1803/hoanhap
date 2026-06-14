import { useAccessibility } from "../contexts/AccessibilityContext";
import Icon from "../components/ui/Icon";

export default function AboutPage() {
  const { speakText } = useAccessibility();

  const handleReadCommitment = () => {
    const text = `Cam kết hỗ trợ tiếp cận của Hoà Nhập. Cổng thông tin hỗ trợ người khuyết tật Việt Nam được thiết kế và tối ưu hóa tuân thủ tiêu chuẩn tiếp cận nội dung web WCAG 2.1 mức độ AA. Các tính năng cốt lõi bao gồm: Phóng to thu nhỏ cỡ chữ từ 80% đến 200%, chế độ tương phản cao cho người khiếm thị, đọc nội dung văn bản tự động bằng tiếng Việt trên từng phần tử rê chuột, và sơ đồ phím tắt điều hướng hoàn toàn bằng bàn phím.`;
    speakText(text);
  };

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-24 animate-[fadeIn_0.2s_ease-out]">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[300px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-overlay">
          <img
            alt="Đồ họa hình ảnh đội ngũ và sứ mệnh"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              Về chúng tôi
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed">
              Hoà Nhập là cổng thông tin hỗ trợ tiếp cận dịch vụ, chính sách và cơ hội phát triển bình đẳng dành cho người khuyết tật tại Việt Nam.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Sứ mệnh & Tầm nhìn ─── */}
      <section className="max-w-[1440px] mx-auto px-gutter py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Mission */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-8 shadow-sm theme-transition relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Icon name="emoji_objects" size="text-2xl" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface mb-4">Sứ mệnh của chúng tôi</h2>
            <p className="text-body-medium text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
              Xóa bỏ mọi rào cản thông tin và kết nối xã hội, giúp người khuyết tật Việt Nam dễ dàng tiếp cận các chính sách hỗ trợ của Nhà nước, quyền lợi y tế, giáo dục, việc làm và các dịch vụ cộng đồng. Chúng tôi tin rằng thông tin minh bạch chính là bước đệm đầu tiên cho sự bình đẳng.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-8 shadow-sm theme-transition relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl" />
            <div className="w-12 h-12 rounded-xl bg-secondary-fixed/20 text-secondary flex items-center justify-center mb-6">
              <Icon name="visibility" size="text-2xl" />
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface mb-4">Tầm nhìn chiến lược</h2>
            <p className="text-body-medium text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
              Trở thành cổng thông tin hỗ trợ người khuyết tật tin cậy và dễ tiếp cận nhất tại Việt Nam. Không ngừng ứng dụng công nghệ hỗ trợ hiện đại như AI, đọc giọng nói tự động, bản đồ định vị địa điểm tiếp cận không rào cản nhằm kiến tạo cuộc sống độc lập, tự chủ cho hàng triệu người.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Cam kết tiếp cận (Accessibility Commitment) ─── */}
      <section className="max-w-[1440px] mx-auto px-gutter py-8">
        <div className="bg-surface-container-high dark:bg-tertiary/60 border-2 border-outline-variant dark:border-outline rounded-3xl p-6 md:p-10 shadow-md theme-transition flex flex-col lg:flex-row items-center gap-10">
          <div className="lg:w-2/3">
            <h2 className="font-headline-lg text-headline-lg text-primary dark:text-inverse-primary mb-6 flex items-center gap-3">
              <Icon name="accessibility_new" className="text-primary dark:text-inverse-primary" />
              Cam kết hỗ trợ tiếp cận
            </h2>
            <p className="text-body-medium text-on-surface-variant dark:text-tertiary-fixed-dim mb-6 leading-relaxed">
              Cổng thông tin Hoà Nhập được tối ưu hóa tuân thủ tiêu chuẩn tiếp cận nội dung Web quốc tế <strong className="underline decoration-primary">WCAG 2.1 mức độ AA</strong>. Website được thiết kế đặc biệt nhằm hỗ trợ các nhóm người khuyết tật khác nhau:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold" role="list">
              <li className="flex items-center gap-2" role="listitem">
                <Icon name="text_increase" className="text-primary" />
                Phóng to chữ từ 80% đến 200%
              </li>
              <li className="flex items-center gap-2" role="listitem">
                <Icon name="contrast" className="text-primary" />
                Chế độ tương phản cao (màu vàng/đen)
              </li>
              <li className="flex items-center gap-2" role="listitem">
                <Icon name="text_to_speech" className="text-primary" />
                Đọc nói tự động (TTS) tiếng Việt
              </li>
              <li className="flex items-center gap-2" role="listitem">
                <Icon name="keyboard" className="text-primary" />
                Điều hướng phím tắt Tab hoàn chỉnh
              </li>
            </ul>
            <div className="mt-8 flex gap-4">
              <button
                onClick={handleReadCommitment}
                className="bg-primary text-on-primary font-bold px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-all shadow flex items-center gap-2 accessibility-focus active:scale-95"
              >
                <Icon name="volume_up" />
                Nghe đọc nội dung cam kết
              </button>
            </div>
          </div>
          <div className="lg:w-1/3 flex justify-center">
            <div className="w-56 h-56 bg-primary-fixed dark:bg-on-primary-fixed-variant rounded-full flex items-center justify-center border-4 border-white dark:border-outline shadow-xl">
              <Icon name="diversity_1" size="text-8xl" className="text-primary dark:text-primary-fixed" filled />
            </div>
          </div>
        </div>
      </section>

      {/* ─── Ban biên tập / Đội ngũ (Mock Team) ─── */}
      <section className="max-w-[1440px] mx-auto px-gutter py-12">
        <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface mb-8 text-center">
          Ban Biên tập & Hỗ trợ kỹ thuật
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Member 1 */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 text-center theme-transition hover:border-primary transition-all">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-outline-variant">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
                alt="Trưởng ban biên tập Nguyễn Thu Hà"
              />
            </div>
            <h3 className="font-bold text-lg text-on-surface dark:text-inverse-on-surface">Nguyễn Thu Hà</h3>
            <p className="text-xs text-primary dark:text-inverse-primary font-bold uppercase tracking-wider mt-1">Trưởng Ban Biên tập</p>
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-3 leading-relaxed">
              Chịu trách nhiệm nội dung, kiểm duyệt các văn bản chính sách và liên kết các nguồn lực cộng đồng.
            </p>
          </div>

          {/* Member 2 */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 text-center theme-transition hover:border-primary transition-all">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-outline-variant">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"
                alt="Kỹ sư phát triển phần mềm Trần Quang Huy"
              />
            </div>
            <h3 className="font-bold text-lg text-on-surface dark:text-inverse-on-surface">Trần Quang Huy</h3>
            <p className="text-xs text-primary dark:text-inverse-primary font-bold uppercase tracking-wider mt-1">Kỹ sư Tiếp cận Web</p>
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-3 leading-relaxed">
              Phát triển các công cụ hỗ trợ tiếp cận WCAG 2.1, tối ưu hóa công nghệ đọc tiếng Việt và chatbot thông minh.
            </p>
          </div>

          {/* Member 3 */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 text-center theme-transition hover:border-primary transition-all">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-outline-variant">
              <img
                className="w-full h-full object-cover"
                src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200"
                alt="Điều phối viên hoạt động xã hội Phạm Mai Anh"
              />
            </div>
            <h3 className="font-bold text-lg text-on-surface dark:text-inverse-on-surface">Phạm Mai Anh</h3>
            <p className="text-xs text-primary dark:text-inverse-primary font-bold uppercase tracking-wider mt-1">Điều phối viên Cộng đồng</p>
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-3 leading-relaxed">
              Liên kết các đội xe hỗ trợ di chuyển miễn phí, tình nguyện viên học tập và tư vấn trực tiếp cho NKT nặng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
