import { useState, useEffect } from "react";
import { getAboutContent, addAboutSection, updateAboutSection, deleteAboutSection, getAllUsers } from "../../services/firestore";
import { Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown, Loader2, AlertCircle, User, Briefcase, Info, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "react-i18next";
import Shimmer from "../common/Shimmer";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AboutAdmin() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [contentType, setContentType] = useState("section"); // 'section' or 'team'
  const [showPreview, setShowPreview] = useState(false);
  
  const [newSection, setNewUpdate] = useState({
    type: "section",
    en: { title: "", content: "" },
    bn: { title: "", content: "" }
  });

  const [newMember, setNewMember] = useState({
    type: "team",
    userId: "",
    position: "",
    info: ""
  });

  useEffect(() => {
    loadContent();
    fetchUsers();
  }, []);

  async function loadContent() {
    setLoading(true);
    try {
      const data = await getAboutContent();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUsers() {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAdd() {
    setSaving(true);
    try {
      if (contentType === "section") {
        if (!newSection.bn.title || !newSection.bn.content) {
          alert("অনুগ্রহ করে শিরোনাম এবং বিষয়বস্তু প্রদান করুন।");
          setSaving(false);
          return;
        }
        await addAboutSection({
          ...newSection,
          en: { title: newSection.bn.title, content: newSection.bn.content } // Copy to EN for consistency
        });
        setNewUpdate({
          type: "section",
          en: { title: "", content: "" },
          bn: { title: "", content: "" }
        });
      } else {
        if (!newMember.userId || !newMember.position) {
          alert("অনুগ্রহ করে মেম্বার এবং পদবী নির্বাচন করুন।");
          setSaving(false);
          return;
        }
        const selectedUser = users.find(u => u.id === newMember.userId);
        await addAboutSection({
          ...newMember,
          userName: selectedUser.displayName,
          userPhoto: selectedUser.photoURL,
          userEmail: selectedUser.email
        });
        setNewMember({
          type: "team",
          userId: "",
          position: "",
          info: ""
        });
      }
      await loadContent();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleEdit(item) {
    setEditingId(item.id);
    setEditData({ ...item });
  }

  async function handleSaveEdit() {
    setSaving(true);
    try {
      const payload = { ...editData };
      if (editData.type === "section") {
        payload.en = { title: editData.bn.title, content: editData.bn.content };
      }
      await updateAboutSection(editingId, payload);
      setEditingId(null);
      setEditData(null);
      await loadContent();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("আপনি কি নিশ্চিত?")) return;
    try {
      await deleteAboutSection(id);
      await loadContent();
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMove(id, direction) {
    const idx = items.findIndex(i => i.id === id);
    if ((direction === -1 && idx === 0) || (direction === 1 && idx === items.length - 1)) return;
    
    const newItems = [...items];
    const targetIdx = idx + direction;
    
    // Swap order values
    const currentOrder = newItems[idx].order;
    const targetOrder = newItems[targetIdx].order;
    
    setSaving(true);
    try {
      await Promise.all([
        updateAboutSection(newItems[idx].id, { order: targetOrder }),
        updateAboutSection(newItems[targetIdx].id, { order: currentOrder })
      ]);
      await loadContent();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Add New Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-black text-[var(--text-brown-strong)]">আমাদের সম্পর্কে - কন্টেন্ট ম্যানেজমেন্ট</h2>
        <div className="flex gap-2 p-1 bg-white rounded-xl border-2 border-[var(--text-brown)]/5">
          <button
            onClick={() => setContentType("section")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              contentType === "section" ? "bg-[var(--text-brown)] text-white shadow-md" : "text-[var(--text-brown)] hover:bg-[var(--text-brown)]/5"
            }`}
          >
            সাধারণ সেকশন
          </button>
          <button
            onClick={() => setContentType("team")}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              contentType === "team" ? "bg-[var(--text-brown)] text-white shadow-md" : "text-[var(--text-brown)] hover:bg-[var(--text-brown)]/5"
            }`}
          >
            টিম মেম্বার
          </button>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white border-2 border-[var(--text-brown)]/5 p-6 sm:p-8 shadow-sm">
        <h3 className="text-sm font-black text-[var(--text-brown-strong)] mb-6 flex items-center gap-2 uppercase tracking-widest">
          {contentType === "section" ? "নতুন কন্টেন্ট যোগ করুন" : "নতুন টিম মেম্বার যোগ করুন"}
        </h3>

        {contentType === "section" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-brown)]/40">সাধারণ সেকশন (About)</label>
              <button 
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] hover:opacity-70 transition-opacity"
              >
                {showPreview ? <><EyeOff className="h-3 w-3" /> Hide Preview</> : <><Eye className="h-3 w-3" /> Show Preview</>}
              </button>
            </div>
            
            <input
              type="text"
              placeholder="শিরোনাম (বাংলা)"
              value={newSection.bn.title}
              onChange={e => setNewUpdate({...newSection, bn: {...newSection.bn, title: e.target.value}})}
              className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black font-bold"
            />
            
            <div className="grid gap-4 grid-cols-1">
              {!showPreview ? (
                <textarea
                  placeholder="বিষয়বস্তু (বাংলা) - Markdown কোড ব্যবহার করতে পারেন (যেমন: **bold**, *italic*, - list)"
                  value={newSection.bn.content}
                  onChange={e => setNewUpdate({...newSection, bn: {...newSection.bn, content: e.target.value}})}
                  rows={6}
                  className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black font-medium"
                />
              ) : (
                <div className="w-full rounded-xl border-2 border-dashed border-[var(--accent-terracotta)]/20 bg-white p-6 min-h-[150px]">
                  <div className="prose prose-sm prose-stone max-w-none prose-p:text-black/70">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {newSection.bn.content || "*Preview content will appear here...*"}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-black/60">মেম্বার নির্বাচন করুন</label>
              <div className="relative">
                <select
                  value={newMember.userId}
                  onChange={(e) => setNewMember({...newMember, userId: e.target.value})}
                  className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black font-bold appearance-none"
                >
                  <option value="">মেম্বার সিলেক্ট করুন...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>
                  ))}
                </select>
                <User className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
              </div>

              <label className="block text-xs font-bold uppercase tracking-wider text-black/60">পদবী (Position)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: ফাউন্ডার, ভলান্টিয়ার"
                  value={newMember.position}
                  onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                  className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black font-bold"
                />
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-black/60">অতিরিক্ত তথ্য (Info)</label>
              <div className="relative">
                <textarea
                  placeholder="মেম্বার সম্পর্কে কিছু লিখুন..."
                  value={newMember.info}
                  onChange={(e) => setNewMember({...newMember, info: e.target.value})}
                  rows={5}
                  className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] pl-10 pr-4 py-3 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
                />
                <Info className="absolute left-3 top-4 h-4 w-4 text-black/40" />
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleAdd}
          disabled={saving}
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white transition btn-swap hover:bg-black/80 disabled:opacity-50 w-full sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span>{contentType === "section" ? "সেকশন যোগ করুন" : "মেম্বার যোগ করুন"}</span>
        </button>
      </div>

      {/* Existing Sections List */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-black">সেকশনসমূহ ম্যানেজ করুন</h2>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 rounded-2xl border-2 border-[var(--accent-terracotta)]/10 bg-white space-y-3">
                <div className="flex gap-2">
                  <Shimmer width="100px" height="1.5rem" />
                  <Shimmer width="60px" height="1.25rem" borderRadius="1rem" />
                </div>
                <Shimmer width="90%" height="1.25rem" />
                <Shimmer width="100%" height="1.25rem" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[var(--accent-terracotta)]/20 p-12 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-black" />
            <p className="mt-2 text-sm font-bold text-black">কোনো সেকশন পাওয়া যায়নি। উপরে নতুন সেকশন যোগ করুন!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item, idx) => (
              <div key={item.id} className="group rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white p-6 shadow-sm transition hover:shadow-md">
                {editingId === item.id ? (
                  <div className="space-y-6">
                    {item.type === "team" ? (
                      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editData.position}
                            onChange={e => setEditData({...editData, position: e.target.value})}
                            placeholder="পদবী"
                            className="w-full rounded-lg border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black font-bold"
                          />
                        </div>
                        <div className="space-y-4">
                          <textarea
                            value={editData.info}
                            onChange={e => setEditData({...editData, info: e.target.value})}
                            placeholder="অতিরিক্ত তথ্য"
                            rows={3}
                            className="w-full rounded-lg border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editData.bn.title}
                            onChange={e => setEditData({...editData, bn: {...editData.bn, title: e.target.value}})}
                            className="w-full rounded-lg border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black font-bold"
                          />
                          <textarea
                            value={editData.bn.content}
                            onChange={e => setEditData({...editData, bn: {...editData.bn, content: e.target.value}})}
                            rows={4}
                            className="w-full rounded-lg border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2 text-sm outline-none focus:border-[var(--accent-terracotta)] text-black"
                          />
                        </div>
                        {/* Hidden English Edit but sync on save if needed */}
                      </div>
                    )}
                    <div className="flex justify-end gap-2">
                      <button onClick={() => {setEditingId(null); setEditData(null);}} className="p-2 text-black hover:bg-black/5 rounded-lg"><X className="h-5 w-5" /></button>
                      <button onClick={handleSaveEdit} disabled={saving} className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white transition btn-swap hover:bg-black/80 disabled:opacity-50">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        <span>সেভ করুন</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {item.type === "team" ? (
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full border-2 border-[var(--accent-terracotta)] overflow-hidden bg-[var(--bg-cream)] shrink-0">
                            {item.userPhoto ? (
                              <img src={item.userPhoto} alt={item.userName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-black">
                                <User className="h-8 w-8" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold text-black">{item.userName}</h3>
                              <span className="px-2 py-0.5 rounded-full bg-black text-white text-[10px] font-bold uppercase tracking-wider">TEAM</span>
                            </div>
                            <p className="text-sm font-bold text-[var(--accent-terracotta)] mb-1">{item.position}</p>
                            <p className="text-xs text-black/60 line-clamp-1">{item.info}</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-black">{item.bn.title || item.en.title}</h3>
                            <span className="px-2 py-0.5 rounded-full bg-[var(--bg-cream-soft)] border border-black/10 text-black text-[10px] font-bold uppercase tracking-wider">ABOUT</span>
                          </div>
                          <p className="text-sm text-black line-clamp-2 leading-relaxed">{item.bn.content || item.en.content}</p>
                        </>
                      )}
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => handleMove(item.id, -1)}
                          disabled={idx === 0 || saving}
                          className="p-1.5 rounded-lg border-2 border-white hover:bg-black/5 disabled:opacity-30"
                        >
                          <MoveUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleMove(item.id, 1)}
                          disabled={idx === items.length - 1 || saving}
                          className="p-1.5 rounded-lg border-2 border-white hover:bg-black/5 disabled:opacity-30"
                        >
                          <MoveDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(item)} className="p-2 text-black hover:bg-black/5 rounded-lg"><Edit2 className="h-5 w-5" /></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-black hover:bg-black/5 rounded-lg"><Trash2 className="h-5 w-5" /></button>
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
