import { Heart, FileText, Bell } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

function MobileBottomNav() {
  const { t } = useTranslation();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 block bg-white border-t-2 border-[var(--accent-terracotta)]/20 px-4 py-2 lg:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        <NavLink
          to="/notices"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-[var(--accent-terracotta)]" : "text-black"
            }`
          }
        >
          <div className="relative">
            <Bell className="h-6 w-6" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider">
            {t("nav.notices", "Notices")}
          </span>
        </NavLink>

        <NavLink
          to="/donation"
          className={({ isActive }) =>
            `relative -top-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-terracotta)] text-white shadow-lg transition-transform hover:scale-105 active:scale-95 border-4 border-white ${
              isActive ? "ring-4 ring-[var(--accent-terracotta)]/40" : ""
            }`
          }
        >
          <Heart className="h-7 w-7 fill-current" />
        </NavLink>

        <NavLink
          to="/posts"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 transition-colors ${
              isActive ? "text-[var(--accent-terracotta)]" : "text-black"
            }`
          }
        >
          <FileText className="h-6 w-6" />
          <span className="text-[10px] font-black uppercase tracking-wider">
            {t("nav.posts", "পোস্ট")}
          </span>
        </NavLink>
      </div>
    </div>
  );
}

export default MobileBottomNav;
