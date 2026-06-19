import { useState, useEffect } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { useLanguage } from "../contexts/LanguageContext";
import Icon from "../components/ui/Icon";
import { db } from "../services/firebase";
import { doc, collection, onSnapshot } from "firebase/firestore";

export default function SocialAllowancePage() {
  const { speakText } = useAccessibility();
  const { language, t } = useLanguage();

  // Load base rate and welfare offices dynamically from Firestore
  const [baseRate, setBaseRate] = useState(360000);
  const [offices, setOffices] = useState([]);

  useEffect(() => {
    // 1. Sync system allowance standard rate
    const settingsRef = doc(db, "settings", "system");
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.allowanceBaseRate !== undefined) {
          setBaseRate(Number(data.allowanceBaseRate));
        }
      }
    });

    // 2. Sync municipal welfare offices list
    const unsubscribeOffices = onSnapshot(collection(db, "welfareOffices"), (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setOffices(list);
    });

    return () => {
      unsubscribeSettings();
      unsubscribeOffices();
    };
  }, []);

  // Calculator inputs
  const [level, setLevel] = useState("dac-biet-nang");
  const [ageGroup, setAgeGroup] = useState("truong-thanh");
  const [needsCare, setNeedsCare] = useState(false);
  const [careForSeverelyDisabled, setCareForSeverelyDisabled] = useState(false);

  // Result state
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [calculationBreakdown, setCalculationBreakdown] = useState("");

  // Checklists
  const [checklist, setChecklist] = useState({
    doc1: false,
    doc2: false,
    doc3: false,
    doc4: false,
    doc5: false,
  });

  // Calculate allowance
  useEffect(() => {
    let multiplier = 0;
    let details = "";

    if (level === "dac-biet-nang") {
      if (ageGroup === "duoi-16") {
        multiplier = 2.5;
        details = language === "en"
          ? "Severely disabled person under 16 years old (Multiplier 2.5)"
          : "Người khuyết tật đặc biệt nặng dưới 16 tuổi (Hệ số 2.5)";
      } else if (ageGroup === "tren-60") {
        multiplier = 2.5;
        details = language === "en"
          ? "Severely disabled elderly person (Multiplier 2.5)"
          : "Người khuyết tật đặc biệt nặng là người cao tuổi (Hệ số 2.5)";
      } else {
        multiplier = 2.0;
        details = language === "en"
          ? "Severely disabled person in working age (Multiplier 2.0)"
          : "Người khuyết tật đặc biệt nặng đang trong độ tuổi lao động (Hệ số 2.0)";
      }
    } else if (level === "nang") {
      if (ageGroup === "duoi-16") {
        multiplier = 2.0;
        details = language === "en"
          ? "Heavy disabled person under 16 years old (Multiplier 2.0)"
          : "Người khuyết tật nặng dưới 16 tuổi (Hệ số 2.0)";
      } else if (ageGroup === "tren-60") {
        multiplier = 2.0;
        details = language === "en"
          ? "Heavy disabled elderly person (Multiplier 2.0)"
          : "Người khuyết tật nặng là người cao tuổi (Hệ số 2.0)";
      } else {
        multiplier = 1.5;
        details = language === "en"
          ? "Heavy disabled person in working age (Multiplier 1.5)"
          : "Người khuyết tật nặng đang trong độ tuổi lao động (Hệ số 1.5)";
      }
    } else {
      multiplier = 0.0;
      details = language === "en"
        ? "Mild disabled person (No monthly cash allowance eligibility)"
        : "Người khuyết tật nhẹ (Không hưởng trợ cấp hàng tháng)";
    }

    let allowanceVal = multiplier * baseRate;
    let extraVal = 0;
    let extraDetails = [];

    if (level === "dac-biet-nang") {
      if (needsCare) {
        extraVal += 1.5 * baseRate;
        extraDetails.push(
          language === "en"
            ? "Special care support (Multiplier 1.5)"
            : "Cần hỗ trợ chăm sóc đặc biệt (Hệ số 1.5)"
        );
      }
    }

    if (careForSeverelyDisabled) {
      extraVal += 1.0 * baseRate;
      extraDetails.push(
        language === "en"
          ? "Household caring for severely disabled individual (Multiplier 1.0)"
          : "Hộ gia đình nhận chăm sóc người khuyết tật đặc biệt nặng (Hệ số 1.0)"
      );
    }

    const total = allowanceVal + extraVal;
    let breakdown = `${details}: ${allowanceVal.toLocaleString("vi-VN")} đ`;
    if (extraDetails.length > 0) {
      breakdown += ` + ${extraDetails.join(" + ")}: ${extraVal.toLocaleString("vi-VN")} đ`;
    }

    setMonthlyTotal(total);
    setCalculationBreakdown(breakdown);
  }, [level, ageGroup, needsCare, careForSeverelyDisabled, baseRate, language]);

  // TTS Read aloud calculation result
  const handleReadCalculation = () => {
    const text = language === "en"
      ? `Calculation results: Your estimated monthly allowance is ${monthlyTotal.toLocaleString("vi-VN")} VND. Breakdown details: ${calculationBreakdown}. The current base rate applied is ${baseRate.toLocaleString("vi-VN")} VND.`
      : `Kết quả tính toán: Mức trợ cấp dự kiến là ${monthlyTotal.toLocaleString("vi-VN")} đồng mỗi tháng. Chi tiết bao gồm: ${calculationBreakdown}. Mức chuẩn trợ cấp hiện hành được áp dụng là ${baseRate.toLocaleString("vi-VN")} đồng.`;
    speakText(text);
  };

  // Toggle checklist
  const toggleDoc = (key) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };



  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-[#1c1f26] bg-dots-pattern theme-transition pb-24 animate-[fadeIn_0.2s_ease-out]">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[260px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-20 mix-blend-overlay">
          <img
            alt="Social security vector"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-10">
          <div className="max-w-3xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              {t("allowance_title")}
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed">
              {t("allowance_hero_desc")}
            </p>
          </div>
        </div>
      </section>

      {/* ─── News Ticker ─── */}
      <section className="bg-amber-100 dark:bg-amber-950/40 border-y border-amber-300 dark:border-amber-900 py-3 px-gutter theme-transition">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center gap-3">
          <span className="bg-amber-600 text-white dark:bg-amber-500 dark:text-black font-bold text-xs uppercase px-2.5 py-1 rounded flex items-center gap-1.5 shrink-0">
            <Icon name="campaign" size="text-sm" />
            {t("allowance_ticker_badge")}
          </span>
          <div className="overflow-hidden relative w-full text-sm font-semibold text-amber-900 dark:text-amber-200">
            <p className="animate-[pulse_2s_infinite] text-center md:text-left">
              {t("allowance_ticker")}
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-gutter grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
        {/* ─── Cột 1 & 2: Calculator & Procedures ─── */}
        <div className="lg:col-span-2 space-y-10">
          {/* Section: Calculator */}
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary mb-6 flex items-center gap-3">
              <Icon name="calculate" className="text-primary dark:text-inverse-primary" />
              {t("allowance_calc_title")}
            </h2>
            
            <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim mb-8">
              {t("allowance_calc_desc")}: <strong className="text-primary dark:text-inverse-primary">{baseRate.toLocaleString("vi-VN")} đ/{language === "en" ? "month" : "tháng"}</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Disability Level Selection */}
              <div>
                <label htmlFor="calc-level" className="block text-sm font-bold text-on-surface dark:text-inverse-on-surface mb-2">
                  {t("allowance_calc_level")}
                </label>
                <select
                  id="calc-level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                >
                  <option value="dac-biet-nang">{t("allowance_calc_level_special")}</option>
                  <option value="nang">{t("allowance_calc_level_heavy")}</option>
                  <option value="nhe">{t("allowance_calc_level_mild")}</option>
                </select>
              </div>

              {/* Age Group Selection */}
              <div>
                <label htmlFor="calc-age" className="block text-sm font-bold text-on-surface dark:text-inverse-on-surface mb-2">
                  {t("allowance_calc_age")}
                </label>
                <select
                  id="calc-age"
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                >
                  <option value="duoi-16">{t("allowance_calc_age_child")}</option>
                  <option value="truong-thanh">{t("allowance_calc_age_adult")}</option>
                  <option value="tren-60">{t("allowance_calc_age_elderly")}</option>
                </select>
              </div>
            </div>

            {/* Care allowance checkboxes */}
            <div className="space-y-4 mb-8 bg-surface-container-low dark:bg-tertiary/40 border border-outline-variant/50 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-on-surface dark:text-inverse-on-surface mb-2">{t("allowance_calc_extra_title")}</h3>
              
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="calc-care"
                  checked={needsCare}
                  disabled={level !== "dac-biet-nang"}
                  onChange={(e) => setNeedsCare(e.target.checked)}
                  className="w-5 h-5 rounded border-outline text-primary focus:ring-primary mt-1 disabled:opacity-50"
                />
                <label htmlFor="calc-care" className={`text-sm text-on-surface-variant dark:text-tertiary-fixed-dim select-none ${level !== "dac-biet-nang" ? "opacity-50" : ""}`}>
                  {t("allowance_calc_extra_care")}
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="calc-care-family"
                  checked={careForSeverelyDisabled}
                  onChange={(e) => setCareForSeverelyDisabled(e.target.checked)}
                  className="w-5 h-5 rounded border-outline text-primary focus:ring-primary mt-1"
                />
                <label htmlFor="calc-care-family" className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim select-none">
                  {t("allowance_calc_extra_family")}
                </label>
              </div>
            </div>

            {/* Results box */}
            <div className="bg-primary-container/20 dark:bg-primary-fixed-dim/10 border-2 border-primary/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-xs font-bold text-primary dark:text-inverse-primary uppercase tracking-wider mb-1">
                  {t("allowance_calc_result_badge")}
                </p>
                <div className="text-3xl font-extrabold text-[#00E5FF] dark:text-[#00E5FF] drop-shadow-md">
                  {monthlyTotal.toLocaleString("vi-VN")} <span className="text-xl font-normal">đ/{language === "en" ? "month" : "tháng"}</span>
                </div>
                <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-2 leading-relaxed">
                  {language === "en" ? "Breakdown" : "Chi tiết"}: {calculationBreakdown}
                </p>
              </div>

              <button
                onClick={handleReadCalculation}
                className="bg-primary text-on-primary font-bold px-5 py-3.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm flex items-center gap-2 accessibility-focus shrink-0 active:scale-95 text-sm"
              >
                <Icon name="volume_up" />
                {t("allowance_calc_result_btn")}
              </button>
            </div>
          </div>

          {/* Section: Procedures Guide */}
          <div className="glass-card rounded-3xl p-6 md:p-8">
            <h2 className="font-headline-md text-headline-md text-on-surface dark:text-inverse-on-surface mb-6 flex items-center gap-3">
              <Icon name="assignment" className="text-primary dark:text-inverse-primary" />
              {t("allowance_proc_title")}
            </h2>

            <div className="relative border-l-2 border-primary/30 dark:border-outline ml-4 space-y-8 py-2">
              {/* Step 1 */}
              <div className="relative pl-8 focus-visible:outline-none group" tabIndex={0}>
                <span className="absolute -left-4 top-4 w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm shadow-sm transition-transform group-focus-visible:scale-110">
                  1
                </span>
                <div className="bg-surface-container-low dark:bg-tertiary-container/30 border border-outline-variant/50 rounded-2xl p-4 shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-primary transition-all">
                  <h3 className="font-bold text-on-surface dark:text-inverse-on-surface text-base mb-1">
                    {language === "en" ? "Determine Disability Level" : "Xác định mức độ khuyết tật"}
                  </h3>
                  <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
                    {language === "en"
                      ? "The disabled person or guardian submits a request to the local commune-level Disability Assessment Council to undergo medical evaluation and receive a Disability Level Certificate."
                      : "Người khuyết tật hoặc người giám hộ làm đơn đề nghị gửi Hội đồng xác định mức độ khuyết tật cấp xã nơi cư trú để được khám và cấp Giấy xác nhận mức độ khuyết tật."}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative pl-8 focus-visible:outline-none group" tabIndex={0}>
                <span className="absolute -left-4 top-4 w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm shadow-sm transition-transform group-focus-visible:scale-110">
                  2
                </span>
                <div className="bg-surface-container-low dark:bg-tertiary-container/30 border border-outline-variant/50 rounded-2xl p-4 shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-primary transition-all">
                  <h3 className="font-bold text-on-surface dark:text-inverse-on-surface text-base mb-1">
                    {language === "en" ? "Prepare Required Documents" : "Chuẩn bị đầy đủ hồ sơ giấy tờ"}
                  </h3>
                  <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
                    {language === "en"
                      ? "Prepare forms, certificates, and copies of identification files according to the Checklist listed on the right side of this page."
                      : "Chuẩn bị tờ khai, giấy xác nhận và bản sao các tài liệu tùy thân theo danh sách yêu cầu chuẩn bị phía bên phải trang này."}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative pl-8 focus-visible:outline-none group" tabIndex={0}>
                <span className="absolute -left-4 top-4 w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm shadow-sm transition-transform group-focus-visible:scale-110">
                  3
                </span>
                <div className="bg-surface-container-low dark:bg-tertiary-container/30 border border-outline-variant/50 rounded-2xl p-4 shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-primary transition-all">
                  <h3 className="font-bold text-on-surface dark:text-inverse-on-surface text-base mb-1">
                    {language === "en" ? "Submit Dossier" : "Nộp hồ sơ cho cơ quan tiếp nhận"}
                  </h3>
                  <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
                    {language === "en"
                      ? "Submit directly to the One-Stop-Shop administrative department of the local commune-level People's Committee, or submit online via the provincial public service portal."
                      : "Nộp trực tiếp tại Bộ phận Tiếp nhận và Trả kết quả của UBND cấp xã (phường/thị trấn) hoặc nộp trực tuyến qua Cổng dịch vụ công của địa phương."}
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative pl-8 focus-visible:outline-none group" tabIndex={0}>
                <span className="absolute -left-4 top-4 w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm shadow-sm transition-transform group-focus-visible:scale-110">
                  4
                </span>
                <div className="bg-surface-container-low dark:bg-tertiary-container/30 border border-outline-variant/50 rounded-2xl p-4 shadow-sm group-focus-visible:ring-2 group-focus-visible:ring-primary transition-all">
                  <h3 className="font-bold text-on-surface dark:text-inverse-on-surface text-base mb-1">
                    {language === "en" ? "Approval & Allowance Payout" : "Thẩm định hồ sơ và Nhận trợ cấp"}
                  </h3>
                  <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
                    {language === "en"
                      ? "Within 15-20 working days from receiving valid documents, the district-level Department of Labor, Invalids and Social Affairs will issue an approval decision for monthly social allowance."
                      : "Trong vòng 15-20 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ, Phòng Lao động - Thương binh & Xã hội cấp quận/huyện sẽ ra quyết định chi trả trợ cấp xã hội hàng tháng."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Cột 3: Documents Checklist & Locations ─── */}
        <div className="space-y-10">
          {/* Section: Checklist */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface mb-4 flex items-center gap-2">
              <Icon name="fact_check" className="text-primary" />
              {t("allowance_docs_title")}
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mb-6">
              {t("allowance_docs_desc")}
            </p>

            <div className="space-y-4">
              <div
                onClick={() => toggleDoc("doc1")}
                className="flex items-start gap-3 p-3 bg-surface-container-low dark:bg-tertiary/40 border border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary/50 transition-all select-none"
              >
                <input
                  type="checkbox"
                  checked={checklist.doc1}
                  readOnly
                  className="w-5 h-5 rounded border-outline text-primary pointer-events-none mt-0.5"
                />
                <span className="text-xs font-semibold text-on-surface dark:text-inverse-on-surface leading-normal">
                  {t("allowance_docs_1")}
                </span>
              </div>

              <div
                onClick={() => toggleDoc("doc2")}
                className="flex items-start gap-3 p-3 bg-surface-container-low dark:bg-tertiary/40 border border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary/50 transition-all select-none"
              >
                <input
                  type="checkbox"
                  checked={checklist.doc2}
                  readOnly
                  className="w-5 h-5 rounded border-outline text-primary pointer-events-none mt-0.5"
                />
                <span className="text-xs font-semibold text-on-surface dark:text-inverse-on-surface leading-normal">
                  {t("allowance_docs_2")}
                </span>
              </div>

              <div
                onClick={() => toggleDoc("doc3")}
                className="flex items-start gap-3 p-3 bg-surface-container-low dark:bg-tertiary/40 border border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary/50 transition-all select-none"
              >
                <input
                  type="checkbox"
                  checked={checklist.doc3}
                  readOnly
                  className="w-5 h-5 rounded border-outline text-primary pointer-events-none mt-0.5"
                />
                <span className="text-xs font-semibold text-on-surface dark:text-inverse-on-surface leading-normal">
                  {t("allowance_docs_3")}
                </span>
              </div>

              <div
                onClick={() => toggleDoc("doc4")}
                className="flex items-start gap-3 p-3 bg-surface-container-low dark:bg-tertiary/40 border border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary/50 transition-all select-none"
              >
                <input
                  type="checkbox"
                  checked={checklist.doc4}
                  readOnly
                  className="w-5 h-5 rounded border-outline text-primary pointer-events-none mt-0.5"
                />
                <span className="text-xs font-semibold text-on-surface dark:text-inverse-on-surface leading-normal">
                  {t("allowance_docs_4")}
                </span>
              </div>

              <div
                onClick={() => toggleDoc("doc5")}
                className="flex items-start gap-3 p-3 bg-surface-container-low dark:bg-tertiary/40 border border-outline-variant/40 rounded-xl cursor-pointer hover:border-primary/50 transition-all select-none"
              >
                <input
                  type="checkbox"
                  checked={checklist.doc5}
                  readOnly
                  className="w-5 h-5 rounded border-outline text-primary pointer-events-none mt-0.5"
                />
                <span className="text-xs font-semibold text-on-surface dark:text-inverse-on-surface leading-normal">
                  {t("allowance_docs_5")}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Welfare Office Locations */}
          <div className="glass-card rounded-3xl p-6">
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface mb-6 flex items-center gap-2">
              <Icon name="location_on" className="text-primary" />
              {t("allowance_office_title")}
            </h2>

            <div className="space-y-6">
              {offices.map((office) => (
                <div
                  key={office.name}
                  className="border-b border-outline-variant/50 last:border-b-0 pb-4 last:pb-0"
                >
                  <span className="text-xs font-bold text-primary dark:text-inverse-primary uppercase tracking-wide">
                    {office.city}
                  </span>
                  <h3 className="text-xs font-bold text-on-surface dark:text-inverse-on-surface mt-1">
                    {office.name}
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-2.5 flex items-start gap-1.5 leading-relaxed">
                    <Icon name="place" size="text-sm" className="shrink-0 mt-0.5" />
                    {office.address}
                  </p>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-1.5 flex items-center gap-1.5">
                    <Icon name="phone" size="text-sm" />
                    {office.phone}
                  </p>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mt-1.5 flex items-center gap-1.5 truncate">
                    <Icon name="mail" size="text-sm" />
                    {office.email}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

