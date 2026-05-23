import { useEffect, useState } from "react";
import { getSettings, setSettings } from "../../services/firestore";
import { 
  AlertCircle, CheckCircle2,
  Key, Loader2, Save
} from "lucide-react";

export default function SettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const adjustHeight = (e) => {
    const target = e.target || e;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const settings = await getSettings();
        if (!mounted) return;
        
        if (settings?.beeImgApiKey) {
          setApiKey(settings.beeImgApiKey);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(adjustHeight);
      }, 100);
    }
  }, [loading, apiKey]);

  async function handleSave() {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await setSettings({ 
        beeImgApiKey: apiKey
      });
      
      setMessage({ type: "success", text: "সেটিংস সফলভাবে সেভ হয়েছে!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "সেটিংস সেভ করতে ব্যর্থ হয়েছে।" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8">
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">
          সিস্টেম সেটিংস
        </h1>
        <p className="text-[10px] font-bold text-black uppercase tracking-widest mt-1">
          ইমেজ আপলোড এবং API কনফিগারেশন ম্যানেজ করুন
        </p>
      </div>

      {loading ? (
        <div className="px-4 sm:px-8 lg:px-10 flex h-48 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
        </div>
      ) : (
        <div className="px-4 sm:px-8 lg:px-10 pb-20 w-full">
          <div className="space-y-8">
            {/* Horizontal Listview Style Field with Auto-grow */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                BeeImg API কী
              </label>
              <div className="md:col-span-3">
                <textarea
                  rows={1}
                  value={apiKey}
                  onInput={adjustHeight}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ea31849f8e4643033e131ff9fe26783a"
                  className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black shadow-sm min-h-[52px] font-mono"
                />
                <p className="mt-2 text-[10px] font-black text-black uppercase tracking-[0.2em] italic">
                  সরাসরি ছবি আপলোডের জন্য প্রয়োজন। এই কী-টি গোপন রাখুন।
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 md:ml-[25%]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-xl bg-[var(--accent-terracotta)] px-10 py-4 text-base font-black text-white shadow-xl shadow-[var(--accent-terracotta)]/20 transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 uppercase tracking-widest border-2 border-[var(--accent-terracotta)]"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
              <span>{saving ? "সেভ হচ্ছে…" : "API কী সেট করুন"}</span>
            </button>
            
            {message.text && (
              <div className={`flex items-center gap-2 px-6 py-3 rounded-xl border-2 animate-in fade-in slide-in-from-left-4 duration-500 ${
                message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>
                {message.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span className="text-sm font-black tracking-tight">{message.text}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
