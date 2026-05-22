import { useParams, Link } from "react-router-dom";
import { projects } from "../data/projects.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getProject as fetchProject, getHeroUpdate } from "../services/firestore";
import { Loader2, Calendar, ArrowLeft } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function ProjectDetail() {
  const { id } = useParams();
  const { i18n, t } = useTranslation();
  const [sourceProject, setSourceProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      try {
        // 1. Try local projects
        const local = projects.find((p) => p.id === id);
        if (local) {
          setSourceProject(local);
          return;
        }

        // 2. Try 'projects' collection
        const remote = await fetchProject(id);
        if (remote) {
          setSourceProject(remote);
          return;
        }

        // 3. Try 'heroUpdates' collection
        const update = await getHeroUpdate(id);
        if (update) {
          setSourceProject(update);
          return;
        }

        setError("প্রজেক্টটি পাওয়া যায়নি।");
      } catch (err) {
        console.error(err);
        setError("ডেটা লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
      </div>
    );
  }

  if (error || !sourceProject) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-black mb-4">{error || "প্রজেক্ট পাওয়া যায়নি।"}</h2>
        <Link to="/projects" className="inline-flex items-center gap-2 text-[var(--accent-terracotta)] font-bold hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t("back_to_projects", "প্রজেক্ট লিস্টে ফিরে যান")}
        </Link>
      </section>
    );
  }

  // Handle both old 'projects' structure and new 'heroUpdates' structure
  const title = sourceProject.bn?.title || sourceProject.en?.title || sourceProject.title || "";
  const content = sourceProject.bn?.content || sourceProject.en?.content || sourceProject.summary || sourceProject.description || "";
  const image = sourceProject.image || sourceProject.bn?.image || sourceProject.en?.image;
  const date = sourceProject.date || sourceProject.created_at;

  const isDonation = sourceProject.category === "donations";
  const backPath = isDonation ? "/funds" : "/projects";
  const backLabel = isDonation 
    ? t("back_to_funds", "তহবিল লিস্টে ফিরে যান") 
    : t("back_to_projects", "প্রজেক্ট লিস্টে ফিরে যান");

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8">
      <div className="mb-12">
        <Link
          to={backPath}
          className="group inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[var(--accent-terracotta)] hover:opacity-70 transition-all"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>{backLabel}</span>
        </Link>
      </div>

      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {image && (
          <div className="aspect-video w-full overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl">
            <img src={image} alt={title} className="h-full w-full object-cover" />
          </div>
        )}

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="bg-[var(--accent-terracotta)] text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-orange-500/20">
              {isDonation ? t("donation_fund", "Donation Fund") : t("project_update", "Project Update")}
            </div>
            {date && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-black/40 uppercase tracking-widest">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { month: "long", day: "numeric", year: "numeric" })}
              </div>
            )}
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tighter leading-[1.1]">
            {title}
          </h1>

          <div className="h-1.5 w-20 bg-[var(--accent-terracotta)] rounded-full" />

          <div className="prose prose-lg max-w-none text-black/80 font-medium">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Detailed content for old projects structure if available */}
        {sourceProject[lang]?.details && Array.isArray(sourceProject[lang].details) && (
          <div className="bg-white rounded-[2rem] p-8 sm:p-12 border-2 border-black/5 shadow-xl">
            <h3 className="text-2xl font-black text-black mb-8">বিস্তারিত তথ্য</h3>
            <ul className="space-y-4">
              {sourceProject[lang].details.map((detail, i) => (
                <li key={i} className="flex items-start gap-4 text-lg text-black/70 font-medium">
                  <div className="h-2 w-2 rounded-full bg-[var(--accent-terracotta)] mt-2.5 shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectDetail;
