import { useState, useEffect } from "react";
import { getReviews, deleteReview } from "../../services/firestore";
import { Star, Trash2, User, MessageSquare, Loader2, Search, Calendar, Quote } from "lucide-react";

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      setLoading(true);
      const data = await getReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি নিশ্চিত যে এই রিভিউটি ডিলিট করতে চান?")) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("রিভিউ ডিলিট করতে সমস্যা হয়েছে।");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter(review => 
    review.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.text?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full px-4 sm:px-8 lg:px-10 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-black uppercase tracking-tight">
            রিভিউ ম্যানেজমেন্ট
          </h1>
          <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest mt-1">
            শুভাকাঙ্ক্ষীদের সকল মতামত এখানে দেখুন এবং কন্ট্রোল করুন
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/20" />
          <input
            type="text"
            placeholder="রিভিউ খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border-2 border-black/5 focus:border-[var(--accent-terracotta)] outline-none transition-all font-bold text-sm shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 rounded-3xl bg-white/50 animate-pulse border-2 border-black/5" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-black/5 shadow-xl">
          <MessageSquare className="h-16 w-16 text-black/10 mx-auto mb-6" />
          <h3 className="text-xl font-black text-black uppercase">কোনো রিভিউ পাওয়া যায়নি</h3>
          <p className="text-sm font-bold text-black/40 mt-2 uppercase tracking-widest">রিভিউ তালিকা বর্তমানে খালি আছে</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReviews.map((review) => (
            <div 
              key={review.id}
              className="group relative bg-white p-8 rounded-[2.5rem] border-2 border-black/5 hover:border-[var(--accent-terracotta)]/30 transition-all duration-500 shadow-sm hover:shadow-2xl overflow-hidden"
            >
              {/* Background Icon */}
              <Quote className="absolute -bottom-4 -right-4 h-24 w-24 text-black/[0.03] -rotate-12 transition-transform group-hover:rotate-0 duration-700" />
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        className={`h-3.5 w-3.5 ${star <= (review.rating || 5) ? "fill-orange-500 text-orange-500" : "text-black/10"}`} 
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deletingId === review.id}
                    className="p-2.5 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                  >
                    {deletingId === review.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-sm font-bold text-black/70 leading-relaxed mb-8 line-clamp-4 italic">
                  "{review.text}"
                </p>

                <div className="flex items-center gap-4 pt-6 border-t border-black/5">
                  <div className="h-12 w-12 rounded-2xl border-2 border-[var(--accent-terracotta)]/20 overflow-hidden bg-white shadow-inner shrink-0">
                    {review.photoURL ? (
                      <img src={review.photoURL} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-black/10">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="text-sm font-black text-black leading-tight truncate">
                      {review.displayName || "অজ্ঞাতনামা"}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-black/20" />
                      <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
                        {review.created_at ? new Date(review.created_at).toLocaleDateString('bn-BD') : "অজানা তারিখ"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
