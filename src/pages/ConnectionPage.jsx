import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, addDoc } from "firebase/firestore";

const VIETNAM_PROVINCES = [
  "Hà Nội",
  "TP. Hồ Chí Minh",
  "Đà Nẵng",
  "Cần Thơ",
  "Khác"
];

// ─── Connection Profile Dataset ─────────────────────────────────
const INITIAL_CONNECTIONS = [
  {
    id: "conn-1",
    name: "Nguyễn Thu Hà",
    type: "tình nguyện viên",
    typeLabel: "Tình nguyện viên",
    location: "Cầu Giấy, Hà Nội",
    region: "Hà Nội",
    supportType: "Hướng dẫn thủ tục",
    description: "Có kinh nghiệm 5 năm hỗ trợ người khiếm thị làm các thủ tục hành chính và hướng dẫn sử dụng công nghệ hỗ trợ. Sẵn sàng giúp đỡ vào cuối tuần.",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    email: "thuha.nguyen@hoanhap.org",
    phone: "0912345678",
    availability: "Cuối tuần (Thứ 7 & Chủ Nhật)",
    details: "Tôi hiện đang là kiểm toán viên nhưng dành thời gian rảnh cuối tuần tham gia công tác thiện nguyện. Tôi có thể di chuyển quanh khu vực Cầu Giấy, Ba Đình để trợ giúp trực tiếp hoặc hỗ trợ trực tuyến qua điện thoại/Zoom."
  },
  {
    id: "conn-2",
    name: "Hành trình Hy vọng",
    type: "cộng đồng",
    typeLabel: "Cộng đồng",
    location: "Quận 3, TP. Hồ Chí Minh",
    region: "TP. Hồ Chí Minh",
    supportType: "Vận chuyển",
    description: "Tổ chức chuyên hỗ trợ vận chuyển người khuyết tật vận động đi khám bệnh và tham gia các hoạt động xã hội bằng phương tiện chuyên dụng.",
    avatarUrl: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=200",
    email: "hanhtrinhhyvong@hoanhap.org",
    phone: "0987654321",
    availability: "Các ngày trong tuần (8:00 - 17:00)",
    details: "Hành trình Hy vọng sở hữu đội xe bán tải có lắp bệ nâng thủy lực chuyên chở xe lăn. Chúng tôi nhận chuyên chở miễn phí hoặc hỗ trợ chi phí thấp cho NKT nghèo đi khám định kỳ tại các bệnh viện lớn."
  },
  {
    id: "conn-3",
    name: "Trần Minh Quân",
    type: "tình nguyện viên",
    typeLabel: "Tình nguyện viên",
    location: "Hải Châu, Đà Nẵng",
    region: "Đà Nẵng",
    supportType: "Hướng dẫn thủ tục",
    description: "Sinh viên ngành Luật, hỗ trợ tư vấn pháp lý cơ bản và hướng dẫn làm hồ sơ hưởng trợ cấp xã hội cho người khuyết tật hoàn toàn miễn phí.",
    avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    email: "minhquan.tran@hoanhap.org",
    phone: "0905123456",
    availability: "Tối Thứ 2, 4, 6 và cả ngày Chủ Nhật",
    details: "Là sinh viên Luật năm cuối, tôi muốn áp dụng kiến thức chuyên môn giúp đỡ cộng đồng. Tôi hỗ trợ viết đơn từ, tư vấn thủ tục xác định mức độ khuyết tật, xin cấp thẻ bảo hiểm y tế miễn phí."
  },
  {
    id: "conn-4",
    name: "Phạm Minh Đức",
    type: "tình nguyện viên",
    typeLabel: "Tình nguyện viên",
    location: "Ninh Kiều, Cần Thơ",
    region: "Cần Thơ",
    supportType: "Hỗ trợ học tập",
    description: "Cử nhân Sư phạm nhận dạy kèm văn hóa cấp 1, cấp 2 cho trẻ em khuyết tật trí tuệ nhẹ hoặc khuyết tật vận động tại nhà.",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    email: "minhduc.pham@hoanhap.org",
    phone: "0939112233",
    availability: "Thứ 3, 5, 7 từ 14:00 - 17:00",
    details: "Tôi có chứng chỉ giáo dục đặc biệt và có kinh nghiệm giảng dạy trẻ chậm phát triển trí tuệ nhẹ, trẻ tự kỷ thể nhẹ. Tôi nhận dạy học miễn phí tại nhà học sinh hoặc hỗ trợ ôn bài trực tuyến."
  },
  {
    id: "conn-5",
    name: "Mái ấm Ánh Dương",
    type: "cộng đồng",
    typeLabel: "Cộng đồng",
    location: "Thanh Xuân, Hà Nội",
    region: "Hà Nội",
    supportType: "Chăm sóc",
    description: "Trung tâm bảo trợ cung cấp các dịch vụ chăm sóc bán trú, phục hồi chức năng và hoạt động giao lưu văn nghệ bổ ích cho NKT.",
    avatarUrl: "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&q=80&w=200",
    email: "anhduong.maiam@hoanhap.org",
    phone: "0243123456",
    availability: "Hàng ngày (8:00 - 20:00)",
    details: "Mái ấm Ánh Dương đón nhận NKT đến sinh hoạt, học nghề may mặc thủ công và giao lưu sinh hoạt cộng đồng nhằm cải thiện kỹ năng giao tiếp xã hội và phục hồi chức năng dựa vào cộng đồng."
  },
  {
    id: "conn-6",
    name: "Lê Thị Hoa",
    type: "tình nguyện viên",
    typeLabel: "Tình nguyện viên",
    location: "Quận 1, TP. Hồ Chí Minh",
    region: "TP. Hồ Chí Minh",
    supportType: "Chăm sóc",
    description: "Nữ điều dưỡng nghỉ hưu nhận tư vấn y tế tại nhà, theo dõi sức khỏe và hướng dẫn phục hồi chức năng cho người tai biến hoặc chấn thương cột sống.",
    avatarUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=200",
    email: "lehoa.nurse@hoanhap.org",
    phone: "0913998877",
    availability: "Thứ 2 đến Thứ 6 (9:00 - 11:30)",
    details: "Với 30 năm kinh nghiệm công tác tại bệnh viện phục hồi chức năng, tôi sẵn sàng đến tận nhà người bệnh khó khăn để đo huyết áp, hỗ trợ các bài tập vận động cơ bản phòng tránh teo cơ."
  },
  {
    id: "conn-7",
    name: "Hội thiện nguyện Nhất Tâm",
    type: "cộng đồng",
    typeLabel: "Cộng đồng",
    location: "Hải Châu, Đà Nẵng",
    region: "Đà Nẵng",
    supportType: "Vận chuyển",
    description: "Cung cấp chuyến xe 0 đồng vận chuyển người khuyết tật nặng từ nhà đến các cơ sở khám chữa bệnh công lập trên địa bàn Đà Nẵng.",
    avatarUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=200",
    email: "nhattam.volunteer@hoanhap.org",
    phone: "0944882211",
    availability: "Tất cả các ngày trong tuần (24/7 cho trường hợp khẩn cấp)",
    details: "Nhóm xe tải thiện nguyện Nhất Tâm nhận đưa đón bệnh nhân chạy thận hoặc khám bệnh nặng cần di chuyển xe lăn. Xin hãy gọi điện đặt lịch trước ít nhất 1 ngày."
  },
  {
    id: "conn-8",
    name: "Đặng Hoàng Nam",
    type: "tình nguyện viên",
    typeLabel: "Tình nguyện viên",
    location: "Bình Thủy, Cần Thơ",
    region: "Cần Thơ",
    supportType: "Hỗ trợ học tập",
    description: "Lập trình viên hướng dẫn dạy tin học cơ bản, kỹ năng sử dụng máy tính, Word, Excel và lập trình căn bản cho NKT muốn học nghề.",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    email: "hoangnam.dev@hoanhap.org",
    phone: "0907123987",
    availability: "Tối Thứ 7 và cả ngày Chủ Nhật",
    details: "Tôi nhận hướng dẫn sử dụng máy tính chạy phần mềm đọc màn hình cho người khiếm thị hoặc kỹ năng gõ bàn phím bằng một tay cho người khuyết tật vận động."
  }
];

const ITEMS_PER_PAGE = 3;

// ─── Reusable Accessible Focus Trap Modal Component ─────────────
function FocusTrapModal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableSelectors = 'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableElements = modal.querySelectorAll(focusableSelectors);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const originalFocus = document.activeElement;

    // Set initial focus
    if (firstElement) {
      setTimeout(() => firstElement.focus(), 50);
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCloseRef.current();
        return;
      }

      if (e.key === "Tab") {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
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
      if (originalFocus && typeof originalFocus.focus === 'function') {
        originalFocus.focus();
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-surface dark:bg-tertiary border-2 border-outline dark:border-outline-variant w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-outline-variant/50 bg-primary text-on-primary">
          <h2 id="modal-title" className="font-bold text-lg">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Đóng hộp thoại"
            className="w-10 h-10 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors accessibility-focus"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-grow text-on-surface dark:text-inverse-on-surface leading-relaxed text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function ConnectionPage({ isTab = false }) {
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "connections"), where("status", "==", "approved"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setConnections(list);
    });
    return unsubscribe;
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSupportType, setSelectedSupportType] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Modal active states
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Form states inside contact modal
  const [contactForm, setContactForm] = useState({ name: "", contactInfo: "", message: "" });
  const [contactSuccess, setContactSuccess] = useState(false);

  // Form states inside register volunteer modal
  const [regForm, setRegForm] = useState({
    name: "",
    phone: "",
    email: "",
    supportType: "Vận chuyển",
    region: "Hà Nội",
    availability: "",
    details: ""
  });
  const [regSuccess, setRegSuccess] = useState(false);

  // Filter submit or change trigger
  const handleFilterSubmit = (e) => {
    if (e) e.preventDefault();
    setCurrentPage(1); // Reset page to 1
  };

  // Filter matching
  const filteredConnections = useMemo(() => {
    return connections.filter((conn) => {
      const matchesSearch =
        searchQuery === "" ||
        conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conn.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRegion =
        selectedRegion === "" ||
        conn.region.toLowerCase() === selectedRegion.toLowerCase();

      const matchesSupport =
        selectedSupportType === "" ||
        conn.supportType.toLowerCase() === selectedSupportType.toLowerCase();

      return matchesSearch && matchesRegion && matchesSupport;
    });
  }, [connections, searchQuery, selectedRegion, selectedSupportType]);

  // Page slice
  const paginatedConnections = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredConnections.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredConnections, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredConnections.length / ITEMS_PER_PAGE));

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactForm({ name: "", contactInfo: "", message: "" });
    setTimeout(() => {
      setContactSuccess(false);
      setSelectedContact(null);
    }, 2000);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    const newVol = {
      name: regForm.name,
      type: "tình nguyện viên",
      typeLabel: "Tình nguyện viên",
      location: `${regForm.region}`,
      region: regForm.region,
      supportType: regForm.supportType,
      description: regForm.details || "Tình nguyện viên vừa tham gia hỗ trợ cộng đồng.",
      avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      email: regForm.email,
      phone: regForm.phone,
      availability: regForm.availability || "Thỏa thuận",
      details: regForm.details,
      status: "pending" // Needs Admin approval
    };

    try {
      await addDoc(collection(db, "connections"), newVol);
    } catch (err) {
      console.error("Failed to register volunteer:", err);
      alert("Đăng ký không thành công. Vui lòng thử lại sau.");
      return;
    }

    setRegSuccess(true);
    setRegForm({
      name: "",
      phone: "",
      email: "",
      supportType: "Vận chuyển",
      region: "Hà Nội",
      availability: "",
      details: ""
    });

    setTimeout(() => {
      setRegSuccess(false);
      setIsRegisterOpen(false);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-20">
      
      {/* ─── Hero Section ─── */}
      {!isTab && (
        <section className="relative w-full min-h-[360px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-overlay">
            <img
              alt="Đồ họa hình trái tim kết nối cộng đồng"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1200"
            />
          </div>
          <div className="absolute inset-0 z-0 bg-black/40"></div>
          <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-12 md:py-16">
            <div className="max-w-2xl">
              <h1 className="font-headline-xl text-headline-xl text-white dark:text-on-primary-fixed mb-4 drop-shadow-md">
                Kết nối yêu thương
              </h1>
              <p className="font-body-lg text-body-lg text-white/95 dark:text-on-primary-fixed/90 mb-8 leading-relaxed drop-shadow-md">
                Nơi kết nối bạn với những tấm lòng hảo tâm và cộng đồng sẵn sàng hỗ trợ, chia sẻ những khó khăn trong cuộc sống thường nhật.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  onClick={() => setIsRegisterOpen(true)}
                  className="h-14 px-8 rounded-full shadow-lg"
                >
                  Tham gia kết nối
                </Button>
                <button
                  onClick={() => {
                    const el = document.getElementById("search-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="h-14 px-8 border-2 border-on-primary-container dark:border-outline text-on-primary-container dark:text-on-primary-fixed font-semibold rounded-full hover:bg-on-primary-container hover:text-primary transition-all accessibility-focus"
                >
                  Tìm hiểu thêm
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Search & Filters Panel ─── */}
      <section id="search-section" className={`max-w-[1440px] mx-auto px-gutter ${isTab ? "py-8" : "py-12"}`}>
        <form
          onSubmit={handleFilterSubmit}
          className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-end gap-6 theme-transition"
        >
          {/* Text Input Search */}
          <div className="w-full md:w-1/3">
            <label htmlFor="search-input" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
              Tìm kiếm tên tổ chức/cá nhân
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline" aria-hidden="true">
                search
              </span>
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-4 h-14 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface"
                placeholder="Tên cộng đồng, tình nguyện viên..."
              />
            </div>
          </div>

          {/* Region Select */}
          <div className="w-full md:w-1/4">
            <label htmlFor="region-select" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
              Khu vực
            </label>
            <select
              id="region-select"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-14 px-4 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface cursor-pointer"
            >
              <option value="">Tất cả khu vực</option>
              <option value="Hà Nội">Hà Nội</option>
              <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
              <option value="Đà Nẵng">Đà Nẵng</option>
              <option value="Cần Thơ">Cần Thơ</option>
            </select>
          </div>

          {/* Support Type Select */}
          <div className="w-full md:w-1/4">
            <label htmlFor="support-select" className="block text-label-large font-bold text-on-surface dark:text-tertiary-fixed mb-2">
              Loại hình hỗ trợ
            </label>
            <select
              id="support-select"
              value={selectedSupportType}
              onChange={(e) => {
                setSelectedSupportType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-14 px-4 rounded-xl border-2 border-outline-variant dark:border-outline focus:border-primary bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface cursor-pointer"
            >
              <option value="">Tất cả loại hình</option>
              <option value="Vận chuyển">Vận chuyển</option>
              <option value="Chăm sóc">Chăm sóc</option>
              <option value="Hướng dẫn thủ tục">Hướng dẫn thủ tục</option>
              <option value="Hỗ trợ học tập">Hỗ trợ học tập</option>
            </select>
          </div>

          {/* Action Button */}
          <Button
            type="submit"
            variant="primary"
            icon="filter_list"
            className="w-full md:w-auto h-14 px-8 rounded-xl font-bold"
          >
            Lọc kết quả
          </Button>
        </form>
      </section>

      {/* ─── Connection Profile Grid ─── */}
      <section className="max-w-[1440px] mx-auto px-gutter">
        <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface mb-8 flex items-center gap-3">
          <Icon name="favorite" className="text-4xl text-secondary dark:text-inverse-primary" filled />
          Danh sách kết nối hiện có
        </h2>

        {paginatedConnections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedConnections.map((conn) => (
              <div
                key={conn.id}
                className="bg-surface-container-lowest dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 hover:border-primary dark:hover:border-inverse-primary transition-all duration-200 shadow-sm flex flex-col justify-between theme-transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-fixed border-2 border-outline-variant dark:border-outline flex-shrink-0">
                      <img
                        className="w-full h-full object-cover"
                        src={conn.avatarUrl}
                        alt={`Ảnh đại diện của ${conn.name}`}
                      />
                    </div>
                    <span
                      role="status"
                      aria-label={`Loại hồ sơ: ${conn.typeLabel}`}
                      className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                        conn.type === "tình nguyện viên"
                          ? "bg-secondary-fixed text-on-secondary-fixed dark:bg-on-secondary-fixed-variant dark:text-secondary-fixed"
                          : "bg-primary-fixed text-on-primary-fixed dark:bg-on-primary-fixed-variant dark:text-primary-fixed"
                      }`}
                    >
                      {conn.typeLabel}
                    </span>
                  </div>

                  <h3 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface mb-2 truncate">
                    {conn.name}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-outline dark:text-tertiary-fixed-dim mb-4">
                    <Icon name="location_on" size="text-sm" />
                    <span className="text-sm font-semibold">{conn.location}</span>
                  </div>

                  <p className="font-body-md text-body-md text-on-surface-variant dark:text-tertiary-fixed-dim mb-6 line-clamp-3 min-h-[84px]">
                    {conn.description}
                  </p>
                </div>

                <div className="flex gap-4 border-t border-outline-variant/30 pt-4">
                  <Button
                    variant="primary"
                    onClick={() => setSelectedContact(conn)}
                    className="flex-1 h-12 text-sm rounded-lg"
                  >
                    Liên hệ ngay
                  </Button>
                  <button
                    onClick={() => setSelectedProfile(conn)}
                    aria-label={`Xem chi tiết hồ sơ của ${conn.name}`}
                    className="h-12 w-12 border-2 border-outline-variant dark:border-outline flex items-center justify-center rounded-lg text-on-surface dark:text-inverse-on-surface hover:bg-surface-container dark:hover:bg-tertiary-container transition-all accessibility-focus"
                  >
                    <Icon name="visibility" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-8 theme-transition">
            <Icon name="search_off" size="text-5xl" className="text-outline mb-4" />
            <h3 className="font-bold text-headline-md text-on-surface dark:text-inverse-on-surface">Không tìm thấy kết nối phù hợp</h3>
            <p className="text-body-medium text-on-surface-variant dark:text-tertiary-fixed-dim mt-2">
              Bạn hãy thử thay đổi từ khóa tìm kiếm hoặc chọn lọc khu vực/loại hình hỗ trợ khác.
            </p>
          </div>
        )}

        {/* ─── Pagination Module ─── */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Trang trước"
              className="w-12 h-12 rounded-full border-2 border-outline-variant dark:border-outline flex items-center justify-center text-outline dark:text-tertiary-fixed-dim hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-outline-variant transition-all accessibility-focus"
            >
              <Icon name="chevron_left" />
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    aria-current={currentPage === pageNum ? "page" : undefined}
                    aria-label={`Trang ${pageNum}`}
                    className={`w-12 h-12 rounded-full font-bold transition-all accessibility-focus ${
                      currentPage === pageNum
                        ? "bg-primary text-on-primary border-2 border-primary"
                        : "border-2 border-outline-variant dark:border-outline hover:bg-surface-container-high dark:hover:bg-tertiary-container text-on-surface dark:text-inverse-on-surface"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
              className="w-12 h-12 rounded-full border-2 border-outline-variant dark:border-outline flex items-center justify-center text-outline dark:text-tertiary-fixed-dim hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-outline-variant transition-all accessibility-focus"
            >
              <Icon name="chevron_right" />
            </button>
          </div>
        )}
      </section>

      {/* ─── Call to Action (CTA) ─── */}
      <section className="w-full bg-surface-container dark:bg-tertiary/40 border-y border-outline-variant/30 py-16 md:py-20 mt-16 theme-transition">
        <div className="max-w-[1440px] mx-auto px-gutter">
          <div className="bg-surface dark:bg-tertiary rounded-3xl p-8 md:p-14 border-2 border-outline-variant dark:border-outline flex flex-col md:flex-row items-center gap-12 relative overflow-hidden shadow-xl theme-transition">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
            <div className="md:w-3/5 relative z-10 text-center md:text-left">
              <h2 className="font-headline-xl text-headline-lg md:text-headline-xl text-primary dark:text-inverse-primary mb-6">
                Bạn muốn chia sẻ yêu thương?
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant dark:text-tertiary-fixed-dim mb-8 leading-relaxed">
                Mỗi sự giúp đỡ, dù nhỏ nhất, cũng góp phần xây dựng một cộng đồng bình đẳng và hạnh phúc hơn. Hãy đăng ký trở thành tình nguyện viên ngay hôm nay!
              </p>
              <Button
                variant="danger"
                onClick={() => setIsRegisterOpen(true)}
                className="h-16 px-10 rounded-full text-headline-md shadow-lg active:scale-95 transition-all"
              >
                Đăng ký giúp đỡ
              </Button>
            </div>
            
            <div className="md:w-2/5 flex justify-center relative z-10">
              <div className="w-64 h-64 bg-primary-fixed dark:bg-on-primary-fixed-variant rounded-3xl flex items-center justify-center transform rotate-6 border-4 border-white dark:border-outline shadow-2xl">
                <Icon
                  name="volunteer_activism"
                  size="text-8xl"
                  className="text-primary dark:text-primary-fixed rotate-12"
                  filled
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         MODALS (FOCUS TRAPPED)
         ═══════════════════════════════════════════════════════════════ */}

      {/* A. CONTACT MODAL (LIÊN HỆ NGAY) */}
      <FocusTrapModal
        isOpen={!!selectedContact}
        onClose={() => setSelectedContact(null)}
        title={`Liên hệ với ${selectedContact?.name}`}
      >
        {contactSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center mx-auto shadow-md">
              <Icon name="check" size="text-3xl" />
            </div>
            <h3 className="font-bold text-lg">Đã gửi tin nhắn liên hệ!</h3>
            <p className="text-on-surface-variant dark:text-tertiary-fixed-dim">
              Cảm ơn bạn. Yêu cầu liên hệ đã được gửi đến {selectedContact?.name}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="p-4 bg-surface-container dark:bg-tertiary-container/30 rounded-xl space-y-2 border border-outline-variant/30">
              <p className="flex items-center gap-2">
                <Icon name="phone" className="text-primary" />
                Số điện thoại: <strong className="ml-1">{selectedContact?.phone}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Icon name="mail" className="text-primary" />
                Email: <strong className="ml-1">{selectedContact?.email}</strong>
              </p>
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-name" className="block font-bold text-xs">
                Họ và tên của bạn
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-info" className="block font-bold text-xs">
                Email hoặc Số điện thoại liên hệ
              </label>
              <input
                id="contact-info"
                type="text"
                required
                value={contactForm.contactInfo}
                onChange={(e) => setContactForm((f) => ({ ...f, contactInfo: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                placeholder="example@gmail.com hoặc 09..."
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="contact-msg" className="block font-bold text-xs">
                Nội dung lời nhắn
              </label>
              <textarea
                id="contact-msg"
                rows="4"
                required
                value={contactForm.message}
                onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                placeholder={`Chào ${selectedContact?.name}, tôi cần hỗ trợ về loại hình ${selectedContact?.supportType}...`}
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                Gửi liên hệ
              </Button>
              <Button type="button" variant="secondary" onClick={() => setSelectedContact(null)} className="flex-1">
                Hủy
              </Button>
            </div>
          </form>
        )}
      </FocusTrapModal>

      {/* B. PROFILE DETAIL MODAL (XEM CHI TIẾT) */}
      <FocusTrapModal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title="Thông tin chi tiết hồ sơ kết nối"
      >
        {selectedProfile && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b border-outline-variant/30 pb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-primary-fixed border-2 border-outline-variant">
                <img
                  className="w-full h-full object-cover"
                  src={selectedProfile.avatarUrl}
                  alt={`Ảnh chân dung của ${selectedProfile.name}`}
                />
              </div>
              <div>
                <h3 className="font-bold text-xl text-on-surface dark:text-inverse-on-surface">
                  {selectedProfile.name}
                </h3>
                <span className="inline-block mt-1 px-3 py-0.5 text-xs font-semibold bg-primary-fixed text-on-primary-fixed rounded-full capitalize">
                  {selectedProfile.typeLabel}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">
                  Khu vực hỗ trợ
                </h4>
                <p className="mt-1 font-semibold flex items-center gap-1">
                  <Icon name="location_on" size="text-base" className="text-primary" />
                  {selectedProfile.location}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">
                  Loại hình hỗ trợ chuyên biệt
                </h4>
                <p className="mt-1 font-semibold flex items-center gap-1">
                  <Icon name="volunteer_activism" size="text-base" className="text-primary" />
                  {selectedProfile.supportType}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">
                  Thời gian sẵn sàng hỗ trợ
                </h4>
                <p className="mt-1 font-semibold flex items-center gap-1">
                  <Icon name="schedule" size="text-base" className="text-primary" />
                  {selectedProfile.availability}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">
                  Mô tả & Phạm vi giúp đỡ
                </h4>
                <p className="mt-1.5 leading-relaxed bg-surface-container dark:bg-tertiary-container/20 p-4 rounded-xl border border-outline-variant/30">
                  {selectedProfile.details}
                </p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-outline-variant/30">
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedProfile(null);
                  setSelectedContact(selectedProfile);
                }}
                className="flex-1"
              >
                Liên hệ trực tiếp
              </Button>
              <Button variant="secondary" onClick={() => setSelectedProfile(null)} className="flex-1">
                Đóng
              </Button>
            </div>
          </div>
        )}
      </FocusTrapModal>

      {/* C. REGISTER VOLUNTEER MODAL (ĐĂNG KÝ HỖ TRỢ) */}
      <FocusTrapModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Đăng ký hỗ trợ người khuyết tật"
      >
        {regSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center mx-auto shadow-md">
              <Icon name="check" size="text-3xl" />
            </div>
            <h3 className="font-bold text-lg">Đăng ký thành công!</h3>
            <p className="text-on-surface-variant dark:text-tertiary-fixed-dim">
              Cảm ơn tấm lòng của bạn. Hồ sơ kết nối của bạn đã được thêm thành công vào danh sách hiển thị toàn quốc.
            </p>
          </div>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mb-4 leading-relaxed">
              Bạn có thể chọn đăng ký dưới tư cách cá nhân (Tình nguyện viên) hoặc tổ chức (Cộng đồng) để chung tay giúp đỡ.
            </p>

            <div className="space-y-1">
              <label htmlFor="reg-name" className="block font-bold text-xs">
                Tên cá nhân / Tổ chức của bạn <span className="text-error">*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                required
                value={regForm.name}
                onChange={(e) => setRegForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                placeholder="Ví dụ: Câu lạc bộ thiện nguyện Sinh viên..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="reg-phone" className="block font-bold text-xs">
                  Số điện thoại <span className="text-error">*</span>
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  required
                  value={regForm.phone}
                  onChange={(e) => setRegForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                  placeholder="09..."
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-email" className="block font-bold text-xs">
                  Email liên hệ <span className="text-error">*</span>
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label htmlFor="reg-support" className="block font-bold text-xs">
                  Loại hình hỗ trợ <span className="text-error">*</span>
                </label>
                <select
                  id="reg-support"
                  value={regForm.supportType}
                  onChange={(e) => setRegForm((f) => ({ ...f, supportType: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary cursor-pointer"
                >
                  <option value="Vận chuyển">Vận chuyển</option>
                  <option value="Chăm sóc">Chăm sóc</option>
                  <option value="Hướng dẫn thủ tục">Hướng dẫn thủ tục</option>
                  <option value="Hỗ trợ học tập">Hỗ trợ học tập</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="reg-region" className="block font-bold text-xs">
                  Khu vực sinh sống <span className="text-error">*</span>
                </label>
                <select
                  id="reg-region"
                  value={regForm.region}
                  onChange={(e) => setRegForm((f) => ({ ...f, region: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary cursor-pointer"
                >
                  {VIETNAM_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-avail" className="block font-bold text-xs">
                Thời gian rảnh nhận hỗ trợ
              </label>
              <input
                id="reg-avail"
                type="text"
                value={regForm.availability}
                onChange={(e) => setRegForm((f) => ({ ...f, availability: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                placeholder="Ví dụ: Rảnh cả ngày Thứ Bảy và Chủ Nhật"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="reg-details" className="block font-bold text-xs">
                Mô tả kinh nghiệm / Phạm vi giúp đỡ
              </label>
              <textarea
                id="reg-details"
                rows="3"
                value={regForm.details}
                onChange={(e) => setRegForm((f) => ({ ...f, details: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface dark:bg-tertiary"
                placeholder="Mô tả kỹ năng, phương tiện bạn có thể tự chuẩn bị, số lượng người có thể hỗ trợ..."
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" variant="primary" className="flex-1">
                Gửi đăng ký
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsRegisterOpen(false)} className="flex-1">
                Hủy
              </Button>
            </div>
          </form>
        )}
      </FocusTrapModal>

    </div>
  );
}
