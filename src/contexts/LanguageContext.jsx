import { createContext, useContext, useState, useEffect } from "react";
import { useAccessibility } from "./AccessibilityContext";

const LanguageContext = createContext(null);

const translations = {
  vi: {
    // Navigation
    rights: "Quyền lợi",
    allowance: "Trợ cấp xã hội",
    connection: "Kết nối",
    map: "Bản đồ hỗ trợ",
    login: "Đăng nhập",
    register: "Đăng ký",
    logout: "Đăng xuất",
    profile: "Hồ sơ cá nhân",
    admin: "Quản trị hệ thống",
    about: "Về chúng tôi",
    contact: "Góp ý",
    home: "Trang chủ",
    terms: "Điều khoản",
    privacy: "Bảo mật",
    
    // Notifications & UI
    notifications: "Thông báo",
    language: "Ngôn ngữ",
    welcome: "Xin chào",
    no_notifications: "Không có thông báo mới nào",
    mark_all_read: "Đánh dấu đã đọc tất cả",
    saved_rights: "Quyền lợi đã lưu",
    
    // Footer / General
    all_rights_reserved: "Bản quyền thuộc về Hoà Nhập",
    wcag_compliance: "Hệ thống tuân thủ tiêu chuẩn tiếp cận Web WCAG 2.2 AA.",
    footer_desc: "Cổng thông tin hỗ trợ tiếp cận dịch vụ, chính sách và cơ hội việc làm dành cho người khuyết tật tại Việt Nam.",
    footer_built_with: "Xây dựng với",
    footer_built_for: "cho cộng đồng NKT Việt Nam",

    // Accessibility Sidebar
    sidebar_read: "Đọc",
    sidebar_read_desc: "Đọc nội dung bằng giọng nói tích hợp. Nếu bạn đang sử dụng trình đọc màn hình như NVDA hoặc Narrator, vui lòng tắt tính năng này để tránh trùng lặp giọng nói.",
    sidebar_increase: "Tăng chữ",
    sidebar_increase_desc: "Tăng cỡ chữ hiển thị",
    sidebar_decrease: "Giảm chữ",
    sidebar_decrease_desc: "Giảm cỡ chữ hiển thị",
    sidebar_contrast: "Tương phản",
    sidebar_contrast_desc: "Chế độ tương phản cao đặc biệt",
    sidebar_dark: "Chế độ tối",
    sidebar_dark_desc: "Chuyển sang giao diện tối",
    sidebar_keyboard: "Điều hướng",
    sidebar_keyboard_desc: "Kích hoạt điều hướng bàn phím nâng cao",
    sidebar_sos: "SOS",
    sidebar_sos_desc: "SOS Khẩn cấp — Liên hệ đường dây nóng",
    font_scale_current: "Cỡ chữ hiện tại",

    // HomePage
    home_hero_badge: "Cổng thông tin hỗ trợ NKT hàng đầu Việt Nam",
    home_hero_title: "Hòa nhập và Phát triển cùng cộng đồng",
    home_hero_desc: "Cổng thông tin hỗ trợ tiếp cận dịch vụ, chính sách và cơ hội việc làm dành cho người khuyết tật tại Việt Nam.",
    home_search_placeholder: "Tìm kiếm nhanh quyền lợi hoặc trợ cấp...",
    home_services_title: "Dịch vụ trọng tâm",
    home_services_desc: "Những dịch vụ thiết yếu giúp người khuyết tật tiếp cận quyền lợi, kết nối cộng đồng và tìm kiếm hỗ trợ.",
    home_cta_badge: "Hỗ trợ miễn phí",
    home_cta_title: "Bạn cần hỗ trợ pháp lý trực tiếp?",
    home_cta_desc: "Đội ngũ chuyên gia luật của chúng tôi luôn sẵn sàng tư vấn miễn phí cho người khuyết tật và gia đình.",
    home_cta_btn: "Góp ý ngay",

    // Home Services Cards
    service_rights_title: "Tra cứu quyền lợi",
    service_rights_desc: "Thông tin chi tiết về thủ tục hành chính, cấp giấy xác nhận và chính sách ưu đãi dành cho người khuyết tật.",
    service_connection_title: "Kết nối yêu thương",
    service_connection_desc: "Kết nối bạn với các cộng đồng và cá nhân sẵn lòng hỗ trợ, chia sẻ cùng người khuyết tật trên toàn quốc.",
    service_map_title: "Bản đồ hỗ trợ",
    service_map_desc: "Tìm kiếm cơ sở y tế, trung tâm phục hồi chức năng và địa điểm tiếp cận dành cho NKT gần bạn nhất.",
    service_allowance_title: "Chế độ trợ cấp",
    service_allowance_desc: "Tra cứu các khoản trợ cấp, công cụ tính toán tự động mức hưởng theo Nghị định 20 và hướng dẫn thủ tục.",

    // Search Bar
    search_input_label: "Tìm kiếm thông tin, dịch vụ",
    search_placeholder: "Tìm kiếm nhanh dịch vụ, chính sách, việc làm...",
    search_button: "Tìm kiếm",
    search_suggestions_label: "Gợi ý tìm kiếm",
    search_popular_prefix: "Phổ biến:",
    suggestion_tag_nkt: "Cấp thẻ NKT",
    suggestion_tag_work: "Việc làm tại nhà",
    suggestion_tag_legal: "Hỗ trợ pháp lý",

    // SocialAllowancePage
    allowance_title: "Chế độ trợ cấp xã hội",
    allowance_hero_desc: "Cung cấp danh mục các khoản trợ giúp xã hội, công cụ tính toán tự động mức hưởng theo Nghị định 20/2021/NĐ-CP và thông tin hướng dẫn thủ tục nhận hỗ trợ.",
    allowance_ticker_badge: "Cập nhật mới",
    allowance_ticker: "Đang đề xuất tăng mức chuẩn trợ giúp xã hội từ 360.000 đồng lên 500.000 đồng/tháng theo Tờ trình sửa đổi Nghị định 20.",
    allowance_calc_title: "Công cụ tra cứu mức trợ cấp xã hội",
    allowance_calc_desc: "Mức chuẩn trợ giúp xã hội hiện tại đang áp dụng",
    allowance_calc_level: "Mức độ khuyết tật (theo Giấy xác nhận)",
    allowance_calc_level_special: "Đặc biệt nặng",
    allowance_calc_level_heavy: "Nặng",
    allowance_calc_level_mild: "Nhẹ",
    allowance_calc_age: "Độ tuổi của người khuyết tật",
    allowance_calc_age_child: "Dưới 16 tuổi (Trẻ em)",
    allowance_calc_age_adult: "Từ 16 đến 60 tuổi",
    allowance_calc_age_elderly: "Trên 60 tuổi (Người cao tuổi)",
    allowance_calc_extra_title: "Hỗ trợ chăm sóc cộng thêm",
    allowance_calc_extra_care: "Người khuyết tật đặc biệt nặng đang cần hỗ trợ chăm sóc đặc biệt (không thể tự phục vụ sinh hoạt cá nhân)",
    allowance_calc_extra_family: "Hộ gia đình trực tiếp nuôi dưỡng, chăm sóc người khuyết tật đặc biệt nặng",
    allowance_calc_result_badge: "Mức trợ cấp xã hội dự kiến",
    allowance_calc_result_btn: "Nghe đọc kết quả",
    allowance_proc_title: "Quy trình & Thủ tục nhận trợ cấp",
    allowance_docs_title: "Hồ sơ cần chuẩn bị",
    allowance_docs_desc: "Đánh dấu tích để kiểm tra các giấy tờ bạn đã có trước khi đem nộp hồ sơ.",
    allowance_docs_1: "Tờ khai đề nghị trợ giúp xã hội theo Mẫu số 01 (ban hành kèm theo Nghị định 20)",
    allowance_docs_2: "Bản sao Giấy xác nhận mức độ khuyết tật do UBND cấp xã cấp",
    allowance_docs_3: "Bản sao Căn cước công dân hoặc Giấy khai sinh của người khuyết tật",
    allowance_docs_4: "Bản sao Căn cước công dân của người giám hộ / người nuôi dưỡng (nếu có)",
    allowance_docs_5: "Giấy xác nhận cư trú hoặc Giấy tờ chứng minh hộ nghèo, cận nghèo (nếu áp dụng)",
    allowance_office_title: "Cơ quan nộp hồ sơ tiêu biểu",
  },
  en: {
    // Navigation
    rights: "Rights & Benefits",
    allowance: "Social Allowance",
    connection: "Connection",
    map: "Support Map",
    login: "Login",
    register: "Register",
    logout: "Logout",
    profile: "Profile",
    admin: "Admin Dashboard",
    about: "About Us",
    contact: "Feedback",
    home: "Home",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    
    // Notifications & UI
    notifications: "Notifications",
    language: "Language",
    welcome: "Welcome",
    no_notifications: "No new notifications",
    mark_all_read: "Mark all as read",
    saved_rights: "Saved Benefits",
    
    // Footer / General
    all_rights_reserved: "Copyright © Hoà Nhập Portal",
    wcag_compliance: "Fully compliant with WCAG 2.2 AA accessibility standards.",
    footer_desc: "Access portal for services, national policy updates, and inclusive employment opportunities for people with disabilities in Vietnam.",
    footer_built_with: "Built with",
    footer_built_for: "for the Vietnamese PWD community",

    // Accessibility Sidebar
    sidebar_read: "Read",
    sidebar_read_desc: "Read page content via built-in voice assistance. If you are already using a screen reader like NVDA or Narrator, please disable this to avoid duplicate voices.",
    sidebar_increase: "A+",
    sidebar_increase_desc: "Increase display font size",
    sidebar_decrease: "A-",
    sidebar_decrease_desc: "Decrease display font size",
    sidebar_contrast: "Contrast",
    sidebar_contrast_desc: "Special high contrast mode",
    sidebar_dark: "Dark UI",
    sidebar_dark_desc: "Switch to dark theme mode",
    sidebar_keyboard: "Navigate",
    sidebar_keyboard_desc: "Activate enhanced keyboard navigation markers",
    sidebar_sos: "SOS",
    sidebar_sos_desc: "Emergency SOS — Contact hotline",
    font_scale_current: "Current text size",

    // HomePage
    home_hero_badge: "Vietnam's Leading Support Portal for PWDs",
    home_hero_title: "Social Inclusion & Development",
    home_hero_desc: "Portal supporting accessibility to services, policy updates, and inclusive employment opportunities for people with disabilities in Vietnam.",
    home_search_placeholder: "Quick search for benefits or allowances...",
    home_services_title: "Core Services",
    home_services_desc: "Essential services helping people with disabilities access their rights, connect with communities, and find local support.",
    home_cta_badge: "Free Legal Advice",
    home_cta_title: "Need direct legal assistance?",
    home_cta_desc: "Our legal experts are always ready to consult free of charge for disabled individuals and their families.",
    home_cta_btn: "Give Feedback",

    // Home Services Cards
    service_rights_title: "Rights Search",
    service_rights_desc: "Detailed info on administration steps, disability certificate requests, and preferential national policy guidelines.",
    service_connection_title: "Community Connection",
    service_connection_desc: "Connecting you with communities, events, and individuals ready to support and share experiences nationwide.",
    service_map_title: "Support Map",
    service_map_desc: "Find hospitals, accessible rehabilitation centers, and obstacle-free public locations near you.",
    service_allowance_title: "Social Allowance",
    service_allowance_desc: "Search monthly social allowance, calculate rates under Decree 20, and view guidelines.",

    // Search Bar
    search_input_label: "Search for info, services",
    search_placeholder: "Search services, policies, jobs...",
    search_button: "Search",
    search_suggestions_label: "Search suggestions",
    search_popular_prefix: "Popular:",
    suggestion_tag_nkt: "Disability Card",
    suggestion_tag_work: "Work from Home",
    suggestion_tag_legal: "Legal Support",

    // SocialAllowancePage
    allowance_title: "Social Allowance Policy",
    allowance_hero_desc: "Find lists of governmental aid catalogs, use the automatic Decree 20/2021/NĐ-CP allowance estimator, and read procedures guide.",
    allowance_ticker_badge: "New Update",
    allowance_ticker: "Draft revision of Decree 20 proposes raising base social assistance rate from 360,000 VND to 500,000 VND/month.",
    allowance_calc_title: "Social Allowance Calculator",
    allowance_calc_desc: "Currently applied base allowance rate",
    allowance_calc_level: "Disability Level (according to Certificate)",
    allowance_calc_level_special: "Special/Severe",
    allowance_calc_level_heavy: "Heavy",
    allowance_calc_level_mild: "Mild",
    allowance_calc_age: "Disabled Person's Age Group",
    allowance_calc_age_child: "Under 16 years old (Child)",
    allowance_calc_age_adult: "16 to 60 years old",
    allowance_calc_age_elderly: "Over 60 years old (Elderly)",
    allowance_calc_extra_title: "Additional Support & Care Needs",
    allowance_calc_extra_care: "Severely disabled person requiring special care support (unable to perform basic self-care activities)",
    allowance_calc_extra_family: "Household directly providing care and support for a severely disabled individual",
    allowance_calc_result_badge: "Estimated Monthly Social Allowance",
    allowance_calc_result_btn: "Read results aloud",
    allowance_proc_title: "Application Process & Procedures",
    allowance_docs_title: "Required Documents",
    allowance_docs_desc: "Mark checkboxes below to review what documents you have ready.",
    allowance_docs_1: "Form 01 - Social assistance request form (issued under Decree 20)",
    allowance_docs_2: "Copy of Disability Level Certificate issued by local commune authorities",
    allowance_docs_3: "Copy of ID Card (CCCD) or Birth Certificate of the disabled person",
    allowance_docs_4: "Copy of ID Card (CCCD) of the guardian / primary caregiver (if applicable)",
    allowance_docs_5: "Residency verification or Certificate of poor/near-poor household (if applicable)",
    allowance_office_title: "Welfare Offices & Locations Contacts",
  }
};

export function LanguageProvider({ children }) {
  const { speakText } = useAccessibility();
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem("hoa-nhap-language");
    return saved === "en" ? "en" : "vi";
  });

  useEffect(() => {
    document.title = language === "en"
      ? "Hoà Nhập — Support Portal for People with Disabilities in Vietnam"
      : "Hoà Nhập — Cổng thông tin hỗ trợ người khuyết tật Việt Nam";
  }, [language]);

  const setLanguage = (lang) => {
    const nextLang = lang === "en" ? "en" : "vi";
    setLanguageState(nextLang);
    localStorage.setItem("hoa-nhap-language", nextLang);
    
    // Speak transition to make it accessible
    if (nextLang === "en") {
      speakText("Language changed to English.");
    } else {
      speakText("Đã chuyển đổi sang Tiếng Việt.");
    }
  };

  const t = (key) => {
    return translations[language][key] || translations["vi"][key] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
