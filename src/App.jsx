import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import ConnectionPage from "./pages/ConnectionPage";
import SupportMapPage from "./pages/MapPage";
import RightsPage from "./pages/RightsPage";
import FeedbackPage from "./pages/FeedbackPage";
import AboutPage from "./pages/AboutPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import SocialAllowancePage from "./pages/SocialAllowancePage";
import AdminPage from "./pages/AdminPage";

/**
 * App — Root application component
 *
 * Architecture:
 *  AccessibilityProvider (global state)
 *    └─ LanguageProvider (translation module)
 *        └─ AuthProvider (user session management)
 *            └─ BrowserRouter
 *                └─ MainLayout (sidebar + header + footer shell)
 *                    ├─ / → HomePage
 *                    ├─ /dang-nhap → LoginPage
 *                    ├─ /dang-ky → RegisterPage
 *                    ├─ /quen-mat-khau → ForgotPasswordPage
 *                    └─ /ho-so → ProfilePage
 */
export default function App() {
  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/dang-nhap" element={<LoginPage />} />
                <Route path="/dang-ky" element={<RegisterPage />} />
                <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
                <Route path="/ho-so" element={<ProfilePage />} />

                {/* ── Phase 3: Core Modules ── */}
                <Route path="/quyen-loi" element={<RightsPage />} />
                <Route path="/ket-noi" element={<ConnectionPage />} />
                <Route path="/ban-do" element={<SupportMapPage />} />

                {/* ── Additional Completed Pages ── */}
                <Route path="/gop-y" element={<FeedbackPage />} />
                <Route path="/ve-chung-toi" element={<AboutPage />} />
                <Route path="/dieu-khoan" element={<TermsPage />} />
                <Route path="/bao-mat" element={<PrivacyPage />} />

                {/* ── Phase 4: Social Allowance ── */}
                <Route path="/tro-cap" element={<SocialAllowancePage />} />

                {/* ── Phase 5: Admin Panel ── */}
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  );
}
