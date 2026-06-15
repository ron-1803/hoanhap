# Cổng thông tin hỗ trợ người khuyết tật Hoà Nhập — Tài liệu Hướng dẫn Nghiệm thu

Tài liệu này hướng dẫn chi tiết cách vận hành và kiểm thử các chức năng đã hoàn thiện của dự án Cổng thông tin hỗ trợ người khuyết tật Việt Nam (Hoà Nhập). Hệ thống được thiết kế theo tiêu chuẩn tiếp cận WCAG 2.2 AA.

---

## 🔑 Tài khoản kiểm thử (Mock Accounts)

Bạn có thể đăng nhập bằng các tài khoản kiểm thử được cài đặt sẵn để kiểm tra các phân hệ người dùng khác nhau:

1. **Tài khoản Thành viên thường:**
   - **Email:** `test@hoanhap.vn`
   - **Mật khẩu:** `Password123`
   - **Quyền:** Sử dụng bản đồ, xem chính sách và tính toán mức trợ cấp.

2. **Tài khoản Quản trị viên (Admin):**
   - **Email:** `admin@hoanhap.vn`
   - **Mật khẩu:** `AdminPassword123`
   - **Quyền:** Xem thống kê hệ thống, đổi trạng thái người dùng (Khóa/Mở khóa), sửa đổi mức chuẩn trợ cấp xã hội của nhà nước để cập nhật công cụ tính của người dùng theo thời gian thực.

---

## ⚙️ Các Tính năng và Hướng dẫn Kiểm thử

### 1. Phân hệ Ngôn ngữ (Language Selection)
- **Hỗ trợ Tiếng Anh & Tiếng Việt:** Click biểu tượng quả địa cầu (Language) ở góc trên bên phải thanh menu:
  - Chọn **English (EN)** để tự động dịch thanh điều hướng chính, các mục chào mừng và menu cá nhân sang tiếng Anh.
  - Chọn **Tiếng Việt (VI)** để chuyển lại ngôn ngữ gốc.
  - Mỗi khi thay đổi ngôn ngữ, hệ thống tự động phát âm thanh thông báo qua TTS tương ứng để người dùng khiếm thị nhận biết.

### 2. Phân hệ Thông báo (Notifications Center)
- **Hộp thông báo thả xuống (Notifications Dropdown):** Click biểu tượng quả chuông trên thanh menu:
  - Xem danh sách thông báo chính sách mới, xác minh tài khoản, v.v. được dịch linh hoạt theo ngôn ngữ đã chọn.
  - **Hệ thống đánh dấu unread:** Các thông báo chưa đọc được đánh dấu chấm xanh và hiển thị số lượng badge màu đỏ trên icon chuông.
  - **Đọc/Bỏ đọc:** Click vào dòng thông báo bất kỳ để đổi trạng thái sang Đã đọc (hoặc Chưa đọc) kèm âm thanh phản hồi.
  - **Đánh dấu đã đọc tất cả (Mark all as read):** Nút chọn nhanh để đặt trạng thái đã đọc cho toàn bộ thông báo.

### 3. Phân hệ Trợ cấp xã hội (`/tro-cap`)
- **Bộ tính toán trợ cấp tự động (Decree 20/2021/NĐ-CP):** Nhập mức độ khuyết tật và độ tuổi để tính toán tổng số tiền hỗ trợ hàng tháng.
- **Tính năng Đọc giọng nói (TTS):** Bấm nút "Nghe đọc kết quả" để hệ thống tự động phát âm thanh kết quả tính toán chi tiết bằng tiếng Việt.
- **Danh sách Hồ sơ & Giấy tờ cần chuẩn bị:** Danh sách check-box tương tác.

### 4. Phân hệ Quản trị hệ thống (`/admin`)
- **Bảng số liệu thống kê:** Hiển thị lượt truy cập, tổng số người dùng đăng ký và mức chuẩn trợ cấp hiện tại.
- **Quản lý mức chuẩn trợ cấp:** Nhập mức chuẩn mới (ví dụ nâng từ `360,000` lên `500,000` đ) và nhấn Cập nhật. Mức này sẽ tự động thay đổi hệ số tính toán của tất cả người dùng trên trang `/tro-cap` ngay lập tức.
- **Quản lý người dùng:** Danh sách người dùng với chức năng Khóa hoặc Mở khóa tài khoản (Active/Suspended).

### 5. Phân hệ Góp ý & Phản hồi (`/gop-y`)
- **Bố cục mới:** Giao diện được thiết kế dạng căn giữa (centered layout) đẹp mắt và gọn gàng, loại bỏ hoàn toàn các thông tin liên lạc không chính xác trước đây.
- **Biểu mẫu gửi góp ý:** Người dùng nhập Họ và tên, Email/Số điện thoại, chọn Chủ đề góp ý (Góp ý website, Báo cáo lỗi, Đóng góp nội dung, v.v.), Tiêu đề và Nội dung chi tiết.
- **Báo cáo rào cản tiếp cận:** Checkbox tích chọn báo cáo lỗi hiển thị/đọc/điều hướng để hệ thống ghi nhận.
- **Cập nhật Chatbot & SOS:** 
  - Đã xóa số điện thoại hỗ trợ NKT `1800 599 920` cũ trong chatbot và menu khẩn cấp SOS để đảm bảo tính chính xác của thông tin.
  - Chatbot hỗ trợ chuyển hướng sang trang `/gop-y` với nhãn dịch vụ tương ứng.

---

## ♿ Các Tiêu chuẩn Tiếp cận Web (WCAG 2.2 Compliance)
- **Keyboard Navigation:** Sử dụng phím `Tab` để di chuyển tiêu điểm qua toàn bộ menu, form nhập liệu, danh sách và nút ấn một cách có tuần tự.
- **High Contrast:** Nhấp vào biểu tượng đổi màu trên thanh công cụ hỗ trợ ở trang chủ để chuyển đổi giao diện sang màu Đen - Vàng chuyên biệt cho người khiếm thị nặng.
- **Resize Font Scale:** Sử dụng nút Tăng/Giảm cỡ chữ trên thanh công cụ để tăng tỷ lệ hiển thị từ 80% lên đến 200%.
