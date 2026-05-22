import logo from "../../assets/novocare.webp";
import { useTranslation } from "react-i18next";

function LogoMark({ compact = false, logoUrl = null }) {
  const { t } = useTranslation();
  const size = compact ? "h-10 w-10" : "h-14 w-14";
  const wordmarkClass = compact ? "text-sm" : "text-lg";
  const taglineClass = compact ? "text-[10px]" : "text-xs";

  const displayLogo = logoUrl || logo;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {displayLogo ? (
          <img src={displayLogo} alt="Logo" className={`${size} object-contain`} />
        ) : (
          <svg
            viewBox="0 0 120 120"
            className={size}
            aria-hidden="true"
            role="presentation"
          >
            <rect
              x="6"
              y="6"
              width="108"
              height="108"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeDasharray="12 8"
              rx="2"
            />
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
            >
              <path d="M60 108 C58 96, 56 80, 60 10" />
              <path d="M53 108 C49 92, 46 74, 42 34" />
              <path d="M47 108 C42 94, 36 78, 28 58" />
              <path d="M65 108 C69 92, 74 76, 81 26" />
              <path d="M70 108 C76 90, 84 72, 95 42" />
              <path d="M76 108 C84 90, 92 72, 104 56" />
            </g>
          </svg>
        )}
        <div className="flex flex-col justify-center">
          <span className="font-black leading-none tracking-tight text-[var(--text-brown)] uppercase">
            NOVOCULTURE
          </span>
          <span
             className={`font-bold leading-none text-[var(--text-brown)] opacity-70 ${taglineClass}`}
           >
             {t("nav.logo_tagline", "Bangladeshi school spirit")}
           </span>
         </div>
       </div>
       {!compact ? (
         <div className="hidden sm:block border-l-2 border-[var(--accent-terracotta)]/20 pl-3 ml-1">
           <p
             className={`font-black uppercase tracking-[0.25em] text-[var(--text-brown)] ${wordmarkClass}`}
           >
             NovoCulture
           </p>
           <p className="mt-1 text-xs font-bold leading-5 text-[var(--text-brown)] opacity-60">
             {t("nav.logo_tagline", "Bangladeshi school spirit")}
           </p>
         </div>
       ) : null}
    </div>
  );
}

export default LogoMark;
