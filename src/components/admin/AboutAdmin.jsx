import { useState, useEffect } from "react";
import { getAboutContent, addAboutSection, updateAboutSection, deleteAboutSection, getAllUsers } from "../../services/firestore";
import { Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown, Loader2, AlertCircle, User, Briefcase, Info, Eye, EyeOff, Layout } from "lucide-react";
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
        payload.en = { title: editData.bn?.title || "", content: editData.bn?.content || "" };
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
  }, [loading, contentType, editingId, newSection, newMember]);

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            আমাদের সম্পর্কে
          </h1>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            প্রতিষ্ঠানের তথ্য এবং টিম মেম্বার ম্যানেজ করুন
          </p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-[var(--accent-terracotta)] rounded-xl border-2 border-[var(--accent-terracotta)]">
          <button
            onClick={() => setContentType("section")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              contentType === "section" ? "bg-white text-[var(--accent-terracotta)] shadow-md scale-105" : "text-white hover:bg-white/10"
            }`}
          >
            সাধারণ সেকশন
          </button>
          <button
            onClick={() => setContentType("team")}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
              contentType === "team" ? "bg-white text-[var(--accent-terracotta)] shadow-md scale-105" : "text-white hover:bg-white/10"
            }`}
          >
            টিম মেম্বার
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-10 pb-20 w-full space-y-16">
        {/* Form Section */}
        <div className="space-y-10">
          {contentType === "section" ? (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                  শিরোনাম
                </label>
                <div className="md:col-span-3">
                  <textarea
                    rows={1}
                    onInput={adjustHeight}
                    placeholder="শিরোনাম (বাংলা)"
                    value={newSection.bn?.title || ""}
                    onChange={e => setNewUpdate({...newSection, bn: {...newSection.bn, title: e.target.value}})}
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-lg font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                <div className="space-y-2">
                  <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                    বিস্তারিত
                  </label>
                  <button 
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)] hover:opacity-70 transition-opacity px-1"
                  >
                    {showPreview ? <><EyeOff className="h-3 w-3" /> কোড</> : <><Eye className="h-3 w-3" /> প্রিভিউ</>}
                  </button>
                </div>
                <div className="md:col-span-3">
                  {!showPreview ? (
                    <textarea
                      placeholder="বিষয়বস্তু (বাংলা) - Markdown ব্যবহার করতে পারেন..."
                      value={newSection.bn?.content || ""}
                      onInput={adjustHeight}
                      onChange={e => setNewUpdate({...newSection, bn: {...newSection.bn, content: e.target.value}})}
                      rows={4}
                      className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[160px]"
                    />
                  ) : (
                    <div className="w-full rounded-xl border-2 border-dashed border-[var(--accent-terracotta)] bg-black/5 p-8 min-h-[160px]">
                      <div className="prose prose-sm prose-stone max-w-none text-black font-bold">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {newSection.bn?.content || "*প্রিভিউ কন্টেন্ট এখানে দেখা যাবে...*"}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-4 md:gap-12 group">
                <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight">
                  মেম্বার
                </label>
                <div className="md:col-span-3">
                  <select
                    value={newMember.userId}
                    onChange={(e) => setNewMember({...newMember, userId: e.target.value})}
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black appearance-none"
                  >
                    <option value="">মেম্বার সিলেক্ট করুন...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                  পদবী
                </label>
                <div className="md:col-span-3">
                  <textarea
                    rows={1}
                    onInput={adjustHeight}
                    placeholder="যেমন: ফাউন্ডার, ভলান্টিয়ার"
                    value={newMember.position}
                    onChange={(e) => setNewMember({...newMember, position: e.target.value})}
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[52px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                <label className="text-base sm:text-lg font-black text-black uppercase tracking-tight md:pt-2">
                  অতিরিক্ত তথ্য
                </label>
                <div className="md:col-span-3">
                  <textarea
                    placeholder="মেম্বার সম্পর্কে কিছু লিখুন..."
                    value={newMember.info}
                    onInput={adjustHeight}
                    onChange={(e) => setNewMember({...newMember, info: e.target.value})}
                    rows={3}
                    className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-black resize-none placeholder:text-black/10 shadow-sm min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-start md:ml-[25%]">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center justify-center gap-3 rounded-xl bg-[var(--accent-terracotta)] px-12 py-4 text-base font-black text-white shadow-xl shadow-[var(--accent-terracotta)]/20 transition hover:opacity-90 active:scale-95 disabled:opacity-30 uppercase tracking-widest border-2 border-[var(--accent-terracotta)]"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              <span>{contentType === "section" ? "সেকশন যোগ করুন" : "মেম্বার যোগ করুন"}</span>
            </button>
          </div>
        </div>

        {/* Existing Content List */}
        <div className="mt-24 pt-16 border-t-2 border-black/5 space-y-12">
          <div className="flex items-center gap-4">
            <Layout className="h-6 w-6 text-[var(--accent-terracotta)]" />
            <h2 className="text-2xl font-black text-black uppercase tracking-tight">বিদ্যমান সেকশনসমূহ</h2>
          </div>

          {loading ? (
            <div className="grid gap-6">
              {[1, 2].map(i => <div key={i} className="h-32 rounded-3xl bg-white border-2 border-black/5 animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-[3rem] border-4 border-dashed border-black/5 p-20 text-center bg-white/50">
              <AlertCircle className="mx-auto h-12 w-12 text-black/10 mb-4" />
              <p className="text-lg font-black text-black/20 uppercase tracking-widest">কোনো সেকশন পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, idx) => (
                <div key={item.id} className="group relative rounded-3xl border-2 border-black/5 bg-white p-8 transition-all hover:border-[var(--accent-terracotta)] hover:shadow-2xl">
                  {editingId === item.id ? (
                    <div className="space-y-8 animate-in fade-in duration-300">
                      {item.type === "team" ? (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                            <label className="text-base font-black text-black uppercase tracking-tight md:pt-2">পদবী</label>
                            <div className="md:col-span-3">
                              <textarea
                                rows={1}
                                onInput={adjustHeight}
                                value={editData.position || ""}
                                onChange={e => setEditData({...editData, position: e.target.value})}
                                className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black resize-none min-h-[52px]"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                            <label className="text-base font-black text-black uppercase tracking-tight md:pt-2">তথ্য</label>
                            <div className="md:col-span-3">
                              <textarea
                                rows={3}
                                onInput={adjustHeight}
                                value={editData.info || ""}
                                onChange={e => setEditData({...editData, info: e.target.value})}
                                className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black resize-none min-h-[100px]"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                            <label className="text-base font-black text-black uppercase tracking-tight md:pt-2">শিরোনাম</label>
                            <div className="md:col-span-3">
                              <textarea
                                rows={1}
                                onInput={adjustHeight}
                                value={editData.bn?.title || ""}
                                onChange={e => setEditData({...editData, bn: {...editData.bn, title: e.target.value}})}
                                className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black resize-none min-h-[52px]"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-4 md:gap-12 group">
                            <label className="text-base font-black text-black uppercase tracking-tight md:pt-2">বিস্তারিত</label>
                            <div className="md:col-span-3">
                              <textarea
                                rows={4}
                                onInput={adjustHeight}
                                value={editData.bn?.content || ""}
                                onChange={e => setEditData({...editData, bn: {...editData.bn, content: e.target.value}})}
                                className="w-full rounded-xl border-2 border-[var(--accent-terracotta)] bg-white px-5 py-3 text-base font-bold outline-none focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 text-black resize-none min-h-[160px]"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex justify-end gap-3 md:ml-[25%]">
                        <button onClick={() => {setEditingId(null); setEditData(null);}} className="px-8 py-3 rounded-xl border-2 border-[var(--accent-terracotta)] font-black text-xs uppercase tracking-widest hover:bg-[var(--accent-terracotta)] hover:text-white transition-all">বাতিল</button>
                        <button onClick={handleSaveEdit} disabled={saving} className="rounded-xl bg-[var(--accent-terracotta)] px-10 py-3 text-sm font-black text-white transition hover:opacity-90 active:scale-95 disabled:opacity-30 uppercase tracking-widest border-2 border-[var(--accent-terracotta)]">
                          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          <span>সেভ করুন</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      {/* Serial Indicator */}
                      <div className="hidden md:flex h-8 w-8 rounded-full bg-[var(--accent-terracotta)] text-white items-center justify-center text-[10px] font-black shrink-0 border-2 border-[var(--accent-terracotta)]">
                        {idx + 1}
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        {item.type === "team" ? (
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="h-20 w-20 rounded-full border-2 border-[var(--accent-terracotta)] overflow-hidden bg-black/5 shrink-0 shadow-lg">
                              {item.userPhoto ? (
                                <img src={item.userPhoto} alt={item.userName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-black/20">
                                  <User className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                            <div className="text-center sm:text-left space-y-1">
                              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h3 className="text-xl font-black text-black leading-tight">{item.userName}</h3>
                                <span className="px-2 py-0.5 rounded bg-[var(--accent-terracotta)] text-white text-[7px] font-black uppercase tracking-widest">TEAM</span>
                              </div>
                              <p className="text-sm font-black text-black opacity-40">{item.position}</p>
                              <p className="text-xs font-bold text-black/60 leading-relaxed max-w-xl line-clamp-2">{item.info}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-black text-black leading-tight">{(item.bn?.title || item.en?.title) || "শিরোনাম নেই"}</h3>
                              <span className="px-2 py-0.5 rounded bg-[var(--accent-terracotta)] text-white text-[7px] font-black uppercase tracking-widest">SECTION</span>
                            </div>
                            <div className="text-xs font-bold text-black/60 leading-relaxed line-clamp-2">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {(item.bn?.content || item.en?.content) || ""}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-6 flex items-center gap-2">
                          <button
                            onClick={() => handleMove(item.id, -1)}
                            disabled={idx === 0 || saving}
                            className="p-2.5 rounded-xl border-2 border-black/10 hover:border-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)] hover:text-white disabled:opacity-20 transition-all active:scale-90"
                          >
                            <MoveUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => handleMove(item.id, 1)}
                            disabled={idx === items.length - 1 || saving}
                            className="p-2.5 rounded-xl border-2 border-black/10 hover:border-[var(--accent-terracotta)] hover:bg-[var(--accent-terracotta)] hover:text-white disabled:opacity-20 transition-all active:scale-90"
                          >
                            <MoveDown className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
      </div>
    </div>
  );
}
