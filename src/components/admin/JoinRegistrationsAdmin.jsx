import { useEffect, useState } from "react";
import { getJoinRegistrations, getAllContactMessages, updateContactMessage, deleteContactMessage } from "../../services/firestore";
import { Trash2, Calendar, User, Mail, Phone, MessageSquare, AlertCircle, Loader2, Send, CheckCircle2, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { CardShimmer } from "../common/Shimmer";

export default function JoinRegistrationsAdmin() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState({});
  const [replying, setReplying] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [regs, msgs] = await Promise.all([
        getJoinRegistrations(),
        getAllContactMessages()
      ]);
      setItems(regs);
      setContactMessages(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleReply = async (id) => {
    if (!replyText[id]?.trim()) return;
    
    try {
      setReplying(prev => ({ ...prev, [id]: true }));
      await updateContactMessage(id, { 
        response: replyText[id],
        respondedAt: new Date().toISOString()
      });
      
      // Update local state
      setContactMessages(prev => prev.map(msg => 
        msg.id === id ? { ...msg, response: replyText[id], respondedAt: new Date().toISOString() } : msg
      ));
      
      setReplyText(prev => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Failed to reply:", err);
    } finally {
      setReplying(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিতভাবে এই বার্তাটি মুছে ফেলতে চান?")) return;
    try {
      await deleteContactMessage(id);
      setContactMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const displayItems = filter === "contact" 
    ? contactMessages 
    : filter === "all" 
      ? items 
      : items.filter(i => i.category === filter);

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            রেজিস্ট্রেশন এবং বার্তা
          </h1>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            নিবন্ধনসমূহ এবং যোগাযোগের বার্তা ম্যানেজ করুন
          </p>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide bg-[var(--accent-terracotta)] p-1.5 rounded-xl border-2 border-[var(--accent-terracotta)]">
          {["all", "donor", "members", "volunteer", "careers", "contact"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${
                filter === cat
                  ? "bg-white text-[var(--accent-terracotta)] shadow-md scale-105"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span>{cat === "all" ? "সবগুলো" : cat === "contact" ? "বার্তা" : t(`join.${cat}`, cat)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 sm:px-8 lg:px-10 pb-20">
        {loading ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => <CardShimmer key={i} />)}
          </div>
        ) : displayItems.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {displayItems.map((item, index) => (
              <div key={item.id} className="group relative bg-white p-6 rounded-3xl border-2 border-black/5 transition-all hover:border-[var(--accent-terracotta)] hover:shadow-2xl">
                {/* Serial Indicator */}
                <div className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-[var(--accent-terracotta)] text-white flex items-center justify-center text-[10px] font-black border-2 border-[var(--accent-terracotta)] z-10">
                  {index + 1}
                </div>

                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-terracotta)]/5 border-2 border-[var(--accent-terracotta)]/5 text-[var(--accent-terracotta)] group-hover:bg-[var(--accent-terracotta)] group-hover:text-white group-hover:border-[var(--accent-terracotta)] transition-colors">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-black leading-tight truncate max-w-[150px]">{item.name || item.displayName || "অজানা"}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[7px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]">
                          {filter === "contact" ? "MESSAGE" : t(`join.${item.category}`, item.category)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-[8px] font-black text-black/20 flex items-center gap-1 uppercase tracking-widest">
                    <Calendar className="h-2.5 w-2.5" />
                    {new Date(item.date).toLocaleDateString("bn-BD")}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-xs text-black/60 font-bold">
                    <Mail className="h-3 w-3 text-black/20" />
                    <a href={`mailto:${item.email}`} className="hover:underline truncate">{item.email}</a>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-black/60 font-bold">
                    <Phone className="h-3 w-3 text-black/20" />
                    <a href={`tel:${item.phone}`} className="hover:underline">{item.phone}</a>
                  </div>
                </div>

                {item.message && (
                  <div className="mb-6 p-4 rounded-2xl bg-[var(--accent-terracotta)]/5 border-2 border-[var(--accent-terracotta)]/5 relative">
                    <MessageSquare className="absolute -top-2 -left-2 h-6 w-6 text-[var(--accent-terracotta)]/10 rotate-12" />
                    <p className="text-xs font-bold text-black/70 leading-relaxed line-clamp-3 italic">"{item.message}"</p>
                  </div>
                )}

                {/* Reply Section for Contact Messages */}
                {filter === "contact" && (
                  <div className="mt-6 pt-6 border-t-2 border-black/5 space-y-4">
                    {item.response ? (
                      <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-green-700">উত্তর:</span>
                        </div>
                        <p className="text-xs font-bold text-black line-clamp-2">{item.response}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <textarea
                          value={replyText[item.id] || ""}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="উত্তর লিখুন..."
                          className="w-full p-4 rounded-xl bg-white border-2 border-[var(--accent-terracotta)] focus:ring-4 focus:ring-[var(--accent-terracotta)]/10 outline-none transition-all text-xs font-bold text-black min-h-[80px] resize-none"
                        />
                        <button
                          onClick={() => handleReply(item.id)}
                          disabled={replying[item.id] || !replyText[item.id]?.trim()}
                          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--accent-terracotta)] text-white font-black text-[10px] uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-30 border-2 border-[var(--accent-terracotta)]"
                        >
                          {replying[item.id] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                          <span>উত্তর পাঠান</span>
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleDeleteMessage(item.id)}
                      className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-red-500/40 hover:text-red-500 transition-colors mx-auto"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                      মুছে ফেলুন
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[3rem] border-4 border-dashed border-black/5 p-20 text-center bg-white/50">
            <AlertCircle className="mx-auto h-12 w-12 text-black/10 mb-4" />
            <p className="text-lg font-black text-black/20 uppercase tracking-widest">কোনো তথ্য পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
