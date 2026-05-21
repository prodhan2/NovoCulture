import { useEffect, useState, useCallback } from "react";
import { ArrowRight, Home, Info, Menu, Grid3X3, Image, Phone, Mail, Sun, Moon, X } from "lucide-react";
import { NavLink, Link } from "react-router-dom";
import LogoMark from "./LogoMark.jsx";
import { useTranslation } from "react-i18next";
import { getSettings } from "../../services/firestore";

function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") === "dark";
    }
    return false;
  });
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
    { label: t("nav.home"), to: "/", icon: Home },
    { label: t("nav.about"), to: "/about", icon: Info },
    { label: t("nav.projects"), to: "/projects", icon: Grid3X3 },
    { label: t("nav.media"), to: "/media", icon: Image },
    { label: t("nav.contact"), to: "/contact", icon: Phone },
  ];

  // Theme toggle
  const toggleTheme = useCallback(() => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.classList.add("drawer-open");
    } else {
      document.body.classList.remove("drawer-open");
    }
    return () => document.body.classList.remove("drawer-open");
  }, [isDrawerOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsDrawerOpen(false);
    }
    if (isDrawerOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const phone = settings?.contact?.[lang]?.phone ?? t("contact.phone");
  const email = settings?.contact?.email ?? t("contact.email");

  return (
    <>
      {/* Overlay */}
      <div
        className={`drawer-overlay ${isDrawerOpen ? "open" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        className={`drawer-panel ${isDrawerOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="drawer-header">
          <Link to="/" onClick={closeDrawer}>
            <LogoMark compact />
          </Link>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-brown)] transition hover:bg-[rgba(224,169,109,0.15)]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="drawer-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `drawer-nav-link ${isActive ? "active" : ""}`
              }
            >
              <item.icon className="drawer-nav-icon" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="drawer-footer space-y-3">
          {/* Contact info */}
          <div className="rounded-xl bg-[var(--bg-cream-soft)] p-3 space-y-2 text-xs text-[var(--text-brown)]/80">
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2.5 transition hover:text-[var(--accent-terracotta)]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--tan-secondary)]" />
              <span dir="auto">{phone}</span>
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2.5 transition hover:text-[var(--accent-terracotta)]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--tan-secondary)]" />
              <span>{email}</span>
            </a>
          </div>

          <Link
            to="/donate"
            onClick={closeDrawer}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-terracotta-dark)]"
          >
            {t("donate")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      {/* Header bar */}
      <header className="border-b border-[color:var(--tan-secondary)]/25 bg-[var(--bg-cream-soft)] shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <LogoMark compact />
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[var(--accent-terracotta)] text-white shadow-sm"
                        : "text-[var(--text-brown)] hover:bg-[rgba(224,169,109,0.12)] hover:text-[var(--accent-terracotta-dark)]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {/* Language switcher + Dark mode (desktop) */}
              <div className="hidden items-center gap-1.5 lg:flex">
                <div className="inline-flex overflow-hidden rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] text-[11px] font-semibold uppercase tracking-wide">
                  {["EN", "BN"].map((option) => {
                    const code = option === "EN" ? "en" : "bn";
                    const isActive = lang === code;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => i18n.changeLanguage(code)}
                        className={`px-3 py-1.5 transition ${
                          isActive
                            ? "bg-[var(--accent-terracotta)] text-white"
                            : "text-[var(--text-brown)] hover:bg-[var(--bg-cream-soft)]"
                        }`}
                        aria-pressed={isActive}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] text-[var(--text-brown)] transition hover:bg-[var(--bg-cream-soft)]"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
              </div>

              {/* Donate (desktop) */}
              <Link
                to="/donate"
                className="hidden lg:inline-flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--accent-terracotta-dark)] hover:shadow-md"
              >
                {t("donate")}
                <ArrowRight className="h-4 w-4" />
              </Link>

              {/* Language + Dark mode + Hamburger (mobile) */}
              <div className="flex items-center gap-1.5 lg:hidden">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] text-[var(--text-brown)] transition hover:bg-[var(--bg-cream-soft)]"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                <div className="inline-flex overflow-hidden rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] text-[11px] font-semibold uppercase tracking-wide">
                  {["EN", "BN"].map((option) => {
                    const code = option === "EN" ? "en" : "bn";
                    const isActive = lang === code;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => i18n.changeLanguage(code)}
                        className={`px-3 py-1.5 transition ${
                          isActive
                            ? "bg-[var(--accent-terracotta)] text-white"
                            : "text-[var(--text-brown)] hover:bg-[var(--bg-cream-soft)]"
                        }`}
                        aria-pressed={isActive}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] text-[var(--text-brown)] transition hover:bg-[var(--bg-cream-soft)]"
                  onClick={() => setIsDrawerOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;
