import { useParams, Link } from "react-router-dom";
import { projects } from "../data/projects.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getProject as fetchProject, getHeroUpdate } from "../services/firestore";
import { Loader2, Calendar, ArrowLeft, Share2, ChevronRight } from "lucide-react";
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

  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  if (error || !sourceProject) {
    return (
      <section className="w-full min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-3xl sm:text-5xl font-black text-black mb-8 tracking-tighter">{error || "প্রজেক্ট পাওয়া যায়নি।"}</h2>
        <Link 
          to="/projects" 
          className="inline-flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-lg font-black text-white hover:bg-black/80 transition-all active:scale-95 border-2 border-black"
        >
          <ArrowLeft className="h-5 w-5" />
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
    <article className="w-full min-h-screen bg-white animate-in fade-in duration-700">
      {/* Header - Full Width */}
      <header className="w-full px-4 sm:px-8 lg:px-16 py-8 sm:py-16 border-b-4 border-black">
        <div className="mb-8 sm:mb-16">
          <Link
            to={backPath}
            className="group inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-black hover:opacity-70 transition-all"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>{backLabel}</span>
          </Link>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg shadow-xl shadow-black/20 border-2 border-black">
              {isDonation ? t("donation_fund", "Donation Fund") : t("project_update", "Project Update")}
            </div>
            {date && (
              <div className="flex items-center gap-1.5 text-[10px] font-black text-black/40 uppercase tracking-widest">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { 
                  month: "long", 
                  day: "numeric", 
                  year: "numeric" 
                })}
              </div>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black tracking-tight leading-tight max-w-4xl break-words">
            {title}
          </h1>

          <div className="h-1.5 w-16 bg-black rounded-full" />
        </div>
      </header>

      {/* Featured Image - Full Width (No Card) */}
      {image && (
        <div className="w-full aspect-[21/9] sm:aspect-[21/7] overflow-hidden border-b-4 border-black">
          <img src={image} alt={title} className="h-full w-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-1000" />
        </div>
      )}

      {/* Content - Full Width (No Card) */}
      <main className="w-full px-4 sm:px-8 lg:px-16 py-10 sm:py-20">
        <div 
          className="prose prose-xl sm:prose-2xl prose-stone max-w-none text-justify prose-headings:font-black prose-headings:tracking-tight prose-p:text-black prose-p:font-bold prose-p:leading-relaxed prose-strong:text-black prose-strong:font-black prose-li:font-bold prose-li:text-black quill-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Detailed content for old projects structure if available */}
        {sourceProject[lang]?.details && Array.isArray(sourceProject[lang].details) && (
          <div className="mt-20 sm:mt-40 rounded-[3rem] border-4 border-black bg-white p-8 sm:p-16 shadow-2xl">
            <h3 className="text-3xl sm:text-5xl font-black text-black mb-12 tracking-tighter">বিস্তারিত তথ্য</h3>
            <ul className="space-y-6">
              {sourceProject[lang].details.map((detail, i) => (
                <li key={i} className="flex items-start gap-6 text-xl sm:text-2xl text-black font-bold leading-relaxed">
                  <div className="h-4 w-4 rounded-full bg-black mt-3 shrink-0" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-20 sm:mt-40 pt-10 border-t-4 border-black flex flex-wrap items-center justify-between gap-8">
          <div className="flex items-center gap-4 relative">
            <span className="text-xs font-black uppercase tracking-widest text-black/40">শেয়ার করুন</span>
            <button 
              onClick={handleShare}
              className="h-16 w-16 flex items-center justify-center rounded-full border-4 border-black hover:bg-black hover:text-white transition-all group"
            >
              <Share2 className="h-6 w-6" />
            </button>
            
            {showShareToast && (
              <div className="absolute left-1/2 -top-12 -translate-x-1/2 bg-black text-white text-[10px] font-black px-4 py-2 rounded-lg animate-in fade-in slide-in-from-bottom-2 whitespace-nowrap border-2 border-white shadow-xl">
                লিঙ্ক কপি করা হয়েছে!
              </div>
            )}
          </div>
          <Link 
            to={backPath} 
            className="text-xl sm:text-3xl lg:text-5xl font-black text-black hover:opacity-70 transition-all flex items-center gap-6 group"
          >
            {t("read_more_projects", "আরো দেখুন")}
            <div className="h-12 w-12 sm:h-20 sm:w-20 rounded-full border-4 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
              <ChevronRight className="h-6 w-6 sm:h-10 sm:w-10 transition-transform group-hover:translate-x-2" />
            </div>
          </Link>
        </div>
      </main>
    </article>
  );
}

export default ProjectDetail;
