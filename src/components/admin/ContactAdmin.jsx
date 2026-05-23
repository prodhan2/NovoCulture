import { useEffect, useState } from "react";
import { Loader2, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { getSettings, setSettings } from "../../services/firestore";

export default function ContactAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState({
    bn: { address: "", phone: "" },
    email: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const settings = await getSettings();
        if (!mounted) return;
        const c = settings?.contact || {};
        setContact({
          bn: c.bn || { address: "", phone: "" },
          email: c.email ?? c.bn?.email ?? "",
        });
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      // Copy Bengali data to English to keep it consistent
      const dataToSave = {
        ...contact,
        en: { ...contact.bn }
      };
      await setSettings({ contact: dataToSave });
      setMessage("সফলভাবে সেভ হয়েছে।");
    } catch (err) {
      console.error(err);
      setMessage("সেভ করতে সমস্যা হয়েছে। কনসোল চেক করুন।");
    } finally {
      setSaving(false);
    }
  }

  const adjustHeight = (e) => {
    const target = e.target || e;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  useEffect(() => {
    if (!loading) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(adjustHeight);
      }, 100);
    }
  }, [loading, contact]);

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8">
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">
          যোগাযোগের তথ্য পরিবর্তন
        </h1>
        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
          প্রতিষ্ঠানের যোগাযোগের বিবরণ আপডেট করুন
        </p>
      </div>

      {loading ? (
        <div className="px-4 sm:px-8 lg:px-10 flex h-48 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
        </div>
      ) : (
        <div className="px-4 sm:px-8 lg:px-10 pb-20 w-full">
          <div className="space-y-8">
            {/* Horizontal Listview Style Fields with Auto-grow */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                অফিস ঠিকানা
              </label>
              <div className="md:col-span-3">
                <textarea
                  rows={1}
                  dir="auto"
                  value={contact.bn.address}
                  onInput={adjustHeight}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      bn: { ...contact.bn, address: e.target.value },
                    })
                  }
                  placeholder="ঠিকানা লিখুন..."
                  className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                ফোন নম্বর
              </label>
              <div className="md:col-span-3">
                <textarea
                  rows={1}
                  value={contact.bn.phone}
                  onInput={adjustHeight}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      bn: { ...contact.bn, phone: e.target.value },
                    })
                  }
                  placeholder="ফোন নম্বর"
                  className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                ইমেইল এড্রেস
              </label>
              <div className="md:col-span-3">
                <textarea
                  rows={1}
                  value={contact.email}
                  onInput={adjustHeight}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                  placeholder="ইমেইল"
                  className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 md:ml-[25%]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-4 rounded-xl bg-[var(--accent-terracotta)] px-10 py-4 text-base font-black text-white shadow-xl shadow-[var(--accent-terracotta)]/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 uppercase tracking-widest border-2 border-[var(--accent-terracotta)]"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              <span>{saving ? "সেভ হচ্ছে…" : "তথ্য আপডেট করুন"}</span>
            </button>
            
            {message && (
              <div className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 animate-in fade-in slide-in-from-left-4 duration-500 ${
                message.includes("সফল") ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {message.includes("সফল") ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span className="text-sm font-black tracking-tight">{message}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
