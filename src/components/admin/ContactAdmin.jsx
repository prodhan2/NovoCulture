import { useEffect, useState } from "react";
import { getSettings, setSettings } from "../../services/firestore";

export default function ContactAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState({
    en: { address: "", phone: "" },
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
          en: c.en || { address: "", phone: "" },
          bn: c.bn || { address: "", phone: "" },
          email: c.email ?? c.en?.email ?? c.bn?.email ?? "",
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
      await setSettings({ contact });
      setMessage("সফলভাবে সেভ হয়েছে।");
    } catch (err) {
      console.error(err);
      setMessage("সেভ করতে সমস্যা হয়েছে। কনসোল চেক করুন।");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-bold text-black">
        যোগাযোগের তথ্য পরিবর্তন (ইংরেজি ও বাংলা)
      </h2>

      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">ইংরেজি (English)</h3>
              <div>
                <label className="mb-1 block text-sm font-bold text-black">ঠিকানা (Address)</label>
                <textarea
                  rows={3}
                  value={contact.en.address}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      en: { ...contact.en, address: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-white px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-black">
                  ফোন (Phone)
                </label>
                <input
                  value={contact.en.phone}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      en: { ...contact.en, phone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-white px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">বাংলা</h3>
              <div>
                <label className="mb-1 block text-sm font-bold text-black">
                  ঠিকানা
                </label>
                <textarea
                  rows={3}
                  dir="auto"
                  value={contact.bn.address}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      bn: { ...contact.bn, address: e.target.value },
                    })
                  }
                  placeholder="ঠিকানা"
                  className="w-full rounded-xl border-2 border-white px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-bold text-black">
                  ফোন
                </label>
                <input
                  value={contact.bn.phone}
                  onChange={(e) =>
                    setContact({
                      ...contact,
                      bn: { ...contact.bn, phone: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border-2 border-white px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-2 border-white">
            <label className="mb-2 block text-sm font-bold text-black">
              ইমেইল (উভয় ভাষার জন্য প্রযোজ্য)
            </label>
            <input
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              className="w-full rounded-xl border-2 border-white px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-black px-8 py-3 text-sm font-bold text-white transition btn-swap hover:bg-black/80 disabled:opacity-50"
            >
              <span>{saving ? "সেভ হচ্ছে…" : "তথ্য আপডেট করুন"}</span>
            </button>
            {message && (
              <span className="text-sm font-bold text-green-600">
                {message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
