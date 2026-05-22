import { useEffect, useState } from "react";
import { 
  getMedia, addMedia, setMedia, deleteMedia, 
  getMediaCategories, addMediaCategory, deleteMediaCategory 
} from "../../services/firestore";
import { Trash2, Plus, Loader2, Upload, ImageIcon, Images, Tag, Filter, CheckSquare, Square, Edit3, X, Save } from "lucide-react";
import { uploadImage, uploadImages } from "../../services/imageUpload";
import { MediaShimmer } from "../common/Shimmer";

export default function MediaAdmin() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previews, setPreviews] = useState([]);
  
  // Selection and Edit states
  const [selectedIds, setSelectedIds] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategory, setEditCategory] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [mediaData, categoryData] = await Promise.all([
        getMedia(),
        getMediaCategories()
      ]);
      setItems(mediaData);
      setCategories(categoryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(item => item.id));
    }
  };

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`${selectedIds.length} টি ছবি মুছে ফেলতে চান?`)) return;
    
    setSaving(true);
    try {
      const promises = selectedIds.map(id => deleteMedia(id));
      await Promise.all(promises);
      setItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      alert("সফলভাবে মুছে ফেলা হয়েছে!");
    } catch (err) {
      alert("মুছে ফেলতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function handleBulkUpdateCategory() {
    if (selectedIds.length === 0 || !editCategory) return;
    setSaving(true);
    try {
      const promises = selectedIds.map(id => {
        const item = items.find(i => i.id === id);
        return setMedia(id, { ...item, category: editCategory });
      });
      await Promise.all(promises);
      await load();
      setSelectedIds([]);
      setIsEditMode(false);
      setEditCategory("");
      alert("ক্যাটাগরি আপডেট করা হয়েছে!");
    } catch (err) {
      alert("আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Create local previews
    const localPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(localPreviews);

    setUploading(true);
    setUploadProgress(0);
    try {
      const metadata = { 
        category: uploadCategory || "General",
        date: new Date().toISOString() 
      };

      if (files.length === 1) {
        const uploadedUrl = await uploadImage(files[0], (progress) => {
          setUploadProgress(progress);
        });
        await addMedia({ url: uploadedUrl, ...metadata });
      } else {
        const uploadedUrls = await uploadImages(files, (progress) => {
          setUploadProgress(progress);
        });
        
        // Add all URLs to Firestore
        const promises = uploadedUrls.map(url => addMedia({ url, ...metadata }));
        await Promise.all(promises);
      }
      
      await load();
      alert("ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.message || "ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      setPreviews([]);
    }
  };

  async function handleAdd() {
    if (!url) return alert("ছবির ইউআরএল দিন");
    const payload = { 
      url, 
      category: uploadCategory || "General",
      date: new Date().toISOString() 
    };
    const id = await addMedia(payload);
    setItems((s) => [{ id, ...payload }, ...s]);
    setUrl("");
  }

  async function handleDelete(id) {
    if (!confirm("আপনি কি এটি মুছে ফেলতে চান?")) return;
    await deleteMedia(id);
    setItems((s) => s.filter((m) => m.id !== id));
  }

  async function handleAddCategory() {
    if (!newCategory.trim()) return;
    try {
      const cat = await addMediaCategory(newCategory.trim());
      setCategories(prev => [...prev, cat]);
      setNewCategory("");
    } catch (err) {
      alert("ক্যাটাগরি যোগ করতে সমস্যা হয়েছে");
    }
  }

  async function handleDeleteCategory(id, name) {
    if (!confirm(`ক্যাটাগরি "${name}" মুছে ফেলবেন? ছবিগুলো মোছা হবে না।`)) return;
    try {
      await deleteMediaCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert("ক্যাটাগরি মুছে ফেলতে সমস্যা হয়েছে");
    }
  }

  const filteredItems = selectedCategory === "All" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Management Section */}
      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <Tag className="h-5 w-5 text-black" />
          <h2 className="text-lg font-bold text-black">ক্যাটাগরি ম্যানেজমেন্ট</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="নতুন ক্যাটাগরির নাম..."
              className="flex-1 rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
            />
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white transition hover:bg-black/80"
            >
              <Plus className="h-4 w-4" />
              <span>যোগ করুন</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <div key={cat.id} className="group flex items-center gap-2 rounded-full border-2 border-white bg-[var(--bg-cream-soft)] pl-4 pr-2 py-1.5 text-xs font-bold text-black shadow-sm">
                <span>{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                  className="rounded-full p-1 text-black/20 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-black">নতুন মিডিয়া যোগ করুন</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Category Selector for Upload */}
          <div className="sm:col-span-2 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-black/60">ক্যাটাগরি নির্বাচন করুন</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
            >
              <option value="">ক্যাটাগরি নির্বাচন করুন (ঐচ্ছিক - ডিফল্ট: General)</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* URL Input */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-black/60">ছবির ইউআরএল (URL)</label>
            <div className="flex gap-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black shadow-sm"
              />
              <button
                onClick={handleAdd}
                className="rounded-xl bg-black px-6 py-2.5 text-sm font-bold text-white transition btn-swap hover:bg-black/80"
              >
                <span>যোগ করুন</span>
              </button>
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-black/60">ফাইল আপলোড</label>
            <div className="relative group">
              <label className={`flex items-center justify-center gap-3 w-full h-[46px] rounded-xl border-2 border-dashed border-black/20 bg-[var(--bg-cream-soft)] cursor-pointer transition-all hover:border-[var(--accent-terracotta)] hover:bg-white overflow-hidden ${uploading ? 'pointer-events-none' : ''}`}>
                {uploading ? (
                  <div className="flex items-center gap-3">
                    <div className="h-4 w-48 bg-black/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--accent-terracotta)] transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-black">{uploadProgress}%</span>
                  </div>
                ) : (
                  <>
                    <Upload className="h-5 w-5 text-black" />
                    <span className="text-sm font-bold text-black">ছবি নির্বাচন করুন</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white p-4 shadow-xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-black text-black">{selectedIds.length} টি নির্বাচিত</span>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-xs font-bold text-black/40 hover:text-black"
            >
              বাতিল করুন
            </button>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isEditMode ? (
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-4 py-2 text-sm font-bold text-black outline-none"
                >
                  <option value="">ক্যাটাগরি নির্বাচন করুন</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <button
                  disabled={saving}
                  onClick={handleBulkUpdateCategory}
                  className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-4 py-2 text-sm font-bold text-white transition hover:bg-[var(--accent-terracotta-dark)] disabled:opacity-50"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  সংরক্ষণ
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="p-2 rounded-xl border-2 border-black/10 text-black hover:bg-black/5"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-black/80 flex-1 sm:flex-initial"
                >
                  <Edit3 className="h-4 w-4" />
                  ক্যাটাগরি পরিবর্তন
                </button>
                <button
                  disabled={saving}
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 flex-1 sm:flex-initial"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  মুছে ফেলুন
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filter Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-black" />
          <h2 className="text-lg font-bold text-black">মিডিয়া গ্যালারি</h2>
          <button 
            onClick={toggleSelectAll}
            className="ml-4 flex items-center gap-2 text-xs font-bold text-black/60 hover:text-black transition-colors"
          >
            {selectedIds.length === filteredItems.length ? <CheckSquare className="h-4 w-4 text-[var(--accent-terracotta)]" /> : <Square className="h-4 w-4" />}
            সবগুলো নির্বাচন করুন
          </button>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["All", ...categories.map(c => c.name)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full border-2 border-white px-4 py-1.5 text-xs font-bold transition-all shadow-sm ${
                selectedCategory === cat 
                  ? "bg-black text-white" 
                  : "bg-white text-black hover:bg-black/5"
              }`}
            >
              {cat === "All" ? "সবগুলো" : cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => <MediaShimmer key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-6">
          {/* Previews during upload */}
          {previews.map((url, index) => (
            <div key={`preview-${index}`} className="group relative overflow-hidden rounded-2xl border-2 border-white bg-white transition hover:shadow-md">
              <div className="relative h-40 w-full overflow-hidden">
                <img
                  src={url}
                  alt="preview"
                  className="h-full w-full object-cover opacity-50"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
              </div>
              <div className="p-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-black/40">
                    আপলোড হচ্ছে...
                  </span>
                </div>
                <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}

          {filteredItems.map((m) => (
            <div 
              key={m.id} 
              onClick={() => toggleSelect(m.id)}
              className={`group relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                selectedIds.includes(m.id) 
                  ? "border-[var(--accent-terracotta)] ring-4 ring-[var(--accent-terracotta)]/10 shadow-xl" 
                  : "border-white bg-white hover:shadow-md"
              }`}
            >
              <img
                src={m.url}
                alt="media"
                className={`h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110 ${selectedIds.includes(m.id) ? "opacity-90" : ""}`}
              />
              
              {/* Selection Indicator */}
              <div className={`absolute top-2 right-2 h-6 w-6 rounded-lg flex items-center justify-center transition-all ${
                selectedIds.includes(m.id) 
                  ? "bg-[var(--accent-terracotta)] text-white scale-110 shadow-lg" 
                  : "bg-white/80 text-black/20 opacity-0 group-hover:opacity-100"
              }`}>
                {selectedIds.includes(m.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
              </div>

              <div className="p-3 bg-white">
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-black/40">
                    {m.category || "General"}
                  </span>
                </div>
                <div className="text-[10px] font-bold text-black/50">
                  {new Date(m.date).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
