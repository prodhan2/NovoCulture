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

  const adjustHeight = (e) => {
    const target = e.target || e;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(adjustHeight);
      }, 100);
    }
  }, [loading, newCategory, url]);

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8">
        <h1 className="text-2xl font-black text-black uppercase tracking-tight">
          মিডিয়া লাইব্রেরি
        </h1>
        <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
          ছবি আপলোড, ক্যাটাগরি এবং গ্যালারি ম্যানেজ করুন
        </p>
      </div>

      {loading ? (
        <div className="px-4 sm:px-8 lg:px-10 flex h-48 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
        </div>
      ) : (
        <div className="px-4 sm:px-8 lg:px-10 pb-20 w-full space-y-16">
          
          {/* Category Management - Horizontal Style */}
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                নতুন ক্যাটাগরি
              </label>
              <div className="md:col-span-3 space-y-4">
                <div className="flex gap-3">
                  <textarea
                    rows={1}
                    value={newCategory}
                    onInput={adjustHeight}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="ক্যাটাগরির নাম..."
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                  />
                  <button
                    onClick={handleAddCategory}
                    className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-8 py-3 text-sm font-black text-white transition-all hover:opacity-90 active:scale-95 border-2 border-[var(--accent-terracotta)] whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" />
                    <span>যোগ করুন</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map((cat) => (
                    <div key={cat.id} className="group flex items-center gap-2 rounded-full border-2 border-[var(--accent-terracotta)]/20 bg-white pl-4 pr-2 py-1.5 text-[10px] font-black text-black shadow-sm">
                      <span>{cat.name}</span>
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="rounded-full p-1 text-black/20 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Media Upload - Horizontal Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                মিডিয়া আপলোড
              </label>
              <div className="md:col-span-3 space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] px-1">ক্যাটাগরি</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-4 py-3 text-sm font-black outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black appearance-none"
                    >
                      <option value="">General</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] px-1">ফাইল আপলোড</label>
                    <label className={`flex items-center justify-center gap-3 w-full h-[52px] rounded-xl border-2 border-dashed border-[var(--accent-terracotta)] bg-white cursor-pointer transition-all hover:bg-[var(--accent-terracotta)]/5 overflow-hidden ${uploading ? 'pointer-events-none' : ''}`}>
                      {uploading ? (
                        <div className="flex items-center gap-3 px-4 w-full">
                          <div className="h-2 flex-1 bg-black/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--accent-terracotta)] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-black">{uploadProgress}%</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 text-[var(--accent-terracotta)]" />
                          <span className="text-xs font-black uppercase tracking-widest">ছবি নির্বাচন করুন</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] px-1">অথবা ইউআরএল (URL)</label>
                  <div className="flex gap-3">
                    <textarea
                      rows={1}
                      value={url}
                      onInput={adjustHeight}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                    />
                    <button
                      onClick={handleAdd}
                      className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-8 py-3 text-sm font-black text-white transition-all hover:opacity-90 active:scale-95 border-2 border-[var(--accent-terracotta)] whitespace-nowrap"
                    >
                      <span>যোগ করুন</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Selection Action Bar - Minimalist */}
          {selectedIds.length > 0 && (
            <div className="sticky top-20 z-30 flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white p-6 shadow-2xl animate-in slide-in-from-top-4">
              <div className="flex items-center gap-6">
                <span className="text-lg font-black text-[var(--accent-terracotta)]">{selectedIds.length} টি নির্বাচিত</span>
                <button 
                  onClick={() => setSelectedIds([])}
                  className="text-xs font-black text-[var(--accent-terracotta)]/40 hover:text-[var(--accent-terracotta)] uppercase tracking-[0.2em]"
                >
                  বাতিল করুন
                </button>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isEditMode ? (
                  <div className="flex items-center gap-3 flex-1 sm:flex-initial">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-4 py-3 text-sm font-black text-black outline-none"
                    >
                      <option value="">ক্যাটাগরি পরিবর্তন</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    <button
                      disabled={saving || !editCategory}
                      onClick={handleBulkUpdateCategory}
                      className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-6 py-3 text-sm font-black text-white transition-all hover:opacity-90 disabled:opacity-30 border-2 border-[var(--accent-terracotta)] shadow-lg"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      <span>সংরক্ষণ</span>
                    </button>
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="p-3 rounded-xl border-2 border-[var(--accent-terracotta)] text-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)]/5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setIsEditMode(true)}
                      className="flex items-center justify-center gap-3 rounded-xl bg-[var(--accent-terracotta)] px-6 py-3 text-xs font-black text-white transition-all hover:opacity-90 flex-1 sm:flex-initial border-2 border-[var(--accent-terracotta)] uppercase tracking-widest"
                    >
                      <Edit3 className="h-4 w-4" />
                      <span>ক্যাটাগরি</span>
                    </button>
                    <button
                      disabled={saving}
                      onClick={handleBulkDelete}
                      className="flex items-center justify-center gap-3 rounded-xl bg-red-600 px-6 py-3 text-xs font-black text-white transition-all hover:bg-red-700 disabled:opacity-30 flex-1 sm:flex-initial border-2 border-red-600 uppercase tracking-widest shadow-xl shadow-red-900/10"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span>মুছে ফেলুন</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Gallery Area */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <Filter className="h-5 w-5 text-[var(--accent-terracotta)]" />
                <h2 className="text-xl font-black text-black uppercase tracking-tight">গ্যালারি</h2>
                <button 
                  onClick={toggleSelectAll}
                  className="ml-4 flex items-center gap-2 text-[10px] font-black text-[var(--accent-terracotta)]/40 uppercase tracking-widest hover:text-[var(--accent-terracotta)] transition-colors"
                >
                  {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  <span>সবগুলো নির্বাচন</span>
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto scrollbar-hide">
                {["All", ...categories.map(c => c.name)].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`whitespace-nowrap rounded-xl border-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCategory === cat 
                        ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)] shadow-lg" 
                        : "bg-white text-black border-[var(--accent-terracotta)]/10 hover:border-[var(--accent-terracotta)]"
                    }`}
                  >
                    {cat === "All" ? "সবগুলো" : cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {/* Previews during upload */}
              {previews.map((url, index) => (
                <div key={`preview-${index}`} className="group relative overflow-hidden rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white animate-pulse">
                  <div className="relative h-40 w-full overflow-hidden">
                    <img src={url} alt="preview" className="h-full w-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-terracotta)]" />
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-terracotta)] transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
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
                      ? "border-[var(--accent-terracotta)] ring-8 ring-[var(--accent-terracotta)]/5 shadow-2xl scale-[1.05] z-10" 
                      : "border-black/5 bg-white hover:border-[var(--accent-terracotta)]/50 hover:shadow-xl"
                  }`}
                >
                  <img
                    src={m.url}
                    alt="media"
                    className={`h-40 w-full object-cover transition-transform duration-700 group-hover:scale-110 ${selectedIds.includes(m.id) ? "opacity-90" : ""}`}
                  />
                  
                  {/* Selection Indicator */}
                  <div className={`absolute top-3 right-3 h-7 w-7 rounded-xl flex items-center justify-center transition-all ${
                    selectedIds.includes(m.id) 
                      ? "bg-[var(--accent-terracotta)] text-white scale-110 shadow-lg" 
                      : "bg-white/80 backdrop-blur-sm border-2 border-[var(--accent-terracotta)] text-[var(--accent-terracotta)] opacity-0 group-hover:opacity-100"
                  }`}>
                    {selectedIds.includes(m.id) ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                  </div>

                  <div className="p-3 bg-white">
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className="rounded-lg bg-[var(--accent-terracotta)] text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
                        {m.category || "General"}
                      </span>
                    </div>
                    <div className="text-[8px] font-black text-black/20 uppercase tracking-[0.2em]">
                      {new Date(m.date).toLocaleDateString("bn-BD")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
