import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";

// ─── Constants for Dropdowns ─────────────────────────────────────────
const DISABILITY_OPTIONS = ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động", "Trí tuệ"];
const AGE_OPTIONS = ["Tất cả", "Trẻ em (<16 tuổi)", "Người trưởng thành (16-60 tuổi)", "Người cao tuổi (>60 tuổi)"];
const PROVINCE_OPTIONS = ["Tất cả", "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ", "Khác"];
const CATEGORY_OPTIONS = ["Tất cả", "Chăm sóc sức khỏe", "Giáo dục & Đào tạo", "Việc làm & Sinh kế", "Giao thông & Công trình", "Văn hóa, Thể thao & Du lịch"];

const BENTO_CATEGORIES = [
  {
    id: "health",
    title: "Chăm sóc sức khỏe",
    icon: "medical_services",
    description: "Quyền được khám bệnh, chữa bệnh, phục hồi chức năng và cấp thẻ BHYT miễn phí hoặc hỗ trợ.",
    color: "border-primary hover:border-primary-container",
  },
  {
    id: "education",
    title: "Giáo dục & Đào tạo",
    icon: "school",
    description: "Hỗ trợ giáo dục hòa nhập, miễn giảm học phí, cung cấp công cụ học tập chuyên dụng.",
    color: "border-teal-600 hover:border-teal-700",
  },
  {
    id: "livelihood",
    title: "Việc làm & Sinh kế",
    icon: "work",
    description: "Tư vấn nghề nghiệp, hỗ trợ vốn vay ưu đãi và bảo vệ quyền lợi tại nơi làm việc.",
    color: "border-amber-600 hover:border-amber-700",
  },
  {
    id: "transport",
    title: "Giao thông & Công trình",
    icon: "accessible",
    description: "Miễn giảm vé tàu xe, yêu cầu tiếp cận không rào cản tại các công trình công cộng.",
    color: "border-blue-600 hover:border-blue-700",
  },
  {
    id: "culture",
    title: "Văn hóa, Thể thao & Du lịch",
    icon: "theater_comedy",
    description: "Giảm giá vé tham quan, hỗ trợ tham gia các hoạt động văn hóa nghệ thuật và thể thao.",
    color: "border-rose-600 hover:border-rose-700",
  },
];

// ─── Mock Legal Documents ───────────────────────────────────────────
const LEGAL_DOCUMENTS = [
  {
    id: "doc-1",
    title: "Luật Người khuyết tật số 51/2010/QH12",
    date: "Ban hành ngày 17/06/2010",
    url: "https://thuvienphapluat.vn/van-ban/Tieu-dung/Luat-nguoi-khuyet-tat-2010-107067.aspx",
  },
  {
    id: "doc-2",
    title: "Nghị định 20/2021/NĐ-CP",
    date: "Quy định chính sách trợ giúp xã hội đối với đối tượng bảo trợ xã hội",
    url: "https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Nghi-dinh-20-2021-ND-CP-chinh-sach-tro-giup-xa-hoi-doi-tuong-bao-tro-xa-hoi-467773.aspx",
  },
];

// ─── Mock Policies Dataset ──────────────────────────────────────────
const POLICIES_DATA = [
  {
    id: "pol-1",
    name: "Cấp thẻ Bảo hiểm y tế miễn phí",
    category: "Chăm sóc sức khỏe",
    icon: "medical_services",
    description: "Cấp thẻ Bảo hiểm y tế miễn phí 100% chi phí khám chữa bệnh đối với người khuyết tật nặng và đặc biệt nặng.",
    conditions: "Là người khuyết tật nặng hoặc đặc biệt nặng theo Giấy xác nhận mức độ khuyết tật.",
    supportRate: "Miễn phí 100% mức đóng BHYT hàng năm và chi phí khám chữa bệnh đúng tuyến tại tất cả các cơ sở y tế nhà nước.",
    documents: ["Tờ khai đăng ký cấp thẻ BHYT", "Bản sao Giấy xác nhận mức độ khuyết tật", "Bản sao Căn cước công dân hoặc giấy khai sinh đối với trẻ em"],
    disabilityTypes: ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động", "Trí tuệ"],
    ageGroups: ["Tất cả", "Trẻ em (<16 tuổi)", "Người trưởng thành (16-60 tuổi)", "Người cao tuổi (>60 tuổi)"],
    provinces: ["Tất cả"],
  },
  {
    id: "pol-2",
    name: "Trợ cấp xã hội hàng tháng cho NKT nặng",
    category: "Chăm sóc sức khỏe",
    icon: "payments",
    description: "Hỗ trợ tài chính hàng tháng đối với người khuyết tật nặng không có thu nhập hoặc ở điều kiện kinh tế khó khăn.",
    conditions: "Người khuyết tật nặng, đặc biệt nặng được cấp Giấy xác nhận khuyết tật và có hộ khẩu thường trú tại địa phương.",
    supportRate: "Hỗ trợ từ 540.000đ đến 900.000đ/tháng tùy theo mức độ khuyết tật và độ tuổi quy định tại địa phương.",
    documents: ["Tờ khai đề nghị trợ cấp xã hội hàng tháng", "Bản sao Giấy xác nhận khuyết tật", "Bản sao Căn cước công dân của người khuyết tật hoặc người giám hộ"],
    disabilityTypes: ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động", "Trí tuệ"],
    ageGroups: ["Tất cả", "Trẻ em (<16 tuổi)", "Người trưởng thành (16-60 tuổi)", "Người cao tuổi (>60 tuổi)"],
    provinces: ["Tất cả"],
  },
  {
    id: "pol-3",
    name: "Hỗ trợ miễn giảm học phí học sinh khuyết tật",
    category: "Giáo dục & Đào tạo",
    icon: "school",
    description: "Miễn giảm 100% học phí và hỗ trợ chi phí học tập cho học sinh, sinh viên khuyết tật tại các cơ sở giáo dục công lập.",
    conditions: "Học sinh, sinh viên là người khuyết tật nặng hoặc đặc biệt nặng đang theo học tại các cấp học từ mầm non đến đại học.",
    supportRate: "Miễn 100% học phí theo quy định của trường học công lập và hỗ trợ sinh hoạt học tập 150.000đ/tháng học.",
    documents: ["Đơn đề nghị miễn giảm học phí", "Bản sao Giấy xác nhận khuyết tật", "Giấy xác nhận đang đi học của nhà trường"],
    disabilityTypes: ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động", "Trí tuệ"],
    ageGroups: ["Trẻ em (<16 tuổi)", "Người trưởng thành (16-60 tuổi)"],
    provinces: ["Tất cả"],
  },
  {
    id: "pol-4",
    name: "Vay vốn ưu đãi giải quyết việc làm",
    category: "Việc làm & Sinh kế",
    icon: "work",
    description: "Hỗ trợ vay vốn kinh doanh, sản xuất với lãi suất ưu đãi từ Ngân hàng Chính sách Xã hội dành riêng cho người khuyết tật.",
    conditions: "Người khuyết tật có năng lực hành vi dân sự đầy đủ (hoặc qua người giám hộ), có phương án sản xuất kinh doanh khả thi.",
    supportRate: "Cho vay tối đa 100 triệu đồng/cá nhân, thời hạn vay lên đến 60 tháng với lãi suất bằng 50% lãi suất cho vay hộ nghèo.",
    documents: ["Giấy đề nghị vay vốn giải quyết việc làm", "Phương án sản xuất kinh doanh khả thi", "Bản sao Giấy xác nhận khuyết tật"],
    disabilityTypes: ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động"],
    ageGroups: ["Người trưởng thành (16-60 tuổi)"],
    provinces: ["Tất cả"],
  },
  {
    id: "pol-5",
    name: "Miễn giảm vé giao thông công cộng đô thị",
    category: "Giao thông & Công trình",
    icon: "accessible",
    description: "Miễn phí 100% vé xe buýt nội đô và giảm tối thiểu 50% vé tàu hỏa, vé máy bay nội địa đối với người khuyết tật.",
    conditions: "Người khuyết tật xuất trình Giấy xác nhận khuyết tật khi lên xe buýt hoặc mua vé tàu, vé máy bay.",
    supportRate: "Miễn 100% vé xe buýt tại Hà Nội và TP.HCM; giảm 50% giá vé tàu hỏa và giảm 15% giá vé máy bay nội địa.",
    documents: ["Xuất trình Giấy xác nhận khuyết tật tại quầy vé", "Căn cước công dân đối chiếu"],
    disabilityTypes: ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động", "Trí tuệ"],
    ageGroups: ["Tất cả", "Trẻ em (<16 tuổi)", "Người trưởng thành (16-60 tuổi)", "Người cao tuổi (>60 tuổi)"],
    provinces: ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Cần Thơ"],
  },
  {
    id: "pol-6",
    name: "Giảm phí tham quan danh lam, di tích lịch sử",
    category: "Văn hóa, Thể thao & Du lịch",
    icon: "theater_comedy",
    description: "Miễn phí hoặc giảm tối thiểu 50% giá vé tham quan di tích lịch sử, bảo tàng, khu du lịch quốc gia.",
    conditions: "Người khuyết tật nặng và đặc biệt nặng xuất trình thẻ xác nhận khuyết tật tại phòng bán vé.",
    supportRate: "Giảm tối thiểu 50% (nhiều di tích công lập miễn phí 100%) phí vào cửa các khu du lịch, danh thắng do nhà nước quản lý.",
    documents: ["Giấy xác nhận khuyết tật hoặc thẻ người khuyết tật"],
    disabilityTypes: ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động", "Trí tuệ"],
    ageGroups: ["Tất cả", "Trẻ em (<16 tuổi)", "Người trưởng thành (16-60 tuổi)", "Người cao tuổi (>60 tuổi)"],
    provinces: ["Tất cả"],
  },
  {
    id: "pol-7",
    name: "Cấp phương tiện trợ giúp, dụng cụ chỉnh hình",
    category: "Chăm sóc sức khỏe",
    icon: "wheelchair_pickup",
    description: "Hỗ trợ cấp miễn phí xe lăn, xe lắc, chân tay giả hoặc dụng cụ chỉnh hình cho người khuyết tật khó khăn.",
    conditions: "Người khuyết tật vận động nghèo, cận nghèo hoặc có hoàn cảnh đặc biệt khó khăn được chỉ định y khoa.",
    supportRate: "Cấp miễn phí xe lăn tiêu chuẩn hoặc hỗ trợ tối đa 5.000.000đ/lần đối với lắp ráp dụng cụ chỉnh hình.",
    documents: ["Đơn đề nghị hỗ trợ phương tiện trợ giúp", "Bản sao Giấy xác nhận khuyết tật vận động", "Xác nhận hộ nghèo hoặc hoàn cảnh khó khăn"],
    disabilityTypes: ["Vận động"],
    ageGroups: ["Tất cả", "Trẻ em (<16 tuổi)", "Người trưởng thành (16-60 tuổi)", "Người cao tuổi (>60 tuổi)"],
    provinces: ["Tất cả"],
  },
  {
    id: "pol-8",
    name: "Học nghề trình độ sơ cấp miễn phí",
    category: "Việc làm & Sinh kế",
    icon: "engineering",
    description: "Hỗ trợ chi phí đào tạo nghề ngắn hạn dưới 3 tháng và trợ cấp ăn trưa, tiền xe đi lại cho người khuyết tật lao động.",
    conditions: "Người khuyết tật trong độ tuổi lao động (16-60 tuổi) có nhu cầu và khả năng học nghề phù hợp.",
    supportRate: "Tài trợ 100% học phí khóa học sơ cấp và hỗ trợ thêm 30.000đ/ngày học thực tế chi phí ăn uống.",
    documents: ["Đơn đăng ký học nghề dành cho NKT", "Bản sao Giấy xác nhận khuyết tật", "Giấy khám sức khỏe đủ điều kiện học tập"],
    disabilityTypes: ["Tất cả", "Trực quan/Khiếm thị", "Thính giác/Khiếm thính", "Vận động"],
    ageGroups: ["Người trưởng thành (16-60 tuổi)"],
    provinces: ["Tất cả"],
  },
];

// ─── Focus Trap Modal Component for Rights Page ─────────────────────
function FocusTrapModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const originalFocus = document.activeElement;

    if (firstElement) {
      setTimeout(() => firstElement.focus(), 50);
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    modal.addEventListener("keydown", handleKeyDown);
    return () => {
      modal.removeEventListener("keydown", handleKeyDown);
      if (originalFocus) {
        originalFocus.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rights-modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface dark:bg-tertiary border-2 border-outline dark:border-outline-variant w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] theme-transition"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-outline-variant/50 bg-primary text-on-primary">
          <h2 id="rights-modal-title" className="font-bold text-xl md:text-2xl leading-snug">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Đóng hộp thoại thông tin quyền lợi"
            className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors accessibility-focus"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-grow text-on-surface dark:text-inverse-on-surface leading-relaxed text-base">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function RightsPage() {
  const { state: accessState, speakText } = useAccessibility();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, toggleSaveBenefit } = useAuth();

  // Load policies and legal documents dynamically from Firestore
  const [policies, setPolicies] = useState([]);
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const unsubscribePol = onSnapshot(collection(db, "policies"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setPolicies(list);
    });

    const unsubscribeDocs = onSnapshot(collection(db, "documents"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setDocuments(list);
    });

    return () => {
      unsubscribePol();
      unsubscribeDocs();
    };
  }, []);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("search") || "");
  const [selectedDisability, setSelectedDisability] = useState("Tất cả");
  const [selectedAge, setSelectedAge] = useState("Tất cả");
  const [selectedProvince, setSelectedProvince] = useState("Tất cả");
  const [selectedBentoCategory, setSelectedBentoCategory] = useState("Tất cả");
  const [currentPage, setCurrentPage] = useState(1);

  // Sync searchQuery when searchParams in URL change
  useEffect(() => {
    const q = searchParams.get("search") || "";
    setSearchQuery(q);
  }, [searchParams]);

  // Saved Bookmarks state
  const savedRights = useMemo(() => {
    return user ? (user.savedBenefits || []) : [];
  }, [user]);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Active details modal policy
  const [activeModalPolicy, setActiveModalPolicy] = useState(null);

  // Show status toasts
  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    if (accessState.screenReader) {
      speakText(msg);
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, [accessState.screenReader, speakText]);

  // Toggle bookmark policy
  const handleToggleBookmark = useCallback(
    async (e, policy) => {
      e.stopPropagation(); // Avoid triggering details modal

      if (!user) {
        triggerToast("Vui lòng đăng nhập để lưu quyền lợi này.");
        return;
      }

      try {
        const isSaved = savedRights.includes(policy.id);
        await toggleSaveBenefit(policy.id);
        if (isSaved) {
          triggerToast(`Đã bỏ lưu chính sách: ${policy.name}`);
        } else {
          triggerToast(`Đã lưu thành công chính sách: ${policy.name}`);
        }
      } catch (err) {
        triggerToast("Đã xảy ra lỗi khi lưu quyền lợi.");
      }
    },
    [user, savedRights, toggleSaveBenefit, triggerToast]
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedDisability, selectedAge, selectedProvince, selectedBentoCategory]);

  // Real-time filtering logic
  const filteredPolicies = useMemo(() => {
    return policies.filter((pol) => {
      const matchesSearch =
        pol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pol.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBento =
        selectedBentoCategory === "Tất cả" || pol.category === selectedBentoCategory;

      const matchesDisability =
        selectedDisability === "Tất cả" ||
        pol.disabilityTypes.includes(selectedDisability) ||
        pol.disabilityTypes.includes("Tất cả");

      const matchesAge =
        selectedAge === "Tất cả" ||
        pol.ageGroups.includes(selectedAge) ||
        pol.ageGroups.includes("Tất cả");

      const matchesProvince =
        selectedProvince === "Tất cả" ||
        pol.provinces.includes(selectedProvince) ||
        pol.provinces.includes("Tất cả");

      return matchesSearch && matchesBento && matchesDisability && matchesAge && matchesProvince;
    });
  }, [policies, searchQuery, selectedBentoCategory, selectedDisability, selectedAge, selectedProvince]);

  // Pagination config
  const ITEMS_PER_PAGE = 4;
  const totalPages = Math.ceil(filteredPolicies.length / ITEMS_PER_PAGE);
  const paginatedPolicies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPolicies.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPolicies, currentPage]);

  // Handle Bento Category Card selections
  const handleBentoSelect = (categoryTitle) => {
    if (categoryTitle === "Tất cả" || selectedBentoCategory === categoryTitle) {
      setSelectedBentoCategory("Tất cả");
      if (accessState.screenReader) {
        speakText(`Đã bỏ chọn bộ lọc danh mục. Đang hiển thị tất cả.`);
      }
    } else {
      setSelectedBentoCategory(categoryTitle);
      if (accessState.screenReader) {
        speakText(`Đang lọc theo nhóm quyền lợi: ${categoryTitle}`);
      }
    }
  };

  // Keypress / screen reader speech on items focus/hover
  const handleSpeakItem = (text) => {
    if (accessState.screenReader) {
      speakText(text);
    }
  };

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-[#1c1f26] bg-dots-pattern pb-24 theme-transition">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[340px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-overlay">
          <img
            alt="Đồ họa nền Luật người khuyết tật Việt Nam"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-12 md:py-16">
          <div className="max-w-3xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              Quyền lợi của bạn
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed">
              Theo <strong className="font-bold underline">Luật Người khuyết tật 2010</strong>, bạn được đảm bảo các quyền bình đẳng về chăm sóc sức khỏe, giáo dục, việc làm và tham gia các hoạt động xã hội. Hệ thống này được thiết kế để giúp bạn dễ dàng tra cứu, hiểu rõ và thực thi các quyền lợi chính đáng của mình một cách thuận tiện nhất.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Smart Filters Panel ─── */}
      <section id="filters-section" className="max-w-[1440px] mx-auto px-gutter py-8 relative z-10">
        <div className="glass-card rounded-2xl p-6 flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Keyword Search */}
            <div className="flex flex-col">
              <label htmlFor="rights-keyword" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
                Tìm kiếm từ khóa
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">
                  search
                </span>
                <input
                  id="rights-keyword"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface placeholder-gray-400 dark:placeholder-gray-300"
                  placeholder="Nhập thẻ BHYT, trợ cấp..."
                />
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="flex flex-col">
              <label htmlFor="rights-category" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
                Nhóm quyền lợi
              </label>
              <select
                id="rights-category"
                value={selectedBentoCategory}
                onChange={(e) => {
                  setSelectedBentoCategory(e.target.value);
                  if (accessState.screenReader) {
                    speakText(`Đang lọc theo nhóm quyền lợi: ${e.target.value}`);
                  }
                }}
                className="w-full h-14 px-4 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Disability Type Dropdown */}
            <div className="flex flex-col">
              <label htmlFor="rights-disability" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
                Dạng khuyết tật
              </label>
              <select
                id="rights-disability"
                value={selectedDisability}
                onChange={(e) => setSelectedDisability(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface cursor-pointer"
              >
                {DISABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Age Dropdown */}
            <div className="flex flex-col">
              <label htmlFor="rights-age" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
                Độ tuổi của bạn
              </label>
              <select
                id="rights-age"
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface cursor-pointer"
              >
                {AGE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Province Dropdown */}
            <div className="flex flex-col">
              <label htmlFor="rights-province" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
                Tỉnh / Thành phố
              </label>
              <select
                id="rights-province"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full h-14 px-4 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface cursor-pointer"
              >
                {PROVINCE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Clear filters link */}
          {(searchQuery !== "" || selectedDisability !== "Tất cả" || selectedAge !== "Tất cả" || selectedProvince !== "Tất cả" || selectedBentoCategory !== "Tất cả") && (
            <div className="flex justify-end border-t border-outline-variant/30 pt-4">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedDisability("Tất cả");
                  setSelectedAge("Tất cả");
                  setSelectedProvince("Tất cả");
                  setSelectedBentoCategory("Tất cả");
                  setCurrentPage(1);
                  triggerToast("Đã thiết lập lại tất cả các bộ lọc tra cứu");
                }}
                className="text-xs font-bold text-secondary dark:text-inverse-primary hover:underline flex items-center gap-1.5 accessibility-focus"
              >
                <Icon name="filter_alt_off" size="text-sm" />
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ─── Filtered Policies Grid ─── */}
      <section className="max-w-[1440px] mx-auto px-gutter py-12">
        <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface mb-8 flex items-center gap-3">
          <Icon name="policy" className="text-primary dark:text-inverse-primary" />
          Danh sách quyền lợi phù hợp ({filteredPolicies.length})
        </h2>

        {paginatedPolicies.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {paginatedPolicies.map((pol) => {
                const isSaved = savedRights.includes(pol.id);
                return (
                  <div
                    key={pol.id}
                    onClick={() => setActiveModalPolicy(pol)}
                    onFocus={() => handleSpeakItem(`${pol.name}. Thuộc nhóm: ${pol.category}. Mô tả: ${pol.description}`)}
                    tabIndex={0}
                    role="button"
                    className="glass-card rounded-2xl p-6 hover:border-primary/50 dark:hover:border-inverse-primary/50 hover:-translate-y-1 flex flex-col justify-between text-left group focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-xs font-bold rounded-full capitalize">
                          {pol.category}
                        </span>
                        <button
                          onClick={(e) => handleToggleBookmark(e, pol)}
                          aria-label={isSaved ? `Bỏ lưu chính sách ${pol.name}` : `Lưu chính sách ${pol.name}`}
                          className="w-10 h-10 border border-outline-variant dark:border-outline rounded-full flex items-center justify-center text-outline-variant dark:text-outline hover:bg-surface-container dark:hover:bg-tertiary-container hover:text-primary transition-all accessibility-focus"
                        >
                          <Icon name="bookmark" className={isSaved ? "text-primary dark:text-inverse-primary" : ""} filled={isSaved} />
                        </button>
                      </div>

                      <h3 className="font-bold text-lg text-on-surface dark:text-inverse-on-surface group-hover:text-primary dark:group-hover:text-inverse-primary leading-snug mb-2.5">
                        {pol.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed mb-6">
                        {pol.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4">
                      <span className="text-xs font-bold text-secondary dark:text-inverse-primary flex items-center gap-1 group-hover:underline">
                        <Icon name="info" size="text-sm" />
                        Xem chi tiết từng thủ tục
                      </span>
                      <Icon name="chevron_right" className="text-outline group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant/30 pt-8 mt-8 theme-transition">
                <span className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim font-medium">
                  Hiển thị {Math.min(filteredPolicies.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredPolicies.length, currentPage * ITEMS_PER_PAGE)} trên tổng số {filteredPolicies.length} quyền lợi
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        speakText(`Chuyển sang trang ${currentPage - 1}`);
                      }
                    }}
                    disabled={currentPage === 1}
                    className="w-10 h-10 rounded-xl border-2 border-outline-variant dark:border-outline flex items-center justify-center text-on-surface hover:border-primary disabled:opacity-40 disabled:hover:border-outline-variant transition-all accessibility-focus dark:text-inverse-on-surface"
                    aria-label="Trang trước"
                  >
                    <Icon name="chevron_left" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => {
                        setCurrentPage(page);
                        speakText(`Chuyển sang trang ${page}`);
                      }}
                      className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all accessibility-focus
                        ${currentPage === page
                          ? "bg-primary border-primary text-on-primary dark:bg-inverse-primary dark:border-inverse-primary dark:text-on-primary-container"
                          : "bg-surface-container-lowest border-outline-variant text-on-surface hover:border-primary dark:bg-tertiary dark:border-outline dark:text-inverse-on-surface"
                        }`}
                      aria-label={`Trang ${page}`}
                      aria-current={currentPage === page ? "page" : undefined}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                        speakText(`Chuyển sang trang ${currentPage + 1}`);
                      }
                    }}
                    disabled={currentPage === totalPages}
                    className="w-10 h-10 rounded-xl border-2 border-outline-variant dark:border-outline flex items-center justify-center text-on-surface hover:border-primary disabled:opacity-40 disabled:hover:border-outline-variant transition-all accessibility-focus dark:text-inverse-on-surface"
                    aria-label="Trang sau"
                  >
                    <Icon name="chevron_right" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-8 theme-transition">
            <Icon name="policy" size="text-5xl" className="text-outline mb-4" />
            <h3 className="font-bold text-headline-md text-on-surface dark:text-inverse-on-surface">Không tìm thấy quyền lợi phù hợp</h3>
            <p className="text-body-medium text-on-surface-variant dark:text-tertiary-fixed-dim mt-2">
              Hãy thử thay đổi nội dung từ khóa tìm kiếm hoặc chọn lọc các tiêu chí khác trong bảng điều khiển bộ lọc.
            </p>
          </div>
        )}
      </section>

      {/* ─── Legal Documents List ─── */}
      <section className="max-w-[1440px] mx-auto px-gutter py-8">
        <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 shadow-sm theme-transition">
          <h2 className="font-headline-lg text-lg md:text-xl font-bold text-on-surface dark:text-inverse-on-surface mb-6 flex items-center gap-2">
            <Icon name="description" className="text-primary dark:text-inverse-primary" />
            Văn bản pháp luật liên quan
          </h2>

          <ul className="space-y-4" role="list">
            {documents.map((doc) => (
              <li
                key={doc.id}
                onFocus={() => handleSpeakItem(`${doc.title}. ${doc.date}`)}
                tabIndex={0}
                className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/50 dark:hover:border-inverse-primary/50 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="max-w-2xl">
                  <h3 className="font-bold text-sm md:text-base text-on-surface dark:text-inverse-on-surface mb-1">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim">
                    {doc.date}
                  </p>
                </div>
                
                <Button
                  as="a"
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  icon="open_in_new"
                  className="font-bold text-xs shrink-0 self-start sm:self-center border-2"
                >
                  Xem chi tiết
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>


      {/* ─── Floating Toast Alerts (Accessibility Live region) ─── */}
      <div
        aria-live="assertive"
        className="fixed bottom-6 right-6 z-[9999] pointer-events-none"
      >
        {toastMessage && (
          <div className="bg-primary text-on-primary px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 max-w-sm animate-[slideUp_0.2s_ease-out]">
            <Icon name="info" size="text-lg" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </div>
        )}
      </div>

      {/* ─── Rights Procedure Details Modal (Focus Trapped) ─── */}
      <FocusTrapModal
        isOpen={!!activeModalPolicy}
        onClose={() => setActiveModalPolicy(null)}
        title={activeModalPolicy?.name || "Chi tiết thủ tục hưởng quyền lợi"}
      >
        {activeModalPolicy && (
          <div className="space-y-6 text-on-surface dark:text-inverse-on-surface">
            {/* Category tag */}
            <div className="flex justify-between items-center">
              <span className="px-3 py-1.5 bg-primary/10 text-primary dark:bg-inverse-primary/20 dark:text-inverse-primary text-sm font-bold rounded-full">
                {activeModalPolicy.category}
              </span>
              <button
                onClick={(e) => handleToggleBookmark(e, activeModalPolicy)}
                className="text-sm font-bold text-primary dark:text-inverse-primary hover:underline flex items-center gap-1.5 accessibility-focus"
              >
                <Icon
                  name="bookmark"
                  size="text-base"
                  filled={savedRights.includes(activeModalPolicy.id)}
                />
                {savedRights.includes(activeModalPolicy.id) ? "Bỏ lưu quyền lợi" : "Lưu vào hồ sơ"}
              </button>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg font-semibold leading-relaxed border-l-4 border-primary pl-4 py-2 bg-surface-container dark:bg-tertiary-container/30 rounded-r-lg">
              {activeModalPolicy.description}
            </p>

            {/* Target conditions */}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-outline dark:text-tertiary-fixed-dim mb-2">
                Điều kiện áp dụng
              </h4>
              <p className="text-base bg-surface-container-low dark:bg-tertiary-container/20 p-4 rounded-lg leading-relaxed">
                {activeModalPolicy.conditions}
              </p>
            </div>

            {/* Support Rate */}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-outline dark:text-tertiary-fixed-dim mb-2">
                Mức hỗ trợ cụ thể
              </h4>
              <p className="text-base bg-surface-container-low dark:bg-tertiary-container/20 p-4 rounded-lg leading-relaxed font-bold text-secondary dark:text-inverse-primary">
                {activeModalPolicy.supportRate}
              </p>
            </div>

            {/* Document Checklists */}
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-wider text-outline dark:text-tertiary-fixed-dim mb-2">
                Hồ sơ chuẩn bị cần thiết
              </h4>
              <ul className="space-y-3" role="list">
                {activeModalPolicy.documents.map((docName, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Icon name="check_circle" className="text-emerald-600 dark:text-emerald-400 mt-0.5" size="text-base" />
                    <span>{docName}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Close actions */}
            <div className="flex justify-center border-t border-outline-variant/30 pt-6">
              <Button
                variant="primary"
                onClick={() => setActiveModalPolicy(null)}
                className="w-full sm:w-48 font-bold text-base h-12"
              >
                Đóng
              </Button>
            </div>
          </div>
        )}
      </FocusTrapModal>
    </div>
  );
}
