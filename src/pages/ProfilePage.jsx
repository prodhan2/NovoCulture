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
    phone: "",
    address: "",
    bio: "",
    occupation: "",
    dob: "",
    gender: "",
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
      try {
        const [profile, userDonations, userMessages] = await Promise.all([
          getUserProfile(user.uid),
          getDonations(user.uid),
          getContactMessages(user.uid)
        ]);
        
        setDonations(userDonations);
        setMessages(userMessages);

        if (profile) {
          setProfileData(prev => ({
            ...prev,
            ...profile,
            displayName: profile.displayName || user.displayName || "",
            photoURL: profile.photoURL || user.photoURL || "",
          }));
          
          // If profile exists but photoURL is missing in Firestore, update it
          if (!profile.photoURL && user.photoURL) {
            await setUserProfile(user.uid, { photoURL: user.photoURL });
          }
        } else {
          // First time user - create profile with auth data
          const initialData = {
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
            email: user.email || ""
          };
          setProfileData(prev => ({
            ...prev,
            ...initialData
          }));
          await setUserProfile(user.uid, initialData);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
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
    try {
      await setUserProfile(user.uid, profileData);
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
      "twitter", "instagram"
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
    <div className="min-h-screen w-full bg-[var(--bg-cream)] py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Horizontal Profile Card */}
        <div className="bg-white rounded-[3rem] border-2 border-[var(--text-brown)]/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-700">
          <div className="flex flex-col md:flex-row">
            {/* Left Side: Avatar Section */}
            <div className="w-full md:w-1/3 relative bg-[var(--bg-cream-soft)] min-h-[300px] md:min-h-full flex flex-col items-center justify-center p-8">
              <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-6">
                <div className="h-full w-full rounded-full border-4 border-white shadow-2xl overflow-hidden bg-white relative">
                  {profileData.photoURL ? (
                    <img src={profileData.photoURL} alt={profileData.displayName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[var(--bg-cream)] text-[var(--text-brown)]">
                      <User className="h-24 w-24" />
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[var(--text-brown)]/60 backdrop-blur-sm">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 h-12 w-12 bg-[var(--accent-terracotta)] rounded-xl border-4 border-white flex items-center justify-center text-white cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera className="h-6 w-6" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 font-black text-[9px] uppercase tracking-widest mb-2">
                  <Shield className="h-3 w-3" />
                  <span>Verified User</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-brown)]/30">Member since 2026</p>
              </div>
            </div>

            {/* Right Side: Info & Forms */}
            <div className="w-full md:w-2/3 p-8 sm:p-12 relative">
              {/* Header Actions */}
              <div className="absolute top-6 right-6 flex gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-cream-soft)] text-[var(--accent-terracotta)] shadow-sm hover:scale-110 transition-all border border-[var(--text-brown)]/5"
                  title="Save Changes"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleLogout}
                  className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--bg-cream-soft)] text-red-500 shadow-sm hover:scale-110 transition-all border border-[var(--text-brown)]/5"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-10">
                <input
                  type="text"
                  name="displayName"
                  value={profileData.displayName}
                  onChange={handleInputChange}
                  className="text-3xl sm:text-4xl font-black text-[var(--text-brown-strong)] tracking-tight bg-transparent border-none outline-none focus:ring-0 w-full mb-1 p-0"
                  placeholder="আপনার নাম"
                />
                <p className="text-sm font-bold text-[var(--text-brown)]/40 tracking-widest uppercase">{user.email}</p>
              </div>

              {/* Form Grid */}
              <div className="grid gap-8">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-brown)]/30 uppercase tracking-[0.2em] px-1">ফোন নম্বর</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--accent-terracotta)]" />
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg-cream-soft)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none text-sm font-bold text-[var(--text-brown)] transition-all shadow-sm"
                        placeholder="আপনার ফোন নম্বর"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-brown)]/30 uppercase tracking-[0.2em] px-1">পেশা</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--accent-terracotta)]" />
                      <input
                        type="text"
                        name="occupation"
                        value={profileData.occupation}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg-cream-soft)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none text-sm font-bold text-[var(--text-brown)] transition-all shadow-sm"
                        placeholder="আপনার পেশা"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-brown)]/30 uppercase tracking-[0.2em] px-1">ঠিকানা</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--accent-terracotta)]" />
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--bg-cream-soft)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none text-sm font-bold text-[var(--text-brown)] transition-all shadow-sm"
                      placeholder="আপনার পূর্ণ ঠিকানা"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-brown)]/30 uppercase tracking-[0.2em] px-1">আপনার সম্পর্কে</label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-6 py-4 rounded-[2rem] bg-[var(--bg-cream-soft)] border-2 border-transparent focus:border-[var(--accent-terracotta)] outline-none text-sm font-medium text-[var(--text-brown)]/80 transition-all shadow-sm resize-none leading-relaxed"
                    placeholder="আপনার সম্পর্কে কিছু বলুন..."
                  />
                </div>
              </div>

              {/* Bottom Quick Links */}
              <div className="mt-12 flex flex-wrap gap-4">
                <Link to="/donation" className="flex-1 min-w-[140px] flex items-center justify-center gap-3 p-4 rounded-2xl bg-[var(--text-brown)] text-white shadow-xl shadow-orange-900/10 hover:-translate-y-1 transition-all active:scale-95">
                  <Heart className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">অনুদান ইতিহাস</span>
                </Link>
                <Link to="/contact" className="flex-1 min-w-[140px] flex items-center justify-center gap-3 p-4 rounded-2xl border-2 border-[var(--text-brown)]/10 text-[var(--text-brown)] hover:bg-[var(--text-brown)] hover:text-white transition-all active:scale-95">
                  <MessageSquare className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-widest">বার্তার ইতিহাস</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Completion Progress Bar */}
        <div className="mt-8 px-8 py-6 bg-white rounded-[2rem] border-2 border-[var(--text-brown)]/5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-[var(--bg-cream-soft)] flex items-center justify-center text-[var(--accent-terracotta)] shadow-inner">
              <span className="text-xl font-black">{completion}%</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--text-brown-strong)]">প্রোফাইল সম্পন্ন</p>
              <p className="text-[10px] font-bold text-[var(--text-brown)]/40">সম্পূর্ণ প্রোফাইল আমাদের কাজকে সহজ করে</p>
            </div>
          </div>
          <div className="flex-1 w-full sm:max-w-xs h-3 rounded-full bg-[var(--bg-cream-soft)] overflow-hidden p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent-terracotta)] to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-sm" 
              style={{ width: `${completion}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
