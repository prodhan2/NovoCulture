import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ProjectsAdmin from "../components/admin/ProjectsAdmin";
import MediaAdmin from "../components/admin/MediaAdmin";
import ContactAdmin from "../components/admin/ContactAdmin";
import SettingsAdmin from "../components/admin/SettingsAdmin";
import HeroUpdatesAdmin from "../components/admin/HeroUpdatesAdmin";
import JoinRegistrationsAdmin from "../components/admin/JoinRegistrationsAdmin";
import AboutAdmin from "../components/admin/AboutAdmin";
import DonationsAdmin from "../components/admin/DonationsAdmin";
import UsersAdmin from "../components/admin/UsersAdmin";
import SMSAdmin from "../components/admin/SMSAdmin";

export default function AdminPage() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState("media");

  useEffect(() => {
    // Force Bengali for admin panel
    if (i18n.language !== "bn") {
      i18n.changeLanguage("bn");
    }
  }, [i18n]);

  return (
    <section className="w-full px-4 py-8 sm:px-6 lg:px-10 bg-[var(--bg-cream)] min-h-screen">
      <div className="mb-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="h-2 w-10 bg-[var(--accent-terracotta)] rounded-full" />
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-brown-strong)] tracking-tight">
            {t("admin_panel.title", "অ্যাডমিন প্যানেল")}
          </h1>
        </div>
        
        {/* Responsive Tabs Container */}
        <div className="w-full lg:w-auto overflow-x-auto pb-4 lg:pb-0 scrollbar-hide">
          <div className="flex flex-nowrap items-center justify-start rounded-2xl bg-white shadow-xl shadow-orange-900/5 border-2 border-[var(--text-brown)]/5 p-1.5 min-w-max">
            <TabButton 
              active={tab === "media"} 
              onClick={() => setTab("media")}
              label={t("admin_panel.media", "মিডিয়া")}
            />
            <TabButton 
              active={tab === "projects"} 
              onClick={() => setTab("projects")}
              label={t("admin_panel.projects", "প্রকল্প")}
            />
            <TabButton 
              active={tab === "hero"} 
              onClick={() => setTab("hero")}
              label={t("admin_panel.hero_tabs", "হিরো ট্যাব")}
            />
            <TabButton 
              active={tab === "about"} 
              onClick={() => setTab("about")}
              label={t("admin_panel.about", "আমাদের সম্পর্কে")}
            />
            <TabButton 
              active={tab === "join"} 
              onClick={() => setTab("join")}
              label={t("admin_panel.join", "নিবন্ধনসমূহ")}
            />
            <TabButton 
              active={tab === "donations"} 
              onClick={() => setTab("donations")}
              label={t("admin_panel.donations", "অনুদান")}
            />
            <TabButton 
              active={tab === "users"} 
              onClick={() => setTab("users")}
              label={t("admin_panel.users", "ব্যবহারকারী")}
            />
            <TabButton 
              active={tab === "sms"} 
              onClick={() => setTab("sms")}
              label="SMS"
            />
            <TabButton 
              active={tab === "contact"} 
              onClick={() => setTab("contact")}
              label={t("admin_panel.contact", "যোগাযোগ")}
            />
            <TabButton 
              active={tab === "settings"} 
              onClick={() => setTab("settings")}
              label={t("admin_panel.settings", "সেটিংস")}
            />
          </div>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {tab === "media" ? (
          <MediaAdmin />
        ) : tab === "projects" ? (
          <ProjectsAdmin />
        ) : tab === "hero" ? (
          <HeroUpdatesAdmin />
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
          ? "bg-[var(--text-brown)] text-white shadow-lg scale-[1.02]"
          : "text-[var(--text-brown)]/40 hover:text-[var(--text-brown)] hover:bg-[var(--text-brown)]/5"
      }`}
    >
      {label}
    </button>
  );
}
