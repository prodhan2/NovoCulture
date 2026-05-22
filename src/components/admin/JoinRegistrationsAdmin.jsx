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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-black text-[var(--text-brown-strong)]">আমাদের সাথে যোগ দিন - নিবন্ধনসমূহ</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
          {["all", "donor", "members", "volunteer", "careers", "contact"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border-2 border-white whitespace-nowrap ${
                filter === cat
                  ? "bg-[var(--text-brown)] text-white shadow-md scale-105"
                  : "bg-white text-[var(--text-brown)] hover:bg-[var(--text-brown)]/5"
              }`}
            >
              <span>{cat === "all" ? "সবগুলো" : cat === "contact" ? "যোগাযোগের বার্তা" : t(`join.${cat}`, cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <CardShimmer key={i} />)}
        </div>
      ) : displayItems.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
          {displayItems.map((item) => (
            <div key={item.id} className="group relative bg-white p-6 rounded-[2.5rem] border-2 border-[var(--text-brown)]/5 shadow-sm transition-all hover:shadow-xl overflow-hidden">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${filter === "contact" ? "bg-[var(--accent-terracotta)]" : "bg-[var(--text-brown)]"}`} />
              
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${filter === "contact" ? "bg-orange-50 text-[var(--accent-terracotta)]" : "bg-[var(--text-brown)] text-white"} border-2 border-[var(--text-brown)]/5`}>
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-[var(--text-brown-strong)] leading-tight">{item.name || item.displayName || "অজানা ব্যবহারকারী"}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                        filter === "contact" ? "bg-orange-100 text-orange-700" : "bg-[var(--text-brown)] text-white"
                      }`}>
                        {filter === "contact" ? "যোগাযোগ বার্তা" : t(`join.${item.category}`, item.category)}
                      </span>
                      {filter === "contact" && item.response && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-green-700">
                          উত্তর দেওয়া হয়েছে
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-black text-[var(--text-brown)]/40 flex items-center gap-1 bg-[var(--bg-cream)] px-2 py-1 rounded-lg">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.date).toLocaleString("bn-BD")}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-[var(--text-brown)] font-bold">
                  <div className="h-8 w-8 rounded-xl bg-[var(--bg-cream)] flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4 text-[var(--text-brown)]/40" />
                  </div>
                  <a href={`mailto:${item.email}`} className="hover:text-[var(--accent-terracotta)] hover:underline truncate">{item.email}</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-[var(--text-brown)] font-bold">
                  <div className="h-8 w-8 rounded-xl bg-[var(--bg-cream)] flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4 text-[var(--text-brown)]/40" />
                  </div>
                  <a href={`tel:${item.phone}`} className="hover:text-[var(--accent-terracotta)] hover:underline">{item.phone}</a>
                </div>
              </div>

              {item.message && (
                <div className="mb-6 rounded-2xl border-2 border-[var(--text-brown)]/5 bg-[var(--bg-cream)]/30 p-5 relative">
                  <MessageSquare className="absolute -top-3 -left-3 h-8 w-8 text-[var(--text-brown)]/5 rotate-12" />
                  <p className="text-sm font-medium text-[var(--text-brown)] leading-relaxed italic">"{item.message}"</p>
                </div>
              )}

              {/* Reply Section for Contact Messages */}
              {filter === "contact" && (
                <div className="mt-6 pt-6 border-t-2 border-[var(--text-brown)]/5 space-y-4">
                  {item.response ? (
                    <div className="p-4 rounded-2xl bg-green-50 border-2 border-green-100">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-green-700">আপনার উত্তর:</span>
                      </div>
                      <p className="text-sm font-bold text-[var(--text-brown)]">{item.response}</p>
                      {item.respondedAt && (
                        <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-green-600/60">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.respondedAt).toLocaleString("bn-BD")}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea
                        value={replyText[item.id] || ""}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="আপনার উত্তরটি এখানে লিখুন..."
                        className="w-full p-4 rounded-2xl bg-[var(--bg-cream)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none transition-all text-sm font-bold text-[var(--text-brown)] min-h-[100px] resize-none"
                      />
                      <button
                        onClick={() => handleReply(item.id)}
                        disabled={replying[item.id] || !replyText[item.id]?.trim()}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--text-brown)] text-white font-black text-xs uppercase tracking-widest transition-all hover:bg-[var(--text-brown-strong)] disabled:opacity-30"
                      >
                        {replying[item.id] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span>উত্তর পাঠান</span>
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => handleDeleteMessage(item.id)}
                    className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors mx-auto pt-2"
                  >
                    <Trash2 className="h-3 w-3" />
                    বার্তাটি মুছে ফেলুন
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[3rem] border-2 border-dashed border-[var(--text-brown)]/10 p-20 text-center bg-white/30">
          <AlertCircle className="mx-auto h-16 w-16 text-[var(--text-brown)]/10 mb-4" />
          <p className="text-xl font-black text-[var(--text-brown)]/40 tracking-tight">এই ক্যাটাগরিতে কোনো তথ্য পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
}
