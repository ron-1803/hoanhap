import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "../contexts/AccessibilityContext";
import SearchBar from "../components/ui/SearchBar";
import ServiceCard from "../components/ui/ServiceCard";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";

/**
 * HomePage — Main landing page
 *
 * Sections:
 *  1. Hero with gradient mesh, animated orbs, and search bar
 *  2. Service grid (3 cards, bento style)
 *  3. Stats / trust indicators
 *  4. CTA Banner (legal support)
 *
 * All content is in natural Vietnamese.
 * Uses semantic <section> elements with aria-labelledby.
 */

const SERVICES = [
  {
    to: "/quyen-loi",
    icon: "gavel",
    title: "Tra cứu quyền lợi",
    description:
      "Thông tin chi tiết về thủ tục hành chính, cấp giấy xác nhận và chính sách ưu đãi dành cho người khuyết tật.",
    ariaLabel:
      "Tra cứu quyền lợi, thủ tục hành chính và chính sách",
    iconBg: "bg-blue-50 dark:bg-blue-950/50",
    iconColor: "text-primary",
    iconBorder: "border-blue-200 dark:border-blue-800",
  },
  {
    to: "/ket-noi",
    icon: "diversity_3",
    title: "Kết nối yêu thương",
    description:
      "Kết nối bạn với các cộng đồng và cá nhân sẵn lòng hỗ trợ, chia sẻ cùng người khuyết tật trên toàn quốc.",
    ariaLabel:
      "Kết nối yêu thương và hỗ trợ từ cộng đồng",
    iconBg: "bg-rose-50 dark:bg-rose-950/50",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBorder: "border-rose-200 dark:border-rose-800",
  },
  {
    to: "/ban-do",
    icon: "map",
    title: "Bản đồ hỗ trợ",
    description:
      "Tìm kiếm cơ sở y tế, trung tâm phục hồi chức năng và địa điểm tiếp cận dành cho NKT gần bạn nhất.",
    ariaLabel:
      "Bản đồ hỗ trợ tìm kiếm cơ sở y tế, trung tâm gần nhất",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBorder: "border-emerald-200 dark:border-emerald-800",
  },
];



export default function HomePage() {
  const { state, speakText } = useAccessibility();
  const navigate = useNavigate();

  const handleSearch = useCallback(
    (query) => {
      if (state.screenReader) {
        speakText(`Đang tìm kiếm kết quả cho: ${query}`);
      }
      navigate(`/quyen-loi?search=${encodeURIComponent(query)}`);
    },
    [state.screenReader, speakText, navigate]
  );

  return (
    <>
      {/* ═══ Hero Section with Gradient Mesh ═══ */}
      <section
        aria-labelledby="hero-heading"
        className="hero-gradient w-full
                   py-20 md:py-32
                   px-margin-mobile md:px-margin-desktop
                   relative overflow-hidden
                   flex flex-col items-center justify-center
                   theme-transition"
      >
        <div className="max-w-[1000px] w-full mx-auto relative z-10 flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                          bg-primary/10 dark:bg-primary/20
                          border border-primary/20 dark:border-primary/30
                          text-sm font-semibold text-primary dark:text-inverse-primary
                          animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" aria-hidden="true" />
            Cổng thông tin hỗ trợ NKT hàng đầu Việt Nam
          </div>

          <h1
            id="hero-heading"
            className="text-headline-xl md:text-[3.75rem] md:leading-[4.5rem]
                       text-gradient-primary
                       font-extrabold leading-tight max-w-4xl
                       animate-fade-up stagger-1"
          >
            Hòa nhập và Phát triển
            <br className="hidden sm:block" />
            cùng cộng đồng
          </h1>

          <p className="text-body-lg text-on-surface-variant dark:text-surface-dim
                        max-w-2xl animate-fade-up stagger-2">
            Cổng thông tin hỗ trợ tiếp cận dịch vụ, chính sách và cơ hội việc
            làm dành cho người khuyết tật tại Việt Nam.
          </p>

          {/* Search Bar */}
          <div className="w-full mt-4 animate-fade-up stagger-3">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Decorative animated orbs */}
        <div
          className="absolute top-10 right-[10%] w-72 h-72 bg-primary/[0.07] rounded-full
                     blur-3xl animate-float"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-10 left-[5%] w-56 h-56 bg-blue-400/[0.06] rounded-full
                     blur-3xl animate-float-reverse"
          aria-hidden="true"
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[600px] h-[600px] bg-primary/[0.03] rounded-full
                     blur-3xl animate-float-slow"
          aria-hidden="true"
        />
      </section>

      {/* ═══ Service Grid (Bento Style) ═══ */}
      <section
        aria-labelledby="services-heading"
        className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop
                   max-w-[1440px] mx-auto w-full"
      >
        <div className="text-center md:text-left mb-14">
          <h2
            id="services-heading"
            className="text-headline-lg-mobile md:text-headline-lg
                       text-gradient-primary
                       inline-block pb-1 font-extrabold"
          >
            Dịch vụ trọng tâm
          </h2>
          <p className="mt-3 text-body-md text-on-surface-variant dark:text-surface-dim max-w-xl mx-auto md:mx-0">
            Những dịch vụ thiết yếu giúp người khuyết tật tiếp cận quyền lợi, kết nối cộng đồng và tìm kiếm hỗ trợ.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, i) => (
            <div key={service.to} className={`animate-fade-up stagger-${i + 1}`}>
              <ServiceCard {...service} />
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Call to Action Banner ═══ */}
      <section
        aria-labelledby="cta-heading"
        className="py-12 px-margin-mobile md:px-margin-desktop w-full"
      >
        <div
          className="cta-banner max-w-[1440px] mx-auto
                     text-on-primary
                     rounded-2xl p-8 md:p-14
                     flex flex-col md:flex-row items-center justify-between gap-8
                     shadow-2xl theme-transition relative z-10"
        >
          <div className="max-w-2xl text-center md:text-left relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                            bg-white/10 text-sm font-semibold mb-4
                            border border-white/10">
              <Icon name="headset_mic" size="text-base" />
              Hỗ trợ miễn phí
            </div>
            <h2
              id="cta-heading"
              className="text-headline-lg-mobile md:text-headline-lg font-bold mb-4"
            >
              Bạn cần hỗ trợ pháp lý trực tiếp?
            </h2>
            <p className="text-body-lg opacity-90">
              Đội ngũ chuyên gia luật của chúng tôi luôn sẵn sàng tư vấn miễn
              phí cho người khuyết tật và gia đình.
            </p>
          </div>

          <button
            className="shimmer-btn relative z-10
                       bg-white text-primary font-bold text-label-lg
                       px-8 py-4 rounded-xl
                       hover:bg-primary-fixed transition-all
                       min-h-[56px]
                       focus-visible:ring-4 focus-visible:ring-white/50
                       whitespace-nowrap
                       shadow-lg hover:shadow-xl
                       flex items-center gap-3
                       active:scale-95
                       hover:-translate-y-0.5"
          >
            <Icon name="call" size="text-xl" />
            Liên hệ ngay
          </button>
        </div>
      </section>
    </>
  );
}
