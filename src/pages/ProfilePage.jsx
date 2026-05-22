import { useEffect, useState } from "react";
import { auth } from "../services/firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { 
  LogOut, User, Mail, Shield, Phone, MapPin, 
  Briefcase, Calendar, Info, CheckCircle2, 
  Globe, Save, Loader2, Camera, Upload, Heart,
  MessageSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { getUserProfile, setUserProfile, getDonations, getContactMessages } from "../services/firestore";
import { uploadImage } from "../services/imageUpload";

function ProfilePage() {
  const [user, authLoading] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [donations, setDonations] = useState([]);
  const [messages, setMessages] = useState([]);
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

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate("/");
      return;
    }

    async function loadProfile() {
      console.log("Loading profile for UID:", user.uid);
      try {
        // Load profile first to ensure we have user data
        const profile = await getUserProfile(user.uid);
        console.log("Fetched profile:", profile);

        if (profile) {
          setProfileData(prev => ({
            ...prev,
            ...profile,
            displayName: profile.displayName || user.displayName || prev.displayName || "",
            photoURL: profile.photoURL || user.photoURL || prev.photoURL || "",
            email: profile.email || user.email || prev.email || "",
          }));
          
          // If profile exists but photoURL is missing in Firestore, update it
          if (!profile.photoURL && user.photoURL) {
            await setUserProfile(user.uid, { photoURL: user.photoURL });
          }
        } else {
          console.log("No profile found, initializing new profile");
          // First time user - create profile with auth data
          const initialData = {
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            email: user.email || "",
            joinedAt: new Date().toISOString(),
            role: "user"
          };
          setProfileData(prev => ({
            ...prev,
            ...initialData
          }));
          await setUserProfile(user.uid, initialData);
        }

        // Load other data separately so they don't block the profile if they fail
        getDonations(user.uid).then(setDonations).catch(err => console.error("Donations load failed:", err));
        getContactMessages(user.uid).then(setMessages).catch(err => console.error("Messages load failed:", err));

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
    const filledFields = fields.filter(field => profileData[field] && profileData[field].trim() !== "");
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

  return (
    <div className="min-h-screen w-full bg-[var(--bg-cream)]">
      {/* Profile Header - Full Width */}
      <div className="w-full bg-white/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
            <div className="flex flex-col items-center gap-6 md:flex-row">
              <div className="relative group/avatar">
                <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-[var(--accent-terracotta)] shadow-xl bg-white relative">
                  {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt={profileData.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[var(--bg-cream)] text-[var(--text-brown)]">
                      <User className="h-16 w-16" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--text-brown)]/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
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
                            className="text-[var(--accent-terracotta)] transition-all duration-300 ease-out"
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
                <label className="absolute bottom-0 right-0 h-10 w-10 bg-[var(--accent-terracotta)] rounded-full border-4 border-[var(--bg-cream)] flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform active:scale-95">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
                {completion === 100 && (
                  <div className="absolute -left-2 -top-2 rounded-full bg-[var(--accent-terracotta)] p-1.5 text-white shadow-lg">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                )}
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-[var(--text-brown-strong)]">
                  {profileData.displayName || "ব্যবহারকারী"}
                </h1>
                <p className="mt-1 text-lg text-[var(--text-brown)] font-medium">{user.email}</p>
                
                {/* Profile Completion Bar */}
                <div className="mt-4 w-64 md:w-80">
                  <div className="mb-2 flex justify-between text-sm font-bold text-[var(--text-brown)]">
                    <span>প্রোফাইল সম্পন্ন</span>
                    <span>{completion}%</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[var(--text-brown)]/10">
                    <div 
                      className="h-2.5 rounded-full bg-[var(--accent-terracotta)] transition-all duration-500" 
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
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-[var(--accent-terracotta)] px-4 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-lg font-bold text-white shadow-lg transition hover:bg-[var(--accent-terracotta-dark)] disabled:opacity-70 border-2 border-[var(--accent-terracotta)]"
              >
                {saving ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Save className="h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="whitespace-nowrap">সংরক্ষণ করুন</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white px-4 py-2.5 sm:px-8 sm:py-4 text-xs sm:text-lg font-bold text-[var(--text-brown)] transition hover:bg-[var(--text-brown)] hover:text-white"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="whitespace-nowrap">লগআউট</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content - Full Width Layout, Cardless */}
      <div className="w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-16 lg:grid-cols-2">
            {/* Left Column: Personal Info */}
            <div className="space-y-12">
              <section>
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-brown-strong)]">
                  <Info className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  ব্যক্তিগত তথ্য
                </h2>
                <div className="space-y-8">
                  <div className="group">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                      পুরো নাম
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={profileData.displayName}
                      onChange={handleInputChange}
                      placeholder="আপনার নাম লিখুন"
                      className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                    />
                  </div>

                  <div className="group">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                      প্রোফাইল ছবির লিঙ্ক (Photo URL)
                    </label>
                    <input
                      type="url"
                      name="photoURL"
                      value={profileData.photoURL}
                      onChange={handleInputChange}
                      placeholder="আপনার ছবির লিঙ্ক দিন"
                      className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                    />
                  </div>

                  <div className="group">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                      ইমেইল (পরিবর্তনযোগ্য নয়)
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] opacity-50 outline-none"
                    />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        ফোন নম্বর
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        placeholder="আপনার ফোন নম্বর"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        পেশা
                      </label>
                      <input
                        type="text"
                        name="occupation"
                        value={profileData.occupation}
                        onChange={handleInputChange}
                        placeholder="আপনার পেশা"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                      শিক্ষা প্রতিষ্ঠান / কর্মস্থল
                    </label>
                    <input
                      type="text"
                      name="institution"
                      value={profileData.institution}
                      onChange={handleInputChange}
                      placeholder="আপনার প্রতিষ্ঠান বা সংগঠনের নাম"
                      className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                    />
                  </div>

                  <div className="group">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                      আপনার সম্পর্কে
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="আপনার সম্পর্কে কিছু বলুন..."
                      className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                    ></textarea>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-brown-strong)]">
                  <User className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  পারিবারিক ও পরিচয়পত্র
                </h2>
                <div className="space-y-8">
                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        পিতার নাম
                      </label>
                      <input
                        type="text"
                        name="fatherName"
                        value={profileData.fatherName}
                        onChange={handleInputChange}
                        placeholder="আপনার পিতার নাম"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        মাতার নাম
                      </label>
                      <input
                        type="text"
                        name="motherName"
                        value={profileData.motherName}
                        onChange={handleInputChange}
                        placeholder="আপনার মাতার নাম"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        রক্তের গ্রুপ
                      </label>
                      <select
                        name="bloodGroup"
                        value={profileData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      >
                        <option value="" className="bg-white text-[var(--text-brown)]">নির্বাচন করুন</option>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(group => (
                          <option key={group} value={group} className="bg-white text-[var(--text-brown)]">{group}</option>
                        ))}
                      </select>
                    </div>
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        এনআইডি / জন্ম নিবন্ধন নম্বর
                      </label>
                      <input
                        type="text"
                        name="nid"
                        value={profileData.nid}
                        onChange={handleInputChange}
                        placeholder="NID বা জন্ম নিবন্ধন নম্বর"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-brown-strong)]">
                  <MapPin className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  ঠিকানা ও অন্যান্য
                </h2>
                <div className="space-y-8">
                  <div className="group">
                    <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                      পূর্ণ ঠিকানা
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      placeholder="আপনার ঠিকানা লিখুন"
                      className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                    />
                  </div>

                  <div className="grid gap-8 sm:grid-cols-2">
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        জন্ম তারিখ
                      </label>
                      <input
                        type="date"
                        name="dob"
                        value={profileData.dob}
                        onChange={handleInputChange}
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                    <div className="group">
                      <label className="mb-2 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60 transition-colors group-focus-within:text-[var(--accent-terracotta)]">
                        লিঙ্গ
                      </label>
                      <select
                        name="gender"
                        value={profileData.gender}
                        onChange={handleInputChange}
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-4 text-xl font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      >
                        <option value="" className="bg-white text-[var(--text-brown)]">নির্বাচন করুন</option>
                        <option value="পুরুষ" className="bg-white text-[var(--text-brown)]">পুরুষ</option>
                        <option value="মহিলা" className="bg-white text-[var(--text-brown)]">মহিলা</option>
                        <option value="অন্যান্য" className="bg-white text-[var(--text-brown)]">অন্যান্য</option>
                      </select>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Social Links & Account Info */}
            <div className="space-y-12">
              <section>
                <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-brown-strong)]">
                  <Shield className="h-6 w-6 text-[var(--accent-terracotta)]" />
                  সামাজিক যোগাযোগ মাধ্যম
                </h2>
                <div className="space-y-8">
                  <div className="group flex items-center gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[var(--accent-terracotta)] transition-colors group-focus-within:bg-[var(--accent-terracotta)] group-focus-within:text-white border border-[var(--accent-terracotta)]">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60">Facebook Profile Link</label>
                      <input
                        type="url"
                        name="facebook"
                        value={profileData.facebook}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/yourprofile"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-2 text-lg font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                  </div>

                  <div className="group flex items-center gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[var(--accent-terracotta)] transition-colors group-focus-within:bg-[var(--accent-terracotta)] group-focus-within:text-white border border-[var(--accent-terracotta)]">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60">Twitter Profile Link</label>
                      <input
                        type="url"
                        name="twitter"
                        value={profileData.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/yourprofile"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-2 text-lg font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                  </div>

                  <div className="group flex items-center gap-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[var(--accent-terracotta)] transition-colors group-focus-within:bg-[var(--accent-terracotta)] group-focus-within:text-white border border-[var(--accent-terracotta)]">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]/60">Instagram Profile Link</label>
                      <input
                        type="url"
                        name="instagram"
                        value={profileData.instagram}
                        onChange={handleInputChange}
                        placeholder="https://instagram.com/yourprofile"
                        className="w-full border-b-2 border-[var(--accent-terracotta)] bg-transparent py-2 text-lg font-medium text-[var(--text-brown)] outline-none transition-all focus:border-[var(--accent-terracotta)]"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <div className="rounded-3xl bg-[var(--accent-terracotta)]/5 p-8 border border-[var(--accent-terracotta)]">
                <h3 className="mb-4 text-xl font-bold text-[var(--text-brown-strong)]">একাউন্ট স্ট্যাটাস</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-terracotta)] text-white">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-[var(--text-brown)]">সক্রিয় (Active)</p>
                      <p className="text-sm text-[var(--text-brown)]/60">আপনার একাউন্টটি বর্তমানে সচল আছে।</p>
                    </div>
                  </div>
                  
                  {profileData.role && (
                    <div className="flex items-center gap-4 pt-4 border-t border-[var(--accent-terracotta)]/10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--text-brown)] text-white">
                        <Shield className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-brown)]">রোল (Role)</p>
                        <p className="text-sm text-[var(--text-brown)]/60 uppercase tracking-widest font-black">{profileData.role}</p>
                      </div>
                    </div>
                  )}

                  {profileData.joinedAt && (
                    <div className="flex items-center gap-4 pt-4 border-t border-[var(--accent-terracotta)]/10">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--text-brown)]/10 text-[var(--text-brown)]">
                        <Calendar className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-bold text-[var(--text-brown)]">যোগদানের তারিখ</p>
                        <p className="text-sm text-[var(--text-brown)]/60">
                          {new Date(profileData.joinedAt).toLocaleDateString("bn-BD")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Donation History Section */}
          <div className="mt-20">
            <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-brown-strong)]">
              <Heart className="h-6 w-6 text-[var(--accent-terracotta)]" />
              আপনার অনুদানের ইতিহাস
            </h2>
            
            {donations.length > 0 ? (
              <div className="overflow-x-auto rounded-3xl border-2 border-[var(--accent-terracotta)] bg-white/50 shadow-sm backdrop-blur-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/50 border-b-2 border-[var(--accent-terracotta)]">
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]">তারিখ</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]">তহবিল</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]">পরিমাণ</th>
                      <th className="px-6 py-4 text-sm font-bold uppercase tracking-wider text-[var(--text-brown)]">অবস্থা</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--accent-terracotta)]/20">
                    {donations.map((donation) => (
                      <tr key={donation.id} className="hover:bg-white/30 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-[var(--text-brown)]">
                          {new Date(donation.date).toLocaleDateString("bn-BD")}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-[var(--text-brown)]">
                          {donation.fund}
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-[var(--text-brown)]">
                          ৳{donation.amount}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border-2 border-[var(--accent-terracotta)] ${
                            donation.status === "Success" ? "bg-green-600 text-white" : 
                            donation.status === "Pending" ? "bg-orange-500 text-white" : 
                            "bg-red-600 text-white"
                          }`}>
                            {donation.status === "Success" ? "সফল" : 
                             donation.status === "Pending" ? "অপেক্ষমান" : "ব্যর্থ"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-[var(--accent-terracotta)] p-12 text-center bg-white/30 backdrop-blur-sm">
                <Heart className="mx-auto h-12 w-12 text-[var(--text-brown)]/20" />
                <p className="mt-4 text-lg font-bold text-[var(--text-brown)]/60">আপনি এখনো কোনো অনুদান দেননি।</p>
                <Link to="/donation" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--text-brown)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--text-brown-strong)] transition-all border-2 border-[var(--accent-terracotta)]">
                  এখনই অনুদান দিন
                </Link>
              </div>
            )}
          </div>

          {/* Contact Message History Section */}
          <div className="mt-20">
            <h2 className="mb-8 flex items-center gap-3 text-2xl font-bold text-[var(--text-brown-strong)]">
              <MessageSquare className="h-6 w-6 text-[var(--accent-terracotta)]" />
              আপনার বার্তার ইতিহাস
            </h2>
            
            {messages.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {messages.map((msg) => (
                  <div key={msg.id} className="group relative bg-white p-6 rounded-[2.5rem] border-2 border-[var(--text-brown)]/5 shadow-xl transition-all hover:shadow-2xl overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-terracotta)]" />
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-brown)]/40">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(msg.date).toLocaleDateString("bn-BD")}</span>
                      </div>
                      {msg.response ? (
                        <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                          <CheckCircle2 className="h-2 w-2" />
                          উত্তর দেওয়া হয়েছে
                        </span>
                      ) : (
                        <span className="bg-orange-100 text-orange-700 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-orange-200">
                          অপেক্ষমান
                        </span>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="bg-[var(--bg-cream)]/30 p-4 rounded-2xl border border-[var(--text-brown)]/5">
                        <p className="text-sm font-bold text-[var(--text-brown)]/40 uppercase tracking-widest mb-1 text-[9px]">আপনার বার্তা:</p>
                        <p className="text-sm font-medium text-[var(--text-brown)] leading-relaxed line-clamp-3 italic">
                          "{msg.message}"
                        </p>
                      </div>

                      {msg.response && (
                        <div className="bg-[var(--accent-terracotta)]/5 p-4 rounded-2xl border border-[var(--accent-terracotta)]/10 animate-in fade-in slide-in-from-top-2">
                          <p className="text-sm font-bold text-[var(--accent-terracotta)] uppercase tracking-widest mb-1 text-[9px]">এডমিন উত্তর:</p>
                          <p className="text-sm font-bold text-[var(--text-brown)] leading-relaxed">
                            {msg.response}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[3rem] border-2 border-dashed border-[var(--text-brown)]/10 p-12 text-center bg-white/30 backdrop-blur-sm">
                <MessageSquare className="mx-auto h-12 w-12 text-[var(--text-brown)]/10" />
                <p className="mt-4 text-lg font-bold text-[var(--text-brown)]/40">আপনার কোনো বার্তার ইতিহাস নেই।</p>
                <Link to="/contact" className="mt-6 inline-flex items-center gap-2 rounded-xl border-2 border-[var(--text-brown)]/5 bg-white px-6 py-3 text-sm font-bold text-[var(--text-brown)] hover:bg-[var(--text-brown)]/5 transition-all">
                  আমাদের সাথে যোগাযোগ করুন
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
