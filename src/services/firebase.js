import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const requiredFirebaseKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId"
];

const missingFirebaseKeys = requiredFirebaseKeys.filter((key) => !firebaseConfig[key]);

export const isFirebaseConfigured = missingFirebaseKeys.length === 0;
export const firebaseConfigError = isFirebaseConfigured
  ? ""
  : "Thiếu cấu hình Firebase. Vui lòng tạo file .env dựa trên .env.example để chạy đầy đủ tính năng.";

if (!isFirebaseConfigured) {
  console.warn(
    "[Firebase] Missing required config:",
    missingFirebaseKeys.join(", ")
  );
}

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const analytics = app ? getAnalytics(app) : null;
export default app;
