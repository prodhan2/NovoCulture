import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import { 
  getCustomFormBySlug, 
  addFormSubmission, 
  getUserProfile, 
  setUserProfile, 
  getFormSubmissions,
  syncUserWithFirestore 
} from "../services/firestore";
import { uploadImage } from "../services/imageUpload";
import { 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ImageIcon, 
  ArrowLeft,
  Upload,
  Send,
  Lock,
  User as UserIcon,
  Trophy,
  Clock,
  AlertTriangle,
  Play,
  Clock3
} from "lucide-react";

export default function CustomFormPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [user, authLoading] = useAuthState(auth);
  
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [uploadingField, setUploadingField] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [userProfile, setUserProfileData] = useState(null);
  const [tempPhone, setTempPhone] = useState("");

  // Exam Specific States
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [timerPos, setTimerPos] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);

  // Scroll and Session Time States
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [deadlineTimeLeft, setDeadlineTimeLeft] = useState(null);
  const [counterPos, setCounterPos] = useState({ x: window.innerWidth - 150, y: window.innerHeight - 150 });
  const [isDraggingCounter, setIsDraggingCounter] = useState(false);

  const handleMouseDown = (e) => {
    setIsDragging(true);
  };

  const handleCounterMouseDown = (e) => {
    setIsDraggingCounter(true);
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging && !isDraggingCounter) return;
    
    // Support both mouse and touch events
    const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
    const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
    
    if (clientX === undefined || clientY === undefined) return;

    if (isDragging) {
      const newX = Math.max(0, Math.min(window.innerWidth - 130, clientX - 65));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, clientY - 50));
      setTimerPos({ x: newX, y: newY });
    } else if (isDraggingCounter) {
      const newX = Math.max(0, Math.min(window.innerWidth - 130, clientX - 65));
      const newY = Math.max(0, Math.min(window.innerHeight - 100, clientY - 50));
      setCounterPos({ x: newX, y: newY });
    }
  }, [isDragging, isDraggingCounter]);

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsDraggingCounter(false);
  };

  useEffect(() => {
    if (isDragging || isDraggingCounter) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isDraggingCounter, handleMouseMove]);

  // Scroll Progress Effect
  useEffect(() => {
    const handleScroll = () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      setScrollPercentage(Math.round(scrolled));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Session and Deadline Time Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
      
      if (form?.deadline) {
        const now = new Date().getTime();
        const deadline = new Date(form.deadline).getTime();
        const diff = deadline - now;
        setDeadlineTimeLeft(diff > 0 ? diff : 0);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [form?.deadline]);

  const formatDeadline = (ms) => {
    if (ms === null) return "";
    if (ms <= 0) return "সময় শেষ";
    
    const seconds = Math.floor(ms / 1000);
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (days > 0) return `${days} দিন ${hours} ঘণ্টা`;
    if (hours > 0) return `${hours} ঘণ্টা ${mins} মি.`;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    async function fetchForm() {
      try {
        const data = await getCustomFormBySlug(slug);
        if (!data) {
          setError("ফর্মটি খুঁজে পাওয়া যায়নি।");
        } else if (!data.active) {
          setError("এই ফর্মটি বর্তমানে বন্ধ আছে।");
        } else if (data.deadline && new Date() > new Date(data.deadline)) {
          setError("দুঃখিত, এই ফর্মটি সাবমিট করার সময়সীমা পার হয়ে গেছে।");
        } else {
          setForm(data);
          // Initialize form data
          const initialData = {};
          data.fields.forEach(field => {
            initialData[field.id] = "";
          });
          setFormData(initialData);
          
          if (data.duration) {
            setTimeLeft(data.duration * 60);
          }

          // Check if user has already submitted this form
          if (user) {
            const [submissions, profile] = await Promise.all([
              getFormSubmissions(data.id),
              getUserProfile(user.uid)
            ]);
            
            setUserProfileData(profile);
            if (profile?.phone) setTempPhone(profile.phone);

            const userSubmission = submissions.find(s => s.uid === user.uid);
            if (userSubmission) {
              setAlreadySubmitted(true);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching form:", err);
        setError("কিছু একটা সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [slug, user]);

  const handleSubmit = useCallback(async (isAuto = false) => {
    if (submitting || submitted) return;

    // Validate phone number if missing in profile
    if (!userProfile?.phone && !isAuto && (!tempPhone || tempPhone.trim().length < 11)) {
      alert("অনুগ্রহ করে একটি সঠিক মোবাইল নম্বর দিন।");
      return;
    }
    
    setSubmitting(true);
    try {
      // If phone was missing, update it in profile first
      if (!userProfile?.phone && tempPhone) {
        await setUserProfile(user.uid, { phone: tempPhone });
      }

      // Fetch user profile to get mobile number
      let fetchedProfile = null;
      try {
        fetchedProfile = await getUserProfile(user.uid);
      } catch (err) {
        console.error("Error fetching user profile for submission:", err);
      }

      // Calculate Quiz Result if category is exam
      let score = 0;
      let totalPoints = 0;
      let analysis = [];
      const isExam = form.category === "exam";

      if (isExam) {
        form.fields.forEach(field => {
          if (field.type === "mcq") {
            const userAnswer = parseInt(formData[field.id]);
            const isCorrect = userAnswer === field.correctAnswer;
            const points = field.points || 1;
            
            totalPoints += points;
            if (isCorrect) score += points;
            
            analysis.push({
              question: field.label,
              userAnswer: field.options[userAnswer],
              correctAnswer: field.options[field.correctAnswer],
              isCorrect,
              points: isCorrect ? points : 0,
              maxPoints: points
            });
          }
        });
        setQuizResult({ score, totalPoints, analysis });
      }

      await addFormSubmission(form.id, {
        ...formData,
        uid: user.uid,
        userName: fetchedProfile?.displayName || user.displayName || user.email,
        userPhone: fetchedProfile?.phone || tempPhone || user.phoneNumber || "",
        status: isExam ? "Completed" : "Pending",
        tabSwitches: tabSwitchCount,
        autoSubmitted: isAuto,
        ...(isExam ? { quizResult: { score, totalPoints, analysis } } : {})
      });
      setSubmitted(true);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error("Error submitting form:", err);
      if (!isAuto) alert("ফর্ম জমা দিতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setSubmitting(false);
    }
  }, [formData, form, user, submitting, submitted, tabSwitchCount]);

  // Timer Effect
  useEffect(() => {
    if (!examStarted || timeLeft === null || timeLeft <= 0 || submitted) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto submit on time up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft, submitted, handleSubmit]);

  // Tab Switch Detection
  useEffect(() => {
    if (!examStarted || submitted) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 3) {
            alert("সতর্কতা: আপনি ৩বার পেজ থেকে বের হয়েছেন। আপনার পরীক্ষাটি স্বয়ংক্রিয়ভাবে জমা দেওয়া হচ্ছে।");
            handleSubmit(true);
          } else {
            alert(`সতর্কতা: আপনি পরীক্ষা চলাকালীন পেজ থেকে বের হয়েছেন। (${newCount}/৩)`);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examStarted, submitted, handleSubmit]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Auto scroll to next field if it's MCQ
    const currentFieldIndex = form.fields.findIndex(f => f.id === fieldId);
    if (form.fields[currentFieldIndex].type === "mcq" && currentFieldIndex < form.fields.length - 1) {
      const nextField = document.querySelectorAll('form > div')[currentFieldIndex + 1];
      if (nextField) {
        setTimeout(() => {
          nextField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    }
  };

  const handleImageUpload = async (fieldId, file) => {
    if (!file) return;
    
    setUploadingField(fieldId);
    try {
      const url = await uploadImage(file);
      handleInputChange(fieldId, url);
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("ছবি আপলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    } finally {
      setUploadingField(null);
    }
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("ফর্ম জমা দেওয়ার জন্য আপনাকে অবশ্যই লগইন করতে হবে।");
      return;
    }
    
    // Validate required fields
    const missingFields = form.fields.filter(f => f.required && !formData[f.id]);
    if (missingFields.length > 0) {
      alert(`দয়া করে ${missingFields[0].label} পূরণ করুন।`);
      return;
    }

    handleSubmit(false);
  };

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      
      // Centralized sync with Firestore
      await syncUserWithFirestore(loggedUser);
    } catch (error) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("লগইন পপআপ ব্লক করা হয়েছে। দয়া করে আপনার ব্রাউজারের পপআপ সেটিং চেক করুন।");
      } else {
        alert("লগইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
      }
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)]">
        <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-[var(--bg-cream)] flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/20 mb-4">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tighter leading-none">
                আপনি ইতিমধ্যে জমা দিয়েছেন!
              </h2>
              <p className="text-sm md:text-base font-black text-black/40 uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
                এই ফর্মটি একবারই পূরণ করা সম্ভব। আপনি ইতিমধ্যে এটি সফলভাবে জমা দিয়েছেন। ধন্যবাদ!
              </p>
            </div>

            <div className="pt-8">
              <button 
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--accent-terracotta)] text-white rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:opacity-90 active:scale-95 shadow-2xl"
              >
                <ArrowLeft className="h-4 w-4" />
                হোম পেজে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] px-6">
        <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-white shadow-2xl shadow-red-500/20 mb-4">
            <AlertCircle className="h-10 w-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tighter leading-none">
              সমস্যা হয়েছে
            </h2>
            <p className="text-sm md:text-base font-black text-black/40 uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
              {error}
            </p>
          </div>
          <div className="pt-8">
            <button 
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--accent-terracotta)] text-white rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:opacity-90 active:scale-95 shadow-2xl"
            >
              <ArrowLeft className="h-4 w-4" /> ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    const isExam = form.category === "exam" && quizResult;
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] py-12 px-6 md:px-12 lg:px-20">
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-12">
            {isExam ? (
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="relative mx-auto h-24 w-24">
                    <div className="absolute inset-0 bg-green-500/10 rounded-full animate-ping" />
                    <div className="relative flex h-full w-full items-center justify-center bg-white rounded-full border-[3px] border-black shadow-2xl">
                      <Trophy className="h-10 w-10 text-black" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tighter leading-none">
                      পরীক্ষা সম্পন্ন হয়েছে!
                    </h2>
                    <div className="inline-flex items-center gap-4 px-8 py-3 bg-black text-white rounded-full text-2xl font-black shadow-2xl">
                      স্কোর: {quizResult.score} <span className="text-sm opacity-40">/ {quizResult.totalPoints}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-12 border-t-[3px] border-black space-y-8 text-left">
                  <h3 className="text-2xl font-black text-black uppercase tracking-tighter flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-black" /> কুইজ অ্যানালাইসিস
                  </h3>
                  <div className="grid gap-6">
                    {quizResult.analysis.map((item, idx) => (
                      <div key={idx} className={`group relative border-b-2 border-black/5 hover:bg-black/[0.01] transition-all pb-8 ${
                        item.isCorrect ? "border-green-500/10" : "border-red-500/10"
                      }`}>
                        <div className="flex items-start justify-between gap-6 mb-4">
                          <p className="text-lg md:text-xl font-black text-black leading-tight tracking-tight">
                            {String(idx + 1).padStart(2, '0')}. {item.question}
                          </p>
                          <span className={`shrink-0 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                            item.isCorrect ? "bg-black text-white" : "bg-red-600 text-white"
                          }`}>
                            {item.points} / {item.maxPoints}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-8 gap-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-30">আপনার উত্তর:</span>
                            <span className={`text-sm font-black ${item.isCorrect ? "text-green-600" : "text-red-600"}`}>
                              {item.userAnswer || "নেই"}
                            </span>
                          </div>
                          {!item.isCorrect && (
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest opacity-30">সঠিক উত্তর:</span>
                              <span className="text-sm font-black text-green-600">{item.correctAnswer}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl shadow-green-500/20 mb-4">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tighter leading-none">ধন্যবাদ!</h2>
                  <p className="text-sm md:text-base font-black text-black/40 uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
                    আপনার তথ্য সফলভাবে জমা দেওয়া হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                  </p>
                </div>
              </div>
            )}

            <div className="pt-8">
              <button 
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--accent-terracotta)] text-white rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:opacity-90 active:scale-95 shadow-2xl"
              >
                <ArrowLeft className="h-4 w-4" />
                হোম পেজে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] px-6">
        <div className="w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
          <div className="relative mx-auto h-24 w-24">
            <div className="absolute inset-0 bg-black/5 rounded-full animate-ping" />
            <div className="relative flex h-full w-full items-center justify-center bg-white rounded-full border-[3px] border-black shadow-2xl">
              <Lock className="h-10 w-10 text-black" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tighter leading-none">
              লগইন প্রয়োজন
            </h2>
            <p className="text-sm md:text-base font-black text-black/40 uppercase tracking-[0.2em] leading-relaxed max-w-md mx-auto">
              এই ফর্মটি পূরণ করার জন্য আপনাকে অবশ্যই আপনার অ্যাকাউন্টে লগইন করতে হবে।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button 
              onClick={handleLogin}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--accent-terracotta)] text-white rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:opacity-90 active:scale-95 shadow-2xl"
            >
              <UserIcon className="h-4 w-4" /> লগইন করুন
            </button>
            <button 
              onClick={() => navigate("/")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 bg-white text-black border-[3px] border-black rounded-full text-xs font-black uppercase tracking-[0.3em] transition-all hover:bg-black hover:text-white active:scale-95 shadow-2xl"
            >
              <ArrowLeft className="h-4 w-4" /> ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (form.category === "exam" && !examStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--bg-cream)] px-6 py-12">
        <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
          <div className="text-center space-y-6">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-black/5 mb-4">
              <Trophy className="h-10 w-10 text-black" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-black tracking-tighter uppercase leading-none">{form.title}</h1>
            <p className="text-[10px] md:text-xs font-black text-black/40 uppercase tracking-[0.4em]">কুইজ/পরীক্ষায় অংশগ্রহণের নিয়মাবলী</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] border-[3px] border-black bg-white hover:bg-black hover:text-white transition-all group">
              <Clock className="h-8 w-8 text-black group-hover:text-white" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">মোট সময়</p>
                <p className="text-2xl font-black">{form.duration || 0} মিনিট</p>
              </div>
            </div>
            <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] border-[3px] border-black bg-white hover:bg-black hover:text-white transition-all group">
              <AlertTriangle className="h-8 w-8 text-black group-hover:text-white" />
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest opacity-40">ট্যাব সতর্কতা</p>
                <p className="text-sm font-black uppercase tracking-tight">৩বারের বেশি ট্যাব পরিবর্তন করলে পরীক্ষা অটো-সাবমিট হবে।</p>
              </div>
            </div>
            {form.deadline && (
              <div className="flex flex-col gap-4 p-8 rounded-[2.5rem] border-[3px] border-black bg-white hover:bg-black hover:text-white transition-all group">
                <AlertCircle className="h-8 w-8 text-black group-hover:text-white" />
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-40">শেষ সময়</p>
                  <p className="text-sm font-black uppercase tracking-tight">{new Date(form.deadline).toLocaleString("bn-BD")}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-center pt-8">
            <button 
              onClick={() => setExamStarted(true)}
              className="inline-flex items-center justify-center gap-4 px-12 py-6 bg-[var(--accent-terracotta)] text-white rounded-full text-sm font-black uppercase tracking-[0.4em] transition-all hover:opacity-90 active:scale-95 shadow-2xl"
            >
              <Play className="h-5 w-5" /> পরীক্ষা শুরু করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-cream)] py-6 sm:py-12 px-0">
      {/* Moveable Floating Scroll Counter */}
      <div 
        style={{ 
          left: `${counterPos.x}px`, 
          top: `${counterPos.y}px`,
          touchAction: 'none'
        }}
        onMouseDown={handleCounterMouseDown}
        onTouchStart={handleCounterMouseDown}
        className={`fixed z-[100] cursor-move bg-white backdrop-blur-xl p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-2xl flex items-center gap-2 sm:gap-3 border-2 border-black transition-all active:scale-95 group ${isDraggingCounter ? 'opacity-80 scale-105 ring-4 ring-black/10' : 'animate-in zoom-in duration-500'}`}
      >
        <div className="flex flex-col items-center">
          <div className="relative h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx={window.innerWidth < 640 ? "16" : "20"}
                cy={window.innerWidth < 640 ? "16" : "20"}
                r={window.innerWidth < 640 ? "14" : "18"}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={window.innerWidth < 640 ? "3" : "4"}
                className="text-black/10"
              />
              <circle
                cx={window.innerWidth < 640 ? "16" : "20"}
                cy={window.innerWidth < 640 ? "16" : "20"}
                r={window.innerWidth < 640 ? "14" : "18"}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={window.innerWidth < 640 ? "3" : "4"}
                strokeDasharray={window.innerWidth < 640 ? 88 : 113}
                strokeDashoffset={(window.innerWidth < 640 ? 88 : 113) - ((window.innerWidth < 640 ? 88 : 113) * scrollPercentage) / 100}
                className="text-black transition-all duration-300"
              />
            </svg>
            <span className="text-[8px] sm:text-[10px] font-black text-black">{scrollPercentage}%</span>
          </div>
        </div>
        <div className="h-6 sm:h-8 w-px bg-black" />
        <div className="flex flex-col pr-1 sm:pr-2">
          <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-black">সময়</span>
          <span className="text-xs sm:text-sm font-black text-black tabular-nums">{formatTime(sessionTime)}</span>
        </div>

        {form?.deadline && (
          <>
            <div className="h-6 sm:h-8 w-px bg-black" />
            <div className="flex flex-col pr-1 sm:pr-2">
              <span className="text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-red-600">বাকি আছে</span>
              <span className={`text-xs sm:text-sm font-black tabular-nums ${deadlineTimeLeft < 3600000 ? 'text-red-500 animate-pulse' : 'text-black'}`}>
                {formatDeadline(deadlineTimeLeft)}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Moveable Floating Timer for Exams */}
      {form.category === "exam" && examStarted && (
        <div 
          style={{ 
            left: `${timerPos.x}px`, 
            top: `${timerPos.y}px`,
            touchAction: 'none'
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
          className={`fixed z-[100] cursor-move bg-black text-white p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] flex flex-col items-center justify-center gap-0.5 sm:gap-1 border-2 border-white min-w-[100px] sm:min-w-[120px] transition-transform active:scale-95 ${isDragging ? 'opacity-80 scale-105 ring-4 ring-white/20' : 'animate-in zoom-in duration-500'}`}
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-green-400'}`} />
            <span className={`text-lg sm:text-xl font-black font-mono tracking-tighter ${timeLeft < 60 ? 'text-red-500' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <div className="flex flex-col items-center opacity-100">
            <span className="text-[6px] sm:text-[7px] font-black uppercase tracking-widest leading-none">সময় বাকি</span>
            <div className="flex items-center gap-1 mt-0.5 sm:mt-1">
              <AlertTriangle className="h-1.5 w-1.5 sm:h-2 sm:w-2" />
              <span className="text-[6px] sm:text-[7px] font-black uppercase">{tabSwitchCount}/৩</span>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto pt-6 sm:pt-10">
        {/* Form Header */}
        <div className="mb-8 sm:mb-10 text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-white shadow-sm border border-black mb-3 sm:mb-4">
            <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[var(--accent-terracotta)] animate-pulse" />
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-black">
              {form.category === "exam" ? "Novo Exam Portal" : "Novo Cultur Form"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-black mb-3 sm:mb-4 tracking-tight px-2">
            {form.title}
          </h1>
          
          {form.deadline && (
            <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-base font-black text-red-500 uppercase tracking-widest animate-pulse mt-4">
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-xl border border-red-100 shadow-sm">
                <Clock3 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>শেষ সময়: {new Date(form.deadline).toLocaleString("bn-BD", { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              </div>
            </div>
          )}
          
          <div className="h-1 w-12 sm:h-1.5 sm:w-20 bg-[var(--accent-terracotta)] mx-auto rounded-full mt-3 sm:mt-4" />
        </div>

        {/* Form Body - Cardless & Simple */}
        <div className="w-full py-4 sm:py-8">
          <form onSubmit={onFormSubmit} className="space-y-12 sm:space-y-16">
            {form.fields.map((field, idx) => (
              <div key={field.id} className="flex flex-col sm:flex-row sm:items-start sm:gap-8 px-4 sm:px-6">
                {/* Left Side: Question Title */}
                <div className="sm:w-1/3 space-y-2 mb-4 sm:mb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-black text-white text-[10px] sm:text-xs font-black shrink-0">
                      {idx + 1}
                    </span>
                    <label className="text-lg sm:text-xl font-black text-black uppercase tracking-[0.1em] break-words">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                  </div>
                </div>
                
                {/* Right Side: Input Fields */}
                <div className="sm:w-2/3">
                  {field.type === "text" ? (
                    <input
                      type="text"
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300 placeholder:text-black/40"
                      placeholder={field.label}
                    />
                  ) : field.type === "mcq" ? (
                    <div className="grid gap-2 sm:gap-3">
                      {field.options.map((option, optIdx) => (
                        <label 
                          key={optIdx} 
                          className={`
                            relative flex items-center gap-3 sm:gap-4 p-4 sm:p-5 cursor-pointer transition-all w-full rounded-2xl border-2
                            ${formData[field.id] === optIdx.toString() 
                              ? "bg-black text-white border-black" 
                              : "bg-white border-black hover:border-black"
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name={field.id}
                            value={optIdx}
                            checked={formData[field.id] === optIdx.toString()}
                            onChange={() => handleInputChange(field.id, optIdx.toString())}
                            className="hidden"
                            required={field.required}
                          />
                          <div className={`
                            h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0
                            ${formData[field.id] === optIdx.toString() ? "border-white bg-white" : "border-black"}
                          `}>
                            {formData[field.id] === optIdx.toString() && <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-black" />}
                          </div>
                          <span className="text-base sm:text-lg font-bold break-words leading-tight">{option}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      rows={1}
                      className="w-full bg-transparent border-b-2 border-black focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300 resize-none min-h-[80px] sm:min-h-[100px] placeholder:text-black/40"
                      placeholder={field.label}
                    />
                  ) : field.type === "email" ? (
                    <input
                      type="email"
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300 placeholder:text-black/40"
                      placeholder="example@email.com"
                    />
                  ) : field.type === "phone" ? (
                    <input
                      type="tel"
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300 placeholder:text-black/40"
                      placeholder="01XXXXXXXXX"
                    />
                  ) : field.type === "date" ? (
                    <input
                      type="date"
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300"
                    />
                  ) : field.type === "time" ? (
                    <input
                      type="time"
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300"
                    />
                  ) : field.type === "number" ? (
                    <input
                      type="number"
                      required={field.required}
                      value={formData[field.id] || ""}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      className="w-full bg-transparent border-b-2 border-black focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300 placeholder:text-black/40"
                      placeholder="সংখ্যা লিখুন"
                    />
                  ) : field.type === "image" ? (
                    <div className="relative pt-2">
                      {formData[field.id] ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-black group w-full">
                          <img 
                            src={formData[field.id]} 
                            alt="Uploaded" 
                            className="w-full h-40 sm:h-64 object-cover transition duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer bg-white text-black px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-[10px] sm:text-xs font-black flex items-center gap-2">
                              <Upload className="h-3 w-3 sm:h-4 sm:w-4" /> পরিবর্তন করুন
                              <input 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={(e) => handleImageUpload(field.id, e.target.files[0])}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className={`
                          flex flex-col items-center justify-center w-full h-40 sm:h-56 
                          bg-white border-2 border-dashed border-black 
                          rounded-2xl cursor-pointer transition-all duration-300
                          hover:bg-black/5
                          ${uploadingField === field.id ? 'opacity-50 pointer-events-none' : ''}
                        `}>
                          {uploadingField === field.id ? (
                            <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-black" />
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-black mb-2 sm:mb-3" />
                              <span className="text-xs sm:text-sm font-black text-black uppercase tracking-widest text-center px-4">ছবি আপলোড করুন</span>
                            </>
                          )}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(field.id, e.target.files[0])}
                            required={field.required && !formData[field.id]}
                          />
                        </label>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {/* Phone Number Field if missing in profile */}
            {!userProfile?.phone && (
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-8 px-4 sm:px-6 pt-12 border-t-2 border-black/10">
                <div className="sm:w-1/3 space-y-2 mb-4 sm:mb-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-orange-500 text-white text-[10px] sm:text-xs font-black shrink-0">
                      !
                    </span>
                    <label className="text-lg sm:text-xl font-black text-orange-600 uppercase tracking-[0.1em] break-words">
                      মোবাইল নম্বর *
                    </label>
                  </div>
                  <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest pl-11">যোগাযোগের জন্য এটি আবশ্যক</p>
                </div>
                <div className="sm:w-2/3">
                  <input
                    type="tel"
                    required
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-orange-500 focus:border-black py-2 sm:py-3 text-lg sm:text-2xl font-bold text-black outline-none transition-all duration-300 placeholder:text-black/20"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
            )}

            <div className="px-4 sm:px-6">
              <button
                type="submit"
                disabled={submitting || !!uploadingField}
                className={`
                  w-full mt-8 sm:mt-12 py-5 sm:py-6 bg-black text-white rounded-xl sm:rounded-2xl 
                  font-black tracking-[0.2em] sm:tracking-[0.3em] uppercase transition-all duration-500
                  flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-black/10
                  hover:bg-black/90 active:scale-[0.98] disabled:opacity-50
                  text-lg sm:text-2xl
                `}
              >
                {submitting ? (
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin" />
                ) : (
                  <>
                    <Send className="h-4 w-4 sm:h-6 sm:w-6" /> {form.category === "exam" ? "পরীক্ষা জমা দিন" : "জমা দিন"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
        
        <p className="mt-20 text-center text-[10px] font-black text-black uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} NOVO CULTUR. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}
