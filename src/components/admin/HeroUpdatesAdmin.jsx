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
      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-bold text-black">নতুন কন্টেন্ট যোগ করুন</h2>
        
        <div className="grid gap-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="mb-2 block text-sm font-bold text-black">ক্যাটাগরি</label>
              <select
                value={newUpdate.category}
                onChange={(e) => setNewUpdate({ ...newUpdate, category: e.target.value })}
                className="w-full rounded-xl border-2 border-white bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
              >
                <option value="sampritik">{t("tabs.sampritik", "সাম্প্রতিক")}</option>
                <option value="notice">{t("tabs.notice", "নোটিশ")}</option>
                <option value="posts">{t("tabs.posts", "পোস্ট")}</option>
                <option value="projects">{t("tabs.projects", "প্রকল্প")}</option>
                <option value="donations">{t("tabs.donations", "অনুদান তহবিল")}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-bold text-black">ছবি</label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-32 rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] flex items-center justify-center overflow-hidden relative shrink-0">
                  {newUpdate.image ? (
                    <img src={newUpdate.image} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-black/20" />
                  )}
                  {uploading && !editingId && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={newUpdate.image}
                    onChange={(e) => setNewUpdate({ ...newUpdate, image: e.target.value })}
                    placeholder="ছবির ইউআরএল"
                    className="w-full rounded-xl border-2 border-white bg-white px-4 py-2 text-xs outline-none focus:border-[var(--accent-terracotta)] text-black"
                  />
                  <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-black text-white text-xs font-bold cursor-pointer transition hover:bg-black/80 ${uploading ? 'opacity-50' : ''}`}>
                    <Upload className="h-3 w-3" />
                    <span>{uploading && !editingId ? `${uploadProgress}%` : "ছবি আপলোড"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} disabled={uploading} />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">বাংলা কন্টেন্ট</h3>
            <input
              type="text"
              placeholder="শিরোনাম (বাংলা)"
              value={newUpdate.bn.title}
              onChange={(e) => setNewUpdate({ ...newUpdate, bn: { ...newUpdate.bn, title: e.target.value } })}
              className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
            />
            <textarea
              placeholder="বিষয়বস্তু (বাংলা)"
              value={newUpdate.bn.content}
              onChange={(e) => setNewUpdate({ ...newUpdate, bn: { ...newUpdate.bn, content: e.target.value } })}
              rows={3}
              className="w-full rounded-xl border-2 border-white px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
            />
          </div>

          <button
            onClick={handleAdd}
            disabled={saving || uploading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-bold text-white shadow-sm transition btn-swap hover:bg-black/80 disabled:opacity-50 sm:w-auto sm:px-8"
          >
            <span>{saving ? "যোগ হচ্ছে..." : <><Plus className="h-4 w-4" /> কন্টেন্ট যোগ করুন</>}</span>
          </button>
        </div>
      </div>

      {/* Existing Updates List */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-black">বিদ্যমান কন্টেন্ট ম্যানেজ করুন</h2>
          
          {/* Tab Filter Bar */}
          <div className="flex flex-wrap gap-2 rounded-xl bg-black/5 p-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${
                  activeFilter === cat.id
                    ? "bg-black text-white shadow-sm"
                    : "text-black/60 hover:bg-black/5 hover:text-black"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-2xl border-2 border-white bg-white">
                <Shimmer width="128px" height="80px" borderRadius="0.75rem" className="mx-auto sm:mx-0" />
                <div className="flex-1 w-full space-y-3">
                  <div className="flex gap-2">
                    <Shimmer width="60px" height="20px" borderRadius="1rem" />
                    <Shimmer width="80px" height="20px" borderRadius="1rem" />
                  </div>
                  <Shimmer width="70%" height="1.5rem" />
                  <Shimmer width="100%" height="2.5rem" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-white p-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-black" />
            <p className="mt-2 text-sm font-bold text-black">কোনো কন্টেন্ট পাওয়া যায়নি। উপরে নতুন কন্টেন্ট যোগ করুন!</p>
          </div>
        ) : ( 
          <div className="grid gap-4">
            {items
              .filter(item => activeFilter === "all" || item.category === activeFilter)
              .map((item) => (
              <div key={item.id} className="group relative rounded-2xl border-2 border-white bg-white p-5 transition hover:shadow-md">
                {editingId === item.id ? (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-2 block text-xs font-bold text-black">ক্যাটাগরি</label>
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="w-full rounded-lg border-2 border-white px-3 py-1.5 text-xs outline-none focus:border-[var(--accent-terracotta)] text-black"
                        >
                          <option value="sampritik">{t("tabs.sampritik")}</option>
                          <option value="notice">{t("tabs.notice")}</option>
                          <option value="posts">{t("tabs.posts")}</option>
                          <option value="projects">{t("tabs.projects")}</option>
                          <option value="donations">{t("tabs.donations", "অনুদান তহবিল")}</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold text-black">ছবি</label>
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-20 rounded-lg border-2 border-white bg-[var(--bg-cream-soft)] flex items-center justify-center overflow-hidden relative shrink-0">
                            {editData.image ? (
                              <img src={editData.image} alt="Preview" className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-black/20" />
                            )}
                            {uploading && editingId === item.id && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={editData.image}
                              onChange={(e) => setEditData({ ...editData, image: e.target.value })}
                              placeholder="ইউআরএল"
                              className="flex-1 rounded-lg border-2 border-white px-3 py-1.5 text-xs outline-none focus:border-[var(--accent-terracotta)] text-black"
                            />
                            <label className="flex items-center justify-center h-8 w-8 rounded-lg bg-black text-white cursor-pointer transition hover:bg-black/80">
                              <Upload className="h-3.5 w-3.5" />
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, true)} disabled={uploading} />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editData.bn.title}
                        onChange={(e) => setEditData({ ...editData, bn: { ...editData.bn, title: e.target.value } })}
                        className="w-full rounded-lg border-2 border-white px-4 py-2 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
                        placeholder="শিরোনাম (বাংলা)"
                      />
                      <textarea
                        value={editData.bn.content}
                        onChange={(e) => setEditData({ ...editData, bn: { ...editData.bn, content: e.target.value } })}
                        rows={3}
                        className="w-full rounded-lg border-2 border-white px-4 py-2 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
                        placeholder="বিষয়বস্তু (বাংলা)"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditingId(null); setEditData(null); }} className="p-2 text-black hover:bg-black/5 rounded-lg">
                        <X className="h-5 w-5" />
                      </button>
                      <button onClick={handleSaveEdit} disabled={saving || uploading} className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white transition btn-swap hover:bg-black/80 disabled:opacity-50 flex items-center gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span>সেভ করুন</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {item.image && (
                      <div className="h-20 w-32 rounded-xl overflow-hidden shrink-0 border-2 border-white shadow-sm mx-auto sm:mx-0">
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="rounded-full bg-black px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          {t(`tabs.${item.category}`)}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs font-medium text-black">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.date).toLocaleDateString("bn-BD")}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-black mb-1 leading-tight">{item.bn?.title || item.en?.title}</h3>
                      <p className="text-sm text-black/70 line-clamp-2 leading-relaxed">{item.bn?.content || item.en?.content}</p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button onClick={() => handleEdit(item)} className="p-2 text-black hover:bg-black/5 rounded-lg transition-colors">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
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
