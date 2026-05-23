import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { 
  LogOut, User, Mail, Shield, Phone, MapPin, 
  Briefcase, Calendar, Info, CheckCircle2, 
  Globe, Save, Loader2, Camera, Upload, Heart,
  MessageSquare, AlertCircle, Clock3, Tag,
  ClipboardList, Trophy, Clock, ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  getUserProfile, 
  setUserProfile, 
  getDonations, 
  getContactMessages,
  getUserFormSubmissions,
  getCustomForms,
  syncUserWithFirestore
} from "../services/firestore";
import { uploadImage } from "../services/imageUpload";

function ProfilePage() {
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [donations, setDonations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [formSubmissions, setFormSubmissions] = useState([]);
  const [customForms, setCustomForms] = useState({});
  const [profileData, setProfileData] = useState({
    displayName: "",
    photoURL: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
    occupation: "",
    dob: "",
    gender: "",
    fatherName: "",
    motherName: "",
    bloodGroup: "",
    institution: "",
    nid: "",
    facebook: "",
    twitter: "",
    instagram: ""
  });
  
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "profile";

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/");
      return;
    }

    async function loadProfile() {
      console.log("Loading profile for UID:", user.uid);
      try {
        // Use syncUserWithFirestore to ensure basic data is always up-to-date
        const profile = await syncUserWithFirestore(user);
        console.log("Synced profile:", profile);

        if (profile) {
          setProfileData(prev => ({
            ...prev,
            ...profile,
            displayName: profile.displayName || prev.displayName || "",
            photoURL: profile.photoURL || prev.photoURL || "",
            email: profile.email || prev.email || "",
          }));
        }

        // Load other data separately so they don't block the profile if they fail
        const [donationsData, messagesData, submissionsData, formsData] = await Promise.all([
          getDonations(user.uid),
          getContactMessages(user.uid),
          getUserFormSubmissions(user.uid),
          getCustomForms()
        ]);
        
        setDonations(donationsData);
        setMessages(messagesData);
        setFormSubmissions(submissionsData);
        
        // Map form IDs to their data for easier display
        const formsMap = {};
        formsData.forEach(f => formsMap[f.id] = f);
        setCustomForms(formsMap);

      } catch (err) {
        console.error("Error in loadProfile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    try {
      const url = await uploadImage(file, (progress) => {
        setUploadProgress(progress);
      });
      setProfileData(prev => ({ ...prev, photoURL: url }));
      alert("ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.message || "ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    console.log("Saving profile data:", profileData);
    try {
      // Ensure we have a consistent email and UID reference
      const dataToSave = {
        ...profileData,
        email: user.email,
        updatedAt: new Date().toISOString()
      };
      await setUserProfile(user.uid, dataToSave);
      alert("প্রোফাইল সফলভাবে আপডেট করা হয়েছে!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("প্রোফাইল আপডেট করতে সমস্যা হয়েছে।");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const calculateCompletion = () => {
    const fields = [
      "displayName", "phone", "address", "bio", 
      "occupation", "dob", "gender", "facebook", 
      "twitter", "instagram", "fatherName", 
      "motherName", "bloodGroup", "institution", "nid"
    ];
    const filledFields = fields.filter(field => {
      const val = profileData[field];
      if (val === undefined || val === null) return false;
      return String(val).trim() !== "";
    });
    return Math.round((filledFields.length / fields.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent-terracotta)] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  const completion = calculateCompletion();
  const isPhoneMissing = !profileData.phone || profileData.phone.trim() === "";

  return (
    <div className="min-h-screen w-full bg-[var(--bg-cream)]">
      {/* Phone Number Required Warning */}
      {isPhoneMissing && (
        <div className="w-full bg-orange-500 py-3 px-4 flex items-center justify-center gap-3 animate-pulse">
          <AlertCircle className="h-5 w-5 text-white" />
          <p className="text-xs sm:text-sm font-black text-white uppercase tracking-widest">
            অনুগ্রহ করে আপনার মোবাইল নম্বরটি প্রোফাইলে যোগ করুন। এটি আবেদনের জন্য প্রয়োজন।
          </p>
        </div>
      )}

      {/* Profile Header - Full Width */}
      <div className="w-full bg-white/50 px-6 py-12 md:px-12 lg:px-20">
        <div className="w-full">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative group/avatar">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-black shadow-xl bg-white relative">
                  {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt={profileData.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-black/5 text-black">
                      <User className="h-16 w-16" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                      <div className="relative h-16 w-16 mb-2">
                        <svg className="h-full w-full" viewBox="0 0 36 36">
                          <path
                            className="text-white/20"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-white transition-all duration-300 ease-out"
                            strokeDasharray={`${uploadProgress}, 100`}
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-white">{uploadProgress}%</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest animate-pulse">
                        {uploadProgress < 15 ? "Converting..." : "Uploading..."}
                      </span>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 h-10 w-10 bg-black rounded-full border-4 border-white flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform active:scale-95">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {completion === 100 && (
                  <div className="absolute -left-2 -top-2 rounded-full bg-black p-1.5 text-white shadow-lg border-2 border-white">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-black text-black uppercase tracking-tight">
                  {profileData.displayName || "ব্যবহারকারী"}
                </h1>
                <p className="mt-1 text-lg text-black/40 font-bold uppercase tracking-widest">{user.email}</p>
                
                {/* Profile Completion Bar */}
                <div className="mt-4 w-64 md:w-80">
                  <div className="mb-2 flex justify-between text-[10px] font-black text-black uppercase tracking-widest">
                    <span>প্রোফাইল সম্পন্ন</span>
                    <span>{completion}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-black/10">
                    <div 
                      className="h-2 rounded-full bg-black transition-all duration-500 shadow-sm" 
                      style={{ width: `${completion}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex w-full sm:w-auto items-center gap-2 sm:gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 rounded-full bg-[var(--accent-terracotta)] px-10 py-5 text-xs font-black text-white shadow-2xl transition hover:opacity-90 disabled:opacity-70 border-2 border-[var(--accent-terracotta)] uppercase tracking-widest"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="whitespace-nowrap">সংরক্ষণ করুন</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none flex items-center justify-center gap-3 rounded-full border-2 border-black bg-white px-10 py-5 text-xs font-black text-black transition hover:bg-black hover:text-white uppercase tracking-widest"
              >
                <LogOut className="h-4 w-4" />
                <span className="whitespace-nowrap">লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-white border-b-2 border-black sticky top-0 z-10 overflow-x-auto scrollbar-hide">
        <div className="w-full px-6 md:px-12 lg:px-20 flex items-center justify-center sm:justify-start gap-4 sm:gap-8 h-16">
          {[
            { id: "profile", label: "প্রোফাইল", icon: User },
            { id: "messages", label: "বার্তার ইতিহাস", icon: MessageSquare, color: "orange" },
            { id: "donations", label: "অনুদানের ইতিহাস", icon: Heart, color: "orange" },
            { id: "submissions", label: "আবেদনের ইতিহাস", icon: ClipboardList, color: "orange" }
          ].map((tab) => (
            <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                  activeTab === tab.id
                    ? (tab.color === "orange" 
                        ? "bg-orange-600 text-white border-orange-600 shadow-xl scale-105" 
                        : "bg-[var(--accent-terracotta)] text-white border-[var(--accent-terracotta)] shadow-xl scale-105")
                    : (tab.color === "orange"
                        ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                        : "text-black/40 border-transparent hover:text-black hover:border-black/10")
                }`}
              >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Content - Full Width Layout, Cardless */}
      <div className={`w-full py-16 ${activeTab === "submissions" ? "" : "px-6 md:px-12 lg:px-20"}`}>
        <div className={`mx-auto ${activeTab === "submissions" ? "w-full" : "max-w-7xl"}`}>
          {activeTab === "profile" && (
            <div className="grid gap-12 lg:grid-cols-2 animate-in fade-in duration-500">
              {/* Left Column: Personal Info */}
              <div className="space-y-10">
                <section>
                  <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-black uppercase tracking-tight">
                    <Info className="h-5 w-5 text-black" />
                    ব্যক্তিগত তথ্য
                  </h2>
                  <div className="space-y-6">
                    <div className="group">
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                        পুরো নাম
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        value={profileData.displayName}
                        onChange={handleInputChange}
                        placeholder="আপনার নাম লিখুন"
                        className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                      />
                    </div>

                    <div className="group">
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                        প্রোফাইল ছবির লিঙ্ক (Photo URL)
                      </label>
                      <input
                        type="url"
                        name="photoURL"
                        value={profileData.photoURL}
                        onChange={handleInputChange}
                        placeholder="আপনার ছবির লিঙ্ক দিন"
                        className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                      />
                    </div>

                    <div className="group">
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                        ইমেইল (পরিবর্তনযোগ্য নয়)
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        readOnly
                        className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black opacity-40 outline-none"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          ফোন নম্বর
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleInputChange}
                          placeholder="আপনার ফোন নম্বর"
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          পেশা
                        </label>
                        <input
                          type="text"
                          name="occupation"
                          value={profileData.occupation}
                          onChange={handleInputChange}
                          placeholder="আপনার পেশা"
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                    </div>

                    <div className="group">
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                        শিক্ষা প্রতিষ্ঠান / কর্মস্থল
                      </label>
                      <input
                        type="text"
                        name="institution"
                        value={profileData.institution}
                        onChange={handleInputChange}
                        placeholder="আপনার প্রতিষ্ঠান বা সংগঠনের নাম"
                        className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                      />
                    </div>

                    <div className="group">
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                        আপনার সম্পর্কে
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder="আপনার সম্পর্কে কিছু বলুন..."
                        className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10 resize-none"
                      ></textarea>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-black uppercase tracking-tight">
                    <User className="h-5 w-5 text-black" />
                    পারিবারিক ও পরিচয়পত্র
                  </h2>
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          পিতার নাম
                        </label>
                        <input
                          type="text"
                          name="fatherName"
                          value={profileData.fatherName}
                          onChange={handleInputChange}
                          placeholder="আপনার পিতার নাম"
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          মাতার নাম
                        </label>
                        <input
                          type="text"
                          name="motherName"
                          value={profileData.motherName}
                          onChange={handleInputChange}
                          placeholder="আপনার মাতার নাম"
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          রক্তের গ্রুপ
                        </label>
                        <select
                          name="bloodGroup"
                          value={profileData.bloodGroup}
                          onChange={handleInputChange}
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)]"
                        >
                          <option value="" className="bg-white text-black">নির্বাচন করুন</option>
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                            <option key={group} value={group} className="bg-white text-black">{group}</option>
                          ))}
                        </select>
                      </div>
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          এনআইডি / জন্ম নিবন্ধন নম্বর
                        </label>
                        <input
                          type="text"
                          name="nid"
                          value={profileData.nid}
                          onChange={handleInputChange}
                          placeholder="NID বা জন্ম নিবন্ধন নম্বর"
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-black uppercase tracking-tight">
                    <MapPin className="h-5 w-5 text-black" />
                    ঠিকানা ও অন্যান্য
                  </h2>
                  <div className="space-y-6">
                    <div className="group">
                      <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                        পূর্ণ ঠিকানা
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={profileData.address}
                        onChange={handleInputChange}
                        placeholder="আপনার ঠিকানা লিখুন"
                        className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          জন্ম তারিখ
                        </label>
                        <input
                          type="date"
                          name="dob"
                          value={profileData.dob}
                          onChange={handleInputChange}
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)]"
                        />
                      </div>
                      <div className="group">
                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-black/40 transition-colors group-focus-within:text-black">
                          লিঙ্গ
                        </label>
                        <select
                          name="gender"
                          value={profileData.gender}
                          onChange={handleInputChange}
                          className="w-full border-b-2 border-black bg-transparent py-2 text-base font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)]"
                        >
                          <option value="" className="bg-white text-black">নির্বাচন করুন</option>
                          <option value="পুরুষ" className="bg-white text-black">পুরুষ</option>
                          <option value="মহিলা" className="bg-white text-black">মহিলা</option>
                          <option value="অন্যান্য" className="bg-white text-black">অন্যান্য</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Right Column: Social Links & Account Info */}
              <div className="space-y-10">
                <section>
                  <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-black uppercase tracking-tight">
                    <Shield className="h-5 w-5 text-black" />
                    সামাজিক যোগাযোগ মাধ্যম
                  </h2>
                  <div className="space-y-6">
                    <div className="group flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-all group-focus-within:scale-110 border-2 border-black shadow-lg">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-black/40">Facebook Profile Link</label>
                        <input
                          type="url"
                          name="facebook"
                          value={profileData.facebook}
                          onChange={handleInputChange}
                          placeholder="https://facebook.com/yourprofile"
                          className="w-full border-b-2 border-black bg-transparent py-1.5 text-sm font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                    </div>

                    <div className="group flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-all group-focus-within:scale-110 border-2 border-black shadow-lg">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-black/40">Twitter Profile Link</label>
                        <input
                          type="url"
                          name="twitter"
                          value={profileData.twitter}
                          onChange={handleInputChange}
                          placeholder="https://twitter.com/yourprofile"
                          className="w-full border-b-2 border-black bg-transparent py-1.5 text-sm font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                    </div>

                    <div className="group flex items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white transition-all group-focus-within:scale-110 border-2 border-black shadow-lg">
                        <Globe className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <label className="mb-1 block text-[10px] font-black uppercase tracking-widest text-black/40">Instagram Profile Link</label>
                        <input
                          type="url"
                          name="instagram"
                          value={profileData.instagram}
                          onChange={handleInputChange}
                          placeholder="https://instagram.com/yourprofile"
                          className="w-full border-b-2 border-black bg-transparent py-1.5 text-sm font-black text-black outline-none transition-all focus:border-[var(--accent-terracotta)] placeholder:text-black/10"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <div className="rounded-[2.5rem] bg-black p-10 border-2 border-black text-white shadow-2xl">
                  <h3 className="mb-6 text-xl font-black uppercase tracking-tight">একাউন্ট স্ট্যাটাস</h3>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-black shadow-xl">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black uppercase tracking-widest text-sm">সক্রিয় (Active)</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">আপনার একাউন্টটি বর্তমানে সচল আছে।</p>
                      </div>
                    </div>
                    
                    {profileData.role && (
                      <div className="flex items-center gap-4 pt-4 border-t-2 border-[var(--accent-terracotta)]/10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-terracotta)] text-white shadow-lg shadow-[var(--accent-terracotta)]/20">
                          <Shield className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-black">রোল (Role)</p>
                          <p className="text-sm text-black uppercase tracking-widest font-black">{profileData.role}</p>
                        </div>
                      </div>
                    )}

                    {profileData.joinedAt && (
                      <div className="flex items-center gap-4 pt-4 border-t-2 border-[var(--accent-terracotta)]/10">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)]">
                          <Calendar className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-black">যোগদানের তারিখ</p>
                          <p className="text-sm text-black opacity-60">
                            {new Date(profileData.joinedAt).toLocaleDateString("bn-BD")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Contents: History Sections */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "donations" && (
              <div className="w-full">
                <div className="px-6 md:px-12 lg:px-20 mb-8 md:mb-12">
                  <h2 className="flex items-center gap-4 text-3xl md:text-4xl font-black text-black uppercase tracking-tighter">
                    <Heart className="h-8 w-8 md:h-10 md:w-10 text-black" />
                    অনুদানের ইতিহাস
                  </h2>
                </div>
                
                {donations.length > 0 ? (
                  <div className="w-full">
                    {/* Desktop Header */}
                    <div className="hidden lg:grid grid-cols-12 gap-6 px-20 py-6 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] sticky top-16 z-10">
                      <div className="col-span-1 whitespace-nowrap">নং</div>
                      <div className="col-span-3 whitespace-nowrap">তহবিলের ধরণ</div>
                      <div className="col-span-2 whitespace-nowrap">তারিখ</div>
                      <div className="col-span-2 whitespace-nowrap">পরিমাণ</div>
                      <div className="col-span-2 whitespace-nowrap">মোবাইল</div>
                      <div className="col-span-2 text-right whitespace-nowrap">অবস্থা</div>
                    </div>

                    {donations.map((donation, index) => (
                      <div 
                        key={donation.id} 
                        className="group relative border-b border-black/5 hover:bg-black/[0.01] transition-all p-4 md:p-8 lg:p-0"
                      >
                        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-center lg:px-20 lg:py-8">
                          {/* Mobile Header */}
                          <div className="flex items-center justify-between mb-3 lg:hidden">
                            <span className="text-[10px] font-black text-black">
                              {String(index + 1).padStart(2, '0')}.
                            </span>
                            <div className="scale-[0.65] origin-right">
                              <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border-2 shadow-sm ${
                                donation.status === "Success" ? "bg-black text-white border-black" : 
                                (donation.status === "Pending" || !donation.status) ? "bg-white text-black border-black" : 
                                "bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/10"
                              }`}>
                                {donation.status === "Success" ? "সফল" : 
                                 (donation.status === "Pending" || !donation.status) ? "অপেক্ষমান" : "ব্যর্থ"}
                              </span>
                            </div>
                          </div>

                          {/* Serial - Desktop */}
                          <div className="hidden lg:block lg:col-span-1">
                            <div className="text-[10px] font-black text-black/20 group-hover:text-black transition-colors">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                          </div>

                          {/* Fund */}
                          <div className="lg:col-span-3">
                            <h3 className="text-sm md:text-base lg:text-lg font-black text-black leading-tight tracking-tight group-hover:text-[var(--accent-terracotta)] transition-colors truncate">
                              {donation.fund}
                            </h3>
                          </div>

                          {/* Date */}
                          <div className="lg:col-span-2">
                            <div className="text-[10px] font-black text-black uppercase tracking-tight whitespace-nowrap">
                              {new Date(donation.date).toLocaleDateString("bn-BD")}
                            </div>
                          </div>

                          {/* Amount */}
                          <div className="lg:col-span-2">
                            <div className="text-base lg:text-xl font-black text-black tracking-tighter">
                              ৳{donation.amount}
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="lg:col-span-2">
                            <div className="text-[10px] font-black text-black/40 uppercase tracking-widest whitespace-nowrap">
                              {donation.phone}
                            </div>
                          </div>

                          {/* Status - Desktop */}
                          <div className="hidden lg:block lg:col-span-2 text-right">
                            <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-[8px] font-black uppercase tracking-widest border-2 transition-all ${
                              donation.status === "Success" ? "bg-black text-white border-black" : 
                              (donation.status === "Pending" || !donation.status) ? "bg-white text-black border-black" : 
                              "bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/10"
                            }`}>
                              {donation.status === "Success" ? "সফল" : 
                               (donation.status === "Pending" || !donation.status) ? "অপেক্ষমান" : "ব্যর্থ"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 md:px-12 lg:px-20 py-20 text-center">
                    <Heart className="mx-auto h-16 w-16 text-black/5 mb-6" />
                    <p className="text-xl font-black text-black/20 uppercase tracking-widest mb-8">আপনি এখনো কোনো অনুদান দেননি।</p>
                    <Link to="/donation" className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-10 py-4 text-[10px] font-black text-white hover:opacity-90 transition-all uppercase tracking-widest shadow-2xl">
                      এখনই অনুদান দিন
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="w-full">
                <div className="px-6 md:px-12 lg:px-20 mb-8 md:mb-12">
                  <h2 className="flex items-center gap-4 text-3xl md:text-4xl font-black text-black uppercase tracking-tighter">
                    <MessageSquare className="h-8 w-8 md:h-10 md:w-10 text-black" />
                    বার্তার ইতিহাস
                  </h2>
                </div>
                
                {messages.length > 0 ? (
                  <div className="w-full">
                    {/* Desktop Header */}
                    <div className="hidden lg:grid grid-cols-12 gap-6 px-20 py-6 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] sticky top-16 z-10">
                      <div className="col-span-1 whitespace-nowrap">নং</div>
                      <div className="col-span-2 whitespace-nowrap">তারিখ</div>
                      <div className="col-span-4 whitespace-nowrap">আপনার বার্তা</div>
                      <div className="col-span-3 whitespace-nowrap">এডমিন উত্তর</div>
                      <div className="col-span-2 text-right whitespace-nowrap">স্ট্যাটাস</div>
                    </div>

                    {messages.map((msg, index) => (
                      <div 
                        key={msg.id} 
                        className="group relative border-b border-black/5 hover:bg-black/[0.01] transition-all p-4 md:p-8 lg:p-0"
                      >
                        <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-center lg:px-20 lg:py-8">
                          {/* Mobile Header */}
                          <div className="flex items-center justify-between mb-3 lg:hidden">
                            <span className="text-[10px] font-black text-black">
                              {String(index + 1).padStart(2, '0')}.
                            </span>
                            <div className="scale-[0.65] origin-right">
                              {msg.response ? (
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-[10px] font-black uppercase tracking-widest shadow-lg">
                                  <CheckCircle2 className="h-3 w-3" />
                                  সম্পন্ন
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-black uppercase tracking-widest border-2 border-black">
                                  <Clock3 className="h-3 w-3" />
                                  অপেক্ষমান
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Serial - Desktop */}
                          <div className="hidden lg:block lg:col-span-1">
                            <div className="text-[10px] font-black text-black/20 group-hover:text-black transition-colors">
                              {String(index + 1).padStart(2, '0')}
                            </div>
                          </div>

                          {/* Date */}
                          <div className="lg:col-span-2">
                            <div className="text-[10px] font-black text-black uppercase tracking-tight whitespace-nowrap">
                              {new Date(msg.date).toLocaleDateString("bn-BD")}
                            </div>
                          </div>

                          {/* User Message */}
                          <div className="lg:col-span-4">
                            <p className="text-sm font-bold text-black leading-relaxed italic line-clamp-2 pr-4">
                              "{msg.message}"
                            </p>
                          </div>

                          {/* Admin Response */}
                          <div className="lg:col-span-3">
                            {msg.response ? (
                              <p className="text-sm font-black text-black leading-relaxed line-clamp-2">
                                {msg.response}
                              </p>
                            ) : (
                              <p className="text-[10px] font-black text-black/20 uppercase tracking-widest italic">অপেক্ষমান...</p>
                            )}
                          </div>

                          {/* Status - Desktop */}
                          <div className="hidden lg:block lg:col-span-2 text-right">
                            {msg.response ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-black text-white text-[8px] font-black uppercase tracking-widest shadow-xl">
                                <CheckCircle2 className="h-3 w-3" />
                                সম্পন্ন
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-black text-[8px] font-black uppercase tracking-widest border-2 border-black">
                                <Clock3 className="h-3 w-3" />
                                অপেক্ষমান
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 md:px-12 lg:px-20 py-20 text-center">
                    <MessageSquare className="mx-auto h-16 w-16 text-black/5 mb-6" />
                    <p className="text-xl font-black text-black/20 uppercase tracking-widest mb-8">আপনি এখনো কোনো বার্তা পাঠাননি।</p>
                    <Link to="/contact" className="inline-flex items-center gap-3 rounded-full bg-orange-500 px-10 py-4 text-[10px] font-black text-white hover:opacity-90 transition-all uppercase tracking-widest shadow-2xl">
                      আমাদের সাথে যোগাযোগ করুন
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "submissions" && (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="px-6 md:px-12 lg:px-20 mb-8 md:mb-12">
                  <h2 className="flex items-center gap-4 text-3xl md:text-4xl font-black text-black uppercase tracking-tighter">
                    <ClipboardList className="h-8 w-8 md:h-10 md:w-10 text-black" />
                    আবেদনের ইতিহাস ও রেজাল্ট
                  </h2>
                </div>
                
                {formSubmissions.length > 0 ? (
                  <div className="w-full">
                    {/* Desktop Header - Minimal & Professional */}
                    <div className="hidden lg:grid grid-cols-12 gap-6 px-20 py-6 bg-black text-white text-[9px] font-black uppercase tracking-[0.3em] sticky top-16 z-10">
                      <div className="col-span-1 whitespace-nowrap">নং</div>
                      <div className="col-span-4 whitespace-nowrap">প্রোগ্রাম / আবেদনের নাম</div>
                      <div className="col-span-2 whitespace-nowrap">তারিখ ও সময়</div>
                      <div className="col-span-3 whitespace-nowrap">ফলাফল / স্ট্যাটাস</div>
                      <div className="col-span-2 text-right whitespace-nowrap">অ্যাকশন</div>
                    </div>

                    {formSubmissions.map((sub, index) => {
                      const formInfo = customForms[sub.formId];
                      const title = formInfo?.title || "অজানা আবেদন";
                      const isExam = formInfo?.category === "exam";
                      const score = sub.data?.quizResult || sub.quizResult;
                      
                      return (
                        <div 
                          key={sub.id} 
                          className="group relative border-b border-black/5 hover:bg-black/[0.01] transition-all p-4 md:p-8 lg:p-0"
                        >
                          {/* Main Row */}
                          <div className="lg:grid lg:grid-cols-12 lg:gap-6 lg:items-center lg:px-20 lg:py-8">
                            
                            {/* Mobile/Tablet Header Row - Compact */}
                            <div className="flex items-center justify-between mb-3 lg:hidden">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-black">
                                  {String(index + 1).padStart(2, '0')}.
                                </span>
                                <span className="text-[8px] font-black text-black/20 uppercase tracking-tighter">
                                  #{sub.id.substring(0, 6)}
                                </span>
                              </div>
                              <div className="scale-[0.65] origin-right">
                                <StatusBadge status={sub.status} />
                              </div>
                            </div>

                            {/* Serial - Desktop Only */}
                            <div className="hidden lg:block lg:col-span-1">
                              <div className="text-[10px] font-black text-black/20 group-hover:text-black transition-colors">
                                {String(index + 1).padStart(2, '0')}
                              </div>
                            </div>

                            {/* Title & Info */}
                            <div className="lg:col-span-4 space-y-1">
                              <h3 className="text-sm md:text-base lg:text-lg font-black text-black leading-tight tracking-tight group-hover:text-[var(--accent-terracotta)] transition-colors truncate">
                                {title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-2 lg:hidden">
                                <div className="text-[7px] font-black text-black/40 uppercase tracking-wider whitespace-nowrap">
                                  {new Date(sub.created_at).toLocaleDateString("bn-BD")}
                                </div>
                                <div className="text-[7px] font-black text-black/40 uppercase tracking-wider whitespace-nowrap border-l border-black/10 pl-2">
                                  {new Date(sub.created_at).toLocaleTimeString("bn-BD")}
                                </div>
                              </div>
                            </div>

                            {/* Date - Desktop Only */}
                            <div className="hidden lg:block lg:col-span-2">
                              <div className="space-y-0.5">
                                <div className="text-[10px] font-black text-black uppercase tracking-tight whitespace-nowrap">
                                  {new Date(sub.created_at).toLocaleDateString("bn-BD")}
                                </div>
                                <div className="text-[8px] font-black text-black/20 uppercase tracking-tight whitespace-nowrap">
                                  {new Date(sub.created_at).toLocaleTimeString("bn-BD")}
                                </div>
                              </div>
                            </div>

                            {/* Result / Score */}
                            <div className="lg:col-span-3 mt-3 lg:mt-0">
                              <div className="flex items-center justify-between lg:justify-start lg:gap-3">
                                <div className="hidden lg:block scale-[0.7] origin-left">
                                  <StatusBadge status={sub.status} />
                                </div>
                                {isExam && score ? (
                                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-black/5 lg:bg-transparent border border-black/5 lg:border-0">
                                    <Trophy className="h-3 w-3 text-black/30" />
                                    <span className="text-sm lg:text-base font-black tracking-tighter whitespace-nowrap">
                                      {score.score}<span className="text-[10px] opacity-20 mx-0.5">/</span>{score.totalPoints}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 opacity-30">
                                    <Info className="h-3 w-3" />
                                    <span className="text-[8px] font-black uppercase tracking-widest whitespace-nowrap">প্রক্রিয়াধীন</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action */}
                            <div className="lg:col-span-2 mt-4 lg:mt-0">
                              <button 
                                disabled={!formInfo?.slug}
                                onClick={() => formInfo?.slug && navigate(`/f/${formInfo.slug}`)}
                                className={`w-full lg:w-auto lg:px-6 flex items-center justify-center gap-1.5 py-2 lg:py-2.5 rounded-lg border font-black uppercase tracking-widest transition-all ${
                                  formInfo?.slug 
                                  ? "bg-orange-500 text-white border-orange-500 hover:opacity-90 active:scale-95 shadow-lg" 
                                  : "bg-black/5 text-black/10 border-transparent cursor-not-allowed"
                                } text-[8px] lg:text-[9px] whitespace-nowrap ml-auto`}
                              >
                                {formInfo?.slug ? "বিস্তারিত" : "নেই"}
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[3rem] border-4 border-dashed border-black/5 p-20 text-center bg-white shadow-2xl">
                    <ClipboardList className="mx-auto h-16 w-16 text-black/5 mb-6" />
                    <p className="text-xl font-black text-black/20 uppercase tracking-widest mb-8">আপনি এখনো কোনো আবেদন করেননি।</p>
                    <Link to="/" className="inline-flex items-center gap-3 rounded-2xl bg-orange-500 px-10 py-4 text-sm font-black text-white hover:opacity-90 transition-all border-2 border-orange-500 uppercase tracking-widest shadow-xl shadow-orange-500/20">
                      প্রোগ্রামসমূহ দেখুন
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;

function StatusBadge({ status }) {
  const getStatusConfig = (status) => {
    switch (status) {
      case "Accepted":
        return {
          label: "গৃহীত",
          classes: "bg-orange-500 text-white border-orange-500"
        };
      case "Rejected":
        return {
          label: "বাতিল",
          classes: "bg-red-600 text-white border-red-600 shadow-lg shadow-red-900/10"
        };
      case "Completed":
        return {
          label: "সম্পন্ন",
          classes: "bg-orange-500 text-white border-orange-500"
        };
      default:
        return {
          label: "অপেক্ষমান",
          classes: "bg-white text-black border-black"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border-2 shadow-sm ${config.classes}`}>
      {config.label}
    </span>
  );
}
