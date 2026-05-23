import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getHeroUpdates } from "../../services/firestore";
import { Heart, ChevronRight, ArrowRight } from "lucide-react";

function FundsSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    async function load() {
      try {
        const all = await getHeroUpdates();
        const filtered = all.filter(u => u.category === "donations");
        setFunds(filtered);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;
  if (funds.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:px-16">
      <div className="rounded-[3rem] border-2 border-black bg-white p-8 sm:p-12 shadow-sm relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 h-64 w-64 bg-black/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10 border-b-2 border-black pb-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-1">
              Donation Funds
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
              {t("donations_heading", "NovoCulture অনুদান")}
            </h2>
          </div>
          <Link 
            to="/funds"
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:opacity-70 transition-all"
          >
            {t("view_all_funds", "সবগুলো দেখুন")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory">
          {funds.map((fund) => (
            <article
              key={fund.id}
              onClick={() => navigate(`/projects/${fund.id}`)}
              className="min-w-[280px] sm:min-w-[340px] flex-1 rounded-3xl border-2 border-black bg-[var(--bg-cream-soft)] p-6 transition-all hover:bg-white hover:shadow-2xl cursor-pointer snap-start group"
            >
              <div className="aspect-square rounded-2xl border-2 border-black overflow-hidden mb-6 relative">
                {fund.image ? (
                  <img src={fund.image} alt="" className="h-full w-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500" />
                ) : (
                  <div className="h-full w-full bg-white flex items-center justify-center">
                    <Heart className="h-10 w-10 text-black/10" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg border border-white/20 shadow-lg">
                    Fund
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-black text-black leading-tight group-hover:text-black transition-colors line-clamp-2">
                  {fund.bn?.title || fund.en?.title}
                </h3>
                <p className="text-xs font-bold text-black/60 line-clamp-2 leading-relaxed">
                  {(fund.bn?.content || fund.en?.content || "").replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/[#*`]/g, '')}
                </p>
                
                <div className="pt-4 flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/donation");
                    }}
                    className="px-6 py-2.5 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg border-2 border-black"
                  >
                    অনুদান দিন
                  </button>
                  <div className="h-10 w-10 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FundsSection;
