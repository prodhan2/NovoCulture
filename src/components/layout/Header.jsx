import { useEffect, useState, useCallback } from "react";
import { ArrowRight, Info, Menu, Grid3X3, Image, Phone, Mail, Sun, Moon, X, User, ShieldCheck, LogOut, Heart, PanelLeftClose, PanelLeftOpen, Bell, FileText, Users } from "lucide-react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import LogoMark from "./LogoMark.jsx";
import { useTranslation } from "react-i18next";
import { getSettings } from "../../services/firestore";
import { auth, googleProvider } from "../../services/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getUserProfile, setUserProfile } from "../../services/firestore";
import PhoneVerificationModal from "../common/PhoneVerificationModal.jsx";

function Header({ isSidebarHidden, toggleSidebar }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
        setProfile(p);
        // Show phone modal if phone is missing
        if (p && !p.phone) {
          setShowPhoneModal(true);
        }
      });
    } else {
      setProfile(null);
      setShowPhoneModal(false);
    }
  }, [user]);
  const [settings, setSettings] = useState(null);
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage || i18n.language || "bn";
  const lang = currentLang.startsWith("bn") ? "bn" : "en";



  const handleProfileClick = async () => {
    if (!auth) {
      alert("Firebase is not configured properly.");
      return;
    }
    if (user) {
      navigate("/profile");
    } else {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        const loggedUser = result.user;
        
        // Initialize profile in Firestore on first login
        const existingProfile = await getUserProfile(loggedUser.uid);
        if (!existingProfile) {
          await setUserProfile(loggedUser.uid, {
            displayName: loggedUser.displayName || "",
            photoURL: loggedUser.photoURL || "",
            email: loggedUser.email || ""
          });
        } else if (!existingProfile.photoURL && loggedUser.photoURL) {
          // Update photo if missing in Firestore but available in Auth
          await setUserProfile(loggedUser.uid, { photoURL: loggedUser.photoURL });
        }
        
        navigate("/profile");
      } catch (error) {
        console.error("Login failed:", error);
        if (error.code === 'auth/popup-blocked') {
          alert("লগইন পপআপ ব্লক করা হয়েছে। দয়া করে আপনার ব্রাউজারের পপআপ সেটিং চেক করুন।");
        } else if (error.code === 'auth/unauthorized-domain') {
          alert("এই ডোমেইনটি (Domain) অনুমোদিত নয়। দয়া করে অ্যাডমিনকে জানান।");
        } else {
          alert("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
        }
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      closeDrawer();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  const navigation = [
    { label: t("nav.about"), to: "/about", icon: Info },
    { label: t("nav.posts", "পোস্ট"), to: "/posts", icon: FileText },
    { label: t("nav.media"), to: "/media", icon: Image },
    { label: t("nav.contact"), to: "/contact", icon: Phone },
    { label: t("nav.funds", "তহবিলসমূহ"), to: "/funds", icon: Grid3X3 },
    { label: t("nav.donate", "অনুদান"), to: "/donation", icon: Heart },
    { label: t("nav.admin", "Admin"), to: "/admin", icon: ShieldCheck },
  ];

  // Language toggle
  const toggleLanguage = useCallback(() => {
    const next = currentLang === "bn" ? "en" : "bn";
    i18n.changeLanguage(next);
  }, [currentLang, i18n]);

  // Lock body scroll when drawer is open (Mobile only)
  useEffect(() => {
    if (isDrawerOpen && window.innerWidth < 1024) {
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
  const marqueeText = settings?.[`marqueeText${lang.charAt(0).toUpperCase() + lang.slice(1)}`] || t("marquee_text", "NovoCulture: Discover. Support. Inspire. • Join our mission to empower communities through education and culture • Support our latest outreach programs • ");

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
        className={`drawer-panel ${isDrawerOpen ? "open" : ""} ${isSidebarHidden ? "lg:-translate-x-full" : "lg:translate-x-0"}`}
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
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-brown)] transition hover:bg-[var(--accent-terracotta)]/10 lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 border-b border-[var(--accent-terracotta)]/20">
          <button
            onClick={() => {
              closeDrawer();
              handleProfileClick();
            }}
            className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-[var(--accent-terracotta)]/5 transition"
          >
            <div className="h-10 w-10 rounded-full border-2 border-[var(--accent-terracotta)] bg-white flex items-center justify-center overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-[var(--text-brown)]" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-[var(--text-brown)]">
                {user ? user.displayName : t("login", "Login")}
              </p>
              <p className="text-xs text-[var(--text-brown)] font-medium opacity-60">
                {user ? user.email : t("login_subtitle", "Access your profile")}
              </p>
            </div>
          </button>
          {user && (
            <button
              onClick={handleLogout}
              className="mt-2 flex w-full items-center gap-2 rounded-lg border-2 border-red-500 bg-white px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-600 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("logout", "Logout")}
            </button>
          )}
        </div>

        <nav className="drawer-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={closeDrawer}
              className={({ isActive }) =>
                `drawer-nav-link ${isActive ? "active" : "text-[var(--text-brown)] hover:bg-[var(--accent-terracotta)]/10"}`
              }
            >
              <item.icon className="drawer-nav-icon" />
              <span className="font-bold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="drawer-footer space-y-3">
          {/* Contact info */}
          <div className="rounded-xl bg-white/50 border border-[var(--accent-terracotta)]/20 p-3 space-y-2 text-xs text-[var(--text-brown)] font-bold">
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className="flex items-center gap-2.5 transition hover:text-[var(--accent-terracotta)]"
            >
              <Phone className="h-3.5 w-3.5 shrink-0 text-[var(--accent-terracotta)]" />
              <span dir="auto">{phone}</span>
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2.5 transition hover:text-[var(--accent-terracotta)]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 text-[var(--accent-terracotta)]" />
              <span>{email}</span>
            </a>
          </div>

          <Link
            to="/donate"
            onClick={closeDrawer}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[var(--accent-terracotta-dark)] border-2 border-[var(--accent-terracotta)]"
          >
            {t("donate")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </aside>

      {/* Header bar */}
      <header className={`border-b border-[var(--accent-terracotta)]/20 bg-[var(--bg-cream-soft)] shadow-sm sticky top-0 z-40 transition-all duration-300 ${isSidebarHidden ? "lg:ml-0" : "lg:ml-[280px]"}`}>
        <div className="mx-auto w-full px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link to="/" className={`flex items-center gap-3 shrink-0 ${isSidebarHidden ? "lg:flex" : "lg:hidden"}`}>
                <LogoMark compact />
              </Link>
              
              {/* Sidebar Toggle Button (Desktop) */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="hidden lg:flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[var(--accent-terracotta)] bg-white text-[var(--text-brown)] transition hover:bg-[var(--accent-terracotta)]/10 shadow-sm"
                aria-label={isSidebarHidden ? "Show sidebar" : "Hide sidebar"}
              >
                {isSidebarHidden ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </button>
            </div>

            {/* Desktop Navigation Links (Visible only when sidebar is hidden) */}
            {isSidebarHidden && (
              <nav className="hidden lg:flex items-center gap-2 bg-white/50 p-1.5 rounded-2xl border-2 border-[var(--accent-terracotta)]/10 shadow-sm">
                {navigation.filter(item => item.to !== "/admin").map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs xl:text-sm font-black uppercase tracking-widest transition-all ${
                        isActive 
                          ? "bg-[var(--accent-terracotta)] text-white shadow-lg scale-105" 
                          : "text-[var(--text-brown)] hover:bg-[var(--accent-terracotta)]/10"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </nav>
            )}

            <div className="flex items-center justify-end gap-4 sm:gap-6">
              <div className="flex items-center gap-3 shrink-0">
                {/* Notice Icon (Desktop Only) */}
                <Link
                  to="/notices"
                  className="hidden lg:flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--accent-terracotta)] bg-white text-[var(--text-brown)] transition hover:bg-[var(--accent-terracotta)]/10 hover:scale-110 shadow-sm relative"
                  aria-label="Notices"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                </Link>

                {/* Language toggle (desktop) */}
                <div className="hidden items-center lg:flex">
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[var(--accent-terracotta)] bg-white text-[var(--text-brown)] transition hover:bg-[var(--accent-terracotta)]/10 hover:scale-110 shadow-sm font-black text-xs"
                    aria-label="Toggle Language"
                  >
                    {currentLang === "bn" ? "EN" : "বাং"}
                  </button>
                </div>

                {/* Donate (desktop) */}
                <Link
                  to="/donation"
                  className="hidden lg:inline-flex items-center gap-2.5 rounded-xl bg-[var(--accent-terracotta)] px-7 py-3 text-sm xl:text-base font-black text-white shadow-md transition-all hover:bg-[var(--accent-terracotta-dark)] hover:scale-105 hover:shadow-lg border-2 border-[var(--accent-terracotta)]"
                >
                  {t("donate")}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 lg:hidden">
              {/* Language toggle (mobile) */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] text-[var(--text-brown)] transition hover:bg-[var(--bg-cream-soft)] font-black text-[10px]"
                aria-label="Toggle Language"
              >
                {currentLang === "bn" ? "EN" : "বাং"}
              </button>

              {/* App Drawer Button (Visible only on mobile/tablet) */}
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] text-[var(--text-brown)] transition hover:bg-[rgba(224,169,109,0.15)]"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {showPhoneModal && user && (
        <PhoneVerificationModal 
          user={user} 
          onComplete={(phone) => {
            setProfile(prev => ({ ...prev, phone }));
            setShowPhoneModal(false);
          }} 
        />
      )}
    </>
  );
}

export default Header;
