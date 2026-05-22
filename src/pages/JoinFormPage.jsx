import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Send, Loader2, LogIn, User, Mail, Phone, MessageSquare } from "lucide-react";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { addJoinRegistration, getUserProfile, setUserProfile } from "../services/firestore";

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
      
      const existingProfile = await getUserProfile(loggedUser.uid);
      if (!existingProfile) {
        await setUserProfile(loggedUser.uid, {
          displayName: loggedUser.displayName || "",
          photoURL: loggedUser.photoURL || "",
          email: loggedUser.email || ""
        });
      }
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
    <section className="w-full px-4 py-4 sm:py-16 sm:px-8 lg:px-16 bg-[var(--bg-cream)] min-h-screen">
      <div className="w-full max-w-5xl mx-auto">
        <div className="mb-4 sm:mb-12 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="group flex items-center gap-2 text-[10px] sm:text-xs font-bold text-black hover:text-[var(--accent-terracotta)] transition-all"
          >
            <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white border-2 border-[var(--accent-terracotta)] shadow-sm transition group-hover:bg-[var(--accent-terracotta)] group-hover:text-white">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 w-4" />
            </div>
            <span className="uppercase tracking-widest">{t("back", "হোমে ফিরে যান")}</span>
          </button>
        </div>

        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 sm:mb-16">
            <span className="inline-block rounded-full bg-[var(--accent-terracotta)] px-3 py-0.5 sm:px-4 sm:py-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-white mb-3 sm:mb-4 border-2 border-[var(--accent-terracotta)] shadow-sm">
              {t(`join.${category}`, categories[category])}
            </span>
            <h1 className="text-2xl sm:text-5xl lg:text-7xl font-bold text-black tracking-tighter mb-2 sm:mb-3 leading-none">
              {t("registration_form", "নিবন্ধন ফর্ম পূরণ করুন")}
            </h1>
            <p className="text-sm sm:text-xl lg:text-2xl text-black font-medium leading-snug sm:leading-relaxed max-w-2xl">
              আমাদের সাথে যুক্ত হওয়ার জন্য নিচের ফর্মটি সঠিক তথ্য দিয়ে পূরণ করুন।
            </p>
          </div>
          
          {!user ? (
            <div className="flex flex-col items-start justify-center py-8 sm:py-20 border-t-2 border-[var(--accent-terracotta)]">
              <div className="mb-4 sm:mb-6 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-xl sm:rounded-2xl bg-white text-[var(--accent-terracotta)] border-2 border-[var(--accent-terracotta)] shadow-sm">
                <LogIn className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
              <h2 className="text-xl sm:text-4xl font-bold text-black mb-2">
                নিবন্ধন করতে লগইন করুন
              </h2>
              <p className="text-xs sm:text-lg text-black max-w-xl mb-6 sm:mb-8 font-medium leading-relaxed">
                আপনার তথ্য সুরক্ষিত রাখতে এবং পরবর্তী আপডেটগুলো পেতে দয়া করে গুগল দিয়ে লগইন করুন।
              </p>
              <button
                onClick={handleLogin}
                className="flex items-center gap-2.5 sm:gap-3 rounded-lg sm:rounded-xl bg-black px-6 py-3 sm:px-8 sm:py-4 text-xs sm:text-lg font-bold text-white transition-all hover:bg-black/80 active:scale-95 border-2 border-[var(--accent-terracotta)] shadow-lg shadow-black/10"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="h-4 w-4 sm:h-5 w-5 bg-white rounded-full p-0.5" />
                <span>গুগল দিয়ে লগইন করুন</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12 border-t-4 border-[var(--accent-terracotta)] pt-10 sm:pt-16">
              <div className="grid gap-8 sm:gap-12">
                <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
                  <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-6 sm:p-10 border-2 border-black/5 shadow-sm">
                    <label className="mb-4 block text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black/40">
                      আপনার নাম
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] shrink-0">
                        <User className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <span className="text-xl sm:text-3xl font-black text-black tracking-tighter leading-none">{user.displayName}</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/50 backdrop-blur-sm rounded-[2rem] p-6 sm:p-10 border-2 border-black/5 shadow-sm">
                    <label className="mb-4 block text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-black/40">
                      ইমেইল ঠিকানা
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] shrink-0">
                        <Mail className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <span className="text-xl sm:text-3xl font-black text-black tracking-tighter leading-none truncate">{user.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border-2 border-black/5 shadow-xl group focus-within:border-[var(--accent-terracotta)] transition-all">
                  <label className="mb-6 block text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-black group-focus-within:text-[var(--accent-terracotta)] transition-colors">
                    মোবাইল নম্বর *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-6 sm:h-10 sm:w-10 text-black/20 group-focus-within:text-[var(--accent-terracotta)] transition-colors" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-transparent py-4 sm:py-6 pl-10 sm:pl-16 text-2xl sm:text-5xl font-black text-black outline-none placeholder:text-black/5 tracking-tighter"
                      placeholder="01XXXXXXXXX"
                    />
                    <div className="h-1.5 w-full bg-black/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-[var(--accent-terracotta)] w-0 group-focus-within:w-full transition-all duration-500" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 border-2 border-black/5 shadow-xl group focus-within:border-[var(--accent-terracotta)] transition-all">
                  <label className="mb-6 block text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-black group-focus-within:text-[var(--accent-terracotta)] transition-colors">
                    অতিরিক্ত বার্তা (ঐচ্ছিক)
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-0 top-6 h-6 w-6 sm:h-10 sm:w-10 text-black/20 group-focus-within:text-[var(--accent-terracotta)] transition-colors" />
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-transparent py-4 sm:py-6 pl-10 sm:pl-16 text-xl sm:text-4xl font-black text-black outline-none resize-none placeholder:text-black/5 tracking-tighter leading-tight"
                      placeholder="আপনার কোনো জিজ্ঞাসা থাকলে এখানে লিখুন..."
                    />
                    <div className="h-1.5 w-full bg-black/5 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-[var(--accent-terracotta)] w-0 group-focus-within:w-full transition-all duration-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              {status.text && (
                <div className={`rounded-[2rem] p-6 sm:p-10 flex items-center gap-4 sm:gap-8 animate-in fade-in zoom-in-95 duration-500 border-2 border-black/5 shadow-xl ${status.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  <div className={`flex h-12 w-12 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl shadow-lg ${status.type === "success" ? "bg-green-500 text-white shadow-green-500/20" : "bg-red-500 text-white shadow-red-500/20"}`}>
                    <CheckCircle2 className="h-6 w-6 sm:h-10 sm:w-10" />
                  </div>
                  <span className="text-lg sm:text-3xl font-black tracking-tight leading-tight">{status.text}</span>
                </div>
              )}

              <div className="pt-8 sm:pt-16">
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full sm:w-auto items-center justify-center gap-4 sm:gap-8 rounded-[2rem] sm:rounded-[2.5rem] bg-black px-12 py-6 sm:px-20 sm:py-10 text-xl sm:text-4xl font-black text-white shadow-2xl shadow-black/20 transition-all hover:bg-black/90 hover:-translate-y-2 active:translate-y-0 disabled:opacity-50 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-terracotta)] to-[var(--accent-terracotta-dark)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative flex items-center gap-4 sm:gap-8">
                    {loading ? <Loader2 className="h-6 w-6 sm:h-12 sm:w-12 animate-spin" /> : <Send className="h-6 w-6 sm:h-12 sm:w-12" />}
                    <span>{t("submit_registration", "নিবন্ধন জমা দিন")}</span>
                  </div>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
