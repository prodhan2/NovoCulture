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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-black">অনুদানের রেকর্ডসমূহ</h2>
            <p className="text-xs font-bold text-black/60">সকল ব্যবহারকারীর অনুদানের তালিকা ম্যানেজ করুন</p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl border-2 border-white bg-white px-6 py-2.5 text-sm font-bold text-black transition hover:bg-black/5"
        >
          রিফ্রেশ করুন
        </button>
      </div>

      {loading ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => <CardShimmer key={i} />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-2xl border-2 border-white bg-white/50 p-6 shadow-sm transition hover:shadow-md backdrop-blur-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-[var(--accent-terracotta)] border-2 border-white shadow-sm">
                    <Heart className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-lg">৳{item.amount}</h3>
                    <span className="text-xs font-bold text-black/40 uppercase tracking-widest">{item.fund}</span>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-black flex items-center gap-1.5 bg-white/80 px-3 py-1 rounded-full border-2 border-white shadow-sm">
                  <Calendar className="h-3 w-3" />
                  {new Date(item.date).toLocaleString("bn-BD")}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-black font-medium">
                    <User className="h-4 w-4 shrink-0 text-black/40" />
                    <span className="truncate">{item.userName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-black font-medium">
                    <Mail className="h-4 w-4 shrink-0 text-black/40" />
                    <span className="truncate">{item.userEmail}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-black font-medium">
                    <Phone className="h-4 w-4 shrink-0 text-black/40" />
                    <span>{item.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold">
                    {item.status === "Success" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : item.status === "Pending" ? (
                      <Clock className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className={
                      item.status === "Success" ? "text-green-600" : 
                      item.status === "Pending" ? "text-yellow-600" : "text-red-600"
                    }>
                      {item.status === "Success" ? "সফল" : 
                       item.status === "Pending" ? "অপেক্ষমান" : "ব্যর্থ"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t-2 border-white">
                <button
                  onClick={() => handleStatusChange(item.id, "Success")}
                  disabled={updating === item.id || item.status === "Success"}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-xs font-bold text-green-600 transition hover:bg-green-100 disabled:opacity-30 border-2 border-white shadow-sm"
                >
                  {updating === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  সফল মার্ক করুন
                </button>
                <button
                  onClick={() => handleStatusChange(item.id, "Failed")}
                  disabled={updating === item.id || item.status === "Failed"}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-30 border-2 border-white shadow-sm"
                >
                  {updating === item.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
                  ব্যর্থ মার্ক করুন
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-white p-20 text-center bg-white/30 backdrop-blur-sm">
          <AlertCircle className="mx-auto h-12 w-12 text-black/20" />
          <p className="mt-4 text-lg font-bold text-black/40">এখনো কোনো অনুদান পাওয়া যায়নি।</p>
        </div>
      )}
    </div>
  );
}
