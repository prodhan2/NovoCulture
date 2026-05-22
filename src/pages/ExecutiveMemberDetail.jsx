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
    <div className="min-h-screen bg-[var(--bg-cream)] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] border-2 border-[var(--text-brown)]/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700 relative">
        {/* Minimal Navigation */}
        <div className="absolute top-6 left-6 z-10">
          <button 
            onClick={() => navigate(-1)} 
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 backdrop-blur-md text-[var(--text-brown)] shadow-sm hover:scale-110 transition-all border border-[var(--text-brown)]/5"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Layout Container */}
        <div className="flex flex-col md:flex-row min-h-[400px]">
          {/* Left Side: Image Section */}
          <div className="w-full md:w-2/5 relative bg-[var(--bg-cream-soft)] min-h-[300px] md:min-h-full overflow-hidden">
            {member.userPhoto ? (
              <img 
                src={member.userPhoto} 
                alt={member.userName} 
                className="absolute inset-0 h-full w-full object-cover" 
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--text-brown)]/10">
                <User className="h-24 w-24" />
              </div>
            )}
            {/* Status Badge */}
            <div className="absolute top-6 right-6 h-10 w-10 rounded-xl bg-green-500 border-4 border-white flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Right Side: Content Section */}
          <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)] font-black text-[9px] uppercase tracking-[0.2em] mb-3">
                <Briefcase className="h-3 w-3" />
                <span>Executive Member</span>
              </div>
              <h2 className="text-3xl font-black text-[var(--text-brown-strong)] tracking-tight mb-1">
                {member.userName}
              </h2>
              <p className="text-sm font-bold text-[var(--accent-terracotta)] uppercase tracking-wider">
                {member.position}
              </p>
            </div>

            <div className="space-y-6 flex-1">
              {member.userEmail && (
                <div className="flex items-center gap-3 text-sm font-bold text-[var(--text-brown)]/60">
                  <div className="h-8 w-8 rounded-lg bg-[var(--bg-cream-soft)] flex items-center justify-center text-[var(--accent-terracotta)]">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span>{member.userEmail}</span>
                </div>
              )}

              <div className="bg-[var(--bg-cream-soft)]/50 p-6 rounded-[1.5rem] border border-[var(--text-brown)]/5">
                <p className="text-sm font-medium text-[var(--text-brown)]/80 leading-relaxed italic">
                  "{member.info || "এই সদস্য সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।"}"
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-6 border-t border-[var(--text-brown)]/5 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[var(--text-brown)]/30">
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Joined 2026</span>
              </div>
              <div className="px-3 py-1 rounded-lg border border-[var(--text-brown)]/10">
                ID: {member.id.slice(0, 8)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
