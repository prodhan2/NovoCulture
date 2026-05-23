import { useState, useRef, useMemo, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { 
  Plus, Save, Eye, Layout, Image as ImageIcon, 
  Send, CheckCircle, AlertCircle, Loader2, Upload,
  Calendar, Trash2, Edit2, X, Check
} from "lucide-react";
import { getHeroUpdates, addHeroUpdate, setHeroUpdate, deleteHeroUpdate } from "../../services/firestore";
import { uploadImage } from "../../services/imageUpload";
import { useTranslation } from "react-i18next";

export default function ContentEditorAdmin() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [items, setItems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  
  const [content, setContent] = useState({
    title: "",
    category: "sampritik",
    image: "",
    body: ""
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

  async function loadUpdates(showLoading = true) {
    if (showLoading) setListLoading(true);
    try {
      const data = await getHeroUpdates();
      setItems(data);
    } catch (err) {
      console.error("Failed to load hero updates:", err);
    } finally {
      if (showLoading) setListLoading(false);
    }
  }

  const quillModules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ color: [] }, { background: [] }],
      ["link", "image"],
      ["clean"],
    ],
  }), []);

  const handleFileUpload = async (e, target = "new") => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImage(file);
      if (target === "new") {
        setContent(prev => ({ ...prev, image: url }));
      } else {
        setEditData(prev => ({ ...prev, image: url }));
      }
      alert("ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!content.title || !content.body) {
      alert("শিরোনাম এবং বিষয়বস্তু আবশ্যক।");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        category: content.category,
        image: content.image,
        bn: {
          title: content.title,
          content: content.body
        },
        date: new Date().toISOString()
      };
      
      await addHeroUpdate(payload);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Reset form
      setContent({
        title: "",
        category: "sampritik",
        image: "",
        body: ""
      });
      await loadUpdates();
    } catch (err) {
      console.error(err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setEditData({ ...item });
  };

  const handleSaveEdit = async () => {
    if (!editData?.bn?.title || !editData?.bn?.content) {
      alert("শিরোনাম এবং বিষয়বস্তু আবশ্যক।");
      return;
    }

    setLoading(true);
    try {
      await setHeroUpdate(editingId, editData);
      setItems(items.map(item => item.id === editingId ? editData : item));
      setEditingId(null);
      setEditData(null);
      alert("আপডেট সফল হয়েছে!");
    } catch (err) {
      console.error("Failed to save update:", err);
      alert("সেভ করতে সমস্যা হয়েছে।");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এটি মুছে ফেলতে চান?")) return;
    try {
      await deleteHeroUpdate(id);
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      console.error("Failed to delete update:", err);
      alert("মুছে ফেলতে সমস্যা হয়েছে।");
    }
  };

  const adjustHeight = (e) => {
    const target = e.target || e;
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  };

  useEffect(() => {
    if (!listLoading) {
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(adjustHeight);
      }, 100);
    }
  }, [listLoading, content, editingId]);

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            কন্টেন্ট এডিটর
          </h1>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            সাম্প্রতিক আপডেট, নোটিশ এবং পোস্ট ম্যানেজ করুন
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-[var(--accent-terracotta)] text-[var(--accent-terracotta)]">
            <Layout className="h-4 w-4 text-[var(--accent-terracotta)]" />
            <span className="text-xs font-black uppercase tracking-widest">মোট কন্টেন্ট: {items.length}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 px-4 sm:px-8 lg:px-10">
        {/* Left Panel: Editor Tools */}
        <div className="flex-1 space-y-12">
          <div className="space-y-10">
            {/* Title Input - Horizontal Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                শিরোনাম
              </label>
              <div className="md:col-span-3">
                <textarea
                  rows={1}
                  value={content.title}
                  onInput={adjustHeight}
                  onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="পোস্টের শিরোনাম লিখুন..."
                  className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-lg font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                />
              </div>
            </div>

            {/* Category Selector - Horizontal Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                ক্যাটাগরি
              </label>
              <div className="md:col-span-3">
                <select
                  value={content.category}
                  onChange={(e) => setContent(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black appearance-none"
                >
                  {categories.filter(c => c.id !== "all").map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Upload - Horizontal Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                ফিচার ইমেজ
              </label>
              <div className="md:col-span-3 space-y-4">
                <div className="flex gap-3">
                  <textarea
                    rows={1}
                    value={content.image}
                    onInput={adjustHeight}
                    onChange={(e) => setContent(prev => ({ ...prev, image: e.target.value }))}
                    placeholder="ইউআরএল বা আপলোড করুন"
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                  />
                  <label className={`cursor-pointer flex items-center justify-center h-[52px] w-[52px] rounded-xl border-2 border-[var(--accent-terracotta)] bg-[var(--accent-terracotta)] text-white hover:opacity-90 transition shadow-lg shrink-0 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "new")} />
                  </label>
                </div>
              </div>
            </div>

            {/* Quill Editor - Horizontal Style */}
            <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
              <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                বিস্তারিত
              </label>
              <div className="md:col-span-3">
                <div className="quill-container border-2 border-[var(--accent-terracotta)] rounded-2xl overflow-hidden shadow-sm bg-white">
                  <ReactQuill
                    theme="snow"
                    value={content.body}
                    onChange={(val) => setContent(prev => ({ ...prev, body: val }))}
                    modules={quillModules}
                    placeholder="এখানে আপনার কন্টেন্ট লিখুন..."
                    className="min-h-[400px]"
                  />
                </div>
                
                <div className="flex justify-end pt-8">
                  <button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className={`flex items-center gap-3 px-10 py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-2 ${
                      success 
                        ? "bg-green-500 text-white border-green-500" 
                        : "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)] hover:opacity-90"
                    }`}
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : success ? <CheckCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    <span>{loading ? "সেভ হচ্ছে..." : success ? "সফল হয়েছে!" : "পাবলিশ করুন"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel: Preview - Compact & Sticky */}
        <div className="w-full lg:w-[350px] shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white rounded-[2rem] border-2 border-[var(--accent-terracotta)] p-6 shadow-2xl flex flex-col max-h-[calc(100vh-150px)]">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-5 w-5 text-[var(--accent-terracotta)]" />
                <h2 className="text-lg font-black uppercase tracking-tight">লাইভ প্রিভিউ</h2>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <div className="bg-[var(--bg-cream)] rounded-2xl border-2 border-black/5 overflow-hidden">
                  {/* Preview Image */}
                  <div className="h-40 bg-black/5 flex items-center justify-center border-b-2 border-black/5 relative">
                    {content.image ? (
                      <img src={content.image} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-center p-6">
                        <ImageIcon className="h-8 w-8 mx-auto text-black/10 mb-2" />
                        <p className="text-[8px] font-black uppercase tracking-widest text-black/20">ছবি নেই</p>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-[var(--accent-terracotta)] text-white text-[8px] font-black uppercase tracking-widest rounded-lg">
                        {categories.find(c => c.id === content.category)?.label}
                      </span>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="p-5 space-y-3">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]">
                        {new Date().toLocaleDateString('bn-BD')}
                      </p>
                      <h3 className="text-lg font-black text-black leading-tight">
                        {content.title || "পোস্টের শিরোনাম"}
                      </h3>
                    </div>

                    <div 
                      className="text-xs font-bold text-black/60 leading-relaxed quill-preview line-clamp-3"
                      dangerouslySetInnerHTML={{ __html: content.body || "এখানে বিষয়বস্তু প্রিভিউ হবে..." }}
                    />
                  </div>
                </div>
                
                <div className="mt-6 p-4 rounded-xl bg-black/5 flex items-start gap-3">
                  <AlertCircle className="h-4 w-4 text-black/40 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-bold text-black/60 leading-relaxed">
                    পাবলিশ করার আগে অনুগ্রহ করে প্রিভিউ চেক করে নিন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Panel: List Management */}
      <div className="mt-24 pt-16 border-t-2 border-black/5 px-4 sm:px-8 lg:px-10 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
          <div className="flex items-center gap-4">
            <Layout className="h-6 w-6 text-[var(--accent-terracotta)]" />
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">বিদ্যমান কন্টেন্ট</h2>
          </div>
          
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`rounded-xl px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  activeFilter === cat.id
                    ? "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)] shadow-lg"
                    : "bg-white text-black border-black hover:border-black"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        
        {listLoading ? (
          <div className="grid gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-32 rounded-3xl bg-white border-2 border-black animate-pulse" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-[3rem] border-4 border-dashed border-black p-20 text-center bg-white/50">
            <AlertCircle className="mx-auto h-12 w-12 text-black mb-4" />
            <p className="text-lg font-black text-black uppercase tracking-widest">কোনো কন্টেন্ট পাওয়া যায়নি</p>
          </div>
        ) : ( 
          <div className="grid gap-6">
            {items
              .filter(item => activeFilter === "all" || item.category === activeFilter)
              .map((item, index) => (
              <div key={item.id} className="group relative rounded-3xl border-2 border-black bg-white p-6 transition-all hover:border-[var(--accent-terracotta)] hover:shadow-2xl overflow-hidden">
                {editingId === item.id ? (
                  <div className="space-y-8 animate-in fade-in duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                      <label className="text-base font-black text-black uppercase tracking-tight md:pt-2">ক্যাটাগরি</label>
                      <div className="md:col-span-3">
                        <select
                          value={editData.category}
                          onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                          className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black appearance-none"
                        >
                          {categories.filter(c => c.id !== "all").map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                      <label className="text-base font-black text-black uppercase tracking-tight md:pt-2">শিরোনাম</label>
                      <div className="md:col-span-3">
                        <textarea
                          rows={1}
                          value={editData.bn?.title || ""}
                          onInput={adjustHeight}
                          onChange={(e) => setEditData({ ...editData, bn: { ...editData.bn, title: e.target.value } })}
                          className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black resize-none min-h-[52px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                      <label className="text-base font-black text-black uppercase tracking-tight md:pt-2">বিস্তারিত</label>
                      <div className="md:col-span-3">
                        <textarea
                          rows={3}
                          value={editData.bn?.content || ""}
                          onInput={adjustHeight}
                          onChange={(e) => setEditData({ ...editData, bn: { ...editData.bn, content: e.target.value } })}
                          className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black resize-none min-h-[120px]"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 md:ml-[25%]">
                      <button onClick={() => { setEditingId(null); setEditData(null); }} className="px-8 py-3 rounded-xl border-2 border-black font-black text-[var(--accent-terracotta)] text-xs uppercase tracking-widest hover:bg-[var(--accent-terracotta)] hover:text-white transition-all">
                        বাতিল
                      </button>
                      <button onClick={handleSaveEdit} disabled={loading || uploading} className="rounded-xl bg-[var(--accent-terracotta)] px-10 py-3 text-sm font-black text-white transition hover:opacity-90 active:scale-95 disabled:opacity-30 flex items-center gap-2 border-2 border-[var(--accent-terracotta)]">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span>সেভ করুন</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Serial Indicator */}
                    <div className="hidden md:flex h-8 w-8 rounded-full bg-[var(--accent-terracotta)] text-white items-center justify-center text-[10px] font-black shrink-0 border-2 border-[var(--accent-terracotta)]">
                      {index + 1}
                    </div>

                    {item.image && (
                      <div className="h-20 w-32 rounded-2xl overflow-hidden shrink-0 border-2 border-black relative group-hover:border-[var(--accent-terracotta)]/50 transition-colors">
                        <img src={item.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                        <div className="absolute top-1 left-1">
                          <span className="rounded-lg bg-[var(--accent-terracotta)] text-white px-2 py-0.5 text-[7px] font-black uppercase tracking-widest">
                            {categories.find(c => c.id === item.category)?.label}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="flex-1 min-w-0 w-full space-y-1">
                      <div className="flex items-center gap-2 text-[8px] font-black text-black uppercase tracking-[0.2em]">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.date).toLocaleDateString("bn-BD")}
                      </div>
                      <h3 className="text-lg font-black text-black leading-tight truncate group-hover:text-[var(--accent-terracotta)] transition-colors">{item.bn?.title}</h3>
                      <div 
                        className="text-xs font-bold text-black line-clamp-1 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: item.bn?.content || "" }}
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => handleEdit(item)} className="p-3 rounded-xl border-2 border-[var(--accent-terracotta)] text-[var(--accent-terracotta)] transition hover:bg-[var(--accent-terracotta)] hover:text-white active:scale-95 shadow-sm">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-3 rounded-xl border-2 border-red-500 text-red-500 transition hover:bg-red-500 hover:text-white active:scale-95 shadow-sm">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .quill-container .ql-toolbar {
          border: none !important;
          border-bottom: 2px solid var(--accent-terracotta) !important;
          background: #fdfaf8;
          padding: 10px !important;
          opacity: 0.8;
        }
        .quill-container .ql-container {
          border: none !important;
          font-family: inherit !important;
        }
        .quill-container .ql-editor {
          min-height: 400px;
          font-size: 16px;
          line-height: 1.6;
          padding: 24px !important;
          word-break: break-word;
          overflow-wrap: break-word;
          white-space: pre-wrap;
          font-weight: 700;
        }
        .quill-preview {
          word-break: break-word;
          overflow-wrap: break-word;
        }
        .quill-preview p { margin-bottom: 0.5em; white-space: pre-wrap; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--accent-terracotta); border-radius: 10px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}

