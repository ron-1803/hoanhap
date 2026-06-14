import { useState, useCallback } from "react";
import { useAccessibility } from "../contexts/AccessibilityContext";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";

export default function ContactPage() {
  const { state: accessState, speakText } = useAccessibility();
  
  const [form, setForm] = useState({
    name: "",
    contactInfo: "",
    supportField: "Góp ý website",
    isBarrierReport: false,
    subject: "",
    message: ""
  });
  
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const tempErrors = {};
    if (!form.name.trim()) tempErrors.name = "Vui lòng nhập họ và tên";
    if (!form.contactInfo.trim()) {
      tempErrors.contactInfo = "Vui lòng nhập email hoặc số điện thoại";
    }
    if (!form.subject.trim()) tempErrors.subject = "Vui lòng nhập tiêu đề";
    if (!form.message.trim()) tempErrors.message = "Vui lòng nhập nội dung";
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      if (accessState.screenReader) {
        speakText("Biểu mẫu gửi liên hệ có lỗi. Vui lòng kiểm tra lại các trường thông tin.");
      }
      return;
    }

    setSuccess(true);
    const msg = `Đã gửi liên hệ thành công. Xin chào ${form.name}, chúng tôi đã ghi nhận yêu cầu của bạn về lĩnh vực ${form.supportField}. Chúng tôi sẽ phản hồi trong vòng 24 giờ.`;
    if (accessState.screenReader) {
      speakText(msg);
    }

    // Reset Form
    setForm({
      name: "",
      contactInfo: "",
      supportField: "Góp ý website",
      isBarrierReport: false,
      subject: "",
      message: ""
    });
  };

  const handleReadContactInfo = useCallback(() => {
    const contactText = `Cổng thông tin hỗ trợ người khuyết tật Hoà Nhập. Địa chỉ: Tầng 5, Tòa nhà Dịch vụ Công cộng, Cầu Giấy, Hà Nội. Đường dây nóng y tế: 1 9 0 0 6 1 7 9. Đường dây tư vấn pháp lý: 1 9 0 0 6 1 8 0. Đội xe hỗ trợ di chuyển: 0 9 1 2 3 4 5 6 7 8.`;
    speakText(contactText);
  }, [speakText]);

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-24">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[300px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-overlay">
          <img
            alt="Đồ họa hình phong thư và điện thoại hỗ trợ"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-12 md:py-16">
          <div className="max-w-2xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              Liên hệ với chúng tôi
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed">
              Bạn có câu hỏi, đề xuất hoặc muốn báo cáo một rào cản tiếp cận trên website? Hãy kết nối với ban biên tập Cổng thông tin Hoà Nhập.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Main Content Layout ─── */}
      <section className="max-w-[1440px] mx-auto px-gutter py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact info cards */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 md:p-8 shadow-sm theme-transition">
              <h2 className="font-headline-lg text-headline-md text-primary dark:text-inverse-primary mb-6 flex items-center gap-3">
                <Icon name="support_agent" size="text-3xl" className="text-primary dark:text-inverse-primary" />
                Cổng thông tin hỗ trợ
              </h2>
              
              <p className="text-body-medium text-on-surface-variant dark:text-tertiary-fixed-dim mb-8 leading-relaxed">
                Hoà Nhập cung cấp các đường dây nóng tư vấn hoàn toàn miễn phí phục vụ riêng cho người khuyết tật trên toàn quốc.
              </p>

              {/* Hotlines */}
              <div className="space-y-6" role="list">
                <div className="flex items-start gap-4" role="listitem">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0">
                    <Icon name="medical_services" className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface dark:text-inverse-on-surface">Đường dây nóng Y tế</h3>
                    <a
                      href="tel:19006179"
                      className="text-headline-md font-extrabold text-blue-600 dark:text-blue-400 hover:underline block mt-0.5 accessibility-focus"
                    >
                      1900 6179
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4" role="listitem">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center justify-center shrink-0">
                    <Icon name="gavel" className="text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface dark:text-inverse-on-surface">Tư vấn Pháp lý</h3>
                    <a
                      href="tel:19006180"
                      className="text-headline-md font-extrabold text-amber-600 dark:text-amber-400 hover:underline block mt-0.5 accessibility-focus"
                    >
                      1900 6180
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4" role="listitem">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center shrink-0">
                    <Icon name="accessible" className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface dark:text-inverse-on-surface">Đội xe hỗ trợ di chuyển</h3>
                    <a
                      href="tel:0912345678"
                      className="text-headline-md font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline block mt-0.5 accessibility-focus"
                    >
                      0912 345 678
                    </a>
                  </div>
                </div>
              </div>

              <hr className="border-outline-variant/50 my-8" />

              <div className="space-y-4">
                <div className="flex items-start gap-3 text-sm text-on-surface-variant dark:text-tertiary-fixed-dim">
                  <Icon name="location_on" className="text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Địa chỉ:</strong> Tầng 5, Tòa nhà Dịch vụ Công cộng, Cầu Giấy, Hà Nội
                  </span>
                </div>
                <div className="flex items-start gap-3 text-sm text-on-surface-variant dark:text-tertiary-fixed-dim">
                  <Icon name="mail" className="text-primary shrink-0 mt-0.5" />
                  <span>
                    <strong>Email:</strong> lienhe@hoanhap.org
                  </span>
                </div>
              </div>

              {/* Speak contact info button */}
              <div className="mt-8">
                <Button
                  variant="secondary"
                  onClick={handleReadContactInfo}
                  icon="volume_up"
                  className="w-full font-bold h-12 border-2"
                >
                  Đọc thông tin liên hệ
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Accessible Form */}
          <div className="lg:col-span-7">
            <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 md:p-8 shadow-sm theme-transition">
              {success ? (
                <div className="text-center py-16 space-y-6">
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-inner border border-emerald-200 dark:border-emerald-900">
                    <Icon name="check" size="text-4xl" />
                  </div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface">Đã gửi thành công!</h2>
                  <p className="text-body-lg text-on-surface-variant dark:text-tertiary-fixed-dim max-w-md mx-auto leading-relaxed">
                    Cảm ơn ý kiến đóng góp của bạn. Ban quản trị Cổng thông tin Hoà Nhập đã tiếp nhận thông tin và sẽ phản hồi sớm nhất có thể.
                  </p>
                  <div className="pt-4">
                    <Button variant="primary" onClick={() => setSuccess(false)} className="px-8 h-12">
                      Gửi thư mới
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="font-headline-lg text-headline-md text-on-surface dark:text-inverse-on-surface">
                    Gửi tin nhắn hoặc Góp ý
                  </h2>
                  <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
                    Ý kiến của bạn là vô giá đối với sự phát triển của cộng đồng. Các trường có dấu (<span className="text-error">*</span>) là bắt buộc.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="contact-form-name" className="text-label-large font-bold text-on-surface dark:text-inverse-on-surface">
                        Họ và tên <span className="text-error">*</span>
                      </label>
                      <input
                        id="contact-form-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                        className={`w-full h-12 px-4 rounded-xl border-2 bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-primary transition-all
                          ${errors.name ? "border-error" : "border-outline-variant dark:border-outline"}`}
                        placeholder="Nguyễn Văn A"
                        aria-describedby={errors.name ? "name-error" : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="text-error text-xs font-bold flex items-center gap-1">
                          <Icon name="error" size="text-xs" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Email or Phone */}
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="contact-form-info" className="text-label-large font-bold text-on-surface dark:text-inverse-on-surface">
                        Email hoặc Số điện thoại <span className="text-error">*</span>
                      </label>
                      <input
                        id="contact-form-info"
                        type="text"
                        value={form.contactInfo}
                        onChange={(e) => setForm(f => ({ ...f, contactInfo: e.target.value }))}
                        className={`w-full h-12 px-4 rounded-xl border-2 bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-primary transition-all
                          ${errors.contactInfo ? "border-error" : "border-outline-variant dark:border-outline"}`}
                        placeholder="0912xxxxxx hoặc email@example.com"
                        aria-describedby={errors.contactInfo ? "info-error" : undefined}
                      />
                      {errors.contactInfo && (
                        <p id="info-error" className="text-error text-xs font-bold flex items-center gap-1">
                          <Icon name="error" size="text-xs" />
                          {errors.contactInfo}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Support Field */}
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="contact-form-field" className="text-label-large font-bold text-on-surface dark:text-inverse-on-surface">
                        Lĩnh vực quan tâm
                      </label>
                      <select
                        id="contact-form-field"
                        value={form.supportField}
                        onChange={(e) => setForm(f => ({ ...f, supportField: e.target.value }))}
                        className="w-full h-12 px-4 rounded-xl border-2 border-outline-variant dark:border-outline bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-primary transition-all cursor-pointer"
                      >
                        <option value="Góp ý website">Góp ý, phản ánh lỗi website</option>
                        <option value="Hỗ trợ y tế">Chăm sóc sức khỏe & Y tế</option>
                        <option value="Hỗ trợ giáo dục">Học tập & Giáo dục hòa nhập</option>
                        <option value="Hỗ trợ việc làm">Tư vấn & Vay vốn giải quyết việc làm</option>
                        <option value="Hỗ trợ pháp lý">Trợ giúp pháp lý miễn phí</option>
                        <option value="Vận chuyển & Đi lại">Chuyến xe hỗ trợ di chuyển</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col space-y-2">
                      <label htmlFor="contact-form-subject" className="text-label-large font-bold text-on-surface dark:text-inverse-on-surface">
                        Tiêu đề <span className="text-error">*</span>
                      </label>
                      <input
                        id="contact-form-subject"
                        type="text"
                        value={form.subject}
                        onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                        className={`w-full h-12 px-4 rounded-xl border-2 bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-primary transition-all
                          ${errors.subject ? "border-error" : "border-outline-variant dark:border-outline"}`}
                        placeholder="Ví dụ: Góp ý cải tiến giao diện đọc nói"
                        aria-describedby={errors.subject ? "subject-error" : undefined}
                      />
                      {errors.subject && (
                        <p id="subject-error" className="text-error text-xs font-bold flex items-center gap-1">
                          <Icon name="error" size="text-xs" />
                          {errors.subject}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Accessibility barrier checkbox */}
                  <div className="flex items-start gap-3 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/10 rounded-xl">
                    <input
                      id="contact-form-barrier"
                      type="checkbox"
                      checked={form.isBarrierReport}
                      onChange={(e) => setForm(f => ({ ...f, isBarrierReport: e.target.checked }))}
                      className="w-5 h-5 accent-primary border-2 border-primary/30 rounded focus:ring-primary cursor-pointer mt-0.5"
                    />
                    <label htmlFor="contact-form-barrier" className="text-xs font-bold text-on-surface-variant dark:text-tertiary-fixed-dim cursor-pointer leading-relaxed">
                      Tôi muốn báo cáo một rào cản tiếp cận (lỗi hiển thị, đọc nội dung hoặc điều hướng bàn phím) mà tôi gặp phải trên website này.
                    </label>
                  </div>

                  {/* Message details */}
                  <div className="flex flex-col space-y-2">
                    <label htmlFor="contact-form-message" className="text-label-large font-bold text-on-surface dark:text-inverse-on-surface">
                      Nội dung chi tiết <span className="text-error">*</span>
                    </label>
                    <textarea
                      id="contact-form-message"
                      rows="5"
                      value={form.message}
                      onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border-2 bg-surface-container-lowest dark:bg-tertiary text-on-surface dark:text-inverse-on-surface focus:outline-none focus:border-primary transition-all
                        ${errors.message ? "border-error" : "border-outline-variant dark:border-outline"}`}
                      placeholder="Nhập nội dung chi tiết cần trợ giúp hoặc góp ý..."
                      aria-describedby={errors.message ? "msg-error" : undefined}
                    />
                    {errors.message && (
                      <p id="msg-error" className="text-error text-xs font-bold flex items-center gap-1">
                        <Icon name="error" size="text-xs" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <Button type="submit" variant="primary" icon="send" className="w-full h-14 font-bold rounded-xl shadow-md">
                      Gửi tin nhắn liên hệ
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
