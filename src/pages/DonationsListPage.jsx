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
    <section className="w-full min-h-screen bg-white">
      {/* Header - Full Width */}
      <div className="w-full bg-white px-4 py-6 sm:px-8 lg:px-16 border-b-2 border-black">
        <div className="w-full">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-black text-white shadow-xl shadow-black/20 rotate-3 transition-all">
              <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-1">
                {t("donations_label", "Donation Funds")}
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-black tracking-tight leading-none mb-1">
                {t("donations_heading", "NovoCulture অনুদান")}
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
        ) : funds.length === 0 ? (
          <div className="w-full rounded-3xl border-2 border-dashed border-black p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-black/10 mb-4" />
            <p className="text-lg font-black text-black/40 tracking-tight">
              {t("no_funds_available", "এই মুহূর্তে কোনো অনুদান তহবিল পাওয়া যায়নি।")}
            </p>
          </div>
        ) : (
          <div className="divide-y-2 divide-black/10">
            {funds.map((fund, index) => {
              const title = fund.bn?.title || fund.en?.title || "";
              const content = fund.bn?.content || fund.en?.content || "";
              
              return (
                <div 
                  key={fund.id} 
                  className="group block py-6 sm:py-8 first:pt-0 last:pb-0 transition-all hover:bg-black/[0.02]"
                >
                  <div className="flex gap-4 sm:gap-8 items-center">
                    {/* Left Side: Image */}
                    {fund.image ? (
                      <div 
                        onClick={() => navigate(`/projects/${fund.id}`)}
                        className="h-24 w-24 sm:h-32 sm:w-48 rounded-2xl overflow-hidden border-2 border-black shrink-0 relative cursor-pointer"
                      >
                        <img src={fund.image} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    ) : (
                      <div 
                        onClick={() => navigate(`/projects/${fund.id}`)}
                        className="h-24 w-24 sm:h-32 sm:w-48 rounded-2xl bg-black/5 flex items-center justify-center border-2 border-black shrink-0 cursor-pointer"
                      >
                        <Heart className="h-8 w-8 text-black/10" />
                      </div>
                    )}

                    {/* Right Side: Others */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => navigate(`/projects/${fund.id}`)}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-white text-[10px] font-black shrink-0">
                              {String(index + 1).padStart(2, '0')}
                            </span>
                            <span className="text-[10px] font-black text-black/40 uppercase tracking-widest">DONATION FUND</span>
                          </div>
                          
                          <h2 className="text-lg sm:text-xl font-black text-black mb-1 leading-tight tracking-tight group-hover:text-black transition-colors truncate">
                            {title}
                          </h2>
                          
                          <p className="text-xs sm:text-sm text-black/60 font-bold leading-relaxed line-clamp-2">
                            {content.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/[#*`]/g, '')}
                          </p>
                        </div>
                        
                        <div className="flex flex-col gap-2 shrink-0">
                          <button 
                            onClick={() => navigate("/donation")}
                            className="hidden sm:block px-4 py-2 rounded-xl bg-black text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
                          >
                            অনুদান দিন
                          </button>
                          <div 
                            onClick={() => navigate(`/projects/${fund.id}`)}
                            className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full border-2 border-black text-black group-hover:bg-black group-hover:text-white transition-all self-end cursor-pointer"
                          >
                            <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                          </div>
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
 
 export default DonationsListPage;