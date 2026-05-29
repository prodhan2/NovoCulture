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
  const [selectedStatus, setSelectedStatus] = useState("ongoing");

  const scrollRef1 = useRef(null);
  const scrollRef2 = useRef(null);
  const [isPaused1, setIsPaused1] = useState(false);
  const [isPaused2, setIsPaused2] = useState(false);

  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  const filteredProjects = projects.filter(p => (p.projectStatus || "ongoing") === selectedStatus);

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

  // Auto-scroll logic for both sections
  useEffect(() => {
    const containers = [
      { ref: scrollRef1, paused: isPaused1, data: filteredProjects },
      { ref: scrollRef2, paused: isPaused2, data: donations }
    ];

    const animationIds = [];

    containers.forEach((item, index) => {
      if (!item.ref.current || item.paused || item.data.length === 0) return;

      const scrollContainer = item.ref.current;
      const scroll = () => {
        if (scrollContainer) {
          scrollContainer.scrollLeft += 0.8; // Slower for readability
          if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
            scrollContainer.scrollLeft = 0;
          }
        }
        animationIds[index] = requestAnimationFrame(scroll);
      };
      animationIds[index] = requestAnimationFrame(scroll);
    });

    return () => animationIds.forEach(id => cancelAnimationFrame(id));
  }, [filteredProjects, donations, isPaused1, isPaused2]);

  const nextVideo = () => {
    setCurrentVideoIndex((prev) => (prev + 1) % videoUrls.length);
  };

  const prevVideo = () => {
    setCurrentVideoIndex((prev) => (prev - 1 + videoUrls.length) % videoUrls.length);
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Projects Update Section (Ongoing & Implemented) */}
        <div id="ongoing-activities" className="mb-12 sm:mb-20 scroll-mt-20 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedStatus("ongoing")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-black transition-all border-2 ${
                  selectedStatus === "ongoing"
                    ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)] shadow-lg"
                    : "bg-white text-[var(--text-brown-strong)] border-black/10 hover:border-[var(--accent-terracotta)]"
                }`}
              >
                চলমান কার্যক্রম
              </button>
              <button
                onClick={() => setSelectedStatus("implemented")}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-lg font-black transition-all border-2 ${
                  selectedStatus === "implemented"
                    ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)] shadow-lg"
                    : "bg-white text-[var(--text-brown-strong)] border-black/10 hover:border-[var(--accent-terracotta)]"
                }`}
              >
                বাস্তবায়িত কার্যক্রম
              </button>
            </div>
            <div className="h-1 w-12 sm:h-1.5 sm:w-24 bg-[var(--accent-terracotta)] rounded-full" />
          </div>
          <button
            onClick={() => navigate("/projects")}
            className="flex items-center gap-2 rounded-lg sm:rounded-xl bg-[var(--accent-terracotta)] px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-[11px] font-bold text-white transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20 shrink-0 self-end sm:self-center"
          >
            <span className="hidden sm:inline">সবগুলো কার্যক্রম দেখুন</span>
            <span className="sm:hidden">সবগুলো</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
          </button>
        </div>
        
        <div 
          ref={scrollRef1}
          onMouseEnter={() => setIsPaused1(true)}
          onMouseLeave={() => setIsPaused1(false)}
          onTouchStart={() => setIsPaused1(true)}
          onTouchEnd={() => setIsPaused1(false)}
          className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing select-none"
        >
          <div className="flex gap-6 py-4 px-4 w-max">
            {filteredProjects.length > 0 ? (
              [...filteredProjects, ...filteredProjects].map((proj, idx) => {
                const title = proj.bn?.title || proj.en?.title || "";
                const desc = proj.bn?.content || proj.en?.content || "";
                const image = proj.image || "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop";

                return (
                  <div key={`${proj.id}-${idx}`} className="w-[240px] sm:w-[320px] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden transition-all hover:shadow-xl shrink-0 hover-glow-border border-2 border-transparent">
                    <div className="aspect-[16/10] w-full overflow-hidden">
                      <img 
                        src={image} 
                        alt={title} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-2 text-[var(--accent-terracotta)] mb-2">
                        <Layout className="h-3 w-3" />
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                          {t("tabs.projects", "প্রকল্প")}
                        </span>
                      </div>
                      <h4 className="text-base sm:text-lg font-black text-[var(--text-brown-strong)] mb-2 leading-tight line-clamp-1">
                        {title}
                      </h4>
                      <div 
                        className="text-[11px] sm:text-[12px] text-[var(--text-brown)]/60 font-medium leading-relaxed mb-4 line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: desc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/[#*`]/g, '') }}
                      />
                      <div className="mt-auto">
                        <button 
                          onClick={() => navigate(`/projects/${proj.id}`)}
                          className="w-full rounded-xl bg-[var(--accent-terracotta)] py-2.5 sm:py-3 text-xs sm:text-xs font-bold text-white transition-all hover:bg-[var(--accent-terracotta-dark)] hover:shadow-lg active:scale-95 shadow-md shadow-orange-900/10"
                        >
                          বিস্তারিত দেখুন
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="w-full py-12 px-4 text-center">
                <p className="text-[var(--text-brown)]/40 font-bold italic">এই ক্যাটাগরিতে কোনো কার্যক্রম নেই</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-12">
        {/* Donation Funds Section */}
        <div className="mb-12 sm:mb-20 overflow-hidden">
          <div className="flex items-center justify-between mb-6 sm:mb-10 gap-4">
            <div className="text-left">
              <h2 className="text-xl sm:text-3xl font-black text-[var(--text-brown-strong)] mb-1 sm:mb-4">
                অনুদান তহবিলসমূহ
              </h2>
              <div className="h-1 w-12 sm:h-1.5 sm:w-24 bg-[var(--accent-terracotta)] rounded-full mb-1 sm:mb-4" />
              <p className="hidden sm:block text-sm sm:text-base text-[var(--text-brown)]/60 font-medium">চলুন একসাথে পরিবর্তন আনি</p>
            </div>
            <button
              onClick={() => navigate("/funds")}
              className="flex items-center gap-2 rounded-lg sm:rounded-xl bg-[var(--accent-terracotta)] px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-[11px] font-bold text-white transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20 shrink-0"
            >
              <span>তহবিলসমূহ</span>
              <ArrowRight className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </button>
          </div>
          
          <div 
            ref={scrollRef2}
            onMouseEnter={() => setIsPaused2(true)}
            onMouseLeave={() => setIsPaused2(false)}
            onTouchStart={() => setIsPaused2(true)}
            onTouchEnd={() => setIsPaused2(false)}
            className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex gap-6 py-4 px-4 w-max">
              {(donations.length > 0 ? [...donations, ...donations] : []).map((fund, idx) => {
                const title = fund.bn?.title || fund.en?.title || "";
                const desc = fund.bn?.content || fund.en?.content || "";
                const image = fund.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=800&auto=format&fit=crop";

                return (
                  <div key={`${fund.id}-${idx}`} className="w-[240px] sm:w-[320px] flex flex-col bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden transition-all hover:shadow-xl shrink-0 hover-glow-border border-2 border-transparent">
                    <div className="aspect-[16/9] w-full overflow-hidden">
                      <img 
                        src={image} 
                        alt={title} 
                        className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                      />
                    </div>
                    <div className="p-4 sm:p-6 flex flex-col flex-1 text-center">
                      <h4 className="text-base sm:text-lg font-black text-[var(--text-brown-strong)] mb-2 leading-tight min-h-[2.5rem] sm:min-h-[3rem] flex items-center justify-center line-clamp-2">
                        {title}
                      </h4>
                      <p className="text-[11px] sm:text-[12px] text-[var(--text-brown)]/60 font-medium leading-relaxed mb-4 line-clamp-2">
                        {desc.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/[#*`]/g, '')}
                      </p>
                      <div className="mt-auto">
                        <button 
                          onClick={() => navigate("/donation")}
                          className="w-full rounded-xl bg-[var(--accent-terracotta)] py-2.5 sm:py-3.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-[var(--accent-terracotta-dark)] hover:shadow-lg active:scale-95 shadow-lg shadow-orange-900/10"
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
            <div className="flex items-center justify-between mb-8 sm:mb-12 gap-4">
              <div className="text-left">
                <h2 className="text-xl sm:text-3xl font-black text-[var(--text-brown-strong)] mb-1 sm:mb-4">
                  আমাদের চিত্রশালা
                </h2>
                <div className="h-1 w-12 sm:h-1.5 sm:w-24 bg-[var(--accent-terracotta)] rounded-full" />
              </div>
              <button
                onClick={() => navigate("/media")}
                className="flex items-center gap-2 rounded-lg sm:rounded-xl border-2 border-[var(--text-brown)] px-3 sm:px-8 py-2 sm:py-4 text-[10px] sm:text-base font-bold text-[var(--text-brown)] transition-all hover:bg-[var(--text-brown)] hover:text-white hover:scale-105 active:scale-95 shadow-lg shadow-black/5 shrink-0"
              >
                <span className="hidden sm:inline">পুরো চিত্রশালা দেখুন</span>
                <span className="sm:hidden">পুরো চিত্রশালা</span>
                <ImageIcon className="h-3.5 w-3.5 sm:h-6 sm:w-6 transition-transform group-hover:scale-110" />
              </button>
            </div>
            
            <GallerySection />
          </div>
        </div>

        <div>
            <p className="text-[10px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-brown)]/50">
              {t("join_us_label", "Join Us")}
            </p>
            <h2 className="mt-2 text-xl sm:text-2xl font-black text-[var(--text-brown-strong)]">
              {t("join_us_title", "Ways to participate in the mission")}
            </h2>
          </div>
      </div>

      {/* Universal List View */}
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-6 mb-20">
        {joinItems.map((item) => (
          <div key={item.id} className="group flex flex-col bg-white rounded-2xl sm:rounded-[2rem] border border-[var(--text-brown)]/5 shadow-md sm:shadow-lg p-4 sm:p-6 transition-all hover:shadow-lg sm:hover:shadow-xl sm:hover:-translate-y-1">
            <div className="mb-4 sm:mb-5">
              <div className="flex items-center gap-4 mb-3 sm:mb-3">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-xl bg-[var(--accent-terracotta)] text-white shadow-lg shadow-[var(--accent-terracotta)]/20 transition-transform group-hover:scale-110 shrink-0">
                  <item.icon className="h-5 w-5 sm:h-5 sm:w-5" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-[var(--text-brown-strong)] tracking-tight">
                  {t(`join.${item.id}`, item.label)}
                </h3>
              </div>
              <p className="text-[11px] sm:text-[13px] text-[var(--text-brown)]/70 font-medium leading-relaxed">
                {t(`join.${item.id}_desc`, `Join our mission as a ${item.label.toLowerCase()} and help us make a lasting impact.`)}
              </p>
            </div>
            
            <div className="mt-auto flex flex-row sm:flex-row gap-3 sm:gap-3">
              <button
                onClick={() => navigate(`/join/form/${item.id}`)}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-2 rounded-xl sm:rounded-xl bg-[var(--accent-terracotta)] py-3 sm:py-3.5 text-xs sm:text-base font-bold text-white shadow-xl shadow-[var(--accent-terracotta)]/20 transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-[1.02] active:scale-95"
              >
                <Send className="h-4 w-4 sm:h-4 sm:w-4" />
                <span>{t("start_now", "শুরু করুন")}</span>
              </button>
              <button
                onClick={() => navigate(`/join/list/${item.id}`)}
                className="flex-1 flex items-center justify-center gap-2 sm:gap-2 rounded-xl sm:rounded-xl border-2 border-[var(--text-brown)]/10 bg-white py-3 sm:py-3.5 text-xs sm:text-base font-bold text-[var(--text-brown)] transition-all hover:bg-[var(--text-brown)] hover:text-white hover:border-[var(--text-brown)] hover:scale-[1.02] active:scale-95"
              >
                <ClipboardList className="h-4 w-4 sm:h-4 sm:w-4" />
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
