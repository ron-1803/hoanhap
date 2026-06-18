# Hoà Nhập (Accessible Vietnam Support Hub) - Project Context for AI Agents

**Target Audience:** Future AI Agents / Developers  
**Purpose:** Provide a high-level technical overview of the project architecture, features, and workflows to ensure context continuity.

---

## 1. Project Overview
**Hoà Nhập** is a comprehensive support portal dedicated to People with Disabilities (PWDs) in Vietnam. The application adheres to WCAG 2.2 AAA accessibility standards and aims to connect users with social allowances, legal rights, community support, and accessible locations.

## 2. Tech Stack
- **Framework:** React.js (Single Page Application) powered by Vite.
- **Styling:** Tailwind CSS (configured for dark mode and accessibility).
- **Backend & Database:** Firebase (Authentication, Firestore NoSQL).
- **Hosting/Deployment:** Cloudflare Pages (via `wrangler`).
- **Icons:** Google Material Symbols Outlined.

---

## 3. Core Features & Architecture

### Accessibility First (A11y)
- **`AccessibilityContext.jsx`:** Manages high contrast mode, text scaling, and text-to-speech (using the Web Speech API).
- **`AccessibilitySidebar.jsx`:** Floating sidebar for users to toggle accessibility options on the fly.
- Focus management and semantic HTML are strictly enforced across all components.

### Core Modules
- **Rights/Allowance Directory**: A highly accessible directory (`RightsPage.jsx`) where users can filter benefits. Replaced direct file downloads with informative cards featuring "Xem chi tiết" buttons that link to external legal texts, managed dynamically via Firebase by admins.
- **Interactive Support Map (`MapPage.jsx`)**: Uses `react-leaflet` to display support centers. Currently, it integrates with `Overpass API` to fetch real-world amenities dynamically, resolving CORS by removing headers.
- **Community Hub (`CommunityPage.jsx` & `ForumPage.jsx` & `ConnectionPage.jsx`)**: A unified hub. The Forum (`ForumPage.jsx`) features a professional 2-column layout (Left: Posts & Subtype Filters; Right: Featured Boards & Active Members widgets) matching modern forum patterns with high accessibility. `ConnectionPage.jsx` serves as a quick directory for help requests/offers.
- **Global TTS Welcome Flow**: Voice assistance is enabled by default (`screenReader: true`). Upon a user's first physical interaction (click, keydown, touch) on any page, a global welcome message ("Chào mừng bạn đến với Cổng thông tin Hoà Nhập...") is spoken automatically, unlocking the browser's audio context seamlessly.
- **Admin Panel (`AdminPage.jsx`)**: Comprehensive dashboard to manage users (approving roles, assigning trust badges) and content. Recently redesigned using the Glass Card UI with updated forms to accept external URLs instead of file uploads for legal documents.

### Global State & Contexts
- **`AuthContext.jsx`**: Firebase Auth listener.
- **`LanguageContext.jsx`**: i18n support (Vietnamese & English).
- **`AccessibilityContext.jsx`**: Global accessibility settings.

---

## 4. Firestore Database Schema

The app uses Firebase Firestore. Below are the primary collections:

1. **`users`**
   - Fields: `fullName`, `email`, `role` ("admin" or "member"), `status` ("active" or "suspended"), `disabilityType`, `badge` (e.g., "Trái tim Vàng").
2. **`forum_posts`**
   - Fields: `title`, `board`, `content`, `authorId`, `authorName`, `authorBadge`, `reactions`, `comments` (Array of objects with `id`, `authorName`, `authorBadge`, `text`, `createdAt`, `likes`).
   - *Note*: `authorBadge` is snapshotted at the time of posting from `user.badge`. Comment `likes` are stored as integers inside each comment object and updated via full array replacement.
3. **`support_offers`**
   - Fields: `type`, `description`, `location`, `authorId`.
4. **`locations`**
   - Fields: `name`, `type`, `lat`, `lng`, `accessibilityFeatures` (Array).
5. **`rights_policy`**
   - Fields: `name`, `description`, `supportRate`.
6. **`settings`** (Singleton document: `global`)
   - Fields: `allowanceBase` (Base salary for allowance calculation, e.g., 2340000).

---

## 5. Important Gotchas & Workarounds

### 1. SEO & Static HTML for SPA
- Since this is a Vite React SPA, SEO crawlers/accessibility automated checkers only see the initial `index.html`.
- **Workaround applied:** A visually hidden `<h1>` tag is injected inside `<div id="root">` in `index.html` to satisfy SEO/Accessibility static audits without breaking the React DOM rendering.

### 2. Database Initialization
- **`src/utils/firebaseSeed.js`** and **`src/utils/defaultData.js`**: Contain the scripts and dummy data to seed the Firestore database on the initial run or when the database is empty.
- There is a database migration logic within `firebaseSeed.js` that automatically fixes legacy nested `forum_posts` content structures if found.

### 3. Role-based Badge System
- Admins have exclusive rights to assign `badge`s to users via the Admin Dashboard.
- Badges are assigned in the `users` collection and then retrieved during post/comment creation.

### 4. UI/UX & Accessibility Enhancements
- **FocusTrapModal:** Modified to use `useRef` for `onClose` handlers to prevent unintended focus resets during re-renders, adhering to strict WCAG focus trap standards.
- **ConnectionPage:** Refactored to feature a modern "Glassmorphism" UI with deep shadows, backdrop-blurs, and micro-animations to enhance visual appeal.
- **SocialAllowancePage:** Procedure steps are visually boxed (`border`, `bg-surface-container`) and explicitly tab-indexed for clear Text-to-Speech (TTS) reading order.
- **Leaflet Maps:** Header z-index explicitly set to `[9999]` to prevent overlap with `react-leaflet` controls.

---

## 6. Deployment Workflow

To build and deploy the application to Cloudflare Pages:
1. Run `npm run build`.
2. Run `npx wrangler pages deploy dist --project-name hoanhap`.
---

## 7. Visual Upgrade (Completed)

**Status:** ĐÃ HOÀN THÀNH  
**Mục tiêu:** Nâng cấp toàn bộ visual của website lên phong cách **Modern & Premium** (glassmorphism, gradient, micro-animations) theo chuẩn **WCAG 2.2 AA**.

### Các CSS utility classes đã thêm (`src/index.css`)
| Class | Mô tả |
|-------|--------|
| `.glass-card` | Glassmorphism card (backdrop-blur, semi-transparent bg, subtle border). Tự động fallback solid bg trong `.high-contrast` mode. |
| `.glass-header` | Glassmorphism cho header/sticky bar. |
| `.shadow-premium` | Multi-layer box-shadow tinh tế. |
| `.bg-dots-pattern` | Subtle decorative dot pattern cho page backgrounds. |
| `.footer-gradient` | Gradient background cho Footer. |

### Nguyên tắc WCAG 2.2 đã áp dụng
- Tất cả decorative animations đều được wrap trong `@media (prefers-reduced-motion: no-preference)`.
- Focus indicators duy trì `ring-offset-2` trên glass/dark surfaces (3-4px offset).
- `.high-contrast` class tự động override glass effects thành solid backgrounds.

### Components & Pages đã nâng cấp
- **Layout:** `Header.jsx`, `Footer.jsx`, `AccessibilitySidebar.jsx`
- **UI Components:** `ServiceCard.jsx`, `Button.jsx`
- **Trang chính:** `HomePage.jsx`, `RightsPage.jsx`, `SocialAllowancePage.jsx`, `CommunityPage.jsx`, `ConnectionPage.jsx`, `ForumPage.jsx`, `MapPage.jsx`

---

## 8. Recent Feature Changes

### 8.1 Legal Documents — Direct Links (thay vì tải file)
Do tính đặc thù thay đổi luật thường xuyên, hệ thống đã chuyển từ việc tải file tĩnh sang **liên kết trực tiếp** đến nguồn gốc văn bản pháp luật.

**Các file đã sửa:**
- **`AdminPage.jsx`** (Tab "Quyền lợi & Văn bản"):
  - Label "Đường dẫn tệp tài liệu" → "Liên kết trực tiếp đến dự thảo/văn bản"
  - Placeholder hướng dẫn nhập URL (ví dụ: `https://thuvienphapluat.vn/...`)
  - Bảng danh sách: cột "Liên kết tệp" → "Liên kết gốc"
- **`RightsPage.jsx`** (Section "Văn bản pháp luật liên quan"):
  - Nút "Tải PDF/DOC" (download) → Nút "Xem chi tiết" (`open_in_new`, `target="_blank"`)
  - Mock URLs cập nhật sang liên kết thực trên thuvienphapluat.vn

### 8.2 Screen Reader (TTS) bật mặc định
Chức năng đọc nội dung (Text-to-Speech) được **bật sẵn** cho người dùng mới (lần đầu truy cập).

**File đã sửa:** `AccessibilityContext.jsx`
- `defaultState.screenReader` = `true` (trước đó là `false`).
- Người dùng cũ đã có localStorage sẽ giữ nguyên lựa chọn đã lưu.

**Xử lý browser autoplay policy:**
- Trình duyệt chặn phát âm thanh cho đến khi có tương tác đầu tiên (click/keydown/touchstart).
- Hệ thống lắng nghe sự kiện tương tác đầu tiên, sau đó phát lời chào hướng dẫn:  
  *"Chào mừng bạn đến với Hoà Nhập. Chức năng đọc nội dung đã được bật sẵn. Hãy di chuột hoặc dùng phím Tab để nghe nội dung từng mục."*
- Logic: `hasPlayedWelcome` ref đảm bảo chỉ phát 1 lần duy nhất mỗi session.

### 8.3 Forum Page Redesign (Kết nối yêu thương)
Giao diện Diễn đàn (`ForumPage.jsx`) đã được thiết kế lại thành layout 2 cột chuyên nghiệp:
- **Cột trái (2/3):** Bộ lọc "Chủ đề phổ biến" (Sub-type pills), tiêu đề "Bài viết mới nhất" với Sort, và danh sách Post Cards.
- **Cột phải (1/3):** Widget "Các Chuyên mục" (Board selector với số lượng bài), Widget "Thành viên tích cực" (top 5 tự động tính), và "Quy tắc diễn đàn".
- **Post Cards:** Avatar + tên tác giả + ngày + số bình luận, đoạn trích nội dung, nút Thích/Cảm hứng/Đồng hành, và Banner Đồng hành 1-click.
- **Bình luận:** Giao diện giống YouTube/Facebook (Avatar tròn bên trái, tên in đậm, nội dung, nút Thích và Trả lời). Nút Trả lời tự động điền `@TênNgười` vào ô nhập và focus.
- **Firebase:** Nút Thích bình luận cập nhật trường `likes` trong mảng `comments` trên Firestore.
- **Màu sắc:** Đồng bộ toàn bộ với hệ thống theme `primary` của trang web (không dùng hardcoded hex).

### 8.4 Homepage Welcome Guide
Đã loại bỏ video giới thiệu (`GuideVideoSection`) theo yêu cầu người dùng vì giới hạn file size của Cloudflare Pages. Thay thế bằng component `WelcomeGuideModal.jsx` - một hộp thoại văn bản giới thiệu ngắn gọn các tính năng, tự động hiện lên khi người dùng truy cập lần đầu và lưu trạng thái vào `localStorage`.

### 8.5 ServiceCard — Icon-based (không dùng ảnh)
`ServiceCard.jsx` hiện sử dụng **Material Icons** (`icon` prop) thay vì ảnh URL (`imageSrc`). Mỗi thẻ dịch vụ trên `HomePage.jsx` truyền `icon`, `iconBg`, `iconColor`, `iconBorder` riêng biệt cho từng dịch vụ.

### 8.6 Quản lý Địa điểm Bản đồ (Map Management)
Khôi phục tính năng thêm/sửa/xóa địa điểm hỗ trợ trên `AdminPage`.
Trang `MapPage` nay có khả năng hiển thị đồng thời Marker lấy tự động từ `Overpass API` và Marker do Admin tạo từ Firebase `locations` collection. Popup của Firebase Marker hỗ trợ render trực tiếp các thẻ tiện ích tiếp cận (`accessibilityBadges`) (như Dốc xe lăn, Thang máy).

---

## 9. Deployment Workflow

To build and deploy the application to Cloudflare Pages:
1. Run `npm run build`.
2. Run `npx wrangler pages deploy dist --project-name hoanhap`.
3. Push changes to GitHub (`git add .`, `git commit -m "..."`, `git push`).

*End of Context Document.*
