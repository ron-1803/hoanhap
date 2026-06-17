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

      <div className="max-w-[1200px] mx-auto px-4 md:px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* ─── Sidebar Area ─── */}
        <aside className="lg:col-span-1 space-y-6">
          
          {/* Rules Panel */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-5 shadow-sm theme-transition">
            <h2 className="font-bold text-sm text-primary dark:text-inverse-primary mb-3 flex items-center gap-2 border-b border-outline-variant/60 pb-2">
              <Icon name="verified_user" size="text-sm" />
              {language === "en" ? "Code of Conduct" : "Quy tắc ứng xử"}
            </h2>
            <ul className="text-xs space-y-2.5 text-on-surface-variant dark:text-tertiary-fixed-dim list-disc pl-4 leading-relaxed">
              <li>{language === "en" ? "Be respectful & constructive." : "Tôn trọng và xây dựng tích cực."}</li>
              <li>{language === "en" ? "Do not make others feel pitied." : "Không dùng từ ngữ ban phát, thương hại."}</li>
              <li>{language === "en" ? "Strictly prohibit scams and spam." : "Nghiêm cấm lừa đảo, trục lợi từ thiện."}</li>
              <li>{language === "en" ? "Promote peer support & equity." : "Thúc đẩy bình đẳng và thấu hiểu nhau."}</li>
            </ul>
          </div>

          {/* Board Selector */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-4 shadow-sm theme-transition space-y-2">
            <h2 className="font-bold text-xs text-outline mb-2 uppercase tracking-wider px-2">
              {language === "en" ? "Thematic Boards" : "Các Chuyên Mục"}
            </h2>
            {Object.entries(FORUM_BOARDS).map(([key, board]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedBoard(key);
                  setSelectedSubType("all");
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl font-bold text-xs flex items-center justify-between transition-all accessibility-focus ${
                  selectedBoard === key
                    ? "bg-primary text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed shadow-sm"
                    : "hover:bg-surface-container-high dark:hover:bg-tertiary-container text-on-surface-variant dark:text-inverse-on-surface"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icon name={board.icon} size="text-sm" />
                  {language === "en" ? board.labelEn : board.labelVi}
                </span>
                <Icon name="chevron_right" size="text-xs" />
              </button>
            ))}
          </div>
        </aside>

        {/* ─── Main Content Area ─── */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Sub-type Filters & Search Bar */}
          <div className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-4 shadow-sm theme-transition flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Sub-type Horizontal Buttons */}
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-thin">
              {FORUM_BOARDS[selectedBoard].subTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSelectedSubType(type.key)}
                  className={`px-3 py-1.5 rounded-full font-bold text-xs border transition-all accessibility-focus whitespace-nowrap ${
                    selectedSubType === type.key
                      ? "bg-secondary text-on-secondary border-secondary shadow-sm"
                      : "border-outline hover:bg-surface-container-high dark:hover:bg-tertiary-container text-on-surface-variant"
                  }`}
                >
                  {language === "en" ? type.en : type.vi}
                </button>
              ))}
            </div>

            {/* Search Input & Action Button */}
            <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder={language === "en" ? "Search posts..." : "Tìm bài viết..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl pl-8 pr-3 py-2 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary theme-transition placeholder-gray-400 dark:placeholder-gray-300"
                />
                <Icon name="search" className="absolute left-2.5 top-2.5 text-outline-variant text-sm" />
              </div>
              {isTab && (
                <button
                  onClick={() => {
                    if (!user) {
                      alert(language === "en" ? "Please sign in to write a post!" : "Vui lòng đăng nhập để viết bài!");
                      return;
                    }
                    setIsNewPostOpen(true);
                  }}
                  className="w-full md:w-auto bg-primary text-on-primary font-bold px-4 py-2 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm flex items-center justify-center gap-2 accessibility-focus active:scale-95 text-xs whitespace-nowrap"
                >
                  <Icon name="add" size="text-sm" />
                  {language === "en" ? "New Thread" : "Viết bài mới"}
                </button>
              )}
            </div>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {filteredPosts.length === 0 ? (
              <div className="bg-surface-container dark:bg-tertiary border border-dashed border-outline-variant dark:border-outline rounded-3xl p-12 text-center theme-transition">
                <Icon name="chat_bubble_outline" size="text-4xl" className="text-outline-variant mb-3" />
                <p className="text-sm text-on-surface-variant font-medium">
                  {language === "en" 
                    ? "No posts found in this board. Be the first to start a conversation!"
                    : "Chưa có bài viết nào trong chuyên mục này. Hãy là người đầu tiên chia sẻ!"}
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-surface-container dark:bg-tertiary border-2 border-outline-variant dark:border-outline rounded-3xl p-6 shadow-sm hover:shadow-md transition-all theme-transition"
                >
                  {/* Post Header */}
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {/* Avatar Mock */}
                      <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm">
                        {post.authorName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs text-on-surface dark:text-inverse-on-surface">
                            {post.authorName}
                          </span>
                          {/* Trust Badge */}
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
                        </div>
                        <div className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim mt-0.5">
                          <span className="capitalize">{post.subType}</span>
                          <span className="mx-1.5">•</span>
                          <span>{new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Delete Post Button (if admin or author) */}
                    {user && (user.role === "admin" || user.uid === post.authorId) && (
                      <button
                        onClick={() => handleDeletePost(post.id, post.authorId)}
                        title={language === "en" ? "Delete post" : "Xóa bài đăng"}
                        className="p-1.5 rounded-lg border border-outline hover:bg-error-container/10 text-error hover:border-error transition-colors accessibility-focus"
                      >
                        <Icon name="delete" size="text-xs" />
                      </button>
                    )}
                  </div>

                  {/* Post Content */}
                  <h3 className="font-bold text-base text-on-surface dark:text-inverse-on-surface mb-2.5">
                    {post.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed whitespace-pre-line mb-4">
                    {post.content}
                  </p>

                  {/* 1-Click Support Banner for "đồng hành" support posts */}
                  {post.board === "support" && post.subType === "đồng hành" && (
                    <div className="bg-primary/5 dark:bg-primary-fixed/5 border border-primary/20 dark:border-primary-fixed/30 rounded-2xl p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
                      <div className="text-left">
                        <div className="text-xs font-bold text-primary dark:text-inverse-primary flex items-center gap-1.5">
                          <Icon name="handshake" size="text-sm" />
                          {language === "en" ? "Companion Help Needed" : "Cần hỗ trợ đồng hành trực tiếp"}
                        </div>
                        <p className="text-[10px] text-on-surface-variant dark:text-tertiary-fixed-dim mt-1">
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
                        className="bg-primary text-on-primary dark:bg-primary-fixed dark:text-on-primary-fixed text-[11px] font-bold px-4 py-2 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-all shadow-sm accessibility-focus"
                      >
                        {language === "en" ? "I can assist this" : "Tôi muốn hỗ trợ việc này"}
                      </button>
                    </div>
                  )}

                  {/* Reaction Empathy Section */}
                  <div className="flex flex-wrap gap-2.5 items-center border-y border-outline-variant/40 py-3 mb-4">
                    <span className="text-[10px] font-bold text-outline uppercase mr-1.5">
                      {language === "en" ? "Sympathy:" : "Chia sẻ:"}
                    </span>

                    {/* Hug/Care */}
                    <button
                      onClick={() => handleReact(post.id, "care")}
                      title={language === "en" ? "Send a Hug" : "Gửi đồng cảm"}
                      className="px-2.5 py-1 rounded-full border border-teal-500/30 bg-teal-50/20 dark:bg-teal-950/10 hover:bg-teal-100/30 text-teal-700 dark:text-teal-400 font-bold text-xs flex items-center gap-1 accessibility-focus transition-all"
                    >
                      🫂 <span>{post.reactions?.care || 0}</span>
                    </button>

                    {/* Inspire */}
                    <button
                      onClick={() => handleReact(post.id, "inspire")}
                      title={language === "en" ? "Inspiring post" : "Ngưỡng mộ nghị lực"}
                      className="px-2.5 py-1 rounded-full border border-amber-500/30 bg-amber-50/20 dark:bg-amber-950/10 hover:bg-amber-100/30 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center gap-1 accessibility-focus transition-all"
                    >
                      🌟 <span>{post.reactions?.inspire || 0}</span>
                    </button>

                    {/* With You */}
                    <button
                      onClick={() => handleReact(post.id, "withYou")}
                      title={language === "en" ? "Stand with you" : "Luôn đồng hành"}
                      className="px-2.5 py-1 rounded-full border border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/10 hover:bg-blue-100/30 text-blue-700 dark:text-blue-400 font-bold text-xs flex items-center gap-1 accessibility-focus transition-all"
                    >
                      🤝 <span>{post.reactions?.withYou || 0}</span>
                    </button>

                    {/* Count of Offers Registered */}
                    {post.offers && post.offers.length > 0 && (
                      <span className="ml-auto text-[10px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Icon name="check" size="text-[10px]" />
                        {post.offers.length} {language === "en" ? "assists offered" : "lượt đăng ký giúp đỡ"}
                      </span>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-3.5 pl-3 border-l-2 border-outline-variant/60">
                    <h4 className="font-bold text-xs text-on-surface/85">
                      {language === "en" ? "Discussions" : "Bình luận trao đổi"} ({post.comments?.length || 0})
                    </h4>
                    
                    {/* Render comments list */}
                    {post.comments && post.comments.map((comm, cIndex) => (
                      <div key={comm.id || cIndex} className="text-xs bg-surface-container-high/30 dark:bg-tertiary-container/20 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-[11px] text-on-surface dark:text-inverse-on-surface">
                            {comm.authorName}
                          </span>
                          {comm.authorBadge && (
                            <span className="px-1.5 py-0.2 bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-300 font-bold text-[8px] rounded uppercase">
                              {comm.authorBadge}
                            </span>
                          )}
                          <span className="text-[9px] text-outline ml-auto">
                            {comm.createdAt ? new Date(comm.createdAt).toLocaleDateString("vi-VN") : ""}
                          </span>
                        </div>
                        <p className="text-on-surface-variant dark:text-tertiary-fixed-dim leading-relaxed">
                          {comm.text}
                        </p>
                      </div>
                    ))}

                    {/* Add Comment Input */}
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder={language === "en" ? "Write a comment..." : "Viết bình luận..."}
                        value={commentInputs[post.id] || ""}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddComment(post.id);
                        }}
                        className="flex-grow bg-surface-container-high dark:bg-tertiary-container border border-outline rounded-xl px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary theme-transition placeholder-gray-400 dark:placeholder-gray-300"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-primary text-on-primary font-bold text-xs px-3.5 py-1.5 rounded-xl hover:bg-primary-container hover:text-on-primary-container transition-colors accessibility-focus active:scale-95"
                      >
                        {language === "en" ? "Send" : "Gửi"}
                      </button>
                    </div>
                  </div>

                </article>
              ))
            )}
          </div>
        </main>
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
