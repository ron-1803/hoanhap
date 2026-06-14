import Icon from "../components/ui/Icon";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-24 animate-[fadeIn_0.2s_ease-out]">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[260px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-overlay">
          <img
            alt="Đồ họa hình tấm khiên bảo vệ và ổ khóa dữ liệu"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-12">
          <div className="max-w-3xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              Chính sách bảo mật
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed">
              Chúng tôi cam kết bảo vệ thông tin cá nhân và dữ liệu riêng tư của người khuyết tật khi truy cập và tương tác trên hệ thống Hoà Nhập.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Privacy Content ─── */}
      <section className="max-w-[1000px] mx-auto px-gutter py-12">
        <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 md:p-10 shadow-sm theme-transition space-y-8 text-on-surface dark:text-inverse-on-surface">
          
          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="person_search" />
              1. Thông tin thu thập
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Hoà Nhập thu thập thông tin của bạn khi bạn chủ động đăng ký tài khoản hoặc gửi liên hệ, bao gồm:
              <br />
              • Thông tin đăng ký: Họ và tên, Email, Số điện thoại, và mật khẩu đã mã hóa.
              <br />
              • Thông tin hỗ trợ & rào cản: Các ý kiến báo cáo về lỗi rào cản tiếp cận, dạng khuyết tật (được bạn lựa chọn để lọc chính sách phù hợp).
              <br />
              • Thông tin kết nối: Đối với tình nguyện viên đăng ký giúp đỡ, chúng tôi sẽ thu thập avatar, số điện thoại công khai, địa bàn và thời gian bạn có thể trợ giúp.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="verified_user" />
              2. Sử dụng thông tin và Cookie / Local Storage
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Dữ liệu của bạn được thu thập nhằm mục đích duy nhất là cung cấp và cải thiện trải nghiệm tiếp cận. Chúng tôi sử dụng Local Storage của trình duyệt để lưu lại cấu hình tiếp cận cá nhân (cỡ chữ phóng to, chế độ tương phản cao, và danh sách các quyền lợi chính sách bạn đã lưu làm bookmark). Thông tin này nằm hoàn toàn trên thiết bị của bạn và không bị tải lên máy chủ ngoài trừ phi được bạn cho phép.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="enhanced_encryption" />
              3. Bảo mật thông tin
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Chúng tôi thực hiện các biện pháp an ninh mạng kỹ thuật tiêu chuẩn để bảo vệ thông tin khỏi các hành vi truy cập trái phép, sửa đổi bất hợp pháp, tiết lộ hoặc phá hủy dữ liệu. Chúng tôi tuyệt đối không mua bán, trao đổi hoặc cho bên thứ ba thuê thông tin cá nhân của người khuyết tật và tình nguyện viên.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="manage_accounts" />
              4. Quyền kiểm soát của bạn
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Bạn có toàn quyền kiểm soát dữ liệu cá nhân của mình bao gồm:
              <br />
              • Chỉnh sửa thông tin hồ sơ cá nhân bất cứ lúc nào trong mục Hồ sơ.
              <br />
              • Bỏ lưu các chính sách hoặc thông tin kết nối đã đánh dấu.
              <br />
              • Yêu cầu xóa vĩnh viễn tài khoản và các dữ liệu liên kết khỏi hệ thống bằng cách gửi email trực tiếp cho Ban quản trị.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="contact_mail" />
              5. Thông tin liên hệ giải quyết bảo mật
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Mọi thắc mắc, phản ánh hoặc yêu cầu xử lý quyền dữ liệu riêng tư, bạn có thể liên hệ trực tiếp với bộ phận bảo mật dữ liệu của Hoà Nhập qua email: <span className="font-bold text-primary dark:text-inverse-primary">privacy@hoanhap.org</span> hoặc gửi yêu cầu tại mục Liên hệ của trang web.
            </p>
          </div>

          <div className="pt-6 border-t border-outline-variant/30 text-xs text-on-surface-variant/70 dark:text-tertiary-fixed-dim/70 flex items-center gap-2">
            <Icon name="info" size="text-sm" />
            <span>Cập nhật lần cuối: Ngày 14 tháng 6 năm 2026</span>
          </div>

        </div>
      </section>
    </div>
  );
}
