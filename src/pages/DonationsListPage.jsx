import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getHeroUpdates } from "../services/firestore";
import { Loader2, AlertCircle, Heart } from "lucide-react";

function DonationsListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function loadFunds() {
      setLoading(true);
      try {
        const allUpdates = await getHeroUpdates();
        const filteredFunds = allUpdates.filter(u => u.category === "donations");
        setFunds(filteredFunds);
      } catch (err) {
        console.error("Failed to load donation funds:", err);
      } finally {
        setLoading(false);
      }
    }
    loadFunds();
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--accent-terracotta)] mb-3">
          {t("donations_label", "Donation Funds")}
        </p>
        <h1 className="text-4xl sm:text-6xl font-black text-black tracking-tighter mb-4">
          {t("donations_heading", "NovoCulture অনুদান")}
        </h1>
        <div className="h-1.5 w-24 bg-[var(--accent-terracotta)] mx-auto rounded-full" />
      </div>

      {loading ? (
        <div className="flex h-60 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
        </div>
      ) : funds.length === 0 ? (
        <div className="rounded-[2.5rem] border-4 border-dashed border-black/5 bg-white/50 p-20 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-black/20 mb-4" />
          <p className="text-xl font-bold text-black/40">
            {t("no_funds_available", "এই মুহূর্তে কোনো অনুদান তহবিল পাওয়া যায়নি।")}
          </p>
        </div>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {funds.map((fund) => {
            const title = fund.bn?.title || fund.en?.title || "";
            const content = fund.bn?.content || fund.en?.content || "";
            
            return (
              <div key={fund.id} className="group flex flex-col bg-white rounded-[2.5rem] border border-black/5 shadow-xl overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden relative">
                  {fund.image ? (
                    <img 
                      src={fund.image} 
                      alt={title} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-[var(--bg-cream-soft)] flex items-center justify-center text-black/10">
                      <Heart className="h-12 w-12" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1 text-center">
                  <h3 className="text-2xl font-black text-black mb-4 leading-tight group-hover:text-[var(--accent-terracotta)] transition-colors min-h-[4rem] flex items-center justify-center">
                    {title}
                  </h3>
                  <p className="text-base text-black/60 font-medium leading-relaxed mb-8 line-clamp-4">
                    {content.replace(/[#*`]/g, '')}
                  </p>
                  <div className="mt-auto flex flex-col gap-3">
                    <button 
                      onClick={() => navigate(`/projects/${fund.id}`)}
                      className="w-full rounded-2xl bg-[var(--accent-terracotta)]/5 border-2 border-[var(--accent-terracotta)]/20 py-4 text-base font-bold text-[var(--accent-terracotta)] transition-all hover:bg-[var(--accent-terracotta)] hover:text-white active:scale-95"
                    >
                      বিস্তারিত দেখুন
                    </button>
                    <button 
                      onClick={() => navigate("/donation")}
                      className="w-full rounded-2xl bg-[var(--accent-terracotta)] py-4 text-base font-bold text-white shadow-xl shadow-orange-900/20 transition-all hover:bg-[var(--accent-terracotta-dark)] active:scale-95"
                    >
                      অনুদান করুন
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

export default DonationsListPage;