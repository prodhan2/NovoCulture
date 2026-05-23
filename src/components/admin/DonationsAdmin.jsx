import { useEffect, useState } from "react";
import { getDonations, setSettings } from "../../services/firestore";
import { Heart, Loader2, Calendar, User, Mail, Phone, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { db } from "../../services/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { CardShimmer } from "../common/Shimmer";

export default function DonationsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getDonations();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(id, newStatus) {
    setUpdating(id);
    try {
      const ref = doc(db, "donations", id);
      await updateDoc(ref, { status: newStatus });
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("অবস্থা পরিবর্তন করতে সমস্যা হয়েছে।");
    } finally {
      setUpdating(null);
    }
  }

  return (
    <div className="w-full animate-in fade-in duration-700">
      {/* Compact Header Area */}
      <div className="px-4 sm:px-8 lg:px-10 py-6 border-b-2 border-[var(--accent-terracotta)]/10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            অনুদানের রেকর্ডসমূহ
          </h1>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            সকল ব্যবহারকারীর অনুদানের তালিকা ম্যানেজ করুন
          </p>
        </div>
        
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl bg-[var(--accent-terracotta)] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 border-2 border-[var(--accent-terracotta)]"
        >
          রিফ্রেশ করুন
        </button>
      </div>

      <div className="px-4 sm:px-8 lg:px-10 pb-20">
        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-white border-2 border-black/5 animate-pulse" />)}
          </div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto rounded-3xl border-2 border-black/5 bg-white shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[var(--accent-terracotta)]/5">
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60">নং</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60">দাতা</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60">তহবিল ও পরিমাণ</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60">যোগাযোগ</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60">তারিখ</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60">অবস্থা</th>
                  <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-[var(--accent-terracotta)]/60">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/5">
                {items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-[var(--accent-terracotta)]/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)]/60 font-black text-[10px] border border-[var(--accent-terracotta)]/10">
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-black">{item.userName}</span>
                        <span className="text-[8px] font-bold text-black/30 uppercase tracking-tighter truncate max-w-[120px]">{item.userEmail}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-black">৳{item.amount}</span>
                        <span className="text-[8px] font-black text-[var(--accent-terracotta)] uppercase tracking-widest">{item.fund}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-bold text-black/60">
                      {item.phone}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-black/20 uppercase tracking-widest">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.date).toLocaleDateString("bn-BD")}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                        item.status === "Success" ? "bg-green-50 border-green-200 text-green-700" :
                        item.status === "Failed" ? "bg-red-50 border-red-200 text-red-700" :
                        "bg-orange-50 border-orange-200 text-orange-700"
                      }`}>
                        {item.status === "Success" ? <CheckCircle2 className="h-3 w-3" /> : 
                         item.status === "Failed" ? <XCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {item.status === "Success" ? "সফল" : 
                         item.status === "Failed" ? "ব্যর্থ" : "অপেক্ষমান"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleStatusChange(item.id, "Success")}
                          disabled={updating === item.id || item.status === "Success"}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-500 hover:text-white disabled:opacity-20 transition-all border border-green-100"
                        >
                          {updating === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        </button>
                        <button
                          onClick={() => handleStatusChange(item.id, "Failed")}
                          disabled={updating === item.id || item.status === "Failed"}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white disabled:opacity-20 transition-all border border-red-100"
                        >
                          {updating === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[3rem] border-4 border-dashed border-black/5 p-20 text-center bg-white/50">
            <AlertCircle className="mx-auto h-12 w-12 text-black/10 mb-4" />
            <p className="text-lg font-black text-black/20 uppercase tracking-widest">এখনো কোনো অনুদান পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  );
}
