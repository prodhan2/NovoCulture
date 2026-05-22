import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Heart, Users, UserPlus, Briefcase, ChevronRight, ClipboardList, Send, ArrowLeft, Loader2, User, ArrowRight, ChevronLeft, Image as ImageIcon, Layout } from "lucide-react";
import { addJoinRegistration, getJoinRegistrations, getSettings, getHeroUpdates } from "../../services/firestore";
import GallerySection from "./GallerySection.jsx";

const joinItems = [
  { id: "donor", label: "Regular Donor", icon: Heart },
  { id: "members", label: "Lifetime & Patron Members", icon: Users },
  { id: "volunteer", label: "Volunteer", icon: UserPlus },
  { id: "careers", label: "Careers", icon: Briefcase },
];

function JoinSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(joinItems[0].id);
  const [videoUrls, setVideoUrls] = useState(["https://www.youtube.com/embed/N5mtv8VDr7o?rel=0&controls=1&autoplay=0&mute=0"]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [projects, setProjects] = useState([]);
  const [donations, setDonations] = useState([]);

  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function loadData() {
      // Load Settings
      const s = await getSettings();
      if (s) {
        if (s.heroVideoUrls && Array.isArray(s.heroVideoUrls) && s.heroVideoUrls.length > 0) {
          setVideoUrls(s.heroVideoUrls);
        } else if (s.heroVideoUrl) {
          setVideoUrls([s.heroVideoUrl]);
        }
      }

      // Load Projects & Donations
      const updates = await getHeroUpdates();
      const projectItems = updates.filter(u => u.category === "projects");
      const donationItems = updates.filter(u => u.category === "donations");
      setProjects(projectItems);
      setDonations(donationItems);
    }
    loadData();
  }, []);

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoUrls.length) % videoUrls.length);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Projects Update Section (Ongoing Activities) */}
      <div id="ongoing-activities" className="mb-12 sm:mb-20 scroll-mt-20 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-2xl sm:text-5xl font-black text-[var(--text-brown-strong)] mb-2 sm:mb-4">
              চলমান কার্যক্রমসমূহ
            </h2>
            <div className="h-1 w-16 sm:h-1.5 sm:w-24 bg-[var(--accent-terracotta)] rounded-full" />
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-6 py-3 text-sm sm:text-base font-bold text-white transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20 w-fit"
          >
            <span>সবগুলো কার্যক্রম দেখুন</span>
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <div className="animate-infinite-scroll flex gap-6 py-4 hide-scrollbar">
            {(projects.length > 0 ? [...projects, ...projects] : []).map((proj, idx) => {
              const title = proj.bn?.title || proj.en?.title || "";
              const desc = proj.bn?.content || proj.en?.content || "";
              const image = proj.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop";

              return (
                <div key={`${proj.id}-${idx}`} className="w-[75vw] sm:w-[400px] flex flex-col bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--text-brown)]/5 shadow-xl overflow-hidden transition-all hover:shadow-2xl shrink-0">
                  <div className="aspect-[4/3] w-full overflow-hidden">
                    <img 
                      src={image} 
                      alt={title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 sm:p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-[var(--accent-terracotta)] mb-2 sm:mb-4">
                      <Layout className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                        {t("tabs.projects", "প্রকল্প")}
                      </span>
                    </div>
                    <h4 className="text-lg sm:text-2xl font-black text-[var(--text-brown-strong)] mb-2 sm:mb-4 leading-tight line-clamp-1">
                      {title}
                    </h4>
                    <p className="text-xs sm:text-base text-[var(--text-brown)]/60 font-medium leading-relaxed mb-4 sm:mb-8 line-clamp-2">
                      {desc.replace(/[#*`]/g, '')}
                    </p>
                    <div className="mt-auto">
                      <button 
                        onClick={() => navigate(`/projects/${proj.id}`)}
                        className="w-full rounded-xl sm:rounded-2xl border-2 border-[var(--accent-terracotta)]/20 bg-[var(--accent-terracotta)]/5 py-3 sm:py-4 text-sm sm:text-base font-bold text-[var(--accent-terracotta)] transition-all hover:bg-[var(--accent-terracotta)] hover:text-white"
                      >
                        বিস্তারিত দেখুন
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-12">
        {/* Donation Funds Section */}
        <div className="mb-12 sm:mb-20 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-6">
            <div className="text-left">
              <h2 className="text-2xl sm:text-5xl font-black text-[var(--text-brown-strong)] mb-2 sm:mb-4">
                অনুদান তহবিলসমূহ
              </h2>
              <div className="h-1 w-16 sm:h-1.5 sm:w-24 bg-[var(--accent-terracotta)] rounded-full mb-2 sm:mb-4" />
              <p className="text-sm sm:text-lg text-[var(--text-brown)]/60 font-medium">চলুন একসাথে পরিবর্তন আনি</p>
            </div>
            <button
              onClick={() => navigate("/funds")}
              className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-6 py-3 text-sm sm:text-base font-bold text-white transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20 w-fit"
            >
              <span>তহবিলসমূহ</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
          
          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <div className="animate-infinite-scroll flex gap-6 py-4 hide-scrollbar">
              {(donations.length > 0 ? [...donations, ...donations] : []).map((fund, idx) => {
                const title = fund.bn?.title || fund.en?.title || "";
                const desc = fund.bn?.content || fund.en?.content || "";
                const image = fund.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop";

                return (
                  <div key={`${fund.id}-${idx}`} className="w-[75vw] sm:w-[400px] flex flex-col bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-[var(--text-brown)]/5 shadow-xl overflow-hidden transition-all hover:shadow-2xl shrink-0">
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <img 
                        src={image} 
                        alt={title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                    </div>
                    <div className="p-5 sm:p-8 flex flex-col flex-1 text-center">
                      <h4 className="text-lg sm:text-2xl font-black text-[var(--text-brown-strong)] mb-2 sm:mb-4 leading-tight min-h-[3rem] sm:min-h-[4rem] flex items-center justify-center line-clamp-2">
                        {title}
                      </h4>
                      <p className="text-xs sm:text-base text-[var(--text-brown)]/60 font-medium leading-relaxed mb-4 sm:mb-8 line-clamp-3">
                        {desc.replace(/[#*`]/g, '')}
                      </p>
                      <div className="mt-auto">
                        <button 
                          onClick={() => navigate("/donation")}
                          className="w-full rounded-xl sm:rounded-2xl bg-[var(--accent-terracotta)] py-3 sm:py-5 text-sm sm:text-lg font-bold text-white transition-all hover:bg-[var(--accent-terracotta-dark)] hover:shadow-2xl active:scale-95 shadow-xl shadow-orange-900/20"
                        >
                          অনুদান করুন
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gallery Section (Media) - MOVED HERE BELOW DONATION */}
        <div className="mb-24 w-full">
          <div className="w-full">
            <GallerySection />
            <div className="mt-10 flex justify-center">
              <button
                onClick={() => navigate("/media")}
                className="group flex items-center gap-4 rounded-2xl border-2 border-[var(--text-brown)] px-12 py-5 text-lg font-bold text-[var(--text-brown)] transition-all hover:bg-[var(--text-brown)] hover:text-white hover:scale-105 active:scale-95"
              >
                <span>পুরো চিত্রশালা দেখুন</span>
                <ImageIcon className="h-6 w-6 transition-transform group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>

        <div>
            <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-[var(--text-brown)]/50">
              {t("join_us_label", "Join Us")}
            </p>
            <h2 className="mt-2 text-xl sm:text-3xl font-black text-[var(--text-brown-strong)]">
              {t("join_us_title", "Ways to participate in the mission")}
            </h2>
          </div>
      </div>

      {/* Universal List View */}
      <div className="grid gap-6 sm:grid-cols-2 mb-20">
        {joinItems.map((item) => (
          <div key={item.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-[var(--text-brown)]/5 shadow-xl p-6 sm:p-8 transition-all hover:shadow-2xl hover:-translate-y-1">
            <div className="mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-terracotta)] text-white shadow-lg shadow-[var(--accent-terracotta)]/20 transition-transform group-hover:scale-110">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[var(--text-brown-strong)] tracking-tight">
                  {t(`join.${item.id}`, item.label)}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-[var(--text-brown)]/70 font-medium leading-relaxed">
                {t(`join.${item.id}_desc`, `Join our mission as a ${item.label.toLowerCase()} and help us make a lasting impact.`)}
              </p>
            </div>
            
            <div className="mt-auto flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate(`/join/form/${item.id}`)}
                className="flex-1 flex items-center justify-center gap-3 rounded-2xl bg-[var(--accent-terracotta)] py-4 text-base sm:text-lg font-bold text-white shadow-xl shadow-[var(--accent-terracotta)]/20 transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-[1.02] active:scale-95"
              >
                <Send className="h-5 w-5" />
                <span>{t("start_now", "শুরু করুন")}</span>
              </button>
              <button
                onClick={() => navigate(`/join/list/${item.id}`)}
                className="flex-1 flex items-center justify-center gap-3 rounded-2xl border-2 border-[var(--text-brown)]/10 bg-white py-4 text-base sm:text-lg font-bold text-[var(--text-brown)] transition-all hover:bg-[var(--text-brown)] hover:text-white hover:border-[var(--text-brown)] hover:scale-[1.02] active:scale-95"
              >
                <ClipboardList className="h-5 w-5" />
                <span>{t("view_list", "লিস্ট দেখুন")}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* YouTube Video Section - Moved from Hero */}
      <div className="w-full max-w-4xl mx-auto py-12 border-t-2 border-[var(--text-brown)]/5">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-brown-strong)] mb-2">আমাদের ভিডিও গ্যালারি</h2>
          <div className="h-1.5 w-20 bg-[var(--accent-terracotta)] mx-auto rounded-full" />
        </div>
        
        <div className="relative w-full aspect-video overflow-hidden rounded-[2rem] shadow-2xl border-4 border-white bg-black">
          <iframe
            key={currentVideoIndex}
            src={videoUrls[currentVideoIndex]}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={true}
            title={`YouTube Video ${currentVideoIndex + 1}`}
          ></iframe>

          {/* Slider Controls */}
          {videoUrls.length > 1 && (
            <>
              <button
                onClick={prevVideo}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-90"
                aria-label="Previous video"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextVideo}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:bg-black/60 active:scale-90"
                aria-label="Next video"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                {videoUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentVideoIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      idx === currentVideoIndex ? "w-8 bg-white" : "w-2 bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default JoinSection;
