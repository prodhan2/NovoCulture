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
      setMessage("Saved successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Save failed. See console.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">
        Edit contact (English & Bangla)
      </h2>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">English</h3>
              <label className="mb-1 block text-sm font-medium">Address</label>
              <textarea
                rows={3}
                value={contact.en.address}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    en: { ...contact.en, address: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
              />

              <label className="mb-1 mt-3 block text-sm font-medium">
                Phone
              </label>
              <input
                value={contact.en.phone}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    en: { ...contact.en, phone: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
              />
            </div>

            <div>
              <h3 className="mb-2 font-medium">Bangla</h3>
              <label className="mb-1 block text-sm font-medium">
                Address (Bangla)
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
                className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
              />

              <label className="mb-1 mt-3 block text-sm font-medium">
                Phone
              </label>
              <input
                value={contact.bn.phone}
                onChange={(e) =>
                  setContact({
                    ...contact,
                    bn: { ...contact.bn, phone: e.target.value },
                  })
                }
                className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Email (shared)
            </label>
            <input
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
              className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex rounded-lg bg-[var(--accent-terracotta)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {message && (
              <span className="text-sm text-[var(--text-brown)]/80">
                {message}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
