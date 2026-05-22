import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAboutContent } from "../services/firestore";
import { User, Briefcase, Mail, ArrowLeft, Loader2, Info, Calendar, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ExecutiveMemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMember() {
      try {
        const data = await getAboutContent();
        const foundMember = data.find(m => m.id === id);
        setMember(foundMember);
      } catch (err) {
        console.error("Failed to load member details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMember();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-cream)] px-4 text-center">
        <Info className="h-16 w-16 text-[var(--text-brown)]/20 mb-4" />
        <h2 className="text-2xl font-black text-[var(--text-brown-strong)] mb-2">সদস্য পাওয়া যায়নি</h2>
        <p className="text-[var(--text-brown)]/60 font-medium mb-8">দুঃখিত, এই সদস্যের তথ্য বর্তমানে পাওয়া যাচ্ছে না।</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-2xl bg-[var(--text-brown)] px-8 py-4 text-lg font-bold text-white transition hover:bg-[var(--text-brown)]/80"
        >
          <ArrowLeft className="h-5 w-5" />
          ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b-2 border-[var(--accent-terracotta)]/10 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-[var(--accent-terracotta)] shadow-sm transition group-hover:bg-[var(--accent-terracotta)] group-hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="text-sm font-black uppercase tracking-widest text-[var(--text-brown)] hidden sm:inline">ফিরে যান</span>
          </button>
          <h1 className="text-lg sm:text-2xl font-black text-[var(--text-brown-strong)] tracking-tight truncate px-4">সদস্য প্রোফাইল</h1>
          <div className="w-10 sm:w-24" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:px-8">
        <div className="bg-white rounded-[3rem] border-2 border-[var(--text-brown)]/5 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Cover/Top Section */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-r from-[var(--accent-terracotta)] to-orange-400">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          </div>

          <div className="px-6 sm:px-12 pb-12 sm:pb-16 relative">
            {/* Profile Photo */}
            <div className="relative -mt-16 sm:-mt-24 mb-8">
              <div className="h-32 w-32 sm:h-48 sm:w-48 rounded-full border-[6px] sm:border-[8px] border-white shadow-2xl overflow-hidden bg-white mx-auto md:mx-0">
                {member.userPhoto ? (
                  <img src={member.userPhoto} alt={member.userName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[var(--bg-cream)] text-[var(--text-brown)]">
                    <User className="h-16 w-16 sm:h-24 sm:w-24" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="text-center md:text-left space-y-4">
                <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-brown-strong)] tracking-tighter leading-none">
                  {member.userName}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6">
                  <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-black text-xs sm:text-sm uppercase tracking-widest">
                    <Briefcase className="h-4 w-4" />
                    <span>{member.position}</span>
                  </div>
                  {member.userEmail && (
                    <div className="flex items-center gap-2.5 text-[var(--text-brown)]/60 font-bold text-sm sm:text-base">
                      <Mail className="h-5 w-5 text-[var(--accent-terracotta)]" />
                      <span>{member.userEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-12 sm:mt-16 grid gap-12 lg:grid-cols-1">
              {/* Detailed Info Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 text-[var(--text-brown-strong)]">
                  <div className="h-1.5 w-12 bg-[var(--accent-terracotta)] rounded-full" />
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-widest">পরিচিতি ও তথ্য</h3>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg sm:text-xl text-[var(--text-brown)]/80 font-medium leading-relaxed whitespace-pre-wrap bg-[var(--bg-cream)]/30 p-6 sm:p-10 rounded-[2.5rem] border-2 border-[var(--text-brown)]/5">
                    {member.info || "এই সদস্য সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।"}
                  </p>
                </div>
              </section>

              {/* Status/Badge */}
              <div className="flex items-center gap-4 p-6 sm:p-8 rounded-[2rem] bg-[var(--text-brown)] text-white shadow-xl shadow-orange-900/10">
                <div className="h-12 w-12 rounded-full bg-[var(--accent-terracotta)] flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">Status</p>
                  <p className="text-lg font-bold">Verified Executive Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
