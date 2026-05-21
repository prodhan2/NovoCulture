import { useState, useEffect } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import LogoMark from "./LogoMark.jsx";
import { useTranslation } from "react-i18next";
import { getSettings } from "../../services/firestore";

// navigation labels come from translations inside the component

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [language, setLanguage] = useState("EN");
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await getSettings();
        if (mounted) setSettings(s);
      } catch (err) {
        // ignore
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const lang = i18n?.language && i18n.language.startsWith("bn") ? "bn" : "en";

  const navigation = [
    { label: t("nav.home"), to: "/" },
    { label: t("nav.about"), to: "/about" },
    { label: t("nav.projects"), to: "/projects" },
    { label: t("nav.media"), to: "/media" },
    { label: t("nav.contact"), to: "/contact" },
  ];

  return (
    <header className="border-b border-[color:var(--tan-secondary)]/50 bg-[var(--bg-cream-soft)]">
      <div className="border-b border-[color:var(--tan-secondary)]/35 bg-[var(--bg-cream)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 text-xs text-[var(--text-brown)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-terracotta)]" />
              {settings?.contact?.[lang]?.phone ?? t("contact.phone")}
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent-terracotta)]" />
              {settings?.contact?.email ?? t("contact.email")}
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[var(--text-brown-strong)]">
              {t("language")}
            </span>
            <div className="inline-flex overflow-hidden rounded-full border border-[color:var(--tan-secondary)] bg-white text-[11px] font-medium uppercase tracking-wide shadow-sm">
              {["EN", "BN"].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setLanguage(option);
                    const code = option === "EN" ? "en" : "bn";
                    i18n.changeLanguage(code);
                  }}
                  className={`px-3 py-1 transition ${language === option ? "bg-[var(--accent-terracotta)] text-white" : "text-[var(--text-brown)] hover:bg-[var(--bg-cream)]"}`}
                  aria-pressed={language === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark compact />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm transition ${isActive ? "bg-[var(--accent-terracotta)] text-white" : "text-[var(--text-brown)] hover:bg-[var(--bg-cream-soft)] hover:text-[var(--accent-terracotta-dark)]"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-terracotta)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-terracotta-dark)]"
            >
              {t("donate")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-[color:var(--tan-secondary)] text-[var(--text-brown)] lg:hidden"
            onClick={() => setIsMenuOpen((current) => !current)}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {isMenuOpen ? (
          <div className="mt-4 rounded-xl border border-[color:var(--tan-secondary)]/50 bg-white p-4 shadow-sm lg:hidden">
            <nav className="flex flex-col gap-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-4 py-3 text-sm ${isActive ? "bg-[var(--accent-terracotta)] text-white" : "bg-[var(--bg-cream)] text-[var(--text-brown)]"}`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <Link
                to="/donate"
                onClick={() => setIsMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-[var(--accent-terracotta)] px-4 py-3 text-sm font-semibold text-white"
              >
                {t("donate")}
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}

export default Header;
