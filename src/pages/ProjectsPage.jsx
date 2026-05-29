import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getHeroUpdates } from "../services/firestore";
import { Loader2, AlertCircle, Calendar } from "lucide-react";

function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ongoing");
  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      try {
        const allUpdates = await getHeroUpdates();
        const filteredProjects = allUpdates.filter(u => u.category === "projects");
        setProjects(filteredProjects);
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <section className="w-full min-h-screen bg-white">
      {/* Header - Full Width */}
      <div className="w-full bg-white px-4 py-6 sm:px-8 lg:px-16 border-b-2 border-black">
        <div className="w-full">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-black text-white shadow-xl shadow-black/20 rotate-3 transition-all">
              <Grid3X3 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-1">
                {t("projects_label", "Projects")}
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight leading-none mb-1">
                {t("projects_heading", "NovoCulture প্রজেক্ট আপডেট")}
              </h1>
              <div className="h-1 w-12 sm:w-16 bg-black rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full px-4 sm:px-8 lg:px-16 pt-8">
        <div className="flex items-center gap-2 sm:gap-4 border-b-2 border-black/5">
          <button
            onClick={() => setActiveTab("ongoing")}
            className={`pb-4 px-2 text-sm sm:text-base font-black uppercase tracking-widest transition-all relative ${
              activeTab === "ongoing" ? "text-black" : "text-black/30 hover:text-black/50"
            }`}
          >
            {t("ongoing_projects", "চলমান কার্যক্রম")}
            {activeTab === "ongoing" && <div className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-full" />}
          </button>
          <button
            onClick={() => setActiveTab("implemented")}
            className={`pb-4 px-2 text-sm sm:text-base font-black uppercase tracking-widest transition-all relative ${
              activeTab === "implemented" ? "text-black" : "text-black/30 hover:text-black/50"
            }`}
          >
            {t("implemented_projects", "বাস্তবায়িত কার্যক্রম")}
            {activeTab === "implemented" && <div className="absolute bottom-0 left-0 w-full h-1 bg-black rounded-full" />}
          </button>
        </div>
      </div>

      {/* Content - Full Width & Compact List View */}
      <div className="w-full px-4 sm:px-8 lg:px-16 py-6 sm:py-12">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
          </div>
        ) : projects.filter(p => (p.projectStatus || "ongoing") === activeTab).length === 0 ? (
          <div className="w-full rounded-3xl border-2 border-dashed border-black p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-black/10 mb-4" />
            <p className="text-lg font-black text-black/40 tracking-tight">
              {t("no_content_available", "এই মুহূর্তে কোনো কার্যক্রম পাওয়া যায়নি।")}
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-black/10">
            {projects
              .filter(p => (p.projectStatus || "ongoing") === activeTab)
              .map((project, index) => {
              const title = project.bn?.title || project.en?.title || "";
              const content = project.bn?.content || project.en?.content || "";
              
              return (
                <div 
                  key={project.id} 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="group block py-6 sm:py-8 first:pt-0 last:pb-0 transition-all hover:bg-black/[0.02] cursor-pointer"
                >
                  <div className="flex gap-4 sm:gap-8 items-center">
                    {/* Left Side: Image */}
                    {project.image ? (
                      <div className="h-24 w-24 sm:h-32 sm:w-48 rounded-2xl overflow-hidden shrink-0 relative">
                        <img src={project.image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="h-24 w-24 sm:h-32 sm:w-48 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                        <Grid3X3 className="h-8 w-8 text-black/10" />
                      </div>
                    )}

                    {/* Right Side: Others */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-white text-[10px] font-black shrink-0">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">
                              {project.date ? new Date(project.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { day: "numeric", month: "short", year: "numeric" }) : ""}
                            </span>
                          </div>
                          
                          <h2 className="text-lg sm:text-xl font-black text-black mb-1 leading-tight tracking-tight group-hover:text-black transition-colors truncate">
                            {title}
                          </h2>
                          
                          <p className="text-xs sm:text-sm text-black/60 font-bold leading-relaxed line-clamp-2">
                            {content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/[#*`]/g, '')}
                          </p>
                        </div>
                        
                        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border-2 border-black text-black group-hover:bg-black group-hover:text-white transition-all shrink-0">
                          <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function Grid3X3(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  );
}

function ChevronRight(props) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}

export default ProjectsPage;
