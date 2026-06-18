import { useAccessibility } from "../contexts/AccessibilityContext";
import Icon from "../components/ui/Icon";

const TEAM_MEMBERS = [
  {
    name: "Ngô Huy Hoàng",
    role: "Đội Trưởng Dự Án",
    desc: "Lên ý tưởng, điều phối toàn bộ dự án, quản lý tiến độ và đảm bảo các tiêu chuẩn tiếp cận được thực thi tốt nhất.",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200"
  },
  {
    name: "Nguyễn Trần Thiện Đạt",
    role: "Front End Developer",
    desc: "Thiết kế và xây dựng giao diện người dùng, tích hợp các công cụ hỗ trợ tiếp cận như tăng cỡ chữ, chế độ tương phản cao và phím tắt.",
    avatar: "/team/dat.jpg"
  },
  {
    name: "Trần Văn Lân",
    role: "Back End Developer",
    desc: "Xây dựng kiến trúc hệ thống máy chủ, quản lý cơ sở dữ liệu và tích hợp các API dịch vụ cốt lõi.",
    avatar: "/team/lan.png"
  },
  {
    name: "Lương Ngọc Hiếu",
    role: "R.API Developer",
    desc: "Nghiên cứu và phát triển các API tiếp cận, tối ưu kết nối dịch vụ giọng nói (TTS) và các dịch vụ tích hợp.",
    avatar: "/team/hieu.jpeg"
  },
  {
    name: "Nguyễn Tuấn Khang",
    role: "Quản Lý Dữ Liệu",
    desc: "Thu thập, kiểm duyệt, phân loại và chuẩn hóa các thông tin chính sách, địa điểm hỗ trợ tiếp cận.",
    avatar: "/team/khang.jpg"
  },
  {
    name: "Huỳnh Văn Tân",
    role: "Tester",
    desc: "Kiểm thử chất lượng sản phẩm, tối ưu khả năng tiếp cận chuẩn WCAG 2.2 và cải thiện trải nghiệm người dùng.",
    avatar: "/team/tan.jpg"
  }
];

export default function AboutPage() {
  const { speakText } = useAccessibility();

  const handleReadCommitment = () => {
    const text = `Cam kết hỗ trợ tiếp cận của Hoà Nhập. Cổng thông tin hỗ trợ người khuyết tật Việt Nam được thiết kế và tối ưu hóa tuân thủ tiêu chuẩn tiếp cận nội dung web WCAG 2.2 mức độ AA. Các tính năng cốt lõi bao gồm: Phóng to thu nhỏ cỡ chữ từ 80% đến 200%, chế độ tương phản cao cho người khiếm thị, đọc nội dung văn bản tự động bằng tiếng Việt trên từng phần tử rê chuột, và sơ đồ phím tắt điều hướng hoàn toàn bằng bàn phím.`;
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
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed mb-4">
              Hoà Nhập là sản phẩm nghiên cứu học thuật của nhóm sinh viên tham dự cuộc thi công nghệ, hướng tới mục tiêu hỗ trợ tiếp cận dịch vụ, chính sách và cơ hội phát triển bình đẳng dành cho người khuyết tật tại Việt Nam.
            </p>
            <p className="text-sm text-on-primary-container/80 dark:text-on-primary-fixed/80 italic bg-white/10 p-3 rounded-lg border border-white/10">
              * Lưu ý: Đây là dự án học tập phi lợi nhuận phục vụ mục đích dự thi của sinh viên, không phải là website chính thức của cơ quan nhà nước hay tổ chức pháp lý chuyên nghiệp.
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
              Cổng thông tin Hoà Nhập được tối ưu hóa tuân thủ tiêu chuẩn tiếp cận nội dung Web quốc tế <strong className="underline decoration-primary">WCAG 2.2 mức độ AA</strong>. Website được thiết kế đặc biệt nhằm hỗ trợ các nhóm người khuyết tật khác nhau:
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
          Đội ngũ thực hiện dự án
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, idx) => (
            <div key={idx} className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 text-center theme-transition hover:border-primary transition-all">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-2 border-outline-variant">
                <img
                  className="w-full h-full object-cover"
                  src={member.avatar}
                  alt={`Thành viên ${member.name}`}
                />
              </div>
              <h3 className="font-bold text-lg text-on-surface dark:text-inverse-on-surface">{member.name}</h3>
              <p className="text-xs text-primary dark:text-inverse-primary font-bold uppercase tracking-wider mt-1">{member.role}</p>
              <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-3 leading-relaxed">
                {member.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
