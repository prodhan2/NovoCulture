import { useEffect, useState } from "react";
import {
  getProjects,
  addProject,
  setProject,
  deleteProject,
} from "../../services/firestore";
import { Trash2, Plus, Loader2, Upload, ImageIcon } from "lucide-react";
import { uploadImage } from "../../services/imageUpload";
import { ProjectCardShimmer } from "../common/Shimmer";

export default function ProjectsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getProjects()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate() {
    const now = new Date().toISOString();
    const template = {
      created_at: now,
      updated_at: now,
      date: now,
      en: { title: "New project", subtitle: "", description: "", image: "" },
      bn: { title: "নতুন প্রকল্প", subtitle: "", description: "", image: "" },
    };
    const id = await addProject(template);
    setItems((s) => [{ id, ...template }, ...s]);
  }

  async function handleSave(item) {
    const now = new Date().toISOString();
    const payload = {
      created_at: item.created_at || item.date || now,
      updated_at: now,
      date: item.date || item.created_at || now,
      en: {
        title: item.en?.title || "",
        subtitle: item.en?.subtitle || "",
        description: item.en?.description || "",
        image: item.en?.image || item.image || "",
      },
      bn: {
        title: item.bn?.title || "",
        subtitle: item.bn?.subtitle || "",
        description: item.bn?.description || "",
        image: item.bn?.image || "",
      },
    };

    await setProject(item.id, payload);
    setEditing(null);
  }

  async function handleDelete(id) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই প্রকল্পটি মুছে ফেলতে চান?")) return;
    await deleteProject(id);
    setItems((s) => s.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-black">প্রকল্পসমূহ ম্যানেজ করুন</h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white transition btn-swap hover:bg-black/80"
        >
          <span>নতুন প্রকল্প তৈরি করুন</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <ProjectCardShimmer key={i} />)}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <div key={p.id} className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
              {editing === p.id ? (
                <ProjectEditor
                  item={p}
                  onChange={(u) =>
                    setItems((s) => s.map((x) => (x.id === p.id ? u : x)))
                  }
                  onSave={() => handleSave(items.find((x) => x.id === p.id))}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="text-xl font-bold text-black mb-1">{p.bn?.title || p.en?.title || p.id}</div>
                    <div className="text-sm font-medium text-black">
                      {p.bn?.subtitle || p.en?.subtitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(p.id)}
                      className="px-4 py-2 rounded-xl bg-black text-white text-sm font-bold transition btn-swap hover:bg-black/80"
                    >
                      <span>সম্পাদনা (Edit)</span>
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-4 py-2 rounded-xl bg-red-50 text-red-600 text-sm font-bold transition hover:bg-red-100"
                    >
                      মুছে ফেলুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEditor({ item, onChange, onSave, onCancel }) {
  const [uploading, setUploading] = useState({ en: false, bn: false });
  const [previews, setPreviews] = useState({ en: null, bn: null });

  function update(path, val) {
    const next = JSON.parse(JSON.stringify(item));
    const parts = path.split(".");
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++)
      cur = cur[parts[i]] = cur[parts[i]] || {};
    cur[parts[parts.length - 1]] = val;
    onChange(next);
  }

  const handleFileUpload = async (e, lang) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [lang]: previewUrl }));

    setUploading(prev => ({ ...prev, [lang]: true }));
    try {
      const url = await uploadImage(file);
      update(`${lang}.image`, url);
      alert("ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploading(prev => ({ ...prev, [lang]: false }));
      setPreviews(prev => ({ ...prev, [lang]: null }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black">ইংরেজি (English)</h3>
          {/* Preview Box */}
          <div className="aspect-video w-full rounded-xl border-2 border-[var(--accent-terracotta)]/20 bg-[var(--bg-cream-soft)] overflow-hidden relative">
            {previews.en ? (
              <>
                <img src={previews.en} alt="Preview" className="h-full w-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
              </>
            ) : item.en?.image || item.image ? (
              <img src={item.en?.image || item.image} alt="Project" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-black/20">
                <ImageIcon className="h-12 w-12" />
              </div>
            )}
          </div>
          <input
            value={item.en?.title || ""}
            onChange={(e) => update("en.title", e.target.value)}
            placeholder="প্রকল্পের নাম (ইংরেজি)"
            className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
          />
          <input
            value={item.en?.subtitle || ""}
            onChange={(e) => update("en.subtitle", e.target.value)}
            placeholder="উপশিরোনাম (ইংরেজি)"
            className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
          />
          <textarea
            value={item.en?.description || ""}
            onChange={(e) => update("en.description", e.target.value)}
            className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
            placeholder="বিস্তারিত বর্ণনা (ইংরেজি)"
            rows={4}
          />
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/50 uppercase">প্রকল্পের ছবি (ইংরেজি)</label>
            <div className="flex gap-2">
              <input
                value={item.en?.image || item.image || ""}
                onChange={(e) => update("en.image", e.target.value)}
                className="flex-1 rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
                placeholder="ছবির লিঙ্ক"
              />
              <label className={`flex h-[46px] w-[46px] items-center justify-center rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] cursor-pointer hover:bg-white transition-colors ${uploading.en ? 'opacity-50' : ''}`}>
                {uploading.en ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Upload className="h-4 w-4 text-black" />}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "en")} disabled={uploading.en} />
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-black">বাংলা</h3>
          {/* Preview Box */}
          <div className="aspect-video w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] overflow-hidden relative">
            {previews.bn ? (
              <>
                <img src={previews.bn} alt="Preview" className="h-full w-full object-cover opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
              </>
            ) : item.bn?.image ? (
              <img src={item.bn?.image} alt="Project" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-black/20">
                <ImageIcon className="h-12 w-12" />
              </div>
            )}
          </div>
          <input
            value={item.bn?.title || ""}
            onChange={(e) => update("bn.title", e.target.value)}
            placeholder="প্রকল্পের নাম (বাংলা)"
            className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
          />
          <input
            value={item.bn?.subtitle || ""}
            onChange={(e) => update("bn.subtitle", e.target.value)}
            placeholder="উপশিরোনাম (বাংলা)"
            className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
          />
          <textarea
            value={item.bn?.description || ""}
            onChange={(e) => update("bn.description", e.target.value)}
            className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
            placeholder="বিস্তারিত বর্ণনা (বাংলা)"
            rows={4}
          />
          <div className="space-y-2">
            <label className="text-xs font-bold text-black/50 uppercase">প্রকল্পের ছবি (বাংলা)</label>
            <div className="flex gap-2">
              <input
                value={item.bn?.image || ""}
                onChange={(e) => update("bn.image", e.target.value)}
                className="flex-1 rounded-xl border-2 border-white px-4 py-2.5 text-sm focus:border-[var(--accent-terracotta)] outline-none text-black"
                placeholder="ছবির লিঙ্ক"
              />
              <label className={`flex h-[46px] w-[46px] items-center justify-center rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] cursor-pointer hover:bg-white transition-colors ${uploading.bn ? 'opacity-50' : ''}`}>
                {uploading.bn ? <Loader2 className="h-4 w-4 animate-spin text-black" /> : <Upload className="h-4 w-4 text-black" />}
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "bn")} disabled={uploading.bn} />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t-2 border-white">
        <button
          onClick={onSave}
          className="rounded-xl bg-black px-8 py-2.5 text-sm font-bold text-white transition btn-swap hover:bg-black/80"
        >
          <span>সেভ করুন</span>
        </button>
        <button
          onClick={onCancel}
          className="rounded-xl bg-white border-2 border-white px-8 py-2.5 text-sm font-bold text-black transition hover:bg-black/5"
        >
          বাতিল করুন
        </button>
      </div>
    </div>
  );
}
