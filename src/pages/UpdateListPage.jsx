import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Calendar, Bell, FileText, ArrowLeft, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { getHeroUpdates } from "../services/firestore";

export default function UpdateListPage({ category }) {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const all = await getHeroUpdates();
        const filtered = all.filter((u) => u.category === category);
        setItems(filtered);
      } catch (err) {
        console.error("Failed to load updates:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  const isNotice = category === "notice";
  const isPost = category === "posts";

  const pageTitle = isNotice
    ? t("tabs.notice", "NovoCulture নোটিশ বোর্ড")
    : t("tabs.posts", "NovoCulture পোস্ট ও আপডেট");

  return (
    <section className="w-full min-h-screen bg-white">
      {/* Header - Full Width */}
      <div className="w-full bg-white px-4 py-6 sm:px-8 lg:px-16 border-b-2 border-black">
        <div className="w-full">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:opacity-70 transition-all mb-4 group"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            {t("back", "পিছনে")}
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-black text-white shadow-xl shadow-black/20 rotate-3 transition-all">
              {isNotice ? (
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight leading-none mb-1">
                {pageTitle}
              </h1>
              <div className="h-1 w-12 sm:w-16 bg-black rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content - Full Width & Compact List View */}
      <div className="w-full px-4 sm:px-8 lg:px-16 py-6 sm:py-12">
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
          </div>
        ) : items.length === 0 ? (
          <div className="w-full rounded-3xl border-2 border-dashed border-black p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-black/10 mb-4" />
            <p className="text-lg font-black text-black/40 tracking-tight">
              {t("no_content_available", "এই ক্যাটাগরিতে কোনো আপডেট নেই।")}
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-black/10">
            {items.map((item, index) => {
              const title = item.bn?.title || item.en?.title || "";
              const content = item.bn?.content || item.en?.content || "";
              const itemLink = `/posts/${item.id}`;

              return (
                <Link
                  key={item.id}
                  to={itemLink}
                  className="group block py-6 sm:py-8 first:pt-0 last:pb-0 transition-all hover:bg-black/[0.02]"
                >
                  <div className="flex gap-4 sm:gap-8 items-center">
                    {/* Left Side: Image */}
                    {item.image ? (
                      <div className="h-24 w-24 sm:h-32 sm:w-48 rounded-2xl overflow-hidden shrink-0 relative">
                        <img src={item.image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div className="h-24 w-24 sm:h-32 sm:w-48 rounded-2xl bg-black/5 flex items-center justify-center shrink-0">
                        <FileText className="h-8 w-8 text-black/10" />
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
                              {item.date ? new Date(item.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", { day: "numeric", month: "short", year: "numeric" }) : ""}
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
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
