# HOÀ NHẬP — Cổng thông tin hỗ trợ người khuyết tật Việt Nam

> *"Xóa bỏ mọi rào cản thông tin, kết nối cơ hội bình đẳng cho người khuyết tật Việt Nam"*

**Website:** [https://hoanhap.pages.dev](https://hoanhap.pages.dev)

---

## 1. Tổng quan sản phẩm

**Hoà Nhập** là cổng thông tin hỗ trợ toàn diện dành cho **Người khuyết tật (NKT)** tại Việt Nam, được xây dựng với tiêu chí **"Accessibility First"** — đặt khả năng tiếp cận lên hàng đầu trong mọi quyết định thiết kế.

Sản phẩm tập trung giải quyết **ba vấn đề cốt lõi** mà NKT Việt Nam đang gặp phải:

1. **Thiếu kênh tra cứu tập trung** về quyền lợi, chính sách và thủ tục hành chính dành cho NKT
2. **Khó khăn trong tiếp cận thông tin** do các website hiện tại chưa hỗ trợ công nghệ trợ giúp (TTS, phóng to chữ, tương phản cao)
3. **Thiếu kết nối cộng đồng** giữa NKT với nhau và với các cá nhân/tổ chức sẵn sàng hỗ trợ

### Công nghệ sử dụng

| Thành phần | Công nghệ |
|------------|-----------|
| Framework | React.js (SPA) + Vite |
| Styling | Tailwind CSS (Material Design 3 tokens) |
| Backend & Database | Firebase (Authentication + Firestore NoSQL) |
| Hosting | Cloudflare Pages |
| Icons | Google Material Symbols Outlined |
| Font | Be Vietnam Pro (Google Fonts) |
| Ngôn ngữ | Tiếng Việt (mặc định) + English |

---

## 2. Đối tượng người dùng

### 2.1. Người dùng chính — Người khuyết tật (NKT)

Sản phẩm hướng đến **tất cả các nhóm khuyết tật** theo phân loại của Luật Người khuyết tật 2010:

| Nhóm khuyết tật | Tính năng hỗ trợ tương ứng |
|------------------|---------------------------|
| **Khiếm thị / Thị lực kém** | Đọc giọng nói tự động (TTS) tiếng Việt, phóng to chữ lên đến 200%, chế độ tương phản cao (vàng/đen), tương thích với trình đọc màn hình NVDA/Narrator |
| **Khiếm thính** | Giao diện 100% dựa trên nội dung văn bản và hình ảnh, không phụ thuộc âm thanh để truyền tải thông tin |
| **Khuyết tật vận động** | Điều hướng hoàn toàn bằng bàn phím (Tab/Shift+Tab/Enter/Escape), nút bấm kích thước tối thiểu 48×48px, skip-to-content link |
| **Khuyết tật trí tuệ / nhận thức** | Ngôn ngữ đơn giản dễ hiểu, bố cục nhất quán, hướng dẫn từng bước rõ ràng, hỗ trợ TTS đọc nội dung |

### 2.2. Người dùng phụ — Người thân / Người giám hộ

- Cha mẹ, anh chị em, người giám hộ hợp pháp của NKT
- Tra cứu quyền lợi và thủ tục hành chính thay cho NKT
- Sử dụng công cụ tính trợ cấp để ước tính mức hưởng

### 2.3. Cộng đồng và Tình nguyện viên

- Cá nhân muốn đăng ký hỗ trợ trực tiếp cho NKT (dạy học, đưa đón, hỗ trợ pháp lý...)
- Tham gia diễn đàn chia sẻ kinh nghiệm và kết nối cộng đồng

### 2.4. Quản trị viên hệ thống

- Quản lý tài khoản người dùng, phân quyền, gắn huy hiệu
- Duyệt và quản lý bài viết diễn đàn
- Quản lý dữ liệu địa điểm hỗ trợ trên bản đồ
- Cập nhật mức chuẩn trợ cấp xã hội và chính sách mới

---

## 3. Chức năng sản phẩm

### 3.1. 📋 Tra cứu Quyền lợi & Chính sách

Trang **"Quyền lợi"** (`/quyen-loi`) cung cấp hệ thống tra cứu chính sách dành cho NKT theo Luật Người khuyết tật 2010:

- **Bộ lọc thông minh 5 chiều**: Tìm kiếm theo từ khóa, nhóm quyền lợi (y tế, giáo dục, việc làm, giao thông, văn hóa), dạng khuyết tật, độ tuổi, tỉnh/thành phố
- **Thẻ chính sách chi tiết**: Hiển thị tên chính sách, mô tả, điều kiện hưởng, mức hỗ trợ, danh sách giấy tờ cần thiết
- **Lưu bookmark**: Người dùng đăng nhập có thể lưu các chính sách quan tâm để xem lại sau
- **Tải văn bản pháp luật**: Tải trực tiếp Luật NKT 51/2010/QH12, Nghị định 20/2021/NĐ-CP dưới dạng DOC/PDF
- **Phân trang**: Hiển thị 4 chính sách/trang, điều hướng thuận tiện

### 3.2. 💰 Công cụ tính Trợ cấp xã hội

Trang **"Trợ cấp"** (`/tro-cap`) giúp NKT ước tính mức trợ cấp hàng tháng theo Nghị định 20/2021/NĐ-CP:

- **Máy tính tự động**: Chọn mức độ khuyết tật (đặc biệt nặng / nặng / nhẹ), nhóm tuổi (dưới 16 / 16-60 / trên 60), và các khoản phụ cấp chăm sóc
- **Mức chuẩn real-time**: Mức chuẩn trợ giúp xã hội được đồng bộ trực tiếp từ Firestore, Admin có thể cập nhật khi chính sách thay đổi
- **Kết quả trực quan**: Hiển thị số tiền trợ cấp dự kiến kèm chi tiết phân tích hệ số tính toán
- **Đọc kết quả bằng giọng nói**: Nút "Nghe đọc kết quả" phát âm toàn bộ kết quả tính bằng TTS tiếng Việt
- **Quy trình thủ tục 4 bước**: Hướng dẫn visual dạng timeline từ xác định mức độ → chuẩn bị hồ sơ → nộp → nhận kết quả
- **Checklist hồ sơ**: Danh sách giấy tờ cần chuẩn bị có thể đánh dấu tích từng mục
- **Danh bạ Sở LĐTBXH**: Thông tin liên hệ các Sở Lao động - Thương binh & Xã hội tiêu biểu

### 3.3. 🤝 Kết nối Cộng đồng

Trang **"Kết nối"** (`/ket-noi`) là hub tập trung gồm hai mảng:

#### Diễn đàn thảo luận (`/ket-noi` → Forum)
- **Bảng thảo luận**: Chia sẻ kinh nghiệm sống, nhật ký, kiến thức pháp lý, kỹ năng nghề nghiệp
- **Đăng bài / Bình luận**: Người dùng đăng nhập có thể tạo bài viết, bình luận và phản ứng cảm xúc (reactions)
- **Hệ thống huy hiệu**: Admin gắn huy hiệu (vd: "Trái tim Vàng") cho thành viên tích cực — hiển thị kèm tên người đăng

#### Đăng ký hỗ trợ trực tiếp (`/ket-noi` → Connection Offers)
- **Đăng lời mời hỗ trợ**: Tình nguyện viên đăng ký các hoạt động hỗ trợ (dạy học, đưa đón, hỗ trợ pháp lý, tặng đồ dùng...)
- **Tìm kiếm hỗ trợ**: NKT tìm kiếm hỗ trợ phù hợp theo loại hình và khu vực
- **Giao diện Glassmorphism**: Thiết kế hiện đại với hiệu ứng backdrop-blur, micro-animations

### 3.4. 🗺️ Bản đồ Hỗ trợ

Trang **"Bản đồ"** (`/ban-do`) hiển thị bản đồ tương tác các cơ sở hỗ trợ NKT:

- **Bản đồ Leaflet**: Tích hợp `react-leaflet` hiển thị bản đồ OpenStreetMap
- **Đánh dấu vị trí**: Các bệnh viện, trung tâm phục hồi chức năng, cơ sở giáo dục chuyên biệt, địa điểm tiếp cận
- **Thông tin chi tiết**: Popup hiển thị tên, loại cơ sở, danh sách tính năng tiếp cận (lối đi xe lăn, thang máy, WC NKT...)
- **Marker có thể focus bằng Tab**: Hỗ trợ điều hướng bàn phím đầy đủ trên bản đồ
- **Quản lý từ Admin**: Admin thêm/sửa/xóa địa điểm trực tiếp từ bảng điều khiển

### 3.5. 👤 Hệ thống Tài khoản

- **Đăng ký / Đăng nhập**: Firebase Authentication (email/password)
- **Quên mật khẩu**: Reset password qua email
- **Hồ sơ cá nhân**: Cập nhật thông tin, xem quyền lợi đã lưu bookmark
- **Phân quyền**: Vai trò "member" (mặc định) và "admin" (quản trị)

### 3.6. 🛡️ Bảng quản trị Admin

Trang Admin (`/admin`) — chỉ truy cập được bởi tài khoản có role "admin":

- **Quản lý người dùng**: Xem danh sách, đình chỉ/kích hoạt, gắn huy hiệu
- **Quản lý bài viết diễn đàn**: Duyệt, xóa bài viết vi phạm
- **Quản lý địa điểm bản đồ**: Thêm/sửa/xóa các cơ sở hỗ trợ NKT trên bản đồ
- **Cấu hình hệ thống**: Cập nhật mức chuẩn trợ cấp xã hội, quản lý chính sách và văn bản pháp luật

### 3.7. 🆘 SOS Khẩn cấp

- **Nút SOS cố định**: Luôn hiển thị ở cuối thanh công cụ trợ năng bên trái
- **Modal liên hệ khẩn cấp**: Hiển thị số Cấp cứu (115), Công an (113), Tổng đài Bảo trợ xã hội (111)
- **Gọi trực tiếp**: Nhấn vào số điện thoại để gọi ngay (trên thiết bị di động)
- **Sao chép vị trí**: Nút sao chép tọa độ GPS hiện tại để gửi cho người cứu hộ
- **Focus-trapped modal**: Khi mở, không thể Tab ra ngoài modal — đảm bảo NKT không bị "lạc" focus

### 3.8. 📰 Tin tức & Cập nhật

- Trang tin tức hiển thị các thông tin mới nhất về chính sách, sự kiện liên quan đến NKT

### 3.9. 💬 Chatbot hỗ trợ

- **Floating action button**: Nút chat nổi cố định góc phải dưới màn hình
- **Panel trò chuyện**: Hỗ trợ hỏi đáp nhanh về các chức năng và thông tin trên website

### 3.10. 📝 Góp ý & Phản hồi

- Trang **"Góp ý"** (`/gop-y`) cho phép người dùng gửi ý kiến đóng góp và phản hồi về sản phẩm

---

## 4. Giải pháp Tiếp cận — Tuân thủ WCAG 2.2

**Hoà Nhập** được thiết kế tuân thủ **WCAG 2.2 mức AA**, với mục tiêu hướng tới mức AAA trên nhiều tiêu chí. Dưới đây là chi tiết từng nguyên tắc và cách triển khai:

### 4.1. Nguyên tắc 1: Perceivable (Nhận biết được)

> *Thông tin và các thành phần giao diện phải được trình bày theo cách mà người dùng có thể nhận biết.*

| Tiêu chí WCAG | Mức | Giải pháp triển khai |
|----------------|-----|---------------------|
| **1.1.1** — Nội dung thay thế cho phi văn bản | A | Tất cả `<img>` đều có thuộc tính `alt` mô tả đầy đủ nội dung hình ảnh. Các icon trang trí dùng `aria-hidden="true"` để ẩn khỏi trình đọc màn hình |
| **1.3.1** — Thông tin và quan hệ | A | Sử dụng đúng cấu trúc HTML5 ngữ nghĩa: `<header>`, `<main>`, `<nav>`, `<footer>`, `<section>`, `<article>`. Mỗi trang có duy nhất 1 `<h1>`, heading hierarchy đúng thứ tự (h1→h2→h3) |
| **1.3.2** — Thứ tự có ý nghĩa | A | DOM order phản ánh đúng thứ tự visual, đảm bảo trình đọc màn hình đọc đúng luồng nội dung. Các phần tử SocialAllowancePage được gán `tabIndex` rõ ràng để kiểm soát thứ tự đọc TTS |
| **1.3.4** — Orientation | AA | Layout responsive hoạt động ở cả portrait và landscape, không khóa orientation |
| **1.3.5** — Identify Input Purpose | AA | Tất cả form fields đều có `<label>` tường minh liên kết qua `htmlFor`/`id`, có `placeholder` gợi ý |
| **1.4.1** — Sử dụng màu sắc | A | Thông tin không chỉ dựa vào màu sắc — luôn kết hợp icon, text label, viền, hình dạng để truyền tải ý nghĩa |
| **1.4.3** — Tỷ lệ tương phản (tối thiểu) | AA | Bảng màu Material Design 3 đảm bảo tỷ lệ tương phản ≥ 4.5:1 cho văn bản thường, ≥ 3:1 cho văn bản lớn. Chế độ High Contrast sử dụng nền đen (#000) + chữ trắng (#FFF) + accent vàng (#FFD700) đạt tỷ lệ 21:1 |
| **1.4.4** — Thay đổi kích thước văn bản | AA | **Font Scale Engine**: Biến CSS `--font-scale` trên `<html>` cho phép phóng to/thu nhỏ từ 80% đến 200% qua thanh công cụ trợ năng, tất cả layout vẫn hoạt động đúng ở mọi cỡ chữ |
| **1.4.10** — Reflow | AA | Layout sử dụng CSS Flexbox/Grid responsive, nội dung reflow tốt ở viewport 320px trở lên, không xuất hiện scrollbar ngang |
| **1.4.11** — Tương phản phi văn bản | AA | Viền, icon, nút bấm, form controls đều có tỷ lệ tương phản ≥ 3:1 so với nền. Ở chế độ High Contrast, viền chuyển sang trắng (#FFF) trên nền đen |
| **1.4.12** — Text Spacing | AA | Font Be Vietnam Pro hỗ trợ tốt letter-spacing, line-height tùy chỉnh. Line-height mặc định 1.75rem cho body text, đảm bảo đọc dễ dàng |

### 4.2. Nguyên tắc 2: Operable (Thao tác được)

> *Các thành phần giao diện và điều hướng phải thao tác được.*

| Tiêu chí WCAG | Mức | Giải pháp triển khai |
|----------------|-----|---------------------|
| **2.1.1** — Bàn phím | A | **100% chức năng có thể thao tác bằng bàn phím**: Tab/Shift+Tab điều hướng, Enter kích hoạt, Escape đóng modal/dropdown. Tất cả interactive elements có `tabIndex` hoặc là native focusable elements |
| **2.1.2** — Không bẫy bàn phím | A | **Focus Trap thông minh**: Modal dialogs (Rights Details, SOS) sử dụng `FocusTrapModal` component — Tab/Shift+Tab xoay vòng trong modal, Escape thoát, focus trả về phần tử gốc khi đóng. Không có "bẫy chết" |
| **2.4.1** — Bỏ qua khối nội dung | A | **Skip-to-content link**: Link "Chuyển đến nội dung chính" ẩn visual, xuất hiện khi nhấn Tab đầu tiên, nhảy thẳng đến `<main>`, kèm TTS thông báo "Đã chuyển đến nội dung chính" |
| **2.4.2** — Tiêu đề trang | A | `document.title` cập nhật động theo ngôn ngữ: "Hoà Nhập — Cổng thông tin hỗ trợ người khuyết tật Việt Nam" (VI) / "Hoà Nhập — Support Portal for PWDs" (EN) |
| **2.4.3** — Thứ tự focus | A | Thứ tự focus logic: Sidebar → Skip Link → Header → Nav → Main Content → Footer. Trong page: heading → filters → content → pagination |
| **2.4.4** — Mục đích liên kết (trong ngữ cảnh) | A | Tất cả links có text mô tả rõ đích đến. Buttons có `aria-label` chi tiết khi text không đủ ý nghĩa (vd: `aria-label="Lưu chính sách Cấp thẻ BHYT miễn phí"`) |
| **2.4.6** — Heading và Label | AA | Heading hierarchy nhất quán: `<h1>` cho tiêu đề trang, `<h2>` cho sections, `<h3>` cho sub-items. Labels gắn tường minh cho mọi form control |
| **2.4.7** — Focus có thể nhìn thấy | AA | **Focus Indicators 3 cấp độ**: (1) Mặc định: outline 3px solid #002B6B, offset 2px. (2) Dark mode: outline #B0C6FF. (3) High Contrast: outline 4px solid #FFD700, offset 3px. (4) Keyboard Nav mode: thêm box-shadow halo vàng |
| **2.4.11** — Focus Not Obscured | AA | Header `z-index: 9999` cố định, nhưng focus indicators luôn visible nhờ `outline-offset`. Modal overlays có `z-index: 50` đảm bảo focus trong modal không bị che |
| **2.5.3** — Label in Name | A | Tất cả buttons/links có `aria-label` khớp hoặc chứa visible text label |
| **2.5.8** — Target Size (Minimum) | AA | **Tất cả interactive elements ≥ 48×48px**: Buttons có `min-h-btn: 48px`, sidebar buttons 64×64px, nav links padding đủ lớn, form inputs height 56px |

### 4.3. Nguyên tắc 3: Understandable (Hiểu được)

> *Thông tin và thao tác giao diện phải hiểu được.*

| Tiêu chí WCAG | Mức | Giải pháp triển khai |
|----------------|-----|---------------------|
| **3.1.1** — Ngôn ngữ của trang | A | `<html lang="vi">` mặc định, chuyển sang `lang="en"` khi đổi ngôn ngữ. Hỗ trợ đầy đủ 2 ngôn ngữ Tiếng Việt và English |
| **3.1.2** — Ngôn ngữ của phần tử | AA | Khi chuyển ngôn ngữ, TTS tự động thông báo: "Language changed to English" / "Đã chuyển đổi sang Tiếng Việt" |
| **3.2.1** — Khi nhận focus | A | Không có hành vi bất ngờ khi focus vào bất kỳ phần tử nào — chỉ trigger TTS đọc nội dung nếu người dùng bật tính năng Đọc |
| **3.2.2** — Khi nhập liệu | A | Form không tự submit, bộ lọc cập nhật real-time nhưng không gây mất focus hay chuyển trang |
| **3.2.3** — Điều hướng nhất quán | AA | Header, sidebar, footer giữ nguyên vị trí và nội dung trên mọi trang (thông qua `MainLayout` wrapper) |
| **3.3.1** — Nhận diện lỗi | A | Form validation hiển thị thông báo lỗi rõ ràng kèm gợi ý sửa |
| **3.3.2** — Nhãn hoặc hướng dẫn | A | Tất cả form fields có `<label>` + `placeholder` hướng dẫn. Calculator có mô tả giải thích mức chuẩn hiện hành |
| **3.3.7** — Redundant Entry | A | Thông tin người dùng đã nhập (bộ lọc, checklist, form) được lưu trạng thái trong state, không yêu cầu nhập lại khi chuyển trang |

### 4.4. Nguyên tắc 4: Robust (Bền vững)

> *Nội dung phải đủ bền vững để được diễn giải một cách đáng tin cậy bởi nhiều user agents.*

| Tiêu chí WCAG | Mức | Giải pháp triển khai |
|----------------|-----|---------------------|
| **4.1.2** — Name, Role, Value | A | Tất cả interactive elements sử dụng đúng ARIA attributes: `role="dialog"`, `aria-modal="true"`, `aria-expanded`, `aria-pressed`, `aria-label`, `aria-labelledby`, `aria-live`, `aria-current="page"`. Dropdowns có `role="menu"` + `role="menuitem"` |
| **4.1.3** — Status Messages | AA | **Toast notifications** sử dụng `aria-live="assertive"` — trình đọc màn hình tự động thông báo khi có toast mới. TTS cũng đọc toast content nếu đang bật. VD: "Đã lưu thành công chính sách: Cấp thẻ BHYT miễn phí" |

---

## 5. Thanh công cụ Trợ năng (Accessibility Sidebar)

Thanh công cụ trợ năng **cố định bên trái** màn hình (rộng 80px), luôn hiển thị trên mọi trang, cho phép NKT điều chỉnh trải nghiệm theo nhu cầu cá nhân:

| # | Công cụ | Mô tả | WCAG liên quan |
|---|---------|-------|----------------|
| 1 | **📢 Đọc nội dung** | Bật/tắt Text-to-Speech tự động — khi bật, mọi phần tử được focus/hover sẽ được đọc bằng giọng Việt. Ưu tiên giọng: Google > Microsoft > OS default > Google Translate TTS fallback | 1.1.1, 1.3.2 |
| 2 | **🔤 Tăng chữ (A+)** | Phóng to cỡ chữ toàn trang thêm 10% mỗi lần nhấn (tối đa 200%) | 1.4.4 |
| 3 | **🔡 Giảm chữ (A-)** | Thu nhỏ cỡ chữ toàn trang bớt 10% mỗi lần nhấn (tối thiểu 80%) | 1.4.4 |
| 4 | **🔲 Tương phản cao** | Chế độ ultra-high-contrast: nền đen thuần, chữ trắng/vàng, viền trắng, focus indicators vàng neon. Đảm bảo tỷ lệ tương phản 21:1 | 1.4.3, 1.4.11 |
| 5 | **🌙 Chế độ tối** | Chuyển đổi Light/Dark theme — dark mode sử dụng nền `#111318` với text sáng, giảm mỏi mắt | 1.4.3 |
| 6 | **🆘 SOS** | Mở modal liên hệ khẩn cấp (115, 113, 111) + sao chép tọa độ GPS. Focus-trapped, đóng bằng Escape | 2.1.2 |

**Persistence**: Tất cả cài đặt trợ năng được lưu vào `localStorage` với key `hoa-nhap-accessibility`, tự động khôi phục khi người dùng quay lại.

---

## 6. Hỗ trợ đa ngôn ngữ (i18n)

Sản phẩm hỗ trợ **2 ngôn ngữ**:

- 🇻🇳 **Tiếng Việt** (mặc định)
- 🇬🇧 **English**

Chuyển đổi qua nút Language trên Header (desktop) hoặc nút toggle trên mobile menu. Khi chuyển ngôn ngữ:
- Tất cả UI labels, descriptions, headings được dịch tức thì
- `document.title` cập nhật tương ứng
- TTS thông báo bằng ngôn ngữ đích

---

## 7. Kiến trúc hệ thống

```
AccessibilityProvider (trợ năng toàn cục)
  └─ LanguageProvider (đa ngôn ngữ)
      └─ AuthProvider (xác thực Firebase)
          └─ BrowserRouter
              └─ MainLayout
                  ├─ AccessibilitySidebar (fixed left, 80px)
                  ├─ Skip-to-content Link
                  ├─ Header (sticky top, glassmorphism)
                  ├─ <main> — Page content (React Router Outlet)
                  ├─ Footer
                  └─ ChatbotPanel (floating FAB)
```

---

## 8. Bảng tổng hợp các trang

| Trang | Đường dẫn | Mô tả |
|-------|-----------|-------|
| Trang chủ | `/` | Hero, tìm kiếm nhanh, 4 service cards, CTA banner |
| Quyền lợi | `/quyen-loi` | Tra cứu chính sách, bộ lọc 5 chiều, bookmark, tải văn bản PL |
| Trợ cấp | `/tro-cap` | Máy tính trợ cấp, quy trình thủ tục, checklist hồ sơ |
| Kết nối | `/ket-noi` | Hub cộng đồng: diễn đàn + đăng ký hỗ trợ |
| Bản đồ | `/ban-do` | Bản đồ Leaflet cơ sở hỗ trợ NKT |
| Đăng nhập | `/dang-nhap` | Firebase Auth login |
| Đăng ký | `/dang-ky` | Firebase Auth register |
| Quên mật khẩu | `/quen-mat-khau` | Password reset via email |
| Hồ sơ | `/ho-so` | Thông tin cá nhân, quyền lợi đã lưu |
| Góp ý | `/gop-y` | Form gửi phản hồi |
| Về chúng tôi | `/ve-chung-toi` | Sứ mệnh, tầm nhìn, đội ngũ, cam kết tiếp cận |
| Điều khoản | `/dieu-khoan` | Điều khoản sử dụng |
| Bảo mật | `/bao-mat` | Chính sách bảo mật |
| Admin | `/admin` | Bảng quản trị (chỉ admin) |

---

## 9. Thông tin dự án

- **Loại dự án**: Dự án học thuật phi lợi nhuận của sinh viên
- **Mục đích**: Tham dự cuộc thi công nghệ, phục vụ cộng đồng NKT Việt Nam
- **Đội ngũ**: 6 thành viên (Đội trưởng, Front End Dev, Back End Dev, R.API Dev, Quản lý dữ liệu, Tester)

> ⚠️ **Lưu ý**: Đây là sản phẩm nghiên cứu học thuật, không phải website chính thức của cơ quan nhà nước hay tổ chức pháp lý chuyên nghiệp.

---

*Tài liệu này được tạo tự động dựa trên mã nguồn thực tế của sản phẩm Hoà Nhập.*
