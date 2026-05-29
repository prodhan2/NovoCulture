import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { getSettings } from "../../services/firestore";
import bgImage from "../../assets/bg.webp";
import logoImage from "../../assets/novocare.webp";

function HeroSection() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const s = await getSettings();
        if (s) {
          setSettings(s);
        }
      } catch (err) {
        console.error("Failed to load hero section data:", err);
      }
    }
    loadData();
  }, []);

  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  return (
    <section className="w-full pt-0 sm:pt-4">
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden rounded-none sm:rounded-[2rem] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            alt="Novoculture Hero" 
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-12 lg:px-20 py-8 sm:py-16 text-center lg:text-left">
          <div className="max-w-4xl">
            <div className="flex flex-row items-center gap-3 sm:gap-4 mb-2 sm:mb-4 justify-center lg:justify-start">
              <img src={logoImage} alt="Logo" className="h-10 w-10 sm:h-16 sm:w-16 lg:h-20 lg:w-20 object-contain" />
              <div className="flex flex-col items-start lg:items-start">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[var(--text-brown-strong)] tracking-tight drop-shadow-sm leading-tight">
                  Novoculture
                </h1>
                <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-[var(--accent-terracotta)] uppercase tracking-wider">
                  {t("nav.logo_tagline", "Bangladeshi school spirit")}
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base lg:text-base text-[var(--text-brown)]/90 font-bold leading-relaxed mb-6 sm:mb-10 max-w-3xl mx-auto lg:mx-0">
              Novoculture একটি অরাজনৈতিক ও অলাভজনক সামাজিক প্ল্যাটফর্ম, যা শিক্ষা, নৈতিকতা এবং মানবতার সেবায় নিবেদিত। আমরা জ্ঞান ও সেবামূলক কার্যক্রমের মাধ্যমে একটি সুন্দর ও আলোকিত সমাজ বিনির্মাণে কাজ করছি।
            </p>
            <div className="flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6">
              <Link 
                to="/about"
                className="flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-4 bg-[var(--accent-terracotta)] text-white text-sm sm:text-base font-black rounded-xl sm:rounded-2xl transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-105 active:scale-95 shadow-xl shadow-orange-900/20 flex items-center justify-center whitespace-nowrap btn-glow"
              >
                আরও জানুন
              </Link>
              <button 
                onClick={() => navigate("/projects")}
                className="flex-1 sm:flex-none px-6 sm:px-10 py-3 sm:py-4 bg-[var(--accent-terracotta)] text-white text-sm sm:text-base font-black rounded-xl sm:rounded-2xl transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-105 active:scale-95 shadow-xl shadow-orange-900/20 flex items-center justify-center whitespace-nowrap"
              >
                কার্যক্রমসমূহ
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
