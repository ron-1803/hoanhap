import { useState, useEffect, useMemo, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import Icon from "../components/ui/Icon";
import Button from "../components/ui/Button";

// Thematic Board categories definition
const FORUM_BOARDS = {
  support: {
    labelVi: "Trạm Tiếp Sức",
    labelEn: "Support Station",
    icon: "volunteer_activism",
    subTypes: [
      { key: "all", vi: "Tất cả", en: "All" },
      { key: "mẹo vặt", vi: "Mẹo vặt (Life-Hacks)", en: "Life-Hacks" },
      { key: "đồng hành", vi: "Cần Bạn Đồng Hành", en: "Need Companion" },
      { key: "tư vấn", vi: "Tư vấn Quyền lợi", en: "Benefits Q&A" }
    ]
  },
  inspiration: {
    labelVi: "Lửa Truyền Cảm Hứng",
    labelEn: "Inspiration Flame",
    icon: "campaign",
    subTypes: [
      { key: "all", vi: "Tất cả", en: "All" },
      { key: "nhật ký", vi: "Nhật ký \"Tôi Hoà Nhập\"", en: "My Journey Blog" },
      { key: "thấu cảm", vi: "Lắng nghe & Thấu cảm", en: "Empathy Space" }
    ]
  },
  aspiration: {
    labelVi: "Cơ Hội & Khát Vọng",
    labelEn: "Aspiration & Opportunities",
    icon: "school",
    subTypes: [
      { key: "all", vi: "Tất cả", en: "All" },
      { key: "kỹ năng", vi: "Sàn kỹ năng mềm", en: "Skills Sharing" },
      { key: "việc làm", vi: "Hội chợ việc làm", en: "Inclusive Jobs" }
    ]
  }
};

export default function ForumPage({ isTab = false }) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { speakText } = useAccessibility();

  // State
  const [posts, setPosts] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState("support");
  const [selectedSubType, setSelectedSubType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals & form state
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [newPostForm, setNewPostForm] = useState({
    title: "",
    board: "support",
    subType: "mẹo vặt",
    content: ""
  });
  
  const [activeSupportPost, setActiveSupportPost] = useState(null);
  const [supportForm, setSupportForm] = useState({
    name: user?.fullName || "",
    contactInfo: user?.phone || user?.email || "",
    message: ""
  });
  const [supportSuccess, setSupportSuccess] = useState(false);

  // Comments state per post
  const [commentInputs, setCommentInputs] = useState({});

  // Subscribe to forum posts on mount
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "forum_posts"), (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort by createdAt descending
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setPosts(list);
    });
    return unsubscribe;
  }, []);

  // Filter posts based on Board, Sub-type, and Search Query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesBoard = post.board === selectedBoard;
      const matchesSubType = selectedSubType === "all" || post.subType === selectedSubType;
      const matchesSearch =
        searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.authorName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBoard && matchesSubType && matchesSearch;
    });
  }, [posts, selectedBoard, selectedSubType, searchQuery]);

  // Compute active members
  const activeMembers = useMemo(() => {
    const counts = {};
    posts.forEach(post => {
      if (!counts[post.authorId]) {
        counts[post.authorId] = {
          id: post.authorId,
          name: post.authorName,
          badge: post.authorBadge,
          count: 0
        };
      }
      counts[post.authorId].count += 1;
    });
    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [posts]);

  // Compute posts count per board
  const boardCounts = useMemo(() => {
    const counts = {};
    posts.forEach(post => {
      counts[post.board] = (counts[post.board] || 0) + 1;
    });
    return counts;
  }, [posts]);

  // Handle reaction submission
  const handleReact = async (postId, reactionType) => {
    if (!user) {
      alert(language === "en" ? "Please sign in to react!" : "Vui lòng đăng nhập để bày tỏ cảm xúc!");
      return;
    }

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Initialize map if missing
    const currentReactions = post.reactions || { care: 0, inspire: 0, withYou: 0 };
    const nextCount = (currentReactions[reactionType] || 0) + 1;

    try {
      const postRef = doc(db, "forum_posts", postId);
      await updateDoc(postRef, {
        [`reactions.${reactionType}`]: nextCount
      });

      // Sound notification
      const messages = {
        care: language === "en" ? "Reacted with Care" : "Đã bày tỏ Đồng cảm",
        inspire: language === "en" ? "Reacted with Inspire" : "Đã bày tỏ Ngưỡng mộ",
        withYou: language === "en" ? "Reacted with With You" : "Đã bày tỏ Đồng hành"
      };
      speakText(messages[reactionType]);
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  // Create new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!user) {
      alert(language === "en" ? "Please log in to write posts!" : "Vui lòng đăng nhập để viết bài!");
      return;
    }
    if (!newPostForm.title.trim() || !newPostForm.content.trim()) {
      alert(language === "en" ? "Please fill in all fields!" : "Vui lòng nhập đầy đủ tiêu đề và nội dung!");
      return;
    }

    const userBadge = user.badge || "";

    const newPost = {
      title: newPostForm.title,
      board: newPostForm.board,
      subType: newPostForm.subType,
      content: newPostForm.content,
      authorName: user.fullName || "Thành viên ẩn danh",
      authorId: user.uid,
      authorRole: user.role || "member",
      authorBadge: userBadge,
      reactions: { care: 0, inspire: 0, withYou: 0 },
      comments: [],
      offers: [],
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, "forum_posts"), newPost);
      speakText(language === "en" ? "Post successfully created." : "Đã đăng bài viết mới thành công.");
      setIsNewPostOpen(false);
      setNewPostForm({
        title: "",
        board: "support",
        subType: "mẹo vặt",
        content: ""
      });
    } catch (err) {
      console.error("Failed to create post:", err);
      alert("Lỗi khi đăng bài: " + err.message);
    }
  };

  // Submit comment
  const handleAddComment = async (postId) => {
    const inputVal = commentInputs[postId];
    if (!user) {
      alert(language === "en" ? "Please log in to comment!" : "Vui lòng đăng nhập để bình luận!");
      return;
    }
    if (!inputVal || !inputVal.trim()) return;

    const userBadge = user.badge || "";

    const newComment = {
      id: "comm-" + Date.now(),
      authorName: user.fullName || "Ẩn danh",
      authorRole: user.role || "member",
      authorBadge: userBadge,
      text: inputVal,
      createdAt: new Date().toISOString()
    };

    try {
      const postRef = doc(db, "forum_posts", postId);
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      });
      speakText(language === "en" ? "Comment added." : "Đã gửi bình luận.");
      setCommentInputs({ ...commentInputs, [postId]: "" });
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Lỗi bình luận: " + err.message);
    }
  };

  // Submit support offer
  const handleRegisterSupport = async (e) => {
    e.preventDefault();
    if (!supportForm.name.trim() || !supportForm.contactInfo.trim() || !supportForm.message.trim()) {
      alert(language === "en" ? "Please fill in all information!" : "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    const offer = {
      volunteerName: supportForm.name,
      contactInfo: supportForm.contactInfo,
      message: supportForm.message,
      createdAt: new Date().toISOString()
    };

    try {
      const postRef = doc(db, "forum_posts", activeSupportPost.id);
      await updateDoc(postRef, {
        offers: arrayUnion(offer)
      });
      setSupportSuccess(true);
      speakText(language === "en" ? "Support offer registered. Thank you!" : "Đăng ký hỗ trợ thành công. Xin chân thành cảm ơn!");
      setTimeout(() => {
        setSupportSuccess(false);
        setActiveSupportPost(null);
        setSupportForm({
          name: user?.fullName || "",
          contactInfo: user?.phone || user?.email || "",
          message: ""
        });
      }, 2000);
    } catch (err) {
      console.error("Failed to register support:", err);
      alert("Lỗi đăng ký hỗ trợ: " + err.message);
    }
  };

  // Delete post (only for Admin or post author)
  const handleDeletePost = async (postId, authorId) => {
    if (!user) return;
    const isAuthorized = user.role === "admin" || user.uid === authorId;
    if (!isAuthorized) {
      alert(language === "en" ? "Unauthorized action!" : "Bạn không có quyền xóa bài đăng này!");
      return;
    }

    if (window.confirm(language === "en" ? "Are you sure you want to delete this post?" : "Bạn có chắc chắn muốn xóa bài đăng này?")) {
      try {
        const { deleteDoc: fDelete } = await import("firebase/firestore");
        await fDelete(doc(db, "forum_posts", postId));
        speakText(language === "en" ? "Post deleted." : "Đã xóa bài viết.");
        alert(language === "en" ? "Post deleted successfully!" : "Xóa bài viết thành công!");
      } catch (err) {
        console.error("Failed to delete post:", err);
        alert(language === "en" ? "Error deleting post: " : "Lỗi khi xóa bài viết: " + err.message);
      }
    }
  };

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-tertiary/20 theme-transition pb-24">
      {/* ─── Hero Header ─── */}
      {!isTab && (
        <section className="relative w-full bg-primary text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed border-b-2 border-primary-container p-8">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-headline-xl text-headline-xl mb-2 flex items-center gap-2">
                <Icon name="forum" size="text-4xl" />
                {language === "en" ? "Empathy Forum" : "Diễn đàn Kết nối yêu thương"}
              </h1>
              <p className="text-sm opacity-90 max-w-xl">
                {language === "en" 
                  ? "A safe space to share lifetips, diaries, find companions, and support each other."
                  : "Không gian an toàn chia sẻ mẹo vặt cuộc sống, viết nhật ký hòa nhập, tìm bạn đồng hành và kết nối hỗ trợ."}
              </p>
            </div>
            
            <button
              onClick={() => {
                if (!user) {
                  alert(language === "en" ? "Please sign in to write a post!" : "Vui lòng đăng nhập để viết bài!");
                  return;
                }
                setIsNewPostOpen(true);
              }}
              className="bg-primary-container text-on-primary-container font-bold px-5 py-3 rounded-xl hover:bg-secondary-container hover:text-on-secondary-container transition-all shadow-md flex items-center gap-2 accessibility-focus active:scale-95 text-sm"
            >
              <Icon name="add" size="text-lg" />
              {language === "en" ? "New Thread" : "Viết bài mới"}
            </button>
          </div>
        </section>
      )}

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8">
        
        {/* ─── Top Bar: Search & New Post ─── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="relative w-full md:w-[400px]">
            <input
              type="text"
              placeholder={language === "en" ? "Search posts by title..." : "Tìm kiếm bài viết theo tiêu đề..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface dark:bg-tertiary-container border border-outline-variant/60 rounded-full pl-10 pr-4 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/50 theme-transition placeholder-gray-400"
            />
            <Icon name="search" className="absolute left-3.5 top-2.5 text-outline-variant text-lg" />
          </div>

          <button
            onClick={() => {
              if (!user) {
                alert(language === "en" ? "Please sign in to write a post!" : "Vui lòng đăng nhập để viết bài!");
                return;
              }
              setIsNewPostOpen(true);
            }}
            className="w-full md:w-auto bg-primary hover:bg-primary-dark text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed font-bold px-5 py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 accessibility-focus active:scale-95 text-sm whitespace-nowrap"
          >
            <Icon name="add" size="text-base" />
            {language === "en" ? "New Thread" : "Đăng bài mới"}
          </button>
        </div>

        {/* ─── 2-Column Main Layout ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* ─── Left Main Content (2/3) ─── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Sub-type Filters (Chủ đề phổ biến) */}
            <div className="space-y-3">
              <h2 className="font-bold text-lg text-primary-dark dark:text-inverse-primary">
                {language === "en" ? "Popular Topics" : "Chủ đề phổ biến"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {FORUM_BOARDS[selectedBoard].subTypes.map((type) => (
                  <button
                    key={type.key}
                    onClick={() => setSelectedSubType(type.key)}
                    className={`px-4 py-1.5 rounded-full font-bold text-sm transition-all accessibility-focus ${
                      selectedSubType === type.key
                        ? "bg-primary text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant dark:bg-tertiary-container dark:text-inverse-on-surface hover:bg-surface-container-highest dark:hover:bg-tertiary-fixed-dim"
                    }`}
                  >
                    {language === "en" ? type.en : type.vi}
                  </button>
                ))}
              </div>
            </div>

            {/* Posts List Header */}
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2">
              <h2 className="font-bold text-lg text-primary-dark dark:text-inverse-primary">
                {language === "en" ? "Latest Posts" : "Bài viết mới nhất"}
              </h2>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span>{language === "en" ? "Sort by:" : "Sắp xếp:"}</span>
                <select className="bg-surface dark:bg-tertiary border border-outline-variant/60 rounded-md px-2 py-1 focus:outline-none">
                  <option>{language === "en" ? "Newest" : "Mới nhất"}</option>
                  <option>{language === "en" ? "Oldest" : "Cũ nhất"}</option>
                </select>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-surface dark:bg-tertiary border border-dashed border-outline-variant rounded-2xl p-12 text-center theme-transition">
                  <Icon name="chat_bubble_outline" size="text-4xl" className="text-outline-variant mb-3" />
                  <p className="text-sm text-on-surface-variant font-medium">
                    {language === "en" 
                      ? "No posts found. Be the first to start a conversation!"
                      : "Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!"}
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="bg-white dark:bg-tertiary rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/20 hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0 overflow-hidden border-2 border-white shadow-sm">
                          <span className="text-2xl" role="img" aria-label="avatar">🧑‍🦲</span>
                        </div>
                        
                        {/* Meta */}
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-on-surface dark:text-inverse-on-surface line-clamp-1 leading-tight flex items-center gap-2">
                            {post.title}
                            {post.authorBadge && (
                              <span 
                                title={post.authorBadge}
                                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  post.authorBadge === "Đại sứ Hoà Nhập"
                                    ? "bg-teal-100 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300"
                                    : "bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
                                }`}
                              >
                                <Icon name={post.authorBadge === "Đại sứ Hoà Nhập" ? "verified" : "stars"} size="text-[10px]" />
                                {post.authorBadge}
                              </span>
                            )}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant dark:text-surface-dim mt-1">
                            <span>{language === "en" ? "By" : "Bởi"} <span className="font-bold text-primary dark:text-primary-fixed">{post.authorName}</span></span>
                            <span className="flex items-center gap-1"><Icon name="schedule" size="text-[12px]" /> {new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                            <span className="flex items-center gap-1"><Icon name="chat_bubble_outline" size="text-[12px]" /> {post.comments?.length || 0} bình luận</span>
                          </div>
                        </div>
                      </div>

                      {/* Delete Post Button (if admin or author) */}
                      {user && (user.role === "admin" || user.uid === post.authorId) && (
                        <button
                          onClick={() => handleDeletePost(post.id, post.authorId)}
                          title={language === "en" ? "Delete post" : "Xóa bài đăng"}
                          className="p-1.5 rounded-lg border border-outline-variant hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus shrink-0"
                        >
                          <Icon name="delete" size="text-xs" />
                        </button>
                      )}
                    </div>

                    {/* Excerpt */}
                    <p className="text-sm text-on-surface-variant dark:text-tertiary-fixed-dim mt-1 whitespace-pre-line">
                      {post.content}
                    </p>

                    {/* 1-Click Support Banner for "đồng hành" support posts */}
                    {post.board === "support" && post.subType === "đồng hành" && (
                      <div className="bg-primary-container/30 dark:bg-primary-fixed/10 border border-primary/30 rounded-xl p-3 my-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="text-left">
                          <div className="text-xs font-bold text-primary-dark dark:text-primary-fixed flex items-center gap-1.5">
                            <Icon name="handshake" size="text-sm" />
                            {language === "en" ? "Companion Help Needed" : "Cần hỗ trợ đồng hành trực tiếp"}
                          </div>
                          <p className="text-[10px] text-primary dark:text-primary-fixed/80 mt-1">
                            {language === "en"
                              ? "This member needs help. Contact them or offer support directly below."
                              : "Tác giả cần giúp đỡ trực tiếp. Nhấp vào nút để gửi thông tin đăng ký hỗ trợ."}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => {
                            if (!user) {
                              alert(language === "en" ? "Please sign in to support!" : "Vui lòng đăng nhập để đăng ký hỗ trợ!");
                              return;
                            }
                            setActiveSupportPost(post);
                          }}
                          className="bg-primary text-on-primary font-bold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-all shadow-sm accessibility-focus whitespace-nowrap text-[11px]"
                        >
                          {language === "en" ? "I can assist this" : "Tôi muốn hỗ trợ việc này"}
                        </button>
                      </div>
                    )}

                    {/* Footer: Tags & Reactions */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 pt-3 border-t border-outline-variant/20 gap-3">
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-[#fef5d4] dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold capitalize">
                          {post.subType}
                        </span>

                        <div className="flex gap-1.5 items-center">
                          {/* Hug/Care */}
                          <button
                            onClick={() => handleReact(post.id, "care")}
                            title={language === "en" ? "Send a Hug" : "Gửi đồng cảm"}
                            className="px-2 py-1 rounded-full border border-teal-500/30 bg-teal-50/50 hover:bg-teal-100/50 text-teal-700 font-bold text-xs flex items-center gap-1 accessibility-focus transition-all"
                          >
                            🫂 <span>{post.reactions?.care || 0}</span>
                          </button>

                          {/* Inspire */}
                          <button
                            onClick={() => handleReact(post.id, "inspire")}
                            title={language === "en" ? "Inspiring post" : "Ngưỡng mộ nghị lực"}
                            className="px-2 py-1 rounded-full border border-amber-500/30 bg-amber-50/50 hover:bg-amber-100/50 text-amber-700 font-bold text-xs flex items-center gap-1 accessibility-focus transition-all"
                          >
                            🌟 <span>{post.reactions?.inspire || 0}</span>
                          </button>

                          {/* With You */}
                          <button
                            onClick={() => handleReact(post.id, "withYou")}
                            title={language === "en" ? "Stand with you" : "Luôn đồng hành"}
                            className="px-2 py-1 rounded-full border border-blue-500/30 bg-blue-50/50 hover:bg-blue-100/50 text-blue-700 font-bold text-xs flex items-center gap-1 accessibility-focus transition-all"
                          >
                            🤝 <span>{post.reactions?.withYou || 0}</span>
                          </button>
                        </div>
                      </div>

                      {/* Offers count if any */}
                      {post.offers && post.offers.length > 0 && (
                        <span className="text-[10px] font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Icon name="check" size="text-[10px]" />
                          {post.offers.length} {language === "en" ? "assists offered" : "lượt đăng ký"}
                        </span>
                      )}
                    </div>

                    {/* Comments Section */}
                    <div className="mt-3 pt-3 border-t border-outline-variant/20">
                      {/* Render comments list */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto scrollbar-thin pr-2">
                          {post.comments.map((comm, cIndex) => (
                            <div key={comm.id || cIndex} className="flex items-start gap-3">
                              {/* Avatar */}
                              <div className="w-9 h-9 rounded-full border-2 border-primary/20 dark:border-primary-fixed/20 flex items-center justify-center shrink-0 bg-surface-container">
                                <span className="text-base" role="img" aria-label="avatar">🧑‍🦲</span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-bold text-[13px] text-primary-dark dark:text-primary-fixed">
                                    {comm.authorName}
                                  </span>
                                  {comm.authorBadge && (
                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary-dark dark:text-primary-fixed font-bold text-[9px] rounded uppercase">
                                      {comm.authorBadge}
                                    </span>
                                  )}
                                  <span className="text-[10px] text-outline ml-auto">
                                    {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString("vi-VN") : ""}
                                  </span>
                                </div>
                                <p className="text-on-surface-variant dark:text-tertiary-fixed-dim text-[13px] leading-relaxed mb-2">
                                  {comm.text}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-outline font-medium">
                                  <button className="flex items-center gap-1 hover:text-primary dark:hover:text-primary-fixed transition-colors accessibility-focus">
                                    <Icon name="thumb_up" size="text-[14px]" /> {comm.likes || 0}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setCommentInputs({ ...commentInputs, [post.id]: `@${comm.authorName} ` });
                                      setTimeout(() => {
                                        const el = document.getElementById(`comment-input-${post.id}`);
                                        if (el) el.focus();
                                      }, 0);
                                    }}
                                    className="flex items-center gap-1 hover:text-primary dark:hover:text-primary-fixed transition-colors accessibility-focus"
                                  >
                                    <Icon name="reply" size="text-[14px]" /> {language === "en" ? "Reply" : "Trả lời"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex gap-2">
                        <input
                          id={`comment-input-${post.id}`}
                          type="text"
                          placeholder={language === "en" ? "Write a comment..." : "Viết bình luận..."}
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddComment(post.id);
                          }}
                          className="flex-grow bg-surface-container-lowest dark:bg-tertiary-container border border-outline-variant/60 rounded-xl px-4 py-2 text-sm text-on-surface focus:outline-none focus:ring-1 focus:ring-primary theme-transition"
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-surface-container-high hover:bg-surface-variant text-on-surface-variant font-bold text-sm px-4 py-2 rounded-xl transition-colors accessibility-focus active:scale-95"
                        >
                          {language === "en" ? "Send" : "Gửi"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>

          {/* ─── Right Sidebar (1/3) ─── */}
          <aside className="lg:col-span-1 space-y-6">
            
            {/* Featured Boards (Chủ đề nổi bật) */}
            <div className="bg-white dark:bg-tertiary rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/20">
              <h3 className="font-bold text-base text-primary-dark dark:text-inverse-primary mb-4 pb-2 border-b border-outline-variant/30">
                {language === "en" ? "Featured Boards" : "Các Chuyên mục"}
              </h3>
              <div className="space-y-1">
                {Object.entries(FORUM_BOARDS).map(([key, board]) => {
                  const count = boardCounts[key] || 0;
                  const isSelected = selectedBoard === key;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedBoard(key);
                        setSelectedSubType("all");
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        isSelected 
                          ? "bg-primary-container dark:bg-primary-fixed/20 font-bold text-on-primary-container dark:text-primary-fixed" 
                          : "text-on-surface hover:bg-surface-container-high dark:hover:bg-tertiary-container dark:text-inverse-on-surface"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon name={board.icon} size="text-sm" className={isSelected ? "text-primary dark:text-primary-fixed" : "text-outline"} />
                        {language === "en" ? board.labelEn : board.labelVi}
                      </span>
                      <span className="text-xs bg-surface-container dark:bg-surface-container-highest px-2 py-0.5 rounded-full text-on-surface-variant font-medium">
                        {count} bài
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Members (Thành viên tích cực) */}
            <div className="bg-white dark:bg-tertiary rounded-2xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/20">
              <h3 className="font-bold text-base text-primary-dark dark:text-inverse-primary mb-4 pb-2 border-b border-outline-variant/30">
                {language === "en" ? "Active Members" : "Thành viên tích cực"}
              </h3>
              <div className="space-y-4">
                {activeMembers.length === 0 ? (
                  <p className="text-sm text-on-surface-variant italic">Chưa có dữ liệu</p>
                ) : (
                  activeMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200 shrink-0">
                        <span className="text-lg" role="img" aria-label="avatar">🧑‍🦲</span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-on-surface dark:text-inverse-on-surface">
                          {member.name}
                        </div>
                        <div className="text-xs text-on-surface-variant dark:text-surface-dim">
                          {member.count} bài viết
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Code of Conduct */}
            <div className="bg-[#fef5d4] dark:bg-amber-950/20 rounded-2xl p-5 border border-amber-200 dark:border-amber-900/50">
              <h3 className="font-bold text-sm text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <Icon name="verified_user" size="text-sm" />
                {language === "en" ? "Code of Conduct" : "Quy tắc diễn đàn"}
              </h3>
              <ul className="text-xs space-y-2 text-amber-900/80 dark:text-amber-200/70 list-disc pl-4 leading-relaxed">
                <li>Tôn trọng và xây dựng tích cực.</li>
                <li>Không dùng từ ngữ ban phát, thương hại.</li>
                <li>Nghiêm cấm lừa đảo, trục lợi từ thiện.</li>
              </ul>
            </div>

          </aside>
        </div>
      </div>

      {/* ─── MODAL 1: Write New Post ─── */}
      {isNewPostOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          role="dialog"
          aria-modal="true"
        >
          <form 
            onSubmit={handleCreatePost}
            className="bg-surface dark:bg-tertiary border-2 border-outline w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-primary text-on-primary">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Icon name="add" />
                {language === "en" ? "Create New Post" : "Đăng bài viết mới"}
              </h2>
              <button
                type="button"
                onClick={() => setIsNewPostOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center accessibility-focus"
              >
                <Icon name="close" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-grow text-xs text-on-surface dark:text-inverse-on-surface">
              {/* Board Selection */}
              <div>
                <label className="block font-bold mb-1.5">{language === "en" ? "Select Board" : "Chọn Chuyên mục (*)"}</label>
                <select
                  value={newPostForm.board}
                  onChange={(e) => {
                    const board = e.target.value;
                    const subTypes = FORUM_BOARDS[board].subTypes.filter(s => s.key !== "all");
                    setNewPostForm({ 
                      ...newPostForm, 
                      board, 
                      subType: subTypes[0]?.key || ""
                    });
                  }}
                  className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  <option value="support">{language === "en" ? "Support Station" : "Trạm Tiếp Sức"}</option>
                  <option value="inspiration">{language === "en" ? "Inspiration Flame" : "Lửa Truyền Cảm Hứng"}</option>
                  <option value="aspiration">{language === "en" ? "Aspiration & Opportunities" : "Cơ Hội & Khát Vọng"}</option>
                </select>
              </div>

              {/* Sub-type Selection */}
              <div>
                <label className="block font-bold mb-1.5">{language === "en" ? "Category type" : "Phân loại cụ thể (*)"}</label>
                <select
                  value={newPostForm.subType}
                  onChange={(e) => setNewPostForm({ ...newPostForm, subType: e.target.value })}
                  className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  {FORUM_BOARDS[newPostForm.board].subTypes
                    .filter(t => t.key !== "all")
                    .map(t => (
                      <option key={t.key} value={t.key}>
                        {language === "en" ? t.en : t.vi}
                      </option>
                    ))
                  }
                </select>
              </div>

              {/* Post Title */}
              <div>
                <label className="block font-bold mb-1.5">{language === "en" ? "Title" : "Tiêu đề bài viết (*)"}</label>
                <input
                  type="text"
                  required
                  placeholder={language === "en" ? "What is your topic about?" : "Nhập tiêu đề tóm tắt..."}
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm({ ...newPostForm, title: e.target.value })}
                  className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              {/* Post Content */}
              <div>
                <label className="block font-bold mb-1.5">{language === "en" ? "Content" : "Nội dung bài viết (*)"}</label>
                <textarea
                  required
                  rows="5"
                  placeholder={language === "en" ? "Share your experience or call for companion..." : "Nhập nội dung chia sẻ chi tiết..."}
                  value={newPostForm.content}
                  onChange={(e) => setNewPostForm({ ...newPostForm, content: e.target.value })}
                  className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2.5 text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-4 border-t border-outline-variant/60 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNewPostOpen(false)}
                className="border border-outline px-4 py-2 rounded-xl font-bold hover:bg-surface-variant/30 accessibility-focus"
              >
                {language === "en" ? "Cancel" : "Hủy bỏ"}
              </button>
              <button
                type="submit"
                className="bg-primary text-on-primary font-bold px-5 py-2 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all accessibility-focus"
              >
                {language === "en" ? "Publish" : "Đăng bài"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL 2: 1-Click Support Form ─── */}
      {activeSupportPost && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]"
          role="dialog"
          aria-modal="true"
        >
          <form 
            onSubmit={handleRegisterSupport}
            className="bg-surface dark:bg-tertiary border-2 border-outline w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center p-4 border-b border-outline-variant bg-secondary text-on-secondary">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Icon name="handshake" />
                {language === "en" ? "Register Support" : "Đăng ký hỗ trợ người đăng"}
              </h2>
              <button
                type="button"
                onClick={() => setActiveSupportPost(null)}
                className="w-8 h-8 rounded-full hover:bg-white/20 flex items-center justify-center accessibility-focus"
              >
                <Icon name="close" />
              </button>
            </div>

            {supportSuccess ? (
              <div className="p-8 text-center text-xs space-y-3">
                <Icon name="check_circle" className="text-teal-600 dark:text-teal-400" size="text-4xl" />
                <p className="font-bold text-sm text-teal-800 dark:text-teal-300">
                  {language === "en" ? "Registration Successful!" : "Đăng ký hỗ trợ thành công!"}
                </p>
                <p className="text-on-surface-variant">
                  {language === "en" 
                    ? "Your information has been shared. Thank you for your empathy!"
                    : "Thông tin của bạn đã được ghi nhận. Xin cảm ơn sự sẻ chia của bạn!"}
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 space-y-4 text-xs text-on-surface dark:text-inverse-on-surface">
                  <div className="bg-primary-fixed/10 p-3.5 rounded-2xl mb-2">
                    <span className="font-bold text-primary dark:text-on-primary-fixed block mb-1">
                      {language === "en" ? "Supporting thread:" : "Bài viết cần hỗ trợ:"}
                    </span>
                    <span className="font-semibold block truncate">"{activeSupportPost.title}"</span>
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{language === "en" ? "Full Name" : "Họ và tên (*)"}</label>
                    <input
                      type="text"
                      required
                      value={supportForm.name}
                      onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{language === "en" ? "Contact Info (Phone/Email)" : "Thông tin liên hệ (SĐT / Email) (*)"}</label>
                    <input
                      type="text"
                      required
                      value={supportForm.contactInfo}
                      onChange={(e) => setSupportForm({ ...supportForm, contactInfo: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold mb-1">{language === "en" ? "Your Message" : "Lời nhắn hỗ trợ (*)"}</label>
                    <textarea
                      required
                      rows="3"
                      placeholder={language === "en" ? "I can assist by driving..." : "Ghi rõ khả năng hỗ trợ và thời gian rảnh..."}
                      value={supportForm.message}
                      onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
                      className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl p-2 text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="p-4 border-t border-outline-variant/60 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveSupportPost(null)}
                    className="border border-outline px-4 py-2 rounded-xl font-bold hover:bg-surface-variant/30 accessibility-focus"
                  >
                    {language === "en" ? "Cancel" : "Hủy bỏ"}
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-on-primary font-bold px-5 py-2 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all accessibility-focus"
                  >
                    {language === "en" ? "Submit Offer" : "Gửi đăng ký"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
