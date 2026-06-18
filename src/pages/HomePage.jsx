import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useLanguage } from "../contexts/LanguageContext";
import SearchBar from "../components/ui/SearchBar";
import ServiceCard from "../components/ui/ServiceCard";
import GuideVideoSection from "../components/home/GuideVideoSection";

const SERVICES = [
  {
    to: "/quyen-loi",
    titleKey: "service_rights_title",
    descKey: "service_rights_desc",
    icon: "gavel",
    iconBg: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    iconBorder: "border-blue-200 dark:border-blue-800",
  },
  {
    to: "/tro-cap",
    titleKey: "service_allowance_title",
    descKey: "service_allowance_desc",
    icon: "calculate",
    iconBg: "bg-emerald-50 dark:bg-emerald-950/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    iconBorder: "border-emerald-200 dark:border-emerald-800",
  },
  {
    to: "/ket-noi",
    titleKey: "service_connection_title",
    descKey: "service_connection_desc",
    icon: "diversity_3",
    iconBg: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    iconBorder: "border-amber-200 dark:border-amber-800",
  },
  {
    to: "/ban-do",
    titleKey: "service_map_title",
    descKey: "service_map_desc",
    icon: "map",
    iconBg: "bg-rose-50 dark:bg-rose-950/30",
    iconColor: "text-rose-600 dark:text-rose-400",
    iconBorder: "border-rose-200 dark:border-rose-800",
  },
];

export default function HomePage() {
  const { state, speakText } = useAccessibility();
  const { t } = useLanguage();
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
            {t("home_hero_badge")}
          </div>

          <h1
            id="hero-heading"
            className="text-headline-xl md:text-[3.75rem] md:leading-[4.5rem]
                       text-gradient-primary
                       font-extrabold leading-tight max-w-4xl
                       animate-fade-up stagger-1"
          >
            {t("home_hero_title")}
          </h1>

          <p className="text-body-lg text-on-surface-variant dark:text-surface-dim
                        max-w-2xl animate-fade-up stagger-2">
            {t("home_hero_desc")}
          </p>

          {/* Search Bar */}
          <div className="w-full mt-4 animate-fade-up stagger-3">
            <SearchBar onSearch={handleSearch} placeholder={t("home_search_placeholder")} />
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

      <GuideVideoSection />

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
            {t("home_services_title")}
          </h2>
          <p className="mt-3 text-body-md text-on-surface-variant dark:text-surface-dim max-w-xl mx-auto md:mx-0">
            {t("home_services_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {SERVICES.map((service, i) => (
            <div key={service.to} className={`animate-fade-up stagger-${i + 1}`}>
              <ServiceCard
                to={service.to}
                icon={service.icon}
                title={t(service.titleKey)}
                description={t(service.descKey)}
                ariaLabel={t(service.titleKey)}
                iconBg={service.iconBg}
                iconColor={service.iconColor}
                iconBorder={service.iconBorder}
              />
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
              {t("home_cta_badge")}
            </div>
            <h2
              id="cta-heading"
              className="text-headline-lg-mobile md:text-headline-lg font-bold mb-4"
            >
              {t("home_cta_title")}
            </h2>
            <p className="text-body-lg opacity-90">
              {t("home_cta_desc")}
            </p>
          </div>

          <button
            onClick={() => navigate("/gop-y")}
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
            {t("home_cta_btn")}
          </button>
        </div>
      </section>
    </>
  );
}
