import Icon from "../components/ui/Icon";

export default function TermsPage() {
  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-24 animate-[fadeIn_0.2s_ease-out]">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[260px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-overlay">
          <img
            alt="Đồ họa hình búa pháp lý và cán cân công lý"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-gutter w-full py-12">
          <div className="max-w-3xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              Điều khoản dịch vụ
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 leading-relaxed">
              Vui lòng đọc kỹ các quy định và điều khoản sử dụng Cổng thông tin Hoà Nhập trước khi sử dụng các dịch vụ hỗ trợ của chúng tôi.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Terms Content ─── */}
      <section className="max-w-[1000px] mx-auto px-gutter py-12">
        <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 md:p-10 shadow-sm theme-transition space-y-8 text-on-surface dark:text-inverse-on-surface">
          
          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="gavel" />
              1. Chấp nhận các điều khoản
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Bằng việc truy cập, đăng ký tài khoản hoặc sử dụng bất kỳ dịch vụ nào trên Cổng thông tin Hoà Nhập (bao gồm tra cứu chính sách, đăng ký kết nối tình nguyện viên, hoặc sử dụng chatbot hỗ trợ), bạn đồng ý chịu sự ràng buộc bởi các điều khoản dịch vụ này cùng với Chính sách bảo mật của chúng tôi.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="badge" />
              2. Đăng ký thông tin và Bảo mật tài khoản
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Khi bạn đăng ký tài khoản cá nhân hoặc điền thông tin tham gia kết nối tình nguyện viên, bạn cam kết cung cấp thông tin trung thực, chính xác và cập nhật. Bạn chịu hoàn toàn trách nhiệm bảo mật mật khẩu tài khoản cá nhân và các hoạt động diễn ra dưới tài khoản của mình. Ban quản trị có quyền tạm khóa tài khoản nếu phát hiện thông tin giả mạo.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="volunteer_activism" />
              3. Trách nhiệm của Tình nguyện viên & Cộng đồng
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Các tổ chức, cá nhân tham gia đăng ký giúp đỡ trên trang Kết nối cam kết thực hiện đúng trách nhiệm hỗ trợ phi lợi nhuận (miễn phí hoặc đúng theo mức chi phí thỏa thuận tối thiểu ban đầu). Nghiêm cấm mọi hành vi lợi dụng hình ảnh người khuyết tật để quyên góp trục lợi cá nhân bất chính, quấy rối hoặc phân biệt đối xử trong quá trình tương tác.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="warning" />
              4. Miễn trừ trách nhiệm pháp lý và y tế
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Thông tin về chính sách bảo hiểm, y tế, giáo dục và hướng dẫn pháp lý trên trang web này chỉ mang tính chất tham khảo, giúp định hướng hành chính cho người khuyết tật. Hoà Nhập không chịu trách nhiệm pháp lý đối với bất kỳ quyết định y tế hoặc hành chính nào của bạn nếu không tham vấn trực tiếp các cơ quan nhà nước có thẩm quyền hoặc bác sĩ chuyên khoa.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="font-headline-md text-headline-md text-primary dark:text-inverse-primary flex items-center gap-2">
              <Icon name="edit" />
              5. Thay đổi quy định điều khoản
            </h2>
            <p className="text-sm leading-relaxed text-on-surface-variant dark:text-tertiary-fixed-dim">
              Ban biên tập có quyền cập nhật, sửa đổi các điều khoản dịch vụ này bất cứ lúc nào mà không cần thông báo trước. Những thay đổi mới nhất sẽ được cập nhật công khai ngay trên trang này và có hiệu lực ngay lập tức. Việc tiếp tục sử dụng dịch vụ sau khi điều khoản thay đổi đồng nghĩa bạn đã chấp nhận các thay đổi đó.
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
