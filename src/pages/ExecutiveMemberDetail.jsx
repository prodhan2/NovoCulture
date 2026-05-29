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
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <Info className="h-16 w-16 text-black/10 mb-4" />
        <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-tighter">সদস্য পাওয়া যায়নি</h2>
        <p className="text-black/40 font-bold mb-8 uppercase tracking-widest text-xs">দুঃখিত, এই সদস্যের তথ্য বর্তমানে পাওয়া যাচ্ছে না।</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-black text-white transition hover:bg-black/80 uppercase tracking-widest border-2 border-black active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          ফিরে যান
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 bg-white px-4 py-4 sm:px-8 border-b-2 border-black">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border-2 border-black shadow-sm transition group-hover:bg-black group-hover:text-white">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-black hidden sm:inline">ফিরে যান</span>
          </button>
          <h1 className="text-lg sm:text-xl font-black text-black tracking-widest uppercase truncate px-4">সদস্য প্রোফাইল</h1>
          <div className="w-10 sm:w-24" />
        </div>
      </header>

      <main className="max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 sm:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Member Details Card - Compact Layout */}
          <div className="bg-white rounded-[2.5rem] border-4 border-black p-6 sm:p-10 shadow-2xl flex flex-col sm:flex-row items-center sm:items-start gap-8 sm:gap-12 h-fit">
            
            {/* Left Side: Image */}
            <div className="shrink-0">
              <div className="h-32 w-32 sm:h-48 sm:w-48 rounded-[2rem] border-4 border-black overflow-hidden bg-white shadow-xl relative">
                {member.userPhoto ? (
                  <img src={member.userPhoto} alt={member.userName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-black/5 text-black">
                    <User className="h-16 w-16 sm:h-24 sm:w-24" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Others */}
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-6">
              <div>
                <h2 className="text-3xl sm:text-5xl font-black text-black tracking-tighter leading-none mb-4 break-words">
                  {member.userName}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-black">
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>{member.position}</span>
                  </div>
                  {member.userEmail && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 border-black max-w-full">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="break-all">{member.userEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center sm:justify-start gap-3 text-black">
                  <div className="h-1 w-10 bg-black rounded-full" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em]">পরিচিতি ও তথ্য</h3>
                </div>
                
                <div className="bg-black/5 p-6 rounded-[2rem] border-2 border-black/5">
                  <p className="text-sm sm:text-base text-black font-bold leading-relaxed whitespace-pre-wrap italic">
                    "{member.info || "এই সদস্য সম্পর্কে বিস্তারিত তথ্য শীঘ্রই যোগ করা হবে।"}"
                  </p>
                </div>
              </div>

              {/* Status Badge - Compact */}
              <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center shrink-0 border-2 border-black shadow-lg shadow-black/20">
                  <ShieldCheck className="h-4 w-4 text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60">Verified Executive Member</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
