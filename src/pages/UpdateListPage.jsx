import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Calendar, Bell, FileText, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
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
  const pageTitle = isNotice
    ? t("tabs.notice", "NovoCulture নোটিশ বোর্ড")
    : t("tabs.posts", "NovoCulture পোস্ট ও আপডেট");

  return (
    <section className="w-full min-h-screen bg-[var(--bg-cream)]">
      {/* Header */}
      <div className="w-full bg-white/80 backdrop-blur-md px-4 py-6 sm:py-10 sm:px-6 lg:px-8 border-b border-black/5">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--accent-terracotta)] hover:opacity-70 transition-all mb-4 sm:mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {t("back", "পিছনে")}
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-[var(--accent-terracotta)] text-white shadow-xl shadow-[var(--accent-terracotta)]/20 rotate-3 group-hover:rotate-0 transition-transform">
              {isNotice ? (
                <Bell className="h-6 w-6 sm:h-8 sm:w-8" />
              ) : (
                <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-5xl font-black text-black tracking-tighter leading-none mb-1">
                {pageTitle}
              </h1>
              <div className="h-1 w-12 sm:w-20 bg-[var(--accent-terracotta)] rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-0 sm:px-6 lg:px-8 py-6 sm:py-12">
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-black/30" />
          </div>
        ) : items.length === 0 ? (
          <div className="mx-4 sm:mx-0 rounded-3xl border-4 border-dashed border-white bg-white/20 p-16 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-black/20 mb-4" />
            <p className="text-lg font-bold text-black/40">
              {t("no_content_available", "এই ক্যাটাগরিতে কোনো আপডেট নেই।")}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-8">
            {items.map((item, index) => {
              const title = item.bn?.title || item.en?.title || "";
              const content = item.bn?.content || item.en?.content || "";

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col sm:flex-row gap-4 sm:gap-8 rounded-none sm:rounded-[2.5rem] border-y-2 sm:border-2 border-white bg-white p-6 sm:p-10 shadow-sm transition-all hover:shadow-xl"
                >
                  {/* Number & Date Column */}
                  <div className="flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-4 sm:w-48 shrink-0">
                    <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-[var(--accent-terracotta)] text-white text-lg sm:text-2xl font-black shadow-lg shadow-[var(--accent-terracotta)]/20">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="flex flex-col text-right sm:text-left">
                      <span className="text-[10px] sm:text-xs font-black text-black/40 uppercase tracking-[0.2em] mb-0.5 sm:mb-1">প্রকাশিত</span>
                      <span className="text-lg sm:text-xl font-black text-[var(--accent-terracotta)] leading-none">
                        {item.date
                          ? new Date(item.date).toLocaleDateString(
                              lang === "bn" ? "bn-BD" : "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )
                          : ""}
                      </span>
                    </div>
                  </div>

                  {/* Image (if exists) */}
                  {item.image && (
                    <div className="w-full sm:w-64 aspect-video sm:aspect-square rounded-2xl overflow-hidden border-2 border-black/5 shadow-sm shrink-0">
                      <img src={item.image} alt={title} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                  )}

                  {/* Divider (Mobile) */}
                  {!item.image && <div className="h-px w-full bg-black/5 sm:hidden" />}

                  {/* Content Column */}
                  <div className="flex-1">
                    {/* Title */}
                    {title && (
                      <h2 className="text-xl sm:text-3xl font-black text-black mb-3 sm:mb-4 leading-tight tracking-tight group-hover:text-[var(--accent-terracotta)] transition-colors">
                        {title}
                      </h2>
                    )}

                    {/* Content */}
                    {content && (
                      <p className="text-base sm:text-xl text-black/70 leading-relaxed whitespace-pre-wrap font-medium">
                        {content}
                      </p>
                    )}
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
