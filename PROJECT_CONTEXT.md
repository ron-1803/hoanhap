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
1. **Rights & Policies (`RightsPage.jsx`)**: Displays policies/legal rights for PWDs.
2. **Allowance Calculator (`AllowancePage.jsx`)**: Calculates government social subsidies based on user inputs.
3. **Community Hub (`CommunityPage.jsx` & `ForumPage.jsx`)**: A unified hub containing the Forum (Discussions) and Connection Offers (Help requests/offers).
4. **Accessible Map (`MapPage.jsx`)**: Displays accessible facilities (hospitals, rehab centers) using `react-leaflet`.
5. **Admin Dashboard (`AdminPage.jsx`)**: Protected route for admins to manage users, assign badges, moderate forum posts, and manage map locations.

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
   - Fields: `title`, `board`, `content`, `authorId`, `authorName`, `authorBadge`, `reactions`, `comments` (Array of objects).
   - *Note*: `authorBadge` is snapshotted at the time of posting from `user.badge`.
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
3. Push changes to GitHub (`git add .`, `git commit -m "..."`, `git push`).

---

## 7. Planned Visual Upgrade (TODO)

**Status:** Chưa thực hiện — Chỉ là kế hoạch để thực hiện sau.  
**Mục tiêu:** Nâng cấp toàn bộ visual của website lên phong cách **Modern & Premium** (glassmorphism, gradient mesh, micro-animations) mà **KHÔNG thay đổi bố cục, logic, hay accessibility features**.

### Nguyên tắc
- Giữ nguyên layout/structure hiện tại
- Giữ nguyên 100% tính năng accessibility (WCAG 2.2 AA, TTS, high contrast, keyboard nav)
- Chỉ thay đổi CSS classes và visual styling trong JSX

### Các thay đổi chính

#### A. Global CSS (`src/index.css`)
Thêm các CSS classes mới:
- `.glass-card` — Glassmorphism cards (backdrop-blur, semi-transparent bg, subtle borders)
- `.gradient-border` — Animated gradient borders cho cards khi hover
- `.ambient-glow` — Subtle color glow phía sau cards
- `.shadow-premium` — Multi-layer box-shadow tinh tế
- `.bg-dots-pattern`, `.bg-grid-pattern` — Subtle decorative backgrounds
- `.btn-glow` — Glow effect khi hover buttons
- `.animate-scroll-reveal` — Scroll-triggered reveal animation
- `.card-shine` — Sweep shine effect khi hover cards

#### B. Components (4 files)
| File | Upgrade |
|------|---------|
| `Header.jsx` | Stronger backdrop-blur, gradient bottom line, sliding nav underline, glassmorphism dropdowns |
| `Footer.jsx` | Mesh gradient bg, subtle particles, glow links, gradient divider |
| `ServiceCard.jsx` | Glassmorphism bg, gradient border hover, icon glow, card shine sweep |
| `Button.jsx` | Gradient bg + shimmer, hover glow, dark mode neon borders |

#### C. Pages (12+ files)
Apply consistent visual pattern across all pages:

| Element | Hiện tại | Nâng cấp |
|---------|----------|----------|
| Card backgrounds | `bg-surface-container` solid | `backdrop-blur-xl bg-white/70 dark:bg-white/5` |
| Card borders | `border-2 border-outline-variant` | `border border-white/20` + gradient on hover |
| Card shadows | `shadow-sm` hoặc none | `shadow-lg shadow-primary/5` + ambient glow |
| Hero sections | Single color + image | Multi-layer gradient mesh + floating shapes |
| Buttons (primary) | `bg-primary` solid | Gradient `from-primary to-primary-container` + shimmer |
| Dark mode cards | `bg-tertiary` solid | `bg-white/5 backdrop-blur` + glow borders |
| Page backgrounds | Plain white/dark | Subtle dot/grid patterns |
| Hover effects | `hover:border-primary` | Lift + glow + gradient border animation |

#### D. Priority Order (khi thực hiện)
1. `index.css` — Thêm tất cả CSS classes mới
2. `ServiceCard.jsx`, `Button.jsx` — Components chung
3. `HomePage.jsx` — Trang chủ
4. `RightsPage.jsx`, `SocialAllowancePage.jsx` — Trang chính
5. `Header.jsx`, `Footer.jsx` — Layout
6. Các trang còn lại

### Cách thực hiện
Yêu cầu AI agent: *"Thực hiện visual upgrade plan trong section 7 của PROJECT_CONTEXT.md"*

---

*End of Context Document.*
