import { useState } from "react";
import { Phone, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { setUserProfile } from "../../services/firestore";

export default function PhoneVerificationModal({ user, onComplete }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation for Bangladeshi phone numbers
    const cleanPhone = phone.replace(/[^\d]/g, "");
    if (cleanPhone.length < 10) {
      setError("দয়া করে সঠিক ফোন নম্বর দিন (কমপক্ষে ১০ ডিজিট)");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await setUserProfile(user.uid, { phone: cleanPhone });
      onComplete(cleanPhone);
    } catch (err) {
      console.error("Failed to save phone number:", err);
      setError("ফোন নম্বর সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-2 border-black/5 animate-in zoom-in slide-in-from-bottom-4 duration-500">
        <div className="relative h-24 bg-gradient-to-r from-[var(--accent-terracotta)] to-orange-400">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <div className="h-24 w-24 rounded-full bg-white p-2 shadow-xl border-4 border-white">
              <div className="h-full w-full rounded-full bg-orange-50 flex items-center justify-center text-[var(--accent-terracotta)]">
                <Phone className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pt-16 pb-10 text-center">
          <h2 className="text-2xl font-black text-black mb-2">ফোন নম্বর প্রয়োজন</h2>
          <p className="text-sm font-bold text-black/60 mb-8">
            আপনার প্রোফাইলটি সম্পন্ন করতে এবং আমাদের সাথে যোগাযোগ রাখতে একটি ফোন নম্বর প্রদান করুন।
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/40">
                <Phone className="h-5 w-5" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="আপনার ফোন নম্বর (উদাঃ 017...)"
                className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none transition-all font-bold text-black"
                autoFocus
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-xs font-bold px-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="w-full py-4 rounded-2xl bg-black text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:bg-black/80 hover:scale-[1.02] active:scale-95 disabled:opacity-30 shadow-xl shadow-black/20"
            >
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <span>নিশ্চিত করুন</span>
                  <ArrowRight className="h-6 w-6" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
