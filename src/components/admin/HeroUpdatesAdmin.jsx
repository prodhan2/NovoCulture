import { useEffect, useState } from "react";
import { getHeroUpdates, addHeroUpdate, setHeroUpdate, deleteHeroUpdate } from "../../services/firestore";
import { Plus, Trash2, Calendar, Tag, AlertCircle, Edit2, X, Check, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { uploadImage } from "../../services/imageUpload";
import Shimmer from "../common/Shimmer";

export default function HeroUpdatesAdmin() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [newUpdate, setNewUpdate] = useState({
    category: "sampritik",
    image: "",
    bn: { title: "", content: "" }
  });

  const categories = [
    { id: "all", label: "সব" },
    { id: "sampritik", label: t("tabs.sampritik", "সাম্প্রতিক") },
    { id: "notice", label: t("tabs.notice", "নোটিশ") },
    { id: "posts", label: t("tabs.posts", "পোস্ট") },
    { id: "projects", label: t("tabs.projects", "প্রকল্প") },
    { id: "donations", label: t("tabs.donations", "অনুদান তহবিল") },
  ];

  useEffect(() => {
    loadUpdates();
  }, []);

  async function loadUpdates() {
    setLoading(true);
    try {
      const data = await getHeroUpdates();
      setItems(data);
    } catch (err) {
      console.error("Failed to load hero updates:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e, isEditing = false) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const url = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });
      
      if (isEditing) {
        setEditData({ ...editData, image: url });
      } else {
        setNewUpdate({ ...newUpdate, image: url });
      }
      
      alert("ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.message || "ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  async function handleAdd() {
    if (!newUpdate.bn.title || !newUpdate.bn.content) {
      alert("অনুগ্রহ করে শিরোনাম এবং বিষয়বস্তু প্রদান করুন।");
      return;
    }

    setSaving(true);
    try {
      await addHeroUpdate(newUpdate);
      setNewUpdate({
        category: "sampritik",
        image: "",
        bn: { title: "", content: "" }
      });
      await loadUpdates();
    } catch (err) {
      console.error("Failed to add update:", err);
      alert("যোগ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(item) {
    setEditingId(item.id);
    setEditData({ ...item });
  }

  async function handleSaveEdit() {
    if (!editData.bn.title || !editData.bn.content) {
      alert("শিরোনাম এবং বিষয়বস্তু আবশ্যক।");
      return;
    }

    setSaving(true);
    try {
      await setHeroUpdate(editingId, editData);
      setItems(items.map(item => item.id === editingId ? editData : item));
      setEditingId(null);
      setEditData(null);
    } catch (err) {
      console.error("Failed to save update:", err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান?")) return;
    try {
      await deleteHeroUpdate(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete update:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  }

  return (
    <div className="space-y-8">
      {/* Add New Update */}
      <div className="rounded-[2.5rem] border-2 border-[var(--accent-terracotta)]/20 bg-white p-8 shadow-sm">
        <h2 className="mb-8 text-xl font-black text-black uppercase tracking-tight">নতুন কন্টেন্ট যোগ করুন</h2>
        
        <div className="grid gap-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-black">ক্যাটাগরি</label>
              <select
                value={newUpdate.category}
                onChange={(e) => setNewUpdate({ ...newUpdate, category: e.target.value })}
                className="w-full rounded-2xl border-2 border-[var(--accent-terracotta)]/20 bg-white px-6 py-4 text-sm font-bold outline-none focus:border-[var(--accent-terracotta)] text-black appearance-none"
              >
                <option value="sampritik">{t("tabs.sampritik", "সাম্প্রতিক")}</option>
                <option value="notice">{t("tabs.notice", "নোটিশ")}</option>
                <option value="posts">{t("tabs.posts", "পোস্ট")}</option>
                <option value="projects">{t("tabs.projects", "প্রকল্প")}</option>
                <option value="donations">{t("tabs.donations", "অনুদান তহবিল")}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-black">ছবি</label>
              <div className="flex items-center gap-6">
                <div className="h-24 w-40 rounded-2xl border-2 border-[var(--accent-terracotta)]/20 bg-white flex items-center justify-center overflow-hidden relative shrink-0">
                  {newUpdate.image ? (
                    <img src={newUpdate.image} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-black/40" />
                  )}
                  {uploading && !editingId && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-3">
                  <input
                    type="text"
                    value={newUpdate.image}
                    onChange={(e) => setNewUpdate({ ...newUpdate, image: e.target.value })}
                    placeholder="ছবির ইউআরএল"
                    className="w-full rounded-2xl border-2 border-[var(--accent-terracotta)]/20 bg-white px-6 py-3 text-xs font-bold outline-none focus:border-[var(--accent-terracotta)] text-black"
                  />
                  <label className={`flex items-center justify-center gap-3 w-full py-3 rounded-2xl bg-[var(--accent-terracotta)] text-white text-xs font-black uppercase tracking-widest cursor-pointer transition hover:opacity-90 active:scale-95 ${uploading ? 'opacity-50' : ''}`}>
                    <Upload className="h-4 w-4" />
                    <span>{uploading && !editingId ? `${uploadProgress}%` : "ছবি আপলোড"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">বাংলা কন্টেন্ট</h3>
            <input
              type="text"
              placeholder="শিরোনাম (বাংলা)"
              value={newUpdate.bn.title}
              onChange={(e) => setNewUpdate({ ...newUpdate, bn: { ...newUpdate.bn, title: e.target.value } })}
              className="w-full rounded-2xl border-2 border-[var(--accent-terracotta)]/20 px-6 py-4 text-sm font-bold outline-none focus:border-[var(--accent-terracotta)] text-black"
            />
            <textarea
              placeholder="বিষয়বস্তু (বাংলা)"
              value={newUpdate.bn.content}
              onChange={(e) => setNewUpdate({ ...newUpdate, bn: { ...newUpdate.bn, content: e.target.value } })}
              rows={4}
              className="w-full rounded-2xl border-2 border-[var(--accent-terracotta)]/20 px-6 py-4 text-sm font-bold outline-none focus:border-[var(--accent-terracotta)] text-black resize-none"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--accent-terracotta)] py-4 text-base font-black text-white shadow-xl shadow-[var(--accent-terracotta)]/20 transition hover:opacity-90 active:scale-95 disabled:opacity-30 sm:w-auto sm:px-12 uppercase tracking-widest"
          >
            <span>{saving ? "যোগ হচ্ছে..." : <><Plus className="h-5 w-5" /> কন্টেন্ট যোগ করুন</>}</span>
          </button>
        </div>
      </div>

      {/* Existing Updates List */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h2 className="text-xl font-black text-black uppercase tracking-tight">বিদ্যমান কন্টেন্ট ম্যানেজ করুন</h2>
          
          {/* Tab Filter Bar */}
          <div className="flex flex-wrap gap-2 rounded-2xl bg-[var(--accent-terracotta)] p-1.5 border-2 border-[var(--accent-terracotta)]">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`rounded-xl px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === cat.id
                    ? "bg-white text-[var(--accent-terracotta)] shadow-md scale-105"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col sm:flex-row items-start gap-6 p-8 rounded-[2.5rem] border-2 border-black bg-white">
                <div className="w-32 h-20 bg-black/10 animate-pulse rounded-xl shrink-0" />
                <div className="flex-1 w-full space-y-4">
                  <div className="h-4 w-24 bg-black/10 animate-pulse rounded" />
                  <div className="h-6 w-3/4 bg-black/10 animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-black p-20 text-center bg-white">
            <AlertCircle className="mx-auto h-16 w-16 text-black/40 mb-4" />
            <p className="text-xl font-black text-black">কোনো কন্টেন্ট পাওয়া যায়নি। উপরে নতুন কন্টেন্ট যোগ করুন!</p>
          </div>
        ) : ( 
          <div className="grid gap-6">
            {items
              .filter(item => activeFilter === "all" || item.category === activeFilter)
              .map((item, index) => (
              <div key={item.id} className="group relative rounded-[2.5rem] border-2 border-[var(--accent-terracotta)]/10 bg-white p-8 transition-all hover:border-[var(--accent-terracotta)]/30 hover:shadow-2xl overflow-hidden">
                {/* Serial Number */}
                <div className="absolute -top-3 -left-3 h-10 w-10 rounded-full bg-[var(--accent-terracotta)] text-white flex items-center justify-center text-sm font-black border-2 border-[var(--accent-terracotta)] shadow-lg">
                  {index + 1}
                </div>

                {editingId === item.id ? (
                  <div className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-black">ক্যাটাগরি</label>
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="w-full rounded-2xl border-2 border-black px-4 py-3 text-sm font-bold outline-none focus:border-[var(--accent-terracotta)] text-black appearance-none"
                        >
                          <option value="sampritik">{t("tabs.sampritik")}</option>
                          <option value="notice">{t("tabs.notice")}</option>
                          <option value="posts">{t("tabs.posts")}</option>
                          <option value="projects">{t("tabs.projects")}</option>
                          <option value="donations">{t("tabs.donations", "অনুদান তহবিল")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-black uppercase tracking-widest text-black">ছবি</label>
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-24 rounded-xl border-2 border-black bg-white flex items-center justify-center overflow-hidden relative shrink-0">
                            {editData.image ? (
                              <img src={editData.image} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-6 w-6 text-black/40" />
                            )}
                            {uploading && editingId === item.id && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editData.image}
                              onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                              placeholder="ইউআরএল"
                              className="flex-1 rounded-xl border-2 border-black px-4 py-2 text-xs font-bold outline-none focus:border-[var(--accent-terracotta)] text-black"
                            />
                            <label className="flex items-center justify-center h-10 w-10 rounded-xl bg-[var(--accent-terracotta)] text-white cursor-pointer transition hover:opacity-90 active:scale-95">
                              <Upload className="h-5 w-5" />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} disabled={uploading} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={editData.bn.title}
                        onChange={(e) => setEditData({ ...editData, bn: { ...editData.bn, title: e.target.value } })}
                        className="w-full rounded-2xl border-2 border-black px-6 py-4 text-sm font-bold outline-none focus:border-[var(--accent-terracotta)] text-black"
                        placeholder="শিরোনাম (বাংলা)"
                      />
                      <textarea
                        value={editData.bn.content}
                        onChange={(e) => setEditData({ ...editData, bn: { ...editData.bn, content: e.target.value } })}
                        rows={3}
                        className="w-full rounded-2xl border-2 border-black px-6 py-4 text-sm font-bold outline-none focus:border-[var(--accent-terracotta)] text-black resize-none"
                        placeholder="বিষয়বস্তু (বাংলা)"
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <button onClick={() => { setEditingId(null); setEditData(null); }} className="px-6 py-3 rounded-xl border-2 border-[var(--accent-terracotta)] font-black text-xs uppercase tracking-widest hover:bg-[var(--accent-terracotta)] hover:text-white active:scale-95 transition-all">
                        বাতিল
                      </button>
                      <button onClick={handleSaveEdit} disabled={saving || uploading} className="rounded-xl bg-[var(--accent-terracotta)] px-8 py-3 text-sm font-black text-white transition hover:opacity-90 active:scale-95 disabled:opacity-30 flex items-center gap-2 border-2 border-[var(--accent-terracotta)]">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span>সেভ করুন</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start gap-8">
                    {item.image && (
                      <div className="h-32 w-full sm:w-48 rounded-2xl overflow-hidden shrink-0 border-2 border-black relative">
                        <img src={item.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                        <div className="absolute top-2 left-2">
                          <span className="rounded-lg bg-black px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white border border-white/20">
                            {t(`tabs.${item.category}`)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full space-y-3">
                      <div className="flex items-center gap-3 text-[10px] font-black text-black uppercase tracking-widest">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.date).toLocaleDateString("bn-BD")}
                      </div>
                      <h3 className="text-xl font-black text-black leading-tight group-hover:text-[var(--accent-terracotta)] transition-colors">{item.bn?.title || item.en?.title}</h3>
                      <p className="text-sm font-bold text-black line-clamp-2 leading-relaxed">{item.bn?.content || item.en?.content}</p>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <button onClick={() => handleEdit(item)} className="p-4 rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white text-[var(--accent-terracotta)] transition hover:bg-[var(--accent-terracotta)] hover:text-white active:scale-95 shadow-md">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-4 rounded-2xl border-2 border-red-500 bg-white text-red-600 transition hover:bg-red-600 hover:text-white hover:border-red-600 active:scale-95 shadow-md">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
