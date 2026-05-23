import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getFormSubmission, getCustomForm, updateFormSubmissionStatus } from "../services/firestore";
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Phone, 
  AlertCircle, 
  CheckCircle2, 
  Trophy, 
  ListTodo,
  Loader2,
  XCircle,
  ExternalLink
} from "lucide-react";

function SubmissionDetailPage() {
  const { formId, submissionId } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [subData, formData] = await Promise.all([
          getFormSubmission(submissionId),
          getCustomForm(formId)
        ]);
        setSubmission(subData);
        setForm(formData);
      } catch (error) {
        console.error("Error fetching submission details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [formId, submissionId]);

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await updateFormSubmissionStatus(submissionId, newStatus);
      setSubmission(prev => ({ ...prev, status: newStatus }));
      alert("স্ট্যাটাস আপডেট হয়েছে!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!submission || !form) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center text-black p-6">
        <AlertCircle className="h-16 w-16 text-orange-500 mb-4" />
        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">সাবমিশন খুঁজে পাওয়া যায়নি!</h2>
        <button 
          onClick={() => navigate(-1)}
          className="bg-orange-500 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  if (!submission || !form) return null;

  const quizResult = submission.quizResult || submission.data?.quizResult;

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-black py-12 px-4 sm:px-8 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12 border-b-2 border-black pb-8">
          <div className="space-y-2">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors font-black uppercase text-xs tracking-widest mb-4"
            >
              <ArrowLeft className="h-4 w-4" /> সাবমিশন লিস্টে ফিরে যান
            </button>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-black">
              {submission.userName || submission.data?.userName || "অজানা ব্যবহারকারী"}
            </h1>
            <p className="text-[10px] font-bold text-black uppercase tracking-[0.3em]">
              Form: {form.title} | ID: {submission.id}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={updating}
              onClick={() => handleStatusUpdate("Accepted")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                submission.status === "Accepted" 
                ? "bg-green-600 text-white cursor-default" 
                : "bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20"
              }`}
            >
              <CheckCircle2 className="h-4 w-4" /> গ্রহণ করুন
            </button>
            <button
              disabled={updating}
              onClick={() => handleStatusUpdate("Rejected")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                submission.status === "Rejected" 
                ? "bg-red-600 text-white cursor-default" 
                : "bg-white border-2 border-black text-black hover:bg-black/10"
              }`}
            >
              <XCircle className="h-4 w-4" /> বাতিল করুন
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            {/* Quiz Results if available */}
            {quizResult && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Trophy className="h-6 w-6 text-orange-500" />
                  <h2 className="text-xl font-black uppercase tracking-widest text-black">কুইজ অ্যানালাইসিস</h2>
                </div>
                <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-black shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-black uppercase tracking-widest text-black">প্রাপ্ত নম্বর</span>
                    <span className="text-4xl font-black text-orange-500">{quizResult.score} / {quizResult.totalPoints}</span>
                  </div>
                  <div className="space-y-4">
                    {quizResult.analysis.map((q, i) => (
                      <div key={i} className={`p-5 rounded-2xl border-2 ${q.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                        <p className="text-sm font-black text-black mb-3">{i+1}. {q.question}</p>
                        <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest">
                          <p className="text-black">ইউজার উত্তর: <span className={q.isCorrect ? 'text-green-600' : 'text-red-600'}>{q.userAnswer || "N/A"}</span></p>
                          {!q.isCorrect && <p className="text-black">সঠিক উত্তর: <span className="text-green-600">{q.correctAnswer}</span></p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Form Fields Data */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <ListTodo className="h-6 w-6 text-orange-500" />
                <h2 className="text-xl font-black uppercase tracking-widest text-black">জমাকৃত তথ্যসমূহ</h2>
              </div>
              <div className="grid gap-4">
                {form.fields.map((f, i) => {
                  const val = submission.data?.[f.id] || submission[f.id];
                  return (
                    <div key={f.id} className="bg-white rounded-2xl p-6 border-2 border-black transition-all hover:border-orange-500 shadow-sm">
                      <p className="text-[10px] font-black uppercase tracking-widest text-black mb-2">{f.label}</p>
                      <div className="text-lg font-bold text-black break-words">
                        {f.type === "image" ? (
                          val ? (
                            <div className="mt-4 relative group max-w-md">
                              <img src={val} alt="" className="rounded-2xl border-2 border-black w-full h-64 object-cover shadow-md" />
                              <a 
                                href={val} 
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl"
                              >
                                <span className="px-6 py-3 bg-orange-500 text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center gap-2 shadow-lg">
                                  <ExternalLink className="h-4 w-4" /> ফুল ইমেজ দেখুন
                                </span>
                              </a>
                            </div>
                          ) : <span className="text-black italic">ছবি আপলোড করা হয়নি</span>
                        ) : (
                          val || <span className="text-black italic">তথ্য দেওয়া হয়নি</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Metadata */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border-2 border-black shadow-xl space-y-8 sticky top-24">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-black">বর্তমান স্ট্যাটাস</h3>
                <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                  submission.status === "Accepted" ? "bg-green-500 text-white border-green-600" :
                  submission.status === "Rejected" ? "bg-red-500 text-white border-red-600" :
                  "bg-orange-500 text-white border-orange-600"
                }`}>
                  {submission.status}
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">ব্যবহারকারী</p>
                    <p className="text-sm font-bold text-black">{submission.userName || submission.data?.userName || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">মোবাইল নম্বর</p>
                    <p className="text-sm font-bold text-black">{submission.userPhone || submission.data?.userPhone || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-black">জমা দেওয়ার সময়</p>
                    <p className="text-sm font-bold text-black">{new Date(submission.created_at).toLocaleString("bn-BD")}</p>
                  </div>
                </div>

                {(submission.tabSwitches || submission.data?.tabSwitches) > 0 && (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-50 border-2 border-red-500">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-600">ট্যাব সুইচ সংখ্যা</p>
                      <p className="text-sm font-black text-red-500">{submission.tabSwitches || submission.data.tabSwitches} বার</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-8 border-t-2 border-black">
                <button 
                  onClick={() => navigate(-1)}
                  className="w-full bg-orange-500 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                >
                  ফিরে যান
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubmissionDetailPage;
