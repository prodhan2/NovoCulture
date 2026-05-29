import { useState, useEffect, useRef } from "react";
import { getReviews, addReview, syncUserWithFirestore } from "../../services/firestore";
import { auth, googleProvider } from "../../services/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { Star, Quote, User, MessageSquare, Send, Plus, X, Loader2 } from "lucide-react";

const ReviewSection = () => {
  const [user] = useAuthState(auth);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newReview, setNewReview] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  // Auto-scroll logic
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || loading || isPaused) return;

    let animationFrameId;
    const scroll = () => {
      if (scrollContainer) {
        scrollContainer.scrollLeft += 1;
        // Reset scroll to start for infinite effect if we have enough items
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };

    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [loading, isPaused]);

  async function fetchReviews() {
    try {
      const data = await getReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncUserWithFirestore(result.user);
    } catch (error) {
      console.error("Login failed:", error);
      alert("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!newReview.trim()) return;

    setSubmitting(true);
    try {
      await addReview({
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        text: newReview,
        rating: rating,
      });
      setNewReview("");
      setIsFormOpen(false);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("রিভিউ জমা দিতে সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  // Default reviews to show if none in DB
  const defaultReviews = [
    { displayName: "সাদমান ইসলাম", text: "অসাধারণ উদ্যোগ! আপনাদের কাজ সত্যিই প্রশংসনীয় এবং অনুপ্রেরণামূলক।", rating: 5 },
    { displayName: "রাবেয়া আক্তার", text: "অল্প সময়ে এত সুন্দর আয়োজন দেখে অবাক হয়েছি। সমাজের জন্য এমন উদ্যোগ প্রয়োজন।", rating: 5 },
    { displayName: "মাহমুদ হাসান", text: "সমাজের পিছিয়ে পড়া মানুষের জন্য আপনাদের এই প্রচেষ্টা সার্থক হোক। সাথে আছি।", rating: 5 },
    { displayName: "তানজিলা হক", text: "খুবই স্বচ্ছ এবং পরিকল্পিতভাবে কাজগুলো এগিয়ে নেওয়া হচ্ছে। আপনাদের সততা মুগ্ধ করার মতো।", rating: 5 },
  ];

  const displayReviews = reviews.length > 0 ? reviews : defaultReviews;

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 mb-16">
        <div className="flex flex-row items-center justify-between gap-4">
          <div className="max-w-2xl flex-1">
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              <div className="h-1 w-8 sm:w-12 bg-[var(--accent-terracotta)] rounded-full" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-[var(--accent-terracotta)]">Testimonials</span>
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-tight">
              আমাদের সম্পর্কে <br className="hidden sm:block" /> <span className="text-[var(--accent-terracotta)]">শুভাকাঙ্ক্ষীদের</span> মতামত
            </h2>
          </div>
          
          <div className="shrink-0">
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 px-4 py-2.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[9px] sm:text-xs hover:bg-[var(--accent-terracotta)] transition-all shadow-xl active:scale-95"
            >
              {isFormOpen ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Plus className="h-3 w-3 sm:h-4 sm:w-4" />}
              <span className="whitespace-nowrap">{isFormOpen ? "বন্ধ" : "রিভিউ দিন"}</span>
            </button>
          </div>
        </div>

        {/* Expandable Review Form */}
        <div className={`mt-8 transition-all duration-500 overflow-hidden ${isFormOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="bg-[var(--bg-cream)] rounded-[2.5rem] p-8 border-2 border-black/5 shadow-2xl max-w-2xl mx-auto">
            {!user ? (
              <div className="text-center py-8">
                <p className="text-lg font-bold text-black mb-6">রিভিউ দিতে দয়া করে লগইন করুন</p>
                <button 
                  onClick={handleLogin}
                  className="flex items-center gap-3 px-8 py-4 rounded-xl bg-white border-2 border-black text-black font-black uppercase tracking-widest text-xs hover:bg-black hover:text-white transition-all mx-auto"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="h-5 w-5" />
                  <span>Google দিয়ে লগইন করুন</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full border-2 border-[var(--accent-terracotta)] overflow-hidden">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="h-full w-full object-cover" /> : <User className="h-6 w-6 m-auto mt-2" />}
                  </div>
                  <div>
                    <p className="font-black text-black">{user.displayName}</p>
                    <p className="text-[10px] font-bold text-black/40 uppercase">আপনার মতামত লিখুন</p>
                  </div>
                </div>

                <div className="flex gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button 
                      key={s} 
                      type="button" 
                      onClick={() => setRating(s)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star className={`h-6 w-6 ${s <= rating ? "fill-orange-500 text-orange-500" : "text-black/10"}`} />
                    </button>
                  ))}
                </div>

                <textarea 
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="আপনার অভিজ্ঞতা শেয়ার করুন..."
                  className="w-full h-32 rounded-2xl border-2 border-black/5 bg-white p-4 font-bold text-sm focus:border-[var(--accent-terracotta)] outline-none transition-all resize-none"
                  required
                />

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[var(--accent-terracotta)] text-white font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>রিভিউ সাবমিট করুন</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Review Container */}
      <div 
        ref={scrollRef}
        className="relative flex overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing group select-none"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        <div className="py-12 flex gap-8 whitespace-nowrap px-4">
          {[...displayReviews, ...displayReviews].map((u, i) => (
            <div 
              key={i}
              className="inline-block w-64 sm:w-80 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-[var(--bg-cream)] border-2 border-transparent hover:border-[var(--accent-terracotta)]/30 transition-all duration-500 shadow-sm hover:shadow-2xl relative overflow-hidden hover-glow-border whitespace-normal shrink-0"
            >
              <MessageSquare className="absolute -bottom-4 -right-4 h-20 w-20 text-black/[0.03] -rotate-12" />
              
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} className={`h-3 w-3 ${star <= (u.rating || 5) ? "fill-orange-500 text-orange-500" : "text-black/10"}`} />
                ))}
              </div>
              
              <p className="text-sm font-bold text-black/70 leading-relaxed mb-8 whitespace-normal line-clamp-3 italic relative z-10">
                "{u.text}"
              </p>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="h-10 w-10 rounded-xl border-2 border-[var(--accent-terracotta)]/20 overflow-hidden bg-white shadow-inner">
                  {u.photoURL ? (
                    <img src={u.photoURL} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-black/10">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-black text-black leading-tight">
                    {u.displayName || "শুভাকাঙ্ক্ষী"}
                  </h4>
                  <p className="text-[9px] font-black text-[var(--accent-terracotta)] uppercase tracking-[0.2em] mt-0.5">
                    শুভাকাঙ্ক্ষী
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
      </div>
    </section>
  );
};

export default ReviewSection;
