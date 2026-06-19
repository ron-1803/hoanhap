import { db, auth, isFirebaseConfigured } from "./firebase";
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc, 
  setDoc,
  updateDoc
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import {
  DEFAULT_POLICIES,
  DEFAULT_DOCUMENTS,
  DEFAULT_LOCATIONS,
  DEFAULT_CONNECTIONS,
  DEFAULT_OFFICES,
  DEFAULT_ARTICLES,
  DEFAULT_FORUM_POSTS
} from "../utils/defaultData";

// Tự động tạo tài khoản Admin mặc định
async function seedAdminUser() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      "admin@hoanhap.vn",
      "AdminPassword123"
    );
    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      fullName: "Quản trị viên",
      email: "admin@hoanhap.vn",
      phone: "0987654321",
      disabilityType: "không khuyết tật",
      region: "Hà Nội",
      needs: "",
      savedBenefits: [],
      role: "admin",
      status: "active",
      createdAt: new Date().toISOString()
    });
    console.log("Admin account successfully seeded.");
  } catch (error) {
    if (error.code !== "auth/email-already-in-use") {
      console.warn("Seeding admin account warning:", error.message);
    }
  }
}

// Hàm seed chung cho các collection Firestore
export async function seedDatabase() {
  if (!isFirebaseConfigured || !db || !auth) {
    console.warn("[Firebase] Database seeding skipped because Firebase is not configured.");
    return;
  }

  try {
    // 1. Seed Admin User
    await seedAdminUser();

    // Helper function to seed collection if empty
    const seedIfEmpty = async (colName, defaultData) => {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) {
        console.log(`Seeding collection: ${colName}...`);
        for (const item of defaultData) {
          // Remove ID field if present, Firestore generates auto IDs
          const { id, ...dataToSave } = item;
          await addDoc(colRef, dataToSave);
        }
        console.log(`Finished seeding: ${colName}`);
      }
    };

    // 2. Seed Policies
    await seedIfEmpty("policies", DEFAULT_POLICIES);

    // 3. Seed Documents
    await seedIfEmpty("documents", DEFAULT_DOCUMENTS);

    // 4. Seed Locations
    await seedIfEmpty("locations", DEFAULT_LOCATIONS);

    // 5. Seed Connections
    await seedIfEmpty("connections", DEFAULT_CONNECTIONS);

    // 6. Seed Welfare Offices
    await seedIfEmpty("welfareOffices", DEFAULT_OFFICES);

    // 7. Seed Articles
    await seedIfEmpty("articles", DEFAULT_ARTICLES);

    // 7.5. Seed Forum Posts
    await seedIfEmpty("forum_posts", DEFAULT_FORUM_POSTS);

    // 8. Seed global settings
    const settingsRef = doc(db, "settings", "system");
    const settingsSnap = await getDoc(settingsRef);
    if (!settingsSnap.exists()) {
      await setDoc(settingsRef, {
        allowanceBaseRate: 360000
      });
      console.log("Seeded system settings.");
    }

    // 9. Fix forum_posts structure if needed
    try {
      const forumRef = collection(db, "forum_posts");
      const snap = await getDocs(forumRef);
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (!data.content && data.comments && data.comments.content) {
          await updateDoc(docSnap.ref, {
            content: data.comments.content,
            comments: []
          });
          console.log(`Fixed forum_posts document: ${docSnap.id}`);
        }
      }
    } catch (err) {
      console.warn("Failed to fix forum_posts:", err);
    }

    console.log("Firebase Database Seeding check complete.");
  } catch (error) {
    console.error("Firebase Database Seeding failed:", error);
  }
}

