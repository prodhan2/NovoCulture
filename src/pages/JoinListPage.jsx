import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, User, Loader2, ClipboardList, Calendar } from "lucide-react";
import { getJoinRegistrations } from "../services/firestore";

const categories = {
  donor: "Regular Donor",
  members: "Lifetime & Patron Members",
  volunteer: "Volunteer",
  careers: "Careers"
};

export default function JoinListPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getJoinRegistrations(category);
        setRegistrations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [category]);

  return (
    <section className="w-full px-4 py-4 sm:py-16 sm:px-8 lg:px-16 bg-[var(--bg-cream)] min-h-screen">
      <div className="w-full max-w-6xl mx-auto">
        <div className="mb-6 sm:mb-12 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-bold text-black hover:text-[var(--accent-terracotta)] transition-all"
          >
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none">
              <ArrowLeft className="h-4 w-4 sm:h-5 w-5" />
            </div>
            <span className="uppercase tracking-[0.2em]">{t("back", "হোমে ফিরে যান")}</span>
          </button>
        </div>

        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 sm:mb-16">
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-bold text-black tracking-tighter mb-3 sm:mb-4 leading-[0.9]">
              {t("registration_list", "নিবন্ধন তালিকা")}
            </h1>
            <div className="inline-block rounded-lg bg-black px-3 py-1 sm:px-4 sm:py-1.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white border-2 border-black shadow-[3px_3px_0px_0px_var(--accent-terracotta)] sm:shadow-[4px_4px_0px_0px_var(--accent-terracotta)]">
              {t(`join.${category}`, categories[category])}
            </div>
          </div>

          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-black" />
            </div>
          ) : registrations.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {registrations.map((item) => (
                <div key={item.id} className="group relative rounded-xl sm:rounded-2xl border-2 sm:border-4 border-black bg-white p-4 sm:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] sm:hover:translate-x-[4px] hover:translate-y-[2px] sm:hover:translate-y-[4px] hover:shadow-none">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-black text-white shadow-[2px_2px_0px_0px_var(--accent-terracotta)] sm:shadow-[4px_4px_0px_0px_var(--accent-terracotta)]">
                      <User className="h-5 w-5 sm:h-7 sm:w-7" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base sm:text-xl font-bold text-black truncate tracking-tight">{item.name}</h4>
                      <p className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-black/60 mb-3 sm:mb-4 font-bold uppercase tracking-wider">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        {new Date(item.date).toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      {item.message && (
                        <div className="rounded-lg sm:rounded-xl border-2 border-black bg-[var(--bg-cream-soft)] p-3 sm:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-xs sm:text-sm text-black leading-relaxed font-medium italic">"{item.message}"</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-dashed border-black/20 p-12 sm:p-24 text-center">
              <div className="mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-black/5">
                <ClipboardList className="h-8 w-8 sm:h-12 sm:w-12 text-black/20" />
              </div>
              <p className="text-lg sm:text-2xl font-bold text-black/30 tracking-tight">
                {t("no_registrations", "এখনও কোনো নিবন্ধন নেই।")}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
