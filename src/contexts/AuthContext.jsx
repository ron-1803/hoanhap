import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAccessibility } from "./AccessibilityContext";
import { auth, db, firebaseConfigError, isFirebaseConfigured } from "../services/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { seedDatabase } from "../services/firebaseSeed";

/* ═══════════════════════════════════════════════════════════════════
   AuthContext (Firebase Integrated)
   ───────────────────────────────────────────────────────────────────
   Handles client-side authentication and session management.
   Connects to Firebase Auth and persists profile data in Firestore.
   ═══════════════════════════════════════════════════════════════════ */

const AuthContext = createContext(null);
const firebaseUnavailableMessage =
  firebaseConfigError || "Firebase chưa được cấu hình. Vui lòng kiểm tra file .env.";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { speakText } = useAccessibility();

  // Run database seeding on start, then initialize active user session
  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const initDb = async () => {
      await seedDatabase();
    };
    initDb();
  }, []);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      setUser(null);
      setLoading(false);
      setError(firebaseUnavailableMessage);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: firebaseUser.uid,
              ...userData
            });
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("[AuthContext] Auth state change handler failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // ── Login ────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth || !db) {
        throw new Error(firebaseUnavailableMessage);
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userDocRef = doc(db, "users", firebaseUser.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.status === "suspended") {
          await signOut(auth);
          throw new Error("Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ quản trị viên.");
        }
        const sessionUser = { uid: firebaseUser.uid, ...userData };
        setUser(sessionUser);
        speakText(`Đăng nhập thành công. Chào mừng ${userData.fullName} trở lại.`);
        return sessionUser;
      } else {
        throw new Error("Không tìm thấy thông tin tài khoản trên hệ thống.");
      }
    } catch (err) {
      let errMsg = "Đăng nhập thất bại. Vui lòng kiểm tra lại.";
      if (
        err.code === "auth/user-not-found" || 
        err.code === "auth/wrong-password" || 
        err.code === "auth/invalid-credential"
      ) {
        errMsg = "Tên đăng nhập hoặc mật khẩu không chính xác.";
      } else {
        errMsg = err.message;
      }
      setError(errMsg);
      speakText(`Lỗi đăng nhập: ${errMsg}`);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [speakText]);

  // ── Register ─────────────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth || !db) {
        throw new Error(firebaseUnavailableMessage);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
      const firebaseUser = userCredential.user;

      const newUser = {
        fullName: userData.fullName,
        email: userData.email,
        phone: userData.phone || "",
        disabilityType: userData.disabilityType || "không khuyết tật",
        region: userData.region || "",
        needs: userData.needs || "",
        savedBenefits: [],
        role: "user",
        status: "active",
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      
      const sessionUser = { uid: firebaseUser.uid, ...newUser };
      setUser(sessionUser);
      speakText(`Đăng ký tài khoản thành công. Đã tự động đăng nhập làm ${sessionUser.fullName}.`);
      return sessionUser;
    } catch (err) {
      let errMsg = err.message;
      if (err.code === "auth/email-already-in-use") {
        errMsg = "Email này đã được sử dụng.";
      }
      setError(errMsg);
      speakText(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [speakText]);

  // ── Logout ───────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (!isFirebaseConfigured || !auth) {
        setUser(null);
        speakText("Đã đăng xuất khỏi phiên cục bộ.");
        return;
      }

      await signOut(auth);
      setUser(null);
      speakText("Đã đăng xuất khỏi hệ thống.");
    } catch (err) {
      console.error("[AuthContext] Logout failed:", err);
    }
  }, [speakText]);

  // ── Update Profile ───────────────────────────────────────────────
  const updateProfile = useCallback(async (updatedData) => {
    if (!user || !user.uid) return;
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !db) {
        throw new Error(firebaseUnavailableMessage);
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, updatedData);

      const updatedSessionUser = {
        ...user,
        ...updatedData
      };
      setUser(updatedSessionUser);
      speakText("Cập nhật hồ sơ cá nhân thành công.");
      return updatedSessionUser;
    } catch (err) {
      const errMsg = "Không thể cập nhật hồ sơ người dùng.";
      setError(errMsg);
      speakText(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [user, speakText]);

  // ── Toggle Saved Policy / Bookmark ────────────────────────────────
  const toggleSaveBenefit = useCallback(async (benefitId) => {
    if (!user) {
      speakText("Vui lòng đăng nhập để lưu quyền lợi này.");
      throw new Error("Authentication required");
    }

    const currentSaved = user.savedBenefits || [];
    let nextSaved = [];
    let isSaved = false;

    if (currentSaved.includes(benefitId)) {
      nextSaved = currentSaved.filter((id) => id !== benefitId);
      speakText("Đã bỏ lưu quyền lợi.");
    } else {
      nextSaved = [...currentSaved, benefitId];
      isSaved = true;
      speakText("Đã lưu quyền lợi vào hồ sơ cá nhân.");
    }

    await updateProfile({ savedBenefits: nextSaved });
    return isSaved;
  }, [user, updateProfile, speakText]);

  // ── Reset Password ───────────────────────────────────────────────
  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      if (!isFirebaseConfigured || !auth) {
        throw new Error(firebaseUnavailableMessage);
      }

      await sendPasswordResetEmail(auth, email);
      speakText("Yêu cầu đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra email.");
      return true;
    } catch (err) {
      let errMsg = "Gửi yêu cầu đặt lại mật khẩu thất bại.";
      if (err.code === "auth/user-not-found") {
        errMsg = "Email này chưa được đăng ký trong hệ thống.";
      }
      setError(errMsg);
      speakText(errMsg);
      throw new Error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [speakText]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    toggleSaveBenefit,
    resetPassword,
    isFirebaseConfigured,
    firebaseConfigError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;



