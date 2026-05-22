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
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 bg-[var(--bg-cream)] min-h-screen">
      <div className="mb-12 text-center">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--accent-terracotta)] mb-3">
          {t("projects_label", "Projects")}
        </p>
        <h1 className="text-4xl sm:text-6xl font-black text-[var(--text-brown-strong)] tracking-tighter mb-4">
          {t("projects_heading", "NovoCulture প্রজেক্ট আপডেট")}
        </h1>
        <div className="h-1.5 w-24 bg-[var(--accent-terracotta)] mx-auto rounded-full" />
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-[2.5rem] border-4 border-dashed border-[var(--text-brown)]/10 bg-white/50 p-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-[var(--text-brown)]/20 mb-4" />
          <p className="text-xl font-bold text-[var(--text-brown)]/40">
            {t("no_content_available", "এই মুহূর্তে কোনো প্রজেক্ট পাওয়া যায়নি।")}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const title = project.bn?.title || project.en?.title || "";
            const content = project.bn?.content || project.en?.content || "";
            
            return (
              <div key={project.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-[var(--text-brown)]/5 shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  {project.image ? (
                    <img 
                      src={project.image} 
                      alt={title} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--bg-cream-soft)] flex items-center justify-center text-[var(--text-brown)]/10">
                      <AlertCircle className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[var(--text-brown)]/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-xl">
                      <Calendar className="h-3 w-3" />
                      {project.date ? new Date(project.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-[var(--text-brown-strong)] mb-4 leading-tight group-hover:text-[var(--accent-terracotta)] transition-colors">
                    {title}
                  </h3>
                  <p className="text-base text-[var(--text-brown)]/60 font-medium leading-relaxed mb-8 line-clamp-3">
                    {content.replace(/[#*`]/g, '')}
                  </p>
                  <div className="mt-auto">
                    <button 
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="w-full rounded-2xl bg-[var(--accent-terracotta)]/5 border-2 border-[var(--accent-terracotta)]/20 py-4 text-base font-bold text-[var(--accent-terracotta)] transition-all hover:bg-[var(--accent-terracotta)] hover:text-white active:scale-95"
                    >
                      বিস্তারিত দেখুন
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default ProjectsPage;
