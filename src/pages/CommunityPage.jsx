import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import Button from "../components/ui/Button";
import Icon from "../components/ui/Icon";

import ConnectionPage from "./ConnectionPage";
import ForumPage from "./ForumPage";

export default function CommunityPage() {
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Tab can be 'ket-noi' or 'dien-dan'
  const currentTab = searchParams.get("tab") || "ket-noi";

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="flex-1 bg-surface-container-lowest dark:bg-[#1c1f26] bg-dots-pattern theme-transition flex flex-col">
      {/* ─── Hero Section ─── */}
      <section className="relative w-full min-h-[300px] flex items-center bg-primary-container dark:bg-primary-fixed border-b-2 border-primary overflow-hidden">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30 mix-blend-overlay">
          <img
            alt="Đồ họa hình trái tim kết nối cộng đồng"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1200"
          />
        </div>
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 w-full py-12">
          <div className="max-w-2xl">
            <h1 className="font-headline-xl text-headline-xl text-on-primary-container dark:text-on-primary-fixed mb-4">
              {language === "en" ? "Community Connection" : "Cộng đồng Kết nối"}
            </h1>
            <p className="font-body-lg text-body-lg text-on-primary-container/90 dark:text-on-primary-fixed/90 mb-8 leading-relaxed">
              {language === "en"
                ? "A place to connect with kind hearts, find companions, and share the challenges of daily life."
                : "Nơi kết nối bạn với những tấm lòng hảo tâm, tìm kiếm người đồng hành và chia sẻ những khó khăn trong cuộc sống thường nhật."}
            </p>

            {/* Tab Switcher in Hero */}
            <div className="inline-flex items-center p-1.5 bg-surface/50 dark:bg-tertiary/50 backdrop-blur-md rounded-full shadow-inner border border-outline-variant/30">
              <button
                onClick={() => handleTabChange("ket-noi")}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                  currentTab === "ket-noi"
                    ? "bg-primary/20 text-primary-dark dark:bg-primary text-primary dark:text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary dark:text-inverse-on-surface"
                }`}
              >
                <Icon name="handshake" size="text-sm" />
                {language === "en" ? "Connections Directory" : "Kết nối"}
              </button>
              <button
                onClick={() => handleTabChange("dien-dan")}
                className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-200 flex items-center gap-2 ${
                  currentTab === "dien-dan"
                    ? "bg-primary/20 text-primary-dark dark:bg-primary text-primary dark:text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-primary dark:text-inverse-on-surface"
                }`}
              >
                <Icon name="forum" size="text-sm" />
                {language === "en" ? "Community Forum" : "Diễn đàn kết nối"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Tab Content ─── */}
      <div className="flex-1 w-full">
        {currentTab === "ket-noi" && <ConnectionPage isTab={true} />}
        {currentTab === "dien-dan" && <ForumPage isTab={true} />}
      </div>
    </div>
  );
}
