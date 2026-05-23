import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHeroUpdates } from "../../services/firestore";
import { Calendar, FileText, ChevronRight } from "lucide-react";

function BlogSection() {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function load() {
      try {
        const all = await getHeroUpdates();
        const filtered = all.filter(u => u.category === "posts").slice(0, 3);
        setPosts(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;
  if (posts.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-16">
      <div className="mb-8 flex items-center justify-between gap-4 border-b-2 border-black pb-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-1">
            Blog & Updates
          </p>
          <h2 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-tight">
            {t("tabs.posts", "NovoCulture পোস্ট ও আপডেট")}
          </h2>
        </div>
        <Link 
          to="/posts"
          className="flex items-center gap-2 rounded-lg sm:rounded-xl bg-black px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-[10px] font-black uppercase tracking-widest text-white hover:opacity-80 transition-all shrink-0 shadow-lg shadow-black/20"
        >
          <span className="hidden sm:inline">{t("view_all", "সবগুলো দেখুন")}</span>
          <span className="sm:hidden">সবগুলো</span>
          <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Link>
      </div>

      <div className="-mx-4 sm:-mx-6 lg:-mx-8 overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing">
        <div className="animate-infinite-scroll flex gap-6 py-4 hover:[animation-play-state:paused] active:[animation-play-state:paused]">
          {(posts.length > 0 ? [...posts, ...posts] : []).map((post, idx) => (
            <Link
              key={`${post.id}-${idx}`}
              to={`/posts/${post.id}`}
              className="w-[280px] sm:w-[320px] group block rounded-2xl bg-white p-4 sm:p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl shrink-0"
            >
              <div className="aspect-[16/9] rounded-xl overflow-hidden mb-4 relative">
                {post.image ? (
                  <img src={post.image} alt="" className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="h-full w-full bg-black/5 flex items-center justify-center">
                    <FileText className="h-10 w-10 text-black/10" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-0.5 bg-black text-white text-[8px] font-black uppercase tracking-widest rounded-md border border-white/20 shadow-lg">
                    Update
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[9px] font-black text-black/40 uppercase tracking-widest">
                  <Calendar className="h-3 w-3" />
                  {new Date(post.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US")}
                </div>
                <h3 className="text-base font-black text-black leading-tight group-hover:text-black transition-colors line-clamp-2">
                  {post.bn?.title || post.en?.title}
                </h3>
                <p className="text-[11px] font-bold text-black/60 line-clamp-2 leading-relaxed">
                  {(post.bn?.content || post.en?.content || "").replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/[#*`]/g, '')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BlogSection;
