import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeft, CheckCircle2, Heart, Loader2, LogIn, Mail, User, Phone, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { auth, googleProvider } from "../services/firebase";
import { signInWithPopup } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDonation, getUserProfile, setUserProfile, getCustomForms, syncUserWithFirestore } from "../services/firestore";

export default function DonationPage() {
  const { t } = useTranslation();
  const [user, authLoading] = useAuthState(auth);
  const [fund, setFund] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // In a real app, we might fetch phone from profile, 
      // but for now let's just use the state
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

  async function handleSubmit(event) {
    event.preventDefault();
    console.log("Submit clicked", { fund, phone, amount, user: user?.uid });

    if (!user) {
      setStatus({ type: "error", text: "অনুদান দিতে দয়া করে লগইন করুন।" });
      return;
    }

    if (!fund || !phone || !amount) {
      setStatus({ type: "error", text: "অনুগ্রহ করে সবগুলি ঘর পূরণ করুন।" });
      return;
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setStatus({ type: "error", text: "অনুগ্রহ করে সঠিক টাকার পরিমাণ লিখুন।" });
      return;
    }

    setLoading(true);
    setStatus({ type: "", text: "" });

    try {
      const donationData = {
        uid: user.uid,
        userName: user.displayName || user.email || "Anonymous",
        userEmail: user.email,
        fund,
        phone,
        amount: numAmount,
        status: "Pending",
        date: new Date().toISOString()
      };
      
      console.log("Sending donation data:", donationData);
      const docId = await addDonation(donationData);
      console.log("Donation successful, docId:", docId);
      
      setStatus({ type: "success", text: "আপনার অনুদান সফলভাবে গ্রহণ করা হয়েছে। জাযাকাল্লাহু খাইরান!" });
      setFund("");
      setPhone("");
      setAmount("");
    } catch (err) {
      console.error("Donation submission error:", err);
      setStatus({ type: "error", text: `অনুদান প্রক্রিয়াকরণে সমস্যা হয়েছে: ${err.message || "আবার চেষ্টা করুন।"}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)]">
      {/* Hero Header */}
      <header className="relative overflow-hidden bg-[var(--text-brown)] py-12 sm:py-20 lg:py-24">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--accent-terracotta)]/10 blur-3xl" />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--accent-terracotta)]/10 px-4 py-1.5 border border-[var(--accent-terracotta)]/20 mb-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <Heart className="h-3 w-3 text-[var(--accent-terracotta)]" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-terracotta)]">
              {t("donation.subtitle", "মানবতা")}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            একটি ভালো কাজের অংশীদার হন
          </h1>
          <p className="mx-auto max-w-xl text-sm sm:text-base font-bold text-white/60 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
            আপনার একটি ক্ষুদ্র অনুদান আমাদের সমাজের সুবিধাবঞ্চিত মানুষের জীবনে বড় পরিবর্তন আনতে পারে।
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Why Donate & Info */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 border-2 border-[var(--tan-secondary)]/20 shadow-xl">
              <h2 className="text-xl font-black text-[var(--text-brown)] mb-6 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-[var(--accent-terracotta)]" />
                কেন অনুদান দেবেন?
              </h2>
              <div className="space-y-6">
                <DonationFeature 
                  title="স্বচ্ছতা" 
                  desc="১০০% স্বচ্ছতা নিশ্চিত করা হয় এবং প্রতিটি টাকা মানবতার কল্যাণে ব্যয় হয়।" 
                />
                <DonationFeature 
                  title="সরাসরি প্রভাব" 
                  desc="আপনার অনুদান সরাসরি নির্দিষ্ট প্রকল্পের কাজে ব্যয় করা হয়।" 
                />
                <DonationFeature 
                  title="নিয়মিত আপডেট" 
                  desc="প্রকল্পের অগ্রগতি সম্পর্কে দাতাদের নিয়মিত আপডেট প্রদান করা হয়।" 
                />
              </div>
            </div>

            <div className="p-6 rounded-[1.5rem] bg-[var(--text-brown)] text-white shadow-xl shadow-orange-900/10 border-2 border-white/5 relative overflow-hidden">
              <p className="relative text-sm font-bold italic leading-relaxed text-white/80">
                "নভোকালচার একটি অরাজনৈতিক ও অলাভজনক সামাজিক প্ল্যাটফর্ম, যা মানবতার সেবায় নিবেদিত।"
              </p>
            </div>
          </div>

          {/* Right Column: The Form */}
          <div className="lg:col-span-8">
            <div className="h-full rounded-[2rem] bg-white border-2 border-[var(--tan-secondary)]/20 shadow-xl p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-1 w-8 bg-[var(--accent-terracotta)] rounded-full" />
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-brown)] tracking-tight">
                  অনুদান ফর্ম পূরণ করুন
                </h2>
              </div>

              {!user ? (
                <div className="text-center py-10 bg-[var(--bg-cream-soft)] rounded-[1.5rem] border-2 border-dashed border-[var(--tan-secondary)]/30">
                  <div className="mb-4 flex justify-center">
                    <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center text-[var(--accent-terracotta)] border-2 border-[var(--accent-terracotta)]/10 shadow-md">
                      <LogIn className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-black text-[var(--text-brown)] mb-2">অনুদান দিতে লগইন করুন</h3>
                  <p className="text-[var(--text-brown)]/60 font-bold mb-6 max-w-xs mx-auto text-xs">আপনার অনুদানের তথ্য সুরক্ষিত রাখতে দয়া করে গুগল দিয়ে লগইন করুন।</p>
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-3 mx-auto rounded-xl bg-[var(--text-brown)] px-6 py-3 text-sm font-black text-white transition-all hover:bg-[var(--text-brown)]/90 hover:scale-105 active:scale-95 shadow-md"
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="Google" className="h-4 w-4 bg-white rounded-full p-0.5" />
                    <span>গুগল দিয়ে লগইন করুন</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* User Info (Read-only) */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-cream-soft)] border-2 border-transparent">
                      <User className="h-4 w-4 text-[var(--accent-terracotta)]" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-brown)]/30">নাম</p>
                        <p className="text-sm font-bold text-[var(--text-brown)] truncate">{user.displayName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-cream-soft)] border-2 border-transparent">
                      <Mail className="h-4 w-4 text-[var(--accent-terracotta)]" />
                      <div className="min-w-0">
                        <p className="text-[8px] font-black uppercase tracking-widest text-[var(--text-brown)]/30">ইমেইল</p>
                        <p className="text-sm font-bold text-[var(--text-brown)] truncate">{user.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Fund Selection */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-brown)]/40 px-1">তহবিলের ধরণ</label>
                    <div className="relative">
                      <select
                        value={fund}
                        onChange={(e) => setFund(e.target.value)}
                        className="w-full bg-[var(--bg-cream-soft)] p-4 rounded-xl border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none appearance-none cursor-pointer font-bold text-[var(--text-brown)] text-sm"
                      >
                        <option value="">তহবিল নির্বাচন করুন</option>
                        <option value="General Donation">সাধারণ অনুদান</option>
                        <option value="Eid Gift">ঈদের উপহার</option>
                        <option value="Zakat">যাকাত</option>
                        <option value="Education">শিক্ষা সহায়তা</option>
                      </select>
                      <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-brown)]/30">
                        <ArrowLeft className="h-4 w-4 rotate-[270deg]" />
                      </div>
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-brown)]/40 px-1">মোবাইল নম্বর</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-brown)]/20" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="আপনার মোবাইল নম্বর লিখুন"
                        className="w-full pl-12 pr-5 py-4 rounded-xl bg-[var(--bg-cream-soft)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none transition-all font-bold text-[var(--text-brown)] text-sm"
                      />
                    </div>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-brown)]/40 px-1">অনুদানের পরিমাণ (টাকা)</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--text-brown)]/20">৳</div>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="টাকার পরিমাণ লিখুন"
                        className="w-full pl-10 pr-5 py-4 rounded-xl bg-[var(--bg-cream-soft)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none transition-all font-bold text-[var(--text-brown)] text-sm"
                      />
                    </div>
                  </div>

                  {status.text && (
                    <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-300 ${
                      status.type === 'success' ? "bg-green-50 text-green-700 border-2 border-green-100" : "bg-red-50 text-red-700 border-2 border-red-100"
                    }`}>
                      {status.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      <span className="font-bold text-xs">{status.text}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-[var(--accent-terracotta)] py-4 text-base font-black text-white shadow-xl shadow-orange-900/10 transition-all hover:bg-[var(--accent-terracotta-dark)] hover:-translate-y-1 active:scale-95 disabled:opacity-30"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className="h-5 w-5" />}
                    <span>অনুদান সম্পন্ন করুন</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DonationFeature({ title, desc }) {
  return (
    <div className="group">
      <h3 className="text-sm font-black text-[var(--text-brown)] mb-1 group-hover:text-[var(--accent-terracotta)] transition-colors">{title}</h3>
      <p className="text-xs font-medium text-[var(--text-brown)]/60 leading-relaxed">{desc}</p>
    </div>
  );
}
