import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { getUserProfile, setUserProfile, getSettings, addContactMessage } from "../services/firestore";
import { Mail, Phone, MapPin, Clock, Send, Loader2, LogIn, CheckCircle2, User, ArrowRight, MessageSquare, AlertCircle } from "lucide-react";
import PhoneVerificationModal from "../components/common/PhoneVerificationModal.jsx";

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const [user, authLoading] = useAuthState(auth);
  const [profile, setProfile] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [showPhoneModal, setShowPhoneModal] = useState(false);

  const lang = i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  useEffect(() => {
    if (user) {
      getUserProfile(user.uid).then(p => {
        setProfile(p);
        setFormData(prev => ({
          ...prev,
          name: p?.displayName || user.displayName || "",
          email: p?.email || user.email || ""
        }));
      });
    } else {
      setProfile(null);
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      
      const existingProfile = await getUserProfile(loggedUser.uid);
      if (!existingProfile) {
        const newProfile = {
          displayName: loggedUser.displayName || "",
          photoURL: loggedUser.photoURL || "",
          email: loggedUser.email || ""
        };
        await setUserProfile(loggedUser.uid, newProfile);
        setProfile(newProfile);
      } else {
        setProfile(existingProfile);
      }
    } catch (error) {
      console.error("Login failed:", error);
      let errorMessage = t("login_failed", "লগইন করতে সমস্যা হয়েছে।");
      if (error.code === 'auth/popup-blocked') {
        errorMessage = "লগইন পপআপ ব্লক করা হয়েছে। দয়া করে আপনার ব্রাউজারের পপআপ সেটিং চেক করুন।";
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "এই ডোমেইনটি (Domain) অনুমোদিত নয়।";
      }
      setStatus({ type: "error", text: errorMessage });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setStatus({ type: "error", text: t("please_login", "বার্তা পাঠাতে দয়া করে লগইন করুন।") });
      return;
    }

    // Check for phone number
    if (!profile?.phone) {
      setShowPhoneModal(true);
      return;
    }

    if (!formData.message.trim()) {
      setStatus({ type: "error", text: t("fill_message", "দয়া করে আপনার বার্তাটি লিখুন।") });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      await addContactMessage({
        ...formData,
        uid: user.uid,
        phone: profile.phone,
        lang
      });
      setStatus({ type: "success", text: t("message_sent", "আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে।") });
      setFormData(prev => ({ ...prev, message: "" }));
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: t("message_failed", "বার্তা পাঠাতে সমস্যা হয়েছে।") });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-cream)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[var(--text-brown)] py-10 sm:py-20 lg:py-24">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--accent-terracotta)]/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-terracotta)]/10 px-4 py-1.5 border border-[var(--accent-terracotta)]/20 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--accent-terracotta)]">
              {t("contact.subtitle", "যোগাযোগ")}
            </span>
          </div>
          <h1 className="text-xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {t("contact.title", "আমাদের সাথে যোগাযোগ করুন")}
          </h1>
          <p className="mx-auto max-w-xl text-xs sm:text-base font-bold text-white/60 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000 px-4">
            {t("contact.description", "যেকোনো জিজ্ঞাসার জন্য নিচের তথ্যগুলো ব্যবহার করে আমাদের সাথে যোগাযোগ করুন।")}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-10">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Contact Info Cards */}
          <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <ContactInfoCard 
                icon={<MapPin className="h-5 w-5" />}
                label={t("contact.address_label", "ঠিকানা")}
                value={settings?.contact?.[lang]?.address ?? t("contact.address")}
              />
              <ContactInfoCard 
                icon={<Phone className="h-5 w-5" />}
                label={t("contact.phone_label", "ফোন")}
                value={settings?.contact?.[lang]?.phone ?? t("contact.phone")}
              />
              <ContactInfoCard 
                icon={<Mail className="h-5 w-5" />}
                label={t("contact.email_label", "ইমেইল")}
                value={settings?.contact?.email ?? t("contact.email")}
                isLink
                href={`mailto:${settings?.contact?.email ?? t("contact.email")}`}
              />
              <ContactInfoCard 
                icon={<Clock className="h-5 w-5" />}
                label={t("contact.hours_label", "অফিস সময়")}
                value={t("contact.hours_value", "সোম–শুক্র, ৯:০০ — ৫:০০")}
              />
            </div>
            
            <div className="hidden lg:block p-6 rounded-[1.5rem] bg-[var(--text-brown)] text-white shadow-xl shadow-orange-900/10 border-2 border-white/5 relative overflow-hidden">
              <p className="relative text-sm font-bold italic leading-relaxed text-white/80">
                "আপনার মতামত এবং পরামর্শ আমাদের জন্য অত্যন্ত মূল্যবান। আমরা সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার চেষ্টা করি।"
              </p>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="h-full rounded-[1.5rem] sm:rounded-[2rem] bg-white border-2 border-[var(--tan-secondary)]/20 shadow-xl p-5 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-6 sm:mb-8">
                <div className="h-1 w-6 sm:w-8 bg-[var(--accent-terracotta)] rounded-full" />
                <h2 className="text-lg sm:text-2xl font-black text-[var(--text-brown)] tracking-tight">
                  {t("contact.form_title", "আমাদের বার্তা পাঠান")}
                </h2>
              </div>

              {!user ? (
                <div className="text-center py-8 sm:py-10 bg-[var(--bg-cream-soft)] rounded-[1.25rem] sm:rounded-[1.5rem] border-2 border-dashed border-[var(--tan-secondary)]/30 px-4">
                  <div className="mb-4 flex justify-center">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-white flex items-center justify-center text-[var(--accent-terracotta)] border-2 border-[var(--accent-terracotta)]/10 shadow-md">
                      <LogIn className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[var(--text-brown)] mb-1">বার্তা পাঠাতে লগইন করুন</h3>
                  <p className="text-[var(--text-brown)]/60 font-bold mb-6 max-w-xs mx-auto text-[10px] sm:text-xs">আপনার নাম এবং ইমেইল স্বয়ংক্রিয়ভাবে নেওয়ার জন্য দয়া করে গুগল দিয়ে লগইন করুন।</p>
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 sm:gap-3 mx-auto rounded-xl bg-[var(--text-brown)] px-5 py-3 text-xs sm:text-sm font-black text-white transition-all hover:bg-[var(--text-brown)]/90 hover:scale-105 active:scale-95 shadow-md"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="h-4 w-4 bg-white rounded-full p-0.5" />
                    <span>গুগল দিয়ে লগইন করুন</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-brown)]/40 px-1">আপনার নাম</label>
                      <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-[var(--bg-cream-soft)] border-2 border-transparent">
                        <User className="h-4 w-4 text-[var(--accent-terracotta)] shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-brown)] break-all line-clamp-1">{profile?.displayName || user.displayName}</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-brown)]/40 px-1">ইমেইল ঠিকানা</label>
                      <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl bg-[var(--bg-cream-soft)] border-2 border-transparent">
                        <Mail className="h-4 w-4 text-[var(--accent-terracotta)] shrink-0" />
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-brown)] break-all line-clamp-1">{profile?.email || user.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase tracking-widest text-[var(--text-brown)]/40 px-1">আপনার বার্তা</label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 h-4 w-4 text-[var(--text-brown)]/20" />
                      <textarea
                        rows="4"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="এখানে আপনার বার্তাটি লিখুন..."
                        className="w-full pl-10 sm:pl-12 pr-4 sm:pr-5 py-3.5 sm:py-4 rounded-[1rem] bg-[var(--bg-cream-soft)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none transition-all font-bold text-[var(--text-brown)] text-xs sm:text-sm resize-none placeholder:text-[var(--text-brown)]/10"
                      />
                    </div>
                  </div>

                  {status.text && (
                    <div className={`p-3.5 sm:p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 ${
                      status.type === 'success' ? "bg-green-50 text-green-700 border-2 border-green-100" : "bg-red-50 text-red-700 border-2 border-red-100"
                    }`}>
                      {status.type === 'success' ? <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                      <span className="font-bold text-[10px] sm:text-xs">{status.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !formData.message.trim()}
                    className="flex w-full sm:w-auto items-center justify-center gap-2 sm:gap-3 rounded-xl bg-[var(--accent-terracotta)] px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-black text-white shadow-xl shadow-orange-900/10 transition-all hover:bg-[var(--accent-terracotta-dark)] hover:-translate-y-1 active:scale-95 disabled:opacity-30"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span>বার্তা পাঠান</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {showPhoneModal && user && (
        <PhoneVerificationModal 
          user={user} 
          onComplete={(phone) => {
            setProfile(prev => ({ ...prev, phone }));
            setShowPhoneModal(false);
          }} 
        />
      )}
    </div>
  );
}

function ContactInfoCard({ icon, label, value, isLink, href }) {
  const content = (
    <div className="flex items-center gap-4 p-4 rounded-[1.25rem] bg-white border-2 border-[var(--tan-secondary)]/20 shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 group">
      <div className="h-10 w-10 rounded-xl bg-[var(--bg-cream-soft)] flex items-center justify-center text-[var(--accent-terracotta)] border-2 border-[var(--accent-terracotta)]/10 group-hover:bg-[var(--accent-terracotta)] group-hover:text-white transition-all">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-brown)]/30 mb-0.5">{label}</p>
        <p className="text-sm font-black text-[var(--text-brown)] leading-tight truncate">{value}</p>
      </div>
    </div>
  );

  if (isLink) return <a href={href} className="block">{content}</a>;
  return content;
}
