import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Icon from "../components/ui/Icon";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { db } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc
} from "firebase/firestore";

export default function AdminPage() {
  const { user } = useAuth();
  const { speakText } = useAccessibility();

  // Redirect if not logged in as Admin
  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Active Tab
  const [activeTab, setActiveTab] = useState("overview"); // overview | users | rights | locations | connections | allowance

  // Datasets states
  const [users, setUsers] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [offices, setOffices] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);

  // Base rate config
  const [allowanceRate, setAllowanceRate] = useState(360000);
  const [rateInput, setRateInput] = useState("360000");

  // Form states - Rights Policy Add/Edit
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false);
  const [editingPolicyId, setEditingPolicyId] = useState(null);
  const [policyForm, setPolicyForm] = useState({
    name: "",
    category: "Chăm sóc sức khỏe",
    icon: "medical_services",
    description: "",
    conditions: "",
    supportRate: "",
    docsText: "",
    disabilityTypesText: "Tất cả",
    ageGroupsText: "Tất cả",
    provincesText: "Tất cả",
  });

  // Form states - Legal Document Add/Edit
  const [isDocFormOpen, setIsDocFormOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState(null);
  const [docForm, setDocForm] = useState({
    title: "",
    date: "",
    url: "",
  });

  // Form states - Location Add/Edit
  const [isLocFormOpen, setIsLocFormOpen] = useState(false);
  const [editingLocId, setEditingLocId] = useState(null);
  const [locForm, setLocForm] = useState({
    name: "",
    category: "Cơ sở phục hồi chức năng",
    address: "",
    phone: "",
    workingHours: "08:00 - 17:00",
    lat: "",
    lng: "",
    description: "",
    badgesText: "Dốc xe lăn, Thang máy tiếp cận",
  });

  // Form states - Connection Add/Edit
  const [isConnFormOpen, setIsConnFormOpen] = useState(false);
  const [editingConnId, setEditingConnId] = useState(null);
  const [connForm, setConnForm] = useState({
    name: "",
    type: "tình nguyện viên",
    location: "",
    region: "Hà Nội",
    supportType: "Hướng dẫn thủ tục",
    description: "",
    email: "",
    phone: "",
    availability: "Thỏa thuận",
    details: "",
  });

  // Form states - Welfare Office Add/Edit
  const [isOfficeFormOpen, setIsOfficeFormOpen] = useState(false);
  const [editingOfficeId, setEditingOfficeId] = useState(null);
  const [officeForm, setOfficeForm] = useState({
    city: "Hà Nội",
    name: "",
    address: "",
    phone: "",
    email: "",
  });

  // Selected feedback for detail modal
  const [viewingFeedback, setViewingFeedback] = useState(null);

  // Load datasets on mount using Firestore subscriptions
  useEffect(() => {
    // 1. Sync Users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setUsers(list);
    });

    // 2. Sync Base Allowance Rate
    const settingsRef = doc(db, "settings", "system");
    const unsubscribeSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.allowanceBaseRate !== undefined) {
          setAllowanceRate(Number(data.allowanceBaseRate));
          setRateInput(String(data.allowanceBaseRate));
        }
      }
    });

    // 3. Sync Policies
    const unsubscribePolicies = onSnapshot(collection(db, "policies"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setPolicies(list);
    });

    // 4. Sync Documents
    const unsubscribeDocs = onSnapshot(collection(db, "documents"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setDocuments(list);
    });

    // 5. Sync Map Locations
    const unsubscribeLocations = onSnapshot(collection(db, "locations"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setLocations(list);
    });

    // 6. Sync Connections
    const unsubscribeConnections = onSnapshot(collection(db, "connections"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setConnections(list);
    });

    // 7. Sync Welfare Offices
    const unsubscribeOffices = onSnapshot(collection(db, "welfareOffices"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setOffices(list);
    });

    // 8. Sync Feedbacks
    const unsubscribeFeedbacks = onSnapshot(collection(db, "feedbacks"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setFeedbacks(list);
    });

    // 9. Sync Forum Posts
    const unsubscribeForumPosts = onSnapshot(collection(db, "forum_posts"), (snapshot) => {
      const list = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      setForumPosts(list);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeSettings();
      unsubscribePolicies();
      unsubscribeDocs();
      unsubscribeLocations();
      unsubscribeConnections();
      unsubscribeOffices();
      unsubscribeFeedbacks();
      unsubscribeForumPosts();
    };
  }, []);

  // Update Base Rate
  const handleUpdateRate = async (e) => {
    e.preventDefault();
    const rateVal = parseInt(rateInput, 10);
    if (isNaN(rateVal) || rateVal <= 0) {
      speakText("Lỗi: Mức chuẩn trợ cấp không hợp lệ.");
      alert("Mức chuẩn trợ cấp phải là số dương.");
      return;
    }
    try {
      await setDoc(doc(db, "settings", "system"), { allowanceBaseRate: rateVal }, { merge: true });
      speakText(`Đã cập nhật mức chuẩn trợ cấp xã hội thành ${rateVal.toLocaleString("vi-VN")} đồng.`);
      alert("Cập nhật mức trợ cấp chuẩn thành công!");
    } catch (err) {
      console.error("Failed to update base rate:", err);
      alert("Lỗi khi cập nhật mức trợ cấp.");
    }
  };

  // Toggle user status
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const nextStatus = currentStatus === "suspended" ? "active" : "suspended";
      await updateDoc(doc(db, "users", userId), { status: nextStatus });
      speakText(`Đã thay đổi trạng thái của tài khoản thành ${nextStatus === "suspended" ? "Bị khoá" : "Đang hoạt động"}`);
    } catch (err) {
      console.error("Failed to toggle user status:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      try {
        await deleteDoc(doc(db, "users", userId));
        speakText("Đã xóa tài khoản.");
        alert("Xóa tài khoản thành công!");
      } catch (err) {
        console.error("Failed to delete user:", err);
        alert("Lỗi khi xóa tài khoản: " + err.message);
      }
    }
  };

  const handleUpdateUserBadge = async (userId, newBadge) => {
    try {
      await updateDoc(doc(db, "users", userId), { badge: newBadge });
      speakText(`Đã cập nhật danh hiệu thành ${newBadge || "Không có"}`);
    } catch (err) {
      console.error("Failed to update user badge:", err);
      alert("Lỗi khi cập nhật danh hiệu.");
    }
  };

  // Save Rights Policy
  const handleSavePolicy = async (e) => {
    e.preventDefault();
    if (!policyForm.name || !policyForm.description || !policyForm.supportRate) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    const docsArray = policyForm.docsText.split(",").map((s) => s.trim()).filter((s) => s);
    const disabilityArray = policyForm.disabilityTypesText.split(",").map((s) => s.trim()).filter((s) => s);
    const ageArray = policyForm.ageGroupsText.split(",").map((s) => s.trim()).filter((s) => s);
    const provincesArray = policyForm.provincesText.split(",").map((s) => s.trim()).filter((s) => s);

    const policyData = {
      name: policyForm.name,
      category: policyForm.category,
      icon: policyForm.icon,
      description: policyForm.description,
      conditions: policyForm.conditions,
      supportRate: policyForm.supportRate,
      documents: docsArray,
      disabilityTypes: disabilityArray,
      ageGroups: ageArray,
      provinces: provincesArray,
    };

    try {
      if (editingPolicyId) {
        await updateDoc(doc(db, "policies", editingPolicyId), policyData);
        speakText(`Đã cập nhật chính sách ${policyForm.name}.`);
      } else {
        await addDoc(collection(db, "policies"), policyData);
        speakText(`Đã thêm mới chính sách ${policyForm.name}.`);
      }
    } catch (err) {
      console.error("Failed to save policy:", err);
      alert("Lỗi khi lưu chính sách.");
    }

    setIsPolicyFormOpen(false);
    setEditingPolicyId(null);
    setPolicyForm({
      name: "",
      category: "Chăm sóc sức khỏe",
      icon: "medical_services",
      description: "",
      conditions: "",
      supportRate: "",
      docsText: "",
      disabilityTypesText: "Tất cả",
      ageGroupsText: "Tất cả",
      provincesText: "Tất cả",
    });
  };

  const handleEditPolicy = (pol) => {
    setEditingPolicyId(pol.id);
    setPolicyForm({
      name: pol.name,
      category: pol.category,
      icon: pol.icon || "medical_services",
      description: pol.description,
      conditions: pol.conditions || "",
      supportRate: pol.supportRate,
      docsText: (pol.documents || []).join(", "),
      disabilityTypesText: (pol.disabilityTypes || []).join(", "),
      ageGroupsText: (pol.ageGroups || []).join(", "),
      provincesText: (pol.provinces || []).join(", "),
    });
    setIsPolicyFormOpen(true);
  };

  const handleDeletePolicy = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chính sách này?")) {
      try {
        await deleteDoc(doc(db, "policies", id));
        speakText("Đã xóa chính sách.");
        alert("Xóa chính sách thành công!");
      } catch (err) {
        console.error("Failed to delete policy:", err);
        alert("Lỗi khi xóa chính sách: " + err.message);
      }
    }
  };

  // Save Legal Document
  const handleSaveDoc = async (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.url) {
      alert("Vui lòng điền tiêu đề và liên kết.");
      return;
    }

    const docData = {
      title: docForm.title,
      date: docForm.date || "Không xác định",
      url: docForm.url,
    };

    try {
      if (editingDocId) {
        await updateDoc(doc(db, "documents", editingDocId), docData);
        speakText(`Đã cập nhật văn bản ${docForm.title}.`);
      } else {
        await addDoc(collection(db, "documents"), docData);
        speakText(`Đã thêm mới văn bản ${docForm.title}.`);
      }
    } catch (err) {
      console.error("Failed to save document:", err);
      alert("Lỗi khi lưu văn bản.");
    }

    setIsDocFormOpen(false);
    setEditingDocId(null);
    setDocForm({ title: "", date: "", url: "" });
  };

  const handleEditDoc = (doc) => {
    setEditingDocId(doc.id);
    setDocForm({
      title: doc.title,
      date: doc.date || "",
      url: doc.url,
    });
    setIsDocFormOpen(true);
  };

  const handleDeleteDoc = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa văn bản pháp luật này?")) {
      try {
        await deleteDoc(doc(db, "documents", id));
        speakText("Đã xóa văn bản.");
        alert("Xóa văn bản thành công!");
      } catch (err) {
        console.error("Failed to delete document:", err);
        alert("Lỗi khi xóa văn bản: " + err.message);
      }
    }
  };

  // Save/Update Map Location
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    if (!locForm.name || !locForm.address || !locForm.lat || !locForm.lng) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    const badgeArray = locForm.badgesText.split(",").map((s) => s.trim()).filter((s) => s);

    const locationData = {
      name: locForm.name,
      category: locForm.category,
      icon: locForm.category === "Cơ sở phục hồi chức năng" ? "local_hospital" : locForm.category === "Trung tâm giáo dục đặc biệt" ? "school" : "groups",
      lat: parseFloat(locForm.lat),
      lng: parseFloat(locForm.lng),
      address: locForm.address,
      phone: locForm.phone,
      workingHours: locForm.workingHours,
      distance: "0.0 km",
      accessibilityBadges: badgeArray,
      utilities: badgeArray,
      description: locForm.description,
    };

    try {
      if (editingLocId) {
        await updateDoc(doc(db, "locations", editingLocId), locationData);
        speakText(`Đã cập nhật thông tin địa điểm ${locForm.name}.`);
      } else {
        await addDoc(collection(db, "locations"), locationData);
        speakText(`Đã thêm mới địa điểm ${locForm.name}.`);
      }
    } catch (err) {
      console.error("Failed to save location:", err);
      alert("Lỗi khi lưu địa điểm.");
    }

    setIsLocFormOpen(false);
    setEditingLocId(null);
    setLocForm({
      name: "",
      category: "Cơ sở phục hồi chức năng",
      address: "",
      phone: "",
      workingHours: "08:00 - 17:00",
      lat: "",
      lng: "",
      description: "",
      badgesText: "Dốc xe lăn, Thang máy tiếp cận",
    });
  };

  const handleEditLocation = (loc) => {
    setEditingLocId(loc.id);
    setLocForm({
      name: loc.name,
      category: loc.category,
      address: loc.address,
      phone: loc.phone || "",
      workingHours: loc.workingHours || "08:00 - 17:00",
      lat: loc.lat.toString(),
      lng: loc.lng.toString(),
      description: loc.description || "",
      badgesText: (loc.accessibilityBadges || []).join(", "),
    });
    setIsLocFormOpen(true);
  };

  const handleDeleteLocation = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa địa điểm này khỏi bản đồ?")) {
      try {
        await deleteDoc(doc(db, "locations", id));
        speakText("Đã xóa địa điểm.");
        alert("Xóa địa điểm thành công!");
      } catch (err) {
        console.error("Failed to delete location:", err);
        alert("Lỗi khi xóa địa điểm: " + err.message);
      }
    }
  };

  // Save/Update Connections / Volunteers
  const handleSaveConnection = async (e) => {
    e.preventDefault();
    if (!connForm.name || !connForm.email || !connForm.phone || !connForm.location) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    const connData = {
      name: connForm.name,
      type: connForm.type,
      typeLabel: connForm.type === "tình nguyện viên" ? "Tình nguyện viên" : "Cộng đồng",
      location: connForm.location,
      region: connForm.region,
      supportType: connForm.supportType,
      description: connForm.description || "Hồ sơ kết nối mới được tạo.",
      email: connForm.email,
      phone: connForm.phone,
      availability: connForm.availability,
      details: connForm.details,
      avatarUrl: connForm.type === "tình nguyện viên"
        ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
        : "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=200",
    };

    try {
      if (editingConnId) {
        await updateDoc(doc(db, "connections", editingConnId), connData);
        speakText(`Đã cập nhật hồ sơ kết nối của ${connForm.name}.`);
      } else {
        await addDoc(collection(db, "connections"), { ...connData, status: "approved" });
        speakText(`Đã thêm mới hồ sơ kết nối ${connForm.name}.`);
      }
    } catch (err) {
      console.error("Failed to save connection:", err);
      alert("Lỗi khi lưu hồ sơ kết nối.");
    }

    setIsConnFormOpen(false);
    setEditingConnId(null);
    setConnForm({
      name: "",
      type: "tình nguyện viên",
      location: "",
      region: "Hà Nội",
      supportType: "Hướng dẫn thủ tục",
      description: "",
      email: "",
      phone: "",
      availability: "Thỏa thuận",
      details: "",
    });
  };

  const handleEditConnection = (conn) => {
    setEditingConnId(conn.id);
    setConnForm({
      name: conn.name,
      type: conn.type,
      location: conn.location,
      region: conn.region,
      supportType: conn.supportType,
      description: conn.description || "",
      email: conn.email,
      phone: conn.phone,
      availability: conn.availability || "Thỏa thuận",
      details: conn.details || "",
    });
    setIsConnFormOpen(true);
  };

  const handleDeleteConnection = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ kết nối này?")) {
      try {
        await deleteDoc(doc(db, "connections", id));
        speakText("Đã xóa hồ sơ kết nối.");
        alert("Xóa hồ sơ kết nối thành công!");
      } catch (err) {
        console.error("Failed to delete connection:", err);
        alert("Lỗi khi xóa hồ sơ kết nối: " + err.message);
      }
    }
  };

  // Approve a pending volunteer request
  const handleApproveConnection = async (id, name) => {
    try {
      await updateDoc(doc(db, "connections", id), { status: "approved" });
      speakText(`Đã phê duyệt hồ sơ tình nguyện viên của ${name}.`);
      alert("Phê duyệt thành công!");
    } catch (err) {
      console.error("Failed to approve connection:", err);
      alert("Lỗi khi phê duyệt hồ sơ.");
    }
  };

  // Save/Update Welfare Office
  const handleSaveOffice = async (e) => {
    e.preventDefault();
    if (!officeForm.name || !officeForm.address || !officeForm.phone) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    const officeData = {
      city: officeForm.city,
      name: officeForm.name,
      address: officeForm.address,
      phone: officeForm.phone,
      email: officeForm.email,
    };

    try {
      if (editingOfficeId !== null) {
        await updateDoc(doc(db, "welfareOffices", editingOfficeId), officeData);
        speakText(`Đã cập nhật cơ quan tiếp nhận ${officeForm.name}.`);
      } else {
        await addDoc(collection(db, "welfareOffices"), officeData);
        speakText(`Đã thêm cơ quan tiếp nhận ${officeForm.name}.`);
      }
    } catch (err) {
      console.error("Failed to save office:", err);
      alert("Lỗi khi lưu cơ quan tiếp nhận.");
    }

    setIsOfficeFormOpen(false);
    setEditingOfficeId(null);
    setOfficeForm({
      city: "Hà Nội",
      name: "",
      address: "",
      phone: "",
      email: "",
    });
  };

  const handleEditOffice = (off) => {
    setEditingOfficeId(off.id);
    setOfficeForm({
      city: off.city || "Hà Nội",
      name: off.name,
      address: off.address,
      phone: off.phone || "",
      email: off.email || "",
    });
    setIsOfficeFormOpen(true);
  };

  const handleDeleteOffice = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cơ quan tiếp nhận hồ sơ này?")) {
      try {
        await deleteDoc(doc(db, "welfareOffices", id));
        speakText("Đã xóa cơ quan tiếp nhận.");
        alert("Xóa cơ quan tiếp nhận thành công!");
      } catch (err) {
        console.error("Failed to delete office:", err);
        alert("Lỗi khi xóa cơ quan tiếp nhận: " + err.message);
      }
    }
  };

  // Feedback Actions
  const toggleFeedbackStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === "resolved" ? "pending" : "resolved";
      await updateDoc(doc(db, "feedbacks", id), { status: nextStatus });
      speakText(`Đã đổi trạng thái góp ý thành ${nextStatus === "resolved" ? "Đã xử lý" : "Chưa xử lý"}`);
    } catch (err) {
      console.error("Failed to toggle feedback status:", err);
    }
  };

  const handleDeleteFeedback = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa góp ý này?")) {
      try {
        await deleteDoc(doc(db, "feedbacks", id));
        speakText("Đã xóa góp ý.");
        alert("Xóa góp ý thành công!");
        if (viewingFeedback && viewingFeedback.id === id) {
          setViewingFeedback(null);
        }
      } catch (err) {
        console.error("Failed to delete feedback:", err);
        alert("Lỗi khi xóa góp ý: " + err.message);
      }
    }
  };

  const handleDeleteForumPost = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết diễn đàn này?")) {
      try {
        await deleteDoc(doc(db, "forum_posts", id));
        speakText("Đã xóa bài viết.");
        alert("Xóa bài viết thành công!");
      } catch (err) {
        console.error("Failed to delete forum post:", err);
        alert("Lỗi khi xóa bài viết: " + err.message);
      }
    }
  };

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-24 animate-[fadeIn_0.2s_ease-out]">
      {/* ─── Header Section ─── */}
      <section className="relative w-full bg-primary text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed border-b-2 border-primary-container p-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-headline-xl text-headline-xl mb-2 flex items-center gap-2">
              <Icon name="admin_panel_settings" size="text-4xl" />
              Bảng quản trị hệ thống
            </h1>
            <p className="text-sm opacity-90">
              Quản trị dữ liệu cho 4 phân hệ cốt lõi: Quyền lợi, Bản đồ, Kết nối cộng đồng và Tính trợ cấp xã hội.
            </p>
          </div>
          <span className="bg-primary-container text-on-primary-container dark:bg-on-primary-fixed-variant dark:text-primary-fixed text-xs font-extrabold px-3 py-1.5 rounded-full uppercase tracking-wider">
            Quyền: Quản trị viên
          </span>
        </div>
      </section>

      {/* ─── Tab Navigation Bar ─── */}
      <section className="bg-surface-container-high dark:bg-tertiary border-b border-outline-variant/60 w-full theme-transition">
        <div className="max-w-[1440px] mx-auto px-gutter flex overflow-x-auto gap-2 py-3 scrollbar-hide">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all accessibility-focus whitespace-nowrap ${
              activeTab === "overview" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/40"
            }`}
          >
            <Icon name="monitoring" size="text-sm" />
            Tổng quan
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all accessibility-focus whitespace-nowrap ${
              activeTab === "users" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/40"
            }`}
          >
            <Icon name="manage_accounts" size="text-sm" />
            Thành viên ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("rights")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all accessibility-focus whitespace-nowrap ${
              activeTab === "rights" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/40"
            }`}
          >
            <Icon name="policy" size="text-sm" />
            1. Quyền lợi & Văn bản ({policies.length})
          </button>
          <button
            onClick={() => setActiveTab("connections")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all accessibility-focus whitespace-nowrap ${
              activeTab === "connections" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/40"
            }`}
          >
            <Icon name="diversity_1" size="text-sm" />
            2. Hồ sơ kết nối ({connections.length})
          </button>
          <button
            onClick={() => setActiveTab("forum")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all accessibility-focus whitespace-nowrap ${
              activeTab === "forum" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/40"
            }`}
          >
            <Icon name="forum" size="text-sm" />
            3. Diễn đàn ({forumPosts.length})
          </button>
          <button
            onClick={() => setActiveTab("allowance")}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all accessibility-focus whitespace-nowrap ${
              activeTab === "allowance" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:bg-surface-variant/40"
            }`}
          >
            <Icon name="payments" size="text-sm" />
            4. Trợ cấp & Cơ quan ({offices.length})
          </button>
        </div>
      </section>

      {/* ─── Tab Content ─── */}
      <div className="max-w-[1440px] mx-auto px-gutter mt-8">

        {/* ── Tab 1: Overview ── */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-[fadeIn_0.15s_ease-out]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 theme-transition shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">Tổng số thành viên</span>
                  <Icon name="group" className="text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-on-surface dark:text-inverse-on-surface">{users.length}</div>
              </div>
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 theme-transition shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">Chính sách & Văn bản</span>
                  <Icon name="description" className="text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-on-surface dark:text-inverse-on-surface">{policies.length + documents.length}</div>
              </div>
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 theme-transition shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">Địa điểm hỗ trợ</span>
                  <Icon name="pin_drop" className="text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-on-surface dark:text-inverse-on-surface">{locations.length}</div>
              </div>
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 theme-transition shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-on-surface-variant dark:text-tertiary-fixed-dim uppercase tracking-wider">Góp ý chưa giải quyết</span>
                  <Icon name="feedback" className="text-primary" />
                </div>
                <div className="text-3xl font-extrabold text-on-surface dark:text-inverse-on-surface">{feedbacks.filter((f) => f.status === "pending").length}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition">
                <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface mb-4 flex items-center gap-2">
                  <Icon name="tune" className="text-primary" />
                  Mức chuẩn trợ cấp xã hội
                </h2>
                <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mb-6 leading-relaxed">
                  Cấu hình chuẩn tối thiểu (được dùng để tự động nhân hệ số chi trả theo Nghị định 20).
                </p>
                <form onSubmit={handleUpdateRate} className="space-y-4">
                  <div>
                    <label htmlFor="base-rate-input" className="block text-xs font-bold text-on-surface dark:text-inverse-on-surface mb-2">
                      Chuẩn trợ cấp hiện hành (VND)
                    </label>
                    <input
                      type="number"
                      id="base-rate-input"
                      value={rateInput}
                      onChange={(e) => setRateInput(e.target.value)}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm flex items-center justify-center gap-2 accessibility-focus active:scale-95 text-xs"
                  >
                    Lưu cấu hình
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition flex flex-col justify-between">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface mb-4 flex items-center gap-2">
                    <Icon name="info" className="text-primary" />
                    Hướng dẫn Đồng bộ Cơ sở Dữ liệu
                  </h2>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed space-y-2">
                    Hệ thống đang hoạt động dưới cơ chế **Mock Database (`localStorage`)**. Mọi thay đổi thực hiện trên trang quản trị này (Thêm/Sửa/Xóa chính sách, bản đồ, tình nguyện viên, cơ quan) sẽ được lưu trữ cục bộ và đồng bộ hóa ngay lập tức lên giao diện của người dùng.
                    <br/><br/>
                    Khi tích hợp các cơ sở dữ liệu thực (MongoDB, MySQL, Supabase, v.v.), lập trình viên chỉ cần thay thế các lệnh lấy/ghi `localStorage` bằng API Call (`fetch` / `axios` endpoints: `/api/policies`, `/api/locations`, `/api/connections`, `/api/offices`). Các biểu mẫu và cấu trúc quản trị UI đã được thiết lập hoàn chỉnh theo chuẩn backend JSON.
                  </p>
                </div>
                <div className="text-xs text-primary dark:text-inverse-primary font-bold mt-4">
                  * Dữ liệu hiện tại đã sẵn sàng cấu trúc JSON chuẩn backend.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 2: Users ── */}
        {activeTab === "users" && (
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition animate-[fadeIn_0.15s_ease-out]">
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface mb-2 flex items-center gap-2">
              <Icon name="manage_accounts" className="text-primary" />
              Quản lý tài khoản thành viên
            </h2>
            <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mb-6">
              Xem danh sách và chặn/mở khóa các tài khoản đăng ký trên hệ thống Cổng Hòa Nhập.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs" role="table">
                <thead>
                  <tr className="border-b border-outline-variant/60" role="row">
                    <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Họ tên / Email</th>
                    <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Quyền hạn</th>
                    <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Danh hiệu</th>
                    <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Trạng thái</th>
                    <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-right" role="columnheader">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-on-surface-variant/60">Chưa có người dùng nào đăng ký trên hệ thống.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-outline-variant/30 last:border-b-0" role="row">
                        <td className="py-3 pr-2" role="cell">
                          <div className="font-bold text-on-surface dark:text-inverse-on-surface">{u.fullName}</div>
                          <div className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim mt-0.5">{u.email}</div>
                        </td>
                        <td className="py-3 text-center" role="cell">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                            u.role === "admin" ? "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300" : "bg-surface-variant text-on-surface-variant"
                          }`}>
                            {u.role === "admin" ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="py-3 text-center" role="cell">
                          <select
                            value={u.badge || ""}
                            onChange={(e) => handleUpdateUserBadge(u.id, e.target.value)}
                            className="bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-lg p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-primary theme-transition max-w-[120px]"
                          >
                            <option value="">(Không có)</option>
                            <option value="Trái tim Vàng">Trái tim Vàng</option>
                            <option value="Đại sứ Hoà Nhập">Đại sứ Hoà Nhập</option>
                            <option value="Chuyên gia Tư vấn">Chuyên gia Tư vấn</option>
                            <option value="Người truyền cảm hứng">Người truyền cảm hứng</option>
                          </select>
                        </td>
                        <td className="py-3 text-center" role="cell">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                            u.status === "suspended" ? "bg-error-container text-on-error-container" : "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300"
                          }`}>
                            {u.status === "suspended" ? "Bị khóa" : "Hoạt động"}
                          </span>
                        </td>
                        <td className="py-3 text-right" role="cell">
                          {u.role !== "admin" && (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => toggleUserStatus(u.id, u.status)}
                                title={u.status === "suspended" ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                                className={`p-1.5 rounded-lg border transition-colors accessibility-focus ${
                                  u.status === "suspended" ? "border-teal-500 text-teal-600 hover:bg-teal-50" : "border-error text-error hover:bg-error-container/10"
                                }`}
                              >
                                <Icon name={u.status === "suspended" ? "check" : "block"} size="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                title="Xóa"
                                className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                              >
                                <Icon name="delete" size="text-sm" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Tab 3: Rights Policies & Legal Documents ── */}
        {activeTab === "rights" && (
          <div className="space-y-8 animate-[fadeIn_0.15s_ease-out]">
            {/* Phân hệ 1: Chính sách quyền lợi */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-4 md:p-6 shadow-sm theme-transition">
                <div>
                  <h2 className="font-bold text-base text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                    <Icon name="policy" className="text-primary" />
                    Quản lý Chính sách Quyền lợi NKT
                  </h2>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim">
                    Thêm và chỉnh sửa các chính sách quyền lợi (Y tế, Giáo dục, Việc làm, Giao thông, Văn hóa).
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingPolicyId(null);
                    setPolicyForm({
                      name: "",
                      category: "Chăm sóc sức khỏe",
                      icon: "medical_services",
                      description: "",
                      conditions: "",
                      supportRate: "",
                      docsText: "",
                      disabilityTypesText: "Tất cả",
                      ageGroupsText: "Tất cả",
                      provincesText: "Tất cả",
                    });
                    setIsPolicyFormOpen(!isPolicyFormOpen);
                  }}
                  className="bg-primary text-on-primary font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-1.5 accessibility-focus active:scale-95"
                >
                  <Icon name={isPolicyFormOpen ? "expand_less" : "add"} size="text-sm" />
                  {isPolicyFormOpen ? "Đóng form" : "Thêm chính sách"}
                </button>
              </div>

              {isPolicyFormOpen && (
                <form onSubmit={handleSavePolicy} className="bg-surface-container dark:bg-tertiary border-2 border-primary/40 dark:border-outline rounded-3xl p-6 shadow-md theme-transition grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="md:col-span-2 font-bold text-sm text-primary dark:text-inverse-primary border-b border-outline-variant/60 pb-2 flex items-center gap-2">
                    <Icon name="edit" />
                    {editingPolicyId ? "Cập nhật thông tin chính sách" : "Thêm chính sách quyền lợi mới"}
                  </h3>
                  <div>
                    <label htmlFor="pol-name" className="block text-xs font-bold mb-1.5">Tên chính sách (*)</label>
                    <input
                      id="pol-name"
                      type="text"
                      required
                      value={policyForm.name}
                      onChange={(e) => setPolicyForm({ ...policyForm, name: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                      placeholder="Ví dụ: Cấp thẻ Bảo hiểm y tế miễn phí..."
                    />
                  </div>
                  <div>
                    <label htmlFor="pol-category" className="block text-xs font-bold mb-1.5">Phân nhóm chính sách (*)</label>
                    <select
                      id="pol-category"
                      value={policyForm.category}
                      onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    >
                      <option value="Chăm sóc sức khỏe">Chăm sóc sức khỏe</option>
                      <option value="Giáo dục & Đào tạo">Giáo dục & Đào tạo</option>
                      <option value="Việc làm & Sinh kế">Việc làm & Sinh kế</option>
                      <option value="Giao thông & Công trình">Giao thông & Công trình</option>
                      <option value="Văn hóa, Thể thao & Du lịch">Văn hóa, Thể thao & Du lịch</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pol-icon" className="block text-xs font-bold mb-1.5">Icon hiển thị</label>
                    <select
                      id="pol-icon"
                      value={policyForm.icon}
                      onChange={(e) => setPolicyForm({ ...policyForm, icon: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    >
                      <option value="medical_services">Medical Services (Y tế)</option>
                      <option value="school">School (Giáo dục)</option>
                      <option value="work">Work (Việc làm)</option>
                      <option value="accessible">Accessible (Giao thông/Tiếp cận)</option>
                      <option value="theater_comedy">Theater (Văn hóa/Thể thao)</option>
                      <option value="payments">Payments (Tiền mặt/Trợ cấp)</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="pol-rate" className="block text-xs font-bold mb-1.5">Mức hỗ trợ quy định (*)</label>
                    <input
                      id="pol-rate"
                      type="text"
                      required
                      value={policyForm.supportRate}
                      onChange={(e) => setPolicyForm({ ...policyForm, supportRate: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                      placeholder="Miễn phí 100% / Hỗ trợ 150.000đ/tháng..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="pol-desc" className="block text-xs font-bold mb-1.5">Mô tả chính sách (*)</label>
                    <textarea
                      id="pol-desc"
                      required
                      rows="2"
                      value={policyForm.description}
                      onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none resize-none"
                      placeholder="Mô tả tóm tắt nội dung ưu đãi..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="pol-cond" className="block text-xs font-bold mb-1.5">Điều kiện áp dụng</label>
                    <input
                      id="pol-cond"
                      type="text"
                      value={policyForm.conditions}
                      onChange={(e) => setPolicyForm({ ...policyForm, conditions: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                      placeholder="Ví dụ: Là người khuyết tật nặng hoặc đặc biệt nặng..."
                    />
                  </div>
                  <div>
                    <label htmlFor="pol-disabilities" className="block text-xs font-bold mb-1.5">Dạng khuyết tật hỗ trợ (phân cách bằng dấu phẩy)</label>
                    <input
                      id="pol-disabilities"
                      type="text"
                      value={policyForm.disabilityTypesText}
                      onChange={(e) => setPolicyForm({ ...policyForm, disabilityTypesText: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                      placeholder="Tất cả, Trực quan/Khiếm thị, Vận động..."
                    />
                  </div>
                  <div>
                    <label htmlFor="pol-ages" className="block text-xs font-bold mb-1.5">Nhóm độ tuổi hỗ trợ (phân cách bằng dấu phẩy)</label>
                    <input
                      id="pol-ages"
                      type="text"
                      value={policyForm.ageGroupsText}
                      onChange={(e) => setPolicyForm({ ...policyForm, ageGroupsText: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                      placeholder="Tất cả, Trẻ em (<16 tuổi), Người trưởng thành (16-60 tuổi)..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="pol-docs" className="block text-xs font-bold mb-1.5">Giấy tờ cần chuẩn bị (phân cách bằng dấu phẩy)</label>
                    <input
                      id="pol-docs"
                      type="text"
                      value={policyForm.docsText}
                      onChange={(e) => setPolicyForm({ ...policyForm, docsText: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                      placeholder="Tờ khai đăng ký cấp thẻ BHYT, Bản sao Giấy xác nhận mức độ khuyết tật..."
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsPolicyFormOpen(false);
                        setEditingPolicyId(null);
                      }}
                      className="border border-outline px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-surface-variant/30 accessibility-focus"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm accessibility-focus"
                    >
                      {editingPolicyId ? "Cập nhật chính sách" : "Thêm mới chính sách"}
                    </button>
                  </div>
                </form>
              )}

              {/* Table listing policies */}
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" role="table">
                    <thead>
                      <tr className="border-b border-outline-variant/60" role="row">
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Chính sách / Phân nhóm</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Mức hỗ trợ quy định</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Số giấy tờ yêu cầu</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-right" role="columnheader">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {policies.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-on-surface-variant/60">Không có chính sách quyền lợi nào.</td>
                        </tr>
                      ) : (
                        policies.map((pol) => (
                          <tr key={pol.id} className="border-b border-outline-variant/30 last:border-b-0" role="row">
                            <td className="py-3 pr-2" role="cell">
                              <div className="font-bold text-on-surface dark:text-inverse-on-surface">{pol.name}</div>
                              <div className="text-[10px] text-primary mt-0.5">{pol.category}</div>
                            </td>
                            <td className="py-3 font-semibold text-on-surface-variant" role="cell">
                              {pol.supportRate}
                            </td>
                            <td className="py-3 text-center font-mono text-on-surface-variant" role="cell">
                              {(pol.documents || []).length}
                            </td>
                            <td className="py-3 text-right" role="cell">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditPolicy(pol)}
                                  title="Chỉnh sửa"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-surface-variant/50 transition-colors accessibility-focus"
                                >
                                  <Icon name="edit" size="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDeletePolicy(pol.id)}
                                  title="Xóa"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                                >
                                  <Icon name="delete" size="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Phân hệ 2: Văn bản pháp lý */}
            <div className="space-y-4 pt-6 border-t border-outline-variant/50">
              <div className="flex justify-between items-center bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-4 md:p-6 shadow-sm theme-transition">
                <div>
                  <h2 className="font-bold text-base text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                    <Icon name="description" className="text-primary" />
                    Quản lý Văn bản Pháp luật liên quan
                  </h2>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim">
                    Thêm các nghị định, luật đính kèm liên quan để người dùng tải về tham khảo.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingDocId(null);
                    setDocForm({ title: "", date: "", url: "" });
                    setIsDocFormOpen(!isDocFormOpen);
                  }}
                  className="bg-primary text-on-primary font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-1.5 accessibility-focus active:scale-95"
                >
                  <Icon name={isDocFormOpen ? "expand_less" : "add"} size="text-sm" />
                  {isDocFormOpen ? "Đóng form" : "Thêm văn bản"}
                </button>
              </div>

              {isDocFormOpen && (
                <form onSubmit={handleSaveDoc} className="bg-surface-container dark:bg-tertiary border-2 border-primary/40 dark:border-outline rounded-3xl p-6 shadow-md theme-transition grid grid-cols-1 gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="font-bold text-sm text-primary dark:text-inverse-primary border-b border-outline-variant/60 pb-2 flex items-center gap-2">
                    <Icon name="gavel" />
                    {editingDocId ? "Cập nhật văn bản pháp lý" : "Thêm mới văn bản luật"}
                  </h3>
                  <div>
                    <label htmlFor="doc-title" className="block text-xs font-bold mb-1.5">Tiêu đề văn bản (*)</label>
                    <input
                      id="doc-title"
                      type="text"
                      required
                      value={docForm.title}
                      onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                      placeholder="Ví dụ: Nghị định 20/2021/NĐ-CP..."
                    />
                  </div>
                  <div>
                    <label htmlFor="doc-date" className="block text-xs font-bold mb-1.5">Ngày ban hành / Mô tả ngắn</label>
                    <input
                      id="doc-date"
                      type="text"
                      value={docForm.date}
                      onChange={(e) => setDocForm({ ...docForm, date: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                      placeholder="Ban hành ngày 17/03/2021..."
                    />
                  </div>
                  <div>
                    <label htmlFor="doc-url" className="block text-xs font-bold mb-1.5">Đường dẫn tệp tài liệu (*)</label>
                    <input
                      id="doc-url"
                      type="text"
                      required
                      value={docForm.url}
                      onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent theme-transition"
                      placeholder="Ví dụ: /documents/nghi_dinh_20_2021_nd_cp.pdf..."
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDocFormOpen(false);
                        setEditingDocId(null);
                      }}
                      className="border border-outline px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-surface-variant/30 accessibility-focus"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm accessibility-focus"
                    >
                      {editingDocId ? "Cập nhật văn bản" : "Lưu văn bản"}
                    </button>
                  </div>
                </form>
              )}

              {/* Table listing documents */}
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" role="table">
                    <thead>
                      <tr className="border-b border-outline-variant/60" role="row">
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Tên văn bản luật</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Ngày ban hành / Ghi chú</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Liên kết tệp</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-right" role="columnheader">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-on-surface-variant/60">Không có văn bản pháp luật nào.</td>
                        </tr>
                      ) : (
                        documents.map((doc) => (
                          <tr key={doc.id} className="border-b border-outline-variant/30 last:border-b-0" role="row">
                            <td className="py-3 font-bold text-on-surface dark:text-inverse-on-surface" role="cell">{doc.title}</td>
                            <td className="py-3 font-semibold text-on-surface-variant" role="cell">{doc.date}</td>
                            <td className="py-3 font-mono text-xs text-primary truncate max-w-[200px]" role="cell">{doc.url}</td>
                            <td className="py-3 text-right" role="cell">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditDoc(doc)}
                                  title="Sửa"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-surface-variant/50 transition-colors accessibility-focus"
                                >
                                  <Icon name="edit" size="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  title="Xóa"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                                >
                                  <Icon name="delete" size="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 5: Community Connections ── */}
        {activeTab === "connections" && (
          <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex justify-between items-center bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-4 md:p-6 shadow-sm theme-transition">
              <div>
                <h2 className="font-bold text-base text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                  <Icon name="diversity_1" className="text-primary" />
                  Quản lý Hồ sơ Kết nối & Tình nguyện viên
                </h2>
                <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim">
                  Đăng ký thông tin các cá nhân hoặc tổ chức thiện nguyện sẵn sàng giúp đỡ NKT.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingConnId(null);
                  setConnForm({
                    name: "",
                    type: "tình nguyện viên",
                    location: "",
                    region: "Hà Nội",
                    supportType: "Hướng dẫn thủ tục",
                    description: "",
                    email: "",
                    phone: "",
                    availability: "Thỏa thuận",
                    details: "",
                  });
                  setIsConnFormOpen(!isConnFormOpen);
                }}
                className="bg-primary text-on-primary font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-1.5 accessibility-focus active:scale-95"
              >
                <Icon name={isConnFormOpen ? "expand_less" : "add"} size="text-sm" />
                {isConnFormOpen ? "Đóng form" : "Thêm hồ sơ"}
              </button>
            </div>

            {isConnFormOpen && (
              <form onSubmit={handleSaveConnection} className="bg-surface-container dark:bg-tertiary border-2 border-primary/40 dark:border-outline rounded-3xl p-6 shadow-md theme-transition grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.2s_ease-out]">
                <h3 className="md:col-span-2 font-bold text-sm text-primary dark:text-inverse-primary border-b border-outline-variant/60 pb-2 flex items-center gap-2">
                  <Icon name="volunteer_activism" />
                  {editingConnId ? "Hiệu chỉnh hồ sơ kết nối" : "Thêm hồ sơ kết nối mới"}
                </h3>
                <div>
                  <label htmlFor="conn-name" className="block text-xs font-bold mb-1.5">Tên hiển thị (*)</label>
                  <input
                    id="conn-name"
                    type="text"
                    required
                    value={connForm.name}
                    onChange={(e) => setConnForm({ ...connForm, name: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    placeholder="Nguyễn Văn A / Đội xe..."
                  />
                </div>
                <div>
                  <label htmlFor="conn-type" className="block text-xs font-bold mb-1.5">Phân loại (*)</label>
                  <select
                    id="conn-type"
                    value={connForm.type}
                    onChange={(e) => setConnForm({ ...connForm, type: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                  >
                    <option value="tình nguyện viên">Tình nguyện viên cá nhân</option>
                    <option value="cộng đồng">Cộng đồng / Tổ chức</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="conn-region" className="block text-xs font-bold mb-1.5">Khu vực (*)</label>
                  <select
                    id="conn-region"
                    value={connForm.region}
                    onChange={(e) => setConnForm({ ...connForm, region: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                  >
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="conn-location" className="block text-xs font-bold mb-1.5">Địa bàn chi tiết (*)</label>
                  <input
                    id="conn-location"
                    type="text"
                    required
                    value={connForm.location}
                    onChange={(e) => setConnForm({ ...connForm, location: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    placeholder="Quận Cầu Giấy, Hà Nội..."
                  />
                </div>
                <div>
                  <label htmlFor="conn-support" className="block text-xs font-bold mb-1.5">Hình thức hỗ trợ chính</label>
                  <select
                    id="conn-support"
                    value={connForm.supportType}
                    onChange={(e) => setConnForm({ ...connForm, supportType: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                  >
                    <option value="Hướng dẫn thủ tục">Hướng dẫn thủ tục</option>
                    <option value="Vận chuyển">Vận chuyển</option>
                    <option value="Hỗ trợ học tập">Hỗ trợ học tập</option>
                    <option value="Chăm sóc">Chăm sóc sức khỏe tại nhà</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="conn-availability" className="block text-xs font-bold mb-1.5">Thời gian rảnh</label>
                  <input
                    id="conn-availability"
                    type="text"
                    value={connForm.availability}
                    onChange={(e) => setConnForm({ ...connForm, availability: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    placeholder="Cuối tuần / Tối 3-5-7..."
                  />
                </div>
                <div>
                  <label htmlFor="conn-email" className="block text-xs font-bold mb-1.5">Địa chỉ Email (*)</label>
                  <input
                    id="conn-email"
                    type="email"
                    required
                    value={connForm.email}
                    onChange={(e) => setConnForm({ ...connForm, email: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    placeholder="email@address.com"
                  />
                </div>
                <div>
                  <label htmlFor="conn-phone" className="block text-xs font-bold mb-1.5">Số điện thoại (*)</label>
                  <input
                    id="conn-phone"
                    type="text"
                    required
                    value={connForm.phone}
                    onChange={(e) => setConnForm({ ...connForm, phone: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    placeholder="09..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="conn-desc" className="block text-xs font-bold mb-1.5">Mô tả ngắn gọn</label>
                  <input
                    id="conn-desc"
                    type="text"
                    value={connForm.description}
                    onChange={(e) => setConnForm({ ...connForm, description: e.target.value })}
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    placeholder="Có xe lăn nâng, nhận dạy tin học cơ bản..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="conn-details" className="block text-xs font-bold mb-1.5">Thông tin kinh nghiệm chi tiết</label>
                  <textarea
                    id="conn-details"
                    value={connForm.details}
                    onChange={(e) => setConnForm({ ...connForm, details: e.target.value })}
                    rows="3"
                    className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none resize-none"
                    placeholder="Mong muốn trợ giúp và kĩ năng xã hội..."
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsConnFormOpen(false);
                      setEditingConnId(null);
                    }}
                    className="border border-outline px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-surface-variant/30 accessibility-focus"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm accessibility-focus"
                  >
                    {editingConnId ? "Cập nhật hồ sơ" : "Lưu hồ sơ"}
                  </button>
                </div>
              </form>
            )}

            <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" role="table">
                  <thead>
                    <tr className="border-b border-outline-variant/60" role="row">
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Họ tên / Email</th>
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Phân loại</th>
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Địa bàn / Hỗ trợ</th>
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Trạng thái</th>
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-right" role="columnheader">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {connections.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-on-surface-variant/60">Không có hồ sơ kết nối nào.</td>
                      </tr>
                    ) : (
                      connections.map((conn) => (
                        <tr key={conn.id} className="border-b border-outline-variant/30 last:border-b-0" role="row">
                          <td className="py-3 pr-2" role="cell">
                            <div className="font-bold text-on-surface dark:text-inverse-on-surface">{conn.name}</div>
                            <div className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim mt-0.5">{conn.email} | SĐT: {conn.phone}</div>
                          </td>
                          <td className="py-3" role="cell">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                              conn.type === "tình nguyện viên" ? "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300" : "bg-blue-100 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300"
                            }`}>
                              {conn.typeLabel}
                            </span>
                          </td>
                          <td className="py-3 font-semibold text-on-surface-variant" role="cell">
                            <div>{conn.region} ({conn.location})</div>
                            <div className="text-[10px] text-primary mt-0.5">{conn.supportType}</div>
                          </td>
                          <td className="py-3 text-center" role="cell">
                            <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                              conn.status === "approved" ? "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300" : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                            }`}>
                              {conn.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
                            </span>
                          </td>
                          <td className="py-3 text-right" role="cell">
                            <div className="flex justify-end gap-2">
                              {conn.status !== "approved" && (
                                <button
                                  onClick={() => handleApproveConnection(conn.id, conn.name)}
                                  title="Phê duyệt hồ sơ"
                                  className="p-1.5 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-colors accessibility-focus"
                                >
                                  <Icon name="check" size="text-sm" />
                                </button>
                              )}
                              <button
                                onClick={() => handleEditConnection(conn)}
                                title="Sửa"
                                className="p-1.5 rounded-lg border border-outline hover:bg-surface-variant/50 transition-colors accessibility-focus"
                              >
                                <Icon name="edit" size="text-sm" />
                              </button>
                              <button
                                onClick={() => handleDeleteConnection(conn.id)}
                                title="Xóa"
                                className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                              >
                                <Icon name="delete" size="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* ── Tab 4: Forum Posts ── */}
        {activeTab === "forum" && (
          <div className="space-y-6 animate-[fadeIn_0.15s_ease-out]">
            <div className="flex justify-between items-center bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-4 md:p-6 shadow-sm theme-transition">
              <div>
                <h2 className="font-bold text-base text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                  <Icon name="forum" className="text-primary" />
                  Quản lý Bài viết Diễn đàn
                </h2>
                <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim">
                  Xem và quản lý các bài đăng của người dùng trên Diễn đàn Kết nối.
                </p>
              </div>
            </div>

            <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs" role="table">
                  <thead>
                    <tr className="border-b border-outline-variant/60" role="row">
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Nội dung bài viết</th>
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Thông tin</th>
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Tương tác</th>
                      <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-right" role="columnheader">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forumPosts.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-on-surface-variant/60">Không có bài viết diễn đàn nào.</td>
                      </tr>
                    ) : (
                      forumPosts.map((post) => (
                        <tr key={post.id} className="border-b border-outline-variant/30 last:border-b-0" role="row">
                          <td className="py-3 pr-2 w-1/2" role="cell">
                            <div className="font-bold text-on-surface dark:text-inverse-on-surface line-clamp-2">{post.content}</div>
                            <div className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim mt-0.5">{new Date(post.createdAt).toLocaleString("vi-VN")}</div>
                          </td>
                          <td className="py-3" role="cell">
                            <span className="px-2 py-0.5 rounded font-bold text-[9px] uppercase bg-surface-variant dark:bg-tertiary-container text-on-surface-variant">
                              {post.subType}
                            </span>
                            <div className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim mt-1.5 flex items-center gap-1">
                              <Icon name="person" size="text-[10px]" /> {post.authorName}
                            </div>
                          </td>
                          <td className="py-3 text-center" role="cell">
                            <div className="flex items-center justify-center gap-3 text-on-surface-variant">
                              <span className="flex items-center gap-1" title="Lượt thích"><Icon name="thumb_up" size="text-[12px]" /> {post.likesCount || 0}</span>
                              <span className="flex items-center gap-1" title="Bình luận"><Icon name="chat_bubble" size="text-[12px]" /> {(post.comments || []).length}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right" role="cell">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDeleteForumPost(post.id)}
                                title="Xóa bài viết"
                                className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                              >
                                <Icon name="delete" size="text-sm" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* ── Tab 6: Social Allowance Offices & Feedbacks ── */}
        {activeTab === "allowance" && (
          <div className="space-y-8 animate-[fadeIn_0.15s_ease-out]">
            {/* Phân hệ 1: Sở/Phòng Lao động - Thương binh & Xã hội */}
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-4 md:p-6 shadow-sm theme-transition">
                <div>
                  <h2 className="font-bold text-base text-on-surface dark:text-inverse-on-surface flex items-center gap-2">
                    <Icon name="store" className="text-primary" />
                    Quản lý Cơ quan Tiếp nhận Trợ cấp Xã hội
                  </h2>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim">
                    Nhập danh sách các Sở LĐ-TB&XH tỉnh/thành phố để hướng dẫn NKT địa điểm nộp hồ sơ.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setEditingOfficeId(null);
                    setOfficeForm({
                      city: "Hà Nội",
                      name: "",
                      address: "",
                      phone: "",
                      email: "",
                    });
                    setIsOfficeFormOpen(!isOfficeFormOpen);
                  }}
                  className="bg-primary text-on-primary font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all flex items-center gap-1.5 accessibility-focus active:scale-95"
                >
                  <Icon name={isOfficeFormOpen ? "expand_less" : "add"} size="text-sm" />
                  {isOfficeFormOpen ? "Đóng form" : "Thêm cơ quan"}
                </button>
              </div>

              {isOfficeFormOpen && (
                <form onSubmit={handleSaveOffice} className="bg-surface-container dark:bg-tertiary border-2 border-primary/40 dark:border-outline rounded-3xl p-6 shadow-md theme-transition grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeIn_0.2s_ease-out]">
                  <h3 className="md:col-span-2 font-bold text-sm text-primary dark:text-inverse-primary border-b border-outline-variant/60 pb-2 flex items-center gap-2">
                    <Icon name="place" />
                    {editingOfficeId !== null ? "Hiệu chỉnh cơ quan tiếp nhận" : "Thêm mới cơ quan tiếp nhận"}
                  </h3>
                  <div>
                    <label htmlFor="off-city" className="block text-xs font-bold mb-1.5">Tỉnh / Thành phố (*)</label>
                    <select
                      id="off-city"
                      value={officeForm.city}
                      onChange={(e) => setOfficeForm({ ...officeForm, city: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                    >
                      <option value="Hà Nội">Hà Nội</option>
                      <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                      <option value="Đà Nẵng">Đà Nẵng</option>
                      <option value="Cần Thơ">Cần Thơ</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="off-name" className="block text-xs font-bold mb-1.5">Tên cơ quan tiếp nhận (*)</label>
                    <input
                      id="off-name"
                      type="text"
                      required
                      value={officeForm.name}
                      onChange={(e) => setOfficeForm({ ...officeForm, name: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                      placeholder="Sở Lao động - Thương binh & Xã hội..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="off-addr" className="block text-xs font-bold mb-1.5">Địa chỉ (*)</label>
                    <input
                      id="off-addr"
                      type="text"
                      required
                      value={officeForm.address}
                      onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                      placeholder="Số nhà, Tên đường, Quận/Huyện..."
                    />
                  </div>
                  <div>
                    <label htmlFor="off-phone" className="block text-xs font-bold mb-1.5">Điện thoại liên hệ (*)</label>
                    <input
                      id="off-phone"
                      type="text"
                      required
                      value={officeForm.phone}
                      onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                      placeholder="Ví dụ: 024 ..."
                    />
                  </div>
                  <div>
                    <label htmlFor="off-email" className="block text-xs font-bold mb-1.5">Thư điện tử (Email)</label>
                    <input
                      id="off-email"
                      type="email"
                      value={officeForm.email}
                      onChange={(e) => setOfficeForm({ ...officeForm, email: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                      placeholder="vanthu@sldtxh.gov.vn..."
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOfficeFormOpen(false);
                        setEditingOfficeId(null);
                      }}
                      className="border border-outline px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-surface-variant/30 accessibility-focus"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="bg-primary text-on-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm accessibility-focus"
                    >
                      {editingOfficeId !== null ? "Cập nhật cơ quan" : "Thêm cơ quan"}
                    </button>
                  </div>
                </form>
              )}

              {/* Table listing welfare offices */}
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm theme-transition">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" role="table">
                    <thead>
                      <tr className="border-b border-outline-variant/60" role="row">
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Tên cơ quan / Địa chỉ</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Khu vực</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Điện thoại / Email</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-right" role="columnheader">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {offices.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-6 text-center text-on-surface-variant/60">Không có cơ quan tiếp nhận hồ sơ nào.</td>
                        </tr>
                      ) : (
                        offices.map((off) => (
                          <tr key={off.id} className="border-b border-outline-variant/30 last:border-b-0" role="row">
                            <td className="py-3 pr-2" role="cell">
                              <div className="font-bold text-on-surface dark:text-inverse-on-surface">{off.name}</div>
                              <div className="text-[10px] text-on-surface-variant mt-0.5">{off.address}</div>
                            </td>
                            <td className="py-3 font-semibold text-on-surface-variant" role="cell">{off.city}</td>
                            <td className="py-3 text-on-surface-variant font-mono" role="cell">
                              <div>{off.phone}</div>
                              <div className="text-[10px] mt-0.5">{off.email || "—"}</div>
                            </td>
                            <td className="py-3 text-right" role="cell">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditOffice(off)}
                                  title="Chỉnh sửa"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-surface-variant/50 transition-colors accessibility-focus"
                                >
                                  <Icon name="edit" size="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOffice(off.id)}
                                  title="Xóa"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                                >
                                  <Icon name="delete" size="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Phân hệ 2: Xem ý kiến đóng góp */}
            <div className="space-y-4 pt-6 border-t border-outline-variant/50">
              <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-2xl p-6 shadow-sm theme-transition">
                <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface mb-2 flex items-center gap-2">
                  <Icon name="feedback" className="text-primary" />
                  Ý kiến Đóng góp & Báo cáo Rào cản
                </h2>
                <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim mb-6">
                  Hiển thị phản hồi từ người sử dụng dịch vụ. Các báo cáo rào cản tiếp cận của NKT được đánh dấu ưu tiên.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs" role="table">
                    <thead>
                      <tr className="border-b border-outline-variant/60" role="row">
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Người gửi / Ngày gửi</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase" role="columnheader">Chủ đề</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Phân loại</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-center" role="columnheader">Trạng thái</th>
                        <th className="pb-3 font-bold text-on-surface-variant/70 uppercase text-right" role="columnheader">Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feedbacks.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-6 text-center text-on-surface-variant/60">Không nhận được phản hồi đóng góp nào.</td>
                        </tr>
                      ) : (
                        feedbacks.map((fb) => (
                          <tr key={fb.id} className="border-b border-outline-variant/30 last:border-b-0" role="row">
                            <td className="py-3 pr-2" role="cell">
                              <div className="font-bold text-on-surface dark:text-inverse-on-surface">{fb.name}</div>
                              <div className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim mt-0.5">{fb.contactInfo}</div>
                              <div className="text-[9px] text-on-surface-variant/60 mt-0.5">{new Date(fb.submittedAt).toLocaleString("vi-VN")}</div>
                            </td>
                            <td className="py-3 font-semibold text-on-surface-variant" role="cell">
                              <div>{fb.subject || "Không có tiêu đề"}</div>
                              <div className="text-[10px] text-primary mt-0.5">{fb.feedbackType}</div>
                            </td>
                            <td className="py-3 text-center" role="cell">
                              {fb.isBarrierReport ? (
                                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-300 font-bold text-[9px] rounded uppercase">
                                  Rào cản tiếp cận
                                </span>
                              ) : (
                                <span className="text-on-surface-variant/40">—</span>
                              )}
                            </td>
                            <td className="py-3 text-center" role="cell">
                              <span className={`px-2 py-0.5 rounded font-bold text-[9px] uppercase ${
                                fb.status === "resolved" ? "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300" : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                              }`}>
                                {fb.status === "resolved" ? "Đã xử lý" : "Chờ xử lý"}
                              </span>
                            </td>
                            <td className="py-3 text-right" role="cell">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setViewingFeedback(fb)}
                                  title="Xem"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-surface-variant/50 transition-colors accessibility-focus"
                                >
                                  <Icon name="visibility" size="text-sm" />
                                </button>
                                <button
                                  onClick={() => toggleFeedbackStatus(fb.id, fb.status)}
                                  title={fb.status === "resolved" ? "Đánh dấu Chưa xử lý" : "Đánh dấu Đã xử lý"}
                                  className={`p-1.5 rounded-lg border transition-colors accessibility-focus ${
                                    fb.status === "resolved" ? "border-amber-500 text-amber-600 hover:bg-amber-50" : "border-teal-500 text-teal-600 hover:bg-teal-50"
                                  }`}
                                >
                                  <Icon name={fb.status === "resolved" ? "restart_alt" : "done_all"} size="text-sm" />
                                </button>
                                <button
                                  onClick={() => handleDeleteFeedback(fb.id)}
                                  title="Xóa"
                                  className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                                >
                                  <Icon name="delete" size="text-sm" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── View Feedback Modal ── */}
      {viewingFeedback && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface dark:bg-tertiary border-2 border-outline dark:border-outline-variant w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/50 bg-primary text-on-primary">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Icon name="mail" />
                Chi tiết phản hồi góp ý
              </h2>
              <button
                onClick={() => setViewingFeedback(null)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors accessibility-focus"
              >
                <Icon name="close" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-on-surface dark:text-inverse-on-surface">
              <div>
                <span className="font-bold text-on-surface-variant uppercase block text-[10px] mb-1">Người gửi</span>
                <p className="font-semibold text-sm">{viewingFeedback.name}</p>
                <p className="text-on-surface-variant">{viewingFeedback.contactInfo}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-bold text-on-surface-variant uppercase block text-[10px] mb-1">Loại phản hồi</span>
                  <p className="font-semibold">{viewingFeedback.feedbackType}</p>
                </div>
                <div>
                  <span className="font-bold text-on-surface-variant uppercase block text-[10px] mb-1">Thời gian gửi</span>
                  <p className="font-semibold">{new Date(viewingFeedback.submittedAt).toLocaleString("vi-VN")}</p>
                </div>
              </div>
              <div>
                <span className="font-bold text-on-surface-variant uppercase block text-[10px] mb-1">Chủ đề</span>
                <p className="font-semibold text-sm">{viewingFeedback.subject || "Không có chủ đề"}</p>
              </div>
              <div className="bg-surface-container-high dark:bg-tertiary-container p-4 rounded-xl border border-outline-variant/60 leading-relaxed text-sm">
                {viewingFeedback.message}
              </div>
              {viewingFeedback.isBarrierReport && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 rounded-xl border border-red-200">
                  <Icon name="warning" />
                  <span className="font-bold text-[10px] uppercase">Góp ý báo cáo lỗi rào cản tiếp cận của NKT</span>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-outline-variant/50 flex justify-end gap-3 bg-surface-container dark:bg-tertiary/40">
              <button
                onClick={() => {
                  toggleFeedbackStatus(viewingFeedback.id, viewingFeedback.status);
                  setViewingFeedback(null);
                }}
                className="bg-primary text-on-primary font-bold text-xs px-4 py-2 rounded-lg hover:bg-primary-container transition-all"
              >
                {viewingFeedback.status === "resolved" ? "Đánh dấu chưa xử lý" : "Đánh dấu đã xử lý"}
              </button>
              <button
                onClick={() => setViewingFeedback(null)}
                className="border border-outline px-4 py-2 rounded-lg font-bold text-xs hover:bg-surface-variant/30"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
