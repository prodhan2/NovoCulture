import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Send, Loader2, LogIn, User, Mail, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { addJoinRegistration, getUserProfile, setUserProfile, syncUserWithFirestore } from "../services/firestore";

const categories = {
  donor: "Regular Donor",
  members: "Lifetime & Patron Members",
  volunteer: "Volunteer",
  careers: "Careers"
};

export default function JoinFormPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [status, setStatus] = useState({ type: "", text: "" });

  // Scroll and Session Time States
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [counterPos, setCounterPos] = useState({ x: window.innerWidth - 150, y: window.innerHeight - 150 });
  const [isDraggingCounter, setIsDraggingCounter] = useState(false);

  const handleCounterMouseDown = (e) => {
    setIsDraggingCounter(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingCounter) return;
    
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;

    const newX = Math.max(0, Math.min(window.innerWidth - 130, clientX - 65));
    const newY = Math.max(0, Math.min(window.innerHeight - 100, clientY - 50));
    setCounterPos({ x: newX, y: newY });
  }, [isDraggingCounter]);

  const handleMouseUp = () => {
    setIsDraggingCounter(false);
  };

  useEffect(() => {
    if (isDraggingCounter) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDraggingCounter, handleMouseMove]);

  // Scroll Progress Effect
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollPercentage(Math.round(scrolled));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Session Time Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || ""
      }));
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      
      // Centralized sync with Firestore
      await syncUserWithFirestore(loggedUser);
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = "লগইন করতে সমস্যা হয়েছে।";
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "লগইন পপআপ ব্লক করা হয়েছে। দয়া করে আপনার ব্রাউজারের পপআপ সেটিং চেক করুন।";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "এই ডোমেইনটি (Domain) অনুমোদিত নয়।";
      }
      setStatus({ type: "error", text: errorMessage });
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      setStatus({ type: "error", text: "নিবন্ধন করতে দয়া করে লগইন করুন।" });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone) {
      setStatus({ type: "error", text: t("fill_required_fields", "Please fill all required fields.") });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });
    try {
      await addJoinRegistration({
        ...formData,
        uid: user.uid,
        category: category,
      });
      setStatus({ type: "success", text: t("registration_success", "নিবন্ধন সফলভাবে সম্পন্ন হয়েছে!") });
      setFormData({ name: "", email: "", phone: "", message: "" });
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: t("registration_failed", "নিবন্ধন জমা দিতে সমস্যা হয়েছে।") });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="w-full bg-[var(--bg-cream)] min-h-screen animate-in fade-in duration-700">
      {/* Moveable Floating Scroll Counter */}
      <div 
        style={{ 
          left: `${counterPos.x}px`, 
          top: `${counterPos.y}px`,
          touchAction: 'none'
        }}
        onMouseDown={handleCounterMouseDown}
        onTouchStart={handleCounterMouseDown}
        className={`fixed z-[100] cursor-move bg-[var(--accent-terracotta)]/5 backdrop-blur-xl p-3 rounded-2xl border border-[var(--accent-terracotta)]/20 shadow-2xl flex items-center gap-3 transition-all active:scale-95 group ${isDraggingCounter ? 'opacity-80 scale-105 ring-4 ring-[var(--accent-terracotta)]/10' : 'animate-in zoom-in duration-500'}`}
      >
        <div className="flex flex-col items-center">
          <div className="relative h-10 w-10 flex items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-[var(--accent-terracotta)]/10"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={113}
                strokeDashoffset={113 - (113 * scrollPercentage) / 100}
                className="text-[var(--accent-terracotta)] transition-all duration-300"
              />
            </svg>
            <span className="text-[10px] font-black text-[var(--text-brown-strong)]">{scrollPercentage}%</span>
          </div>
        </div>
        <div className="h-8 w-px bg-[var(--accent-terracotta)]/10" />
        <div className="flex flex-col pr-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/40">সময়</span>
          <span className="text-sm font-black text-[var(--text-brown-strong)] tabular-nums">{formatTime(sessionTime)}</span>
        </div>
        
        {/* Drag handle */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-0.5 p-1 bg-[var(--accent-terracotta)] rounded-full">
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
            <div className="w-1 h-1 rounded-full bg-white/40" />
          </div>
        </div>
      </div>

      {/* Header Area - Full Width */}
      <div className="w-full px-4 sm:px-8 lg:px-16 py-12 sm:py-24">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60 hover:text-[var(--accent-terracotta)] transition-all mb-12 sm:mb-20"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>{t("back", "হোমে ফিরে যান")}</span>
        </button>

        <div className="flex flex-col gap-6 sm:gap-10">
          <span className="inline-block self-start rounded-full bg-[var(--accent-terracotta)] px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-[var(--accent-terracotta)]/20">
            {t(`join.${category}`, categories[category])}
          </span>
          <h1 className="text-5xl sm:text-8xl lg:text-[10rem] font-black text-[var(--text-brown-strong)] tracking-tighter leading-[0.85] max-w-[10ch]">
            {t("registration_form", "নিবন্ধন ফর্ম")}
          </h1>
          <p className="text-xl sm:text-4xl text-[var(--text-brown)]/70 font-bold max-w-3xl leading-tight">
            আমাদের সাথে যুক্ত হওয়ার জন্য নিচের ফর্মটি সঠিক তথ্য দিয়ে পূরণ করুন।
          </p>
        </div>
      </div>
      
      {/* Form Area - Full Width & Cardless */}
      <div className="w-full px-4 sm:px-8 lg:px-16 pb-32 sm:pb-48">
        {!user ? (
          <div className="flex flex-col items-start gap-12">
            <div className="flex h-20 w-20 sm:h-32 sm:w-32 items-center justify-center rounded-[2.5rem] bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] shadow-xl shadow-[var(--accent-terracotta)]/10">
              <LogIn className="h-10 w-10 sm:h-16 sm:w-16" />
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl sm:text-7xl font-black text-[var(--text-brown-strong)] tracking-tighter">
                নিবন্ধন করতে লগইন করুন
              </h2>
              <p className="text-lg sm:text-3xl text-[var(--text-brown)]/40 max-w-2xl font-bold">
                আপনার তথ্য সুরক্ষিত রাখতে এবং পরবর্তী আপডেটগুলো পেতে দয়া করে গুগল দিয়ে লগইন করুন।
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="flex items-center gap-6 rounded-[2.5rem] bg-[var(--text-brown-strong)] px-12 py-8 text-2xl font-black text-white transition-all hover:bg-[var(--accent-terracotta)] hover:-translate-y-2 active:scale-95 shadow-2xl shadow-[var(--text-brown-strong)]/20"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="h-8 w-8 bg-white rounded-full p-0.5" />
              <span>গুগল দিয়ে লগইন করুন</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-32 sm:space-y-56">
            {/* User Info Section - Minimalist & Cardless */}
            <div className="grid lg:grid-cols-2 gap-16 sm:gap-32">
              <div className="space-y-6">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[var(--accent-terracotta)]/40 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent-terracotta)] text-white text-[10px] font-black shadow-lg shadow-[var(--accent-terracotta)]/20">1</span>
                  আপনার নাম
                </label>
                <div className="flex items-center gap-8">
                  <div className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-[var(--accent-terracotta)]/5 shrink-0 border-2 border-[var(--accent-terracotta)]/10">
                    <User className="h-8 w-8 sm:h-12 sm:w-12 text-[var(--accent-terracotta)]" />
                  </div>
                  <span className="text-4xl sm:text-7xl font-black text-[var(--text-brown-strong)] tracking-tighter truncate">{user.displayName}</span>
                </div>
              </div>
              
              <div className="space-y-6">
                <label className="text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] text-[var(--accent-terracotta)]/40 flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[var(--accent-terracotta)] text-white text-[10px] font-black shadow-lg shadow-[var(--accent-terracotta)]/20">2</span>
                  ইমেইল ঠিকানা
                </label>
                <div className="flex items-center gap-8">
                  <div className="flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-[var(--accent-terracotta)]/5 shrink-0 border-2 border-[var(--accent-terracotta)]/10">
                    <Mail className="h-8 w-8 sm:h-12 sm:w-12 text-[var(--accent-terracotta)]" />
                  </div>
                  <span className="text-3xl sm:text-6xl font-black text-[var(--text-brown-strong)] tracking-tighter truncate">{user.email}</span>
                </div>
              </div>
            </div>
            
            {/* Input Fields - Modern Cardless Design */}
            <div className="space-y-32 sm:space-y-64">
              {/* Phone Input */}
              <div className="group border-b-8 border-[var(--accent-terracotta)]/10 focus-within:border-[var(--accent-terracotta)] transition-all pb-12 sm:pb-20">
                <label className="mb-10 block text-xs sm:text-base font-black uppercase tracking-[0.5em] text-[var(--accent-terracotta)]/20 group-focus-within:text-[var(--accent-terracotta)] transition-colors flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-terracotta)]/20 text-[var(--accent-terracotta)] text-xs font-black group-focus-within:bg-[var(--accent-terracotta)] group-focus-within:text-white transition-all shadow-lg shadow-[var(--accent-terracotta)]/10">3</span>
                  মোবাইল নম্বর *
                </label>
                <div className="flex items-center gap-8 sm:gap-16">
                  <Phone className="h-10 w-10 sm:h-24 sm:w-24 text-[var(--accent-terracotta)]/10 group-focus-within:text-[var(--accent-terracotta)] transition-colors shrink-0" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-transparent text-5xl sm:text-9xl lg:text-[12rem] font-black text-[var(--text-brown-strong)] outline-none placeholder:text-[var(--accent-terracotta)]/5 tracking-tighter p-0 selection:bg-[var(--accent-terracotta)] selection:text-white"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>

              {/* Message Textarea */}
              <div className="group border-b-8 border-[var(--accent-terracotta)]/10 focus-within:border-[var(--accent-terracotta)] transition-all pb-12 sm:pb-20">
                <label className="mb-10 block text-xs sm:text-base font-black uppercase tracking-[0.5em] text-[var(--accent-terracotta)]/20 group-focus-within:text-[var(--accent-terracotta)] transition-colors flex items-center gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--accent-terracotta)]/20 text-[var(--accent-terracotta)] text-xs font-black group-focus-within:bg-[var(--accent-terracotta)] group-focus-within:text-white transition-all shadow-lg shadow-[var(--accent-terracotta)]/10">4</span>
                  অতিরিক্ত বার্তা (ঐচ্ছিক)
                </label>
                <div className="flex items-start gap-8 sm:gap-16">
                  <MessageSquare className="mt-6 h-10 w-10 sm:h-24 sm:w-24 text-[var(--accent-terracotta)]/10 group-focus-within:text-[var(--accent-terracotta)] transition-colors shrink-0" />
                  <textarea
                    rows={1}
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-transparent text-4xl sm:text-7xl lg:text-9xl font-black text-[var(--text-brown-strong)] outline-none resize-none placeholder:text-[var(--accent-terracotta)]/5 tracking-tighter p-0 leading-none selection:bg-[var(--accent-terracotta)] selection:text-white"
                    placeholder="আপনার বার্তা..."
                    onInput={(e) => {
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                  />
                </div>
              </div>
            </div>
            
            {status.text && (
              <div className={`flex items-center gap-10 sm:gap-20 animate-in fade-in slide-in-from-left-8 duration-700 ${status.type === "success" ? "text-green-600" : "text-red-600"}`}>
                <div className={`flex h-20 w-20 sm:h-40 sm:w-40 shrink-0 items-center justify-center rounded-[3rem] sm:rounded-[4rem] shadow-2xl ${status.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                  <CheckCircle2 className="h-10 w-10 sm:h-20 sm:w-20" />
                </div>
                <span className="text-3xl sm:text-7xl lg:text-[7rem] font-black tracking-tighter leading-none">{status.text}</span>
              </div>
            )}

            <div className="pt-20 sm:pt-40">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full sm:w-auto items-center justify-center gap-10 rounded-[2.5rem] sm:rounded-[5rem] bg-[var(--text-brown-strong)] px-12 py-10 sm:px-32 sm:py-20 text-3xl sm:text-7xl font-black text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] transition-all hover:bg-[var(--accent-terracotta)] hover:-translate-y-6 active:translate-y-0 disabled:opacity-50 overflow-hidden"
              >
                {loading ? <Loader2 className="h-12 w-12 sm:h-24 sm:w-24 animate-spin" /> : <Send className="h-12 w-12 sm:h-24 sm:w-24 transition-transform group-hover:translate-x-6 group-hover:-translate-y-6" />}
                <span>{t("submit_registration", "নিবন্ধন জমা দিন")}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
