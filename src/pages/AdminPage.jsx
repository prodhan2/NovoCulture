import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { getUserProfile } from "../services/firestore";
import MediaAdmin from "../components/admin/MediaAdmin";
import ContactAdmin from "../components/admin/ContactAdmin";
import SettingsAdmin from "../components/admin/SettingsAdmin";
import ContentEditorAdmin from "../components/admin/ContentEditorAdmin";
import JoinRegistrationsAdmin from "../components/admin/JoinRegistrationsAdmin";
import FormCustomizationAdmin from "../components/admin/FormCustomizationAdmin";
import AboutAdmin from "../components/admin/AboutAdmin";
import DonationsAdmin from "../components/admin/DonationsAdmin";
import UsersAdmin from "../components/admin/UsersAdmin";
import SMSAdmin from "../components/admin/SMSAdmin";
import ReviewsAdmin from "../components/admin/ReviewsAdmin";

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const { tab: activeTab } = useParams();
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState(activeTab || "media");

  useEffect(() => {
    async function checkAdmin() {
      if (loading) return;
      
      if (!user) {
        navigate("/");
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        if (profile?.role === "superadmin" || profile?.role === "coadmin" || profile?.superadmin) {
          setIsAdmin(true);
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        navigate("/");
      } finally {
        setChecking(false);
      }
    }

    checkAdmin();
  }, [user, loading, navigate]);

  useEffect(() => {
    // Force Bengali for admin panel
    if (i18n.language !== "bn") {
      i18n.changeLanguage("bn");
    }
  }, [i18n.language]);

  useEffect(() => {
    if (activeTab && activeTab !== tab) {
      setTab(activeTab);
    }
  }, [activeTab]);

  const handleTabChange = (newTab) => {
    setTab(newTab);
    navigate(`/admin/${newTab}`);
  };

  if (loading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-cream)]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-terracotta)] border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <section className="w-full bg-[var(--bg-cream)] min-h-screen">
      <div className="px-4 py-8 sm:px-6 lg:px-10 mb-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="h-2 w-10 bg-[var(--accent-terracotta)] rounded-full" />
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-brown-strong)] tracking-tight">
            {t("admin_panel.title", "অ্যাডমিন প্যানেল")}
          </h1>
        </div>
        
        {/* Responsive Tabs Container */}
        <div className="w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          <div className="flex flex-nowrap items-center justify-start rounded-2xl bg-white shadow-xl shadow-orange-900/5 border-2 border-[var(--accent-terracotta)] p-1.5 min-w-max">
            <TabButton 
              active={tab === "media"} 
              onClick={() => handleTabChange("media")}
              label={t("admin_panel.media", "মিডিয়া")}
            />
            <TabButton 
              active={tab === "editor"} 
              onClick={() => handleTabChange("editor")}
              label="এডিটর"
            />
            <TabButton 
              active={tab === "about"} 
              onClick={() => handleTabChange("about")}
              label={t("admin_panel.about", "আমাদের সম্পর্কে")}
            />
            <TabButton 
              active={tab === "join"} 
              onClick={() => handleTabChange("join")}
              label={t("admin_panel.join", "নিবন্ধনসমূহ")}
            />
            <TabButton 
              active={tab === "donations"} 
              onClick={() => handleTabChange("donations")}
              label={t("admin_panel.donations", "অনুদান")}
            />
            <TabButton 
              active={tab === "users"} 
              onClick={() => handleTabChange("users")}
              label={t("admin_panel.users", "ব্যবহারকারী")}
            />
            <TabButton 
              active={tab === "sms"} 
              onClick={() => handleTabChange("sms")}
              label="SMS"
            />
            <TabButton 
              active={tab === "reviews"} 
              onClick={() => handleTabChange("reviews")}
              label="রিভিউ"
            />
            <TabButton 
              active={tab === "forms"} 
              onClick={() => handleTabChange("forms")}
              label={t("admin_panel.forms", "ফর্ম")}
            />
            <TabButton 
              active={tab === "contact"} 
              onClick={() => handleTabChange("contact")}
              label={t("admin_panel.contact", "যোগাযোগ")}
            />
            <TabButton 
              active={tab === "settings"} 
              onClick={() => handleTabChange("settings")}
              label={t("admin_panel.settings", "সেটিংস")}
            />
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {tab === "media" ? (
          <MediaAdmin />
        ) : tab === "editor" ? (
          <ContentEditorAdmin />
        ) : tab === "about" ? (
          <AboutAdmin />
        ) : tab === "join" ? (
          <JoinRegistrationsAdmin />
        ) : tab === "donations" ? (
          <DonationsAdmin />
        ) : tab === "users" ? (
          <UsersAdmin />
        ) : tab === "sms" ? (
          <SMSAdmin />
        ) : tab === "reviews" ? (
          <ReviewsAdmin />
        ) : tab === "forms" ? (
          <FormCustomizationAdmin />
        ) : tab === "contact" ? (
          <ContactAdmin />
        ) : (
          <SettingsAdmin />
        )}
      </div>
    </section>
  );
}

function TabButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all duration-300 ${
        active
          ? "bg-[var(--accent-terracotta)] text-white shadow-lg scale-[1.02]"
          : "text-black hover:bg-[var(--accent-terracotta)]/10"
      }`}
    >
      {label}
    </button>
  );
}
