import { useEffect, useState } from "react";
import { getSettings, setSettings } from "../../services/firestore";
import { 
  Video, AlertCircle, CheckCircle2, Plus, Trash2,
  Key, ShieldCheck, Loader2, Save, Image as ImageIcon,
  Upload, Globe, Images, Share2
} from "lucide-react";
import { uploadImage, uploadImages } from "../../services/imageUpload";
import Shimmer from "../common/Shimmer";

export default function SettingsAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState({ hero: false, logo: false, gallery: false });
  const [uploadProgress, setUploadProgress] = useState({ hero: 0, logo: 0, gallery: 0 });
  const [galleryImages, setGalleryImages] = useState([]);
  const [videoUrls, setVideoUrls] = useState([""]);
  const [apiKey, setApiKey] = useState("");
  const [heroBgImage, setHeroBgImage] = useState("");
  const [siteLogo, setSiteLogo] = useState("");
  const [marqueeTextEn, setMarqueeTextEn] = useState("");
  const [marqueeTextBn, setMarqueeTextBn] = useState("");
  const [previews, setPreviews] = useState({ hero: null, logo: null, gallery: [] });
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const settings = await getSettings();
        if (!mounted) return;
        
        // Handle both old single string and new array format
        if (settings?.heroVideoUrls && Array.isArray(settings.heroVideoUrls)) {
          setVideoUrls(settings.heroVideoUrls.length > 0 ? settings.heroVideoUrls : [""]);
        } else if (settings?.heroVideoUrl) {
          setVideoUrls([settings.heroVideoUrl]);
        } else {
          setVideoUrls([""]);
        }

        if (settings?.beeImgApiKey) {
          setApiKey(settings.beeImgApiKey);
        }
        if (settings?.heroBgImage) {
          setHeroBgImage(settings.heroBgImage);
        }
        if (settings?.siteLogo) {
          setSiteLogo(settings.siteLogo);
        }
        if (settings?.galleryImages) {
          setGalleryImages(settings.galleryImages);
        }
        if (settings?.marqueeTextEn) {
          setMarqueeTextEn(settings.marqueeTextEn);
        }
        if (settings?.marqueeTextBn) {
          setMarqueeTextBn(settings.marqueeTextBn);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create local preview
    const previewUrl = URL.createObjectURL(file);
    setPreviews(prev => ({ ...prev, [type]: previewUrl }));

    setUploading(prev => ({ ...prev, [type]: true }));
    setUploadProgress(prev => ({ ...prev, [type]: 0 }));

    try {
      const url = await uploadImage(file, (progress) => {
        setUploadProgress(prev => ({ ...prev, [type]: progress }));
      });
      
      if (type === "hero") setHeroBgImage(url);
      if (type === "logo") setSiteLogo(url);
      
      alert("ছবি সফলভাবে আপলোড হয়েছে!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert(error.message || "ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
      setPreviews(prev => ({ ...prev, [type]: null }));
    }
  };

  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    // Create local previews
    const localPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => ({ ...prev, gallery: localPreviews }));

    setUploading(prev => ({ ...prev, gallery: true }));
    setUploadProgress(prev => ({ ...prev, gallery: 0 }));

    try {
      const urls = await uploadImages(files, (progress) => {
        setUploadProgress(prev => ({ ...prev, gallery: progress }));
      });
      
      setGalleryImages(prev => [...prev, ...urls]);
      alert(`${urls.length} টি ছবি সফলভাবে আপলোড হয়েছে!`);
    } catch (error) {
      console.error("Multiple upload failed:", error);
      alert(error.message || "ছবি আপলোড করতে সমস্যা হয়েছে।");
    } finally {
      setUploading(prev => ({ ...prev, gallery: false }));
      setUploadProgress(prev => ({ ...prev, gallery: 0 }));
      setPreviews(prev => ({ ...prev, gallery: [] }));
    }
  };

  const removeGalleryImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  // Helper to extract YouTube video ID and convert to embed link
  const getEmbedUrl = (url) => {
    if (!url) return "";
    const trimmedUrl = url.trim();
    if (trimmedUrl.includes("youtube.com/embed/")) return trimmedUrl;
    
    let videoId = "";
    if (trimmedUrl.includes("youtu.be/")) {
      videoId = trimmedUrl.split("youtu.be/")[1]?.split("?")[0];
    } else if (trimmedUrl.includes("youtube.com/watch?v=")) {
      videoId = trimmedUrl.split("v=")[1]?.split("&")[0];
    }
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?rel=0&controls=1&autoplay=0&mute=0`;
    }
    return trimmedUrl; // Return original if no ID found
  };

  const handleAddUrl = () => {
    setVideoUrls([...videoUrls, ""]);
  };

  const handleRemoveUrl = (index) => {
    const newUrls = videoUrls.filter((_, i) => i !== index);
    setVideoUrls(newUrls.length > 0 ? newUrls : [""]);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...videoUrls];
    newUrls[index] = value;
    setVideoUrls(newUrls);
  };

  async function handleSave() {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const cleanUrls = videoUrls
        .filter(url => url.trim() !== "")
        .map(url => getEmbedUrl(url));
      
      await setSettings({ 
        heroVideoUrls: cleanUrls,
        // Keep the first one as heroVideoUrl for backward compatibility if needed
        heroVideoUrl: cleanUrls.length > 0 ? cleanUrls[0] : "",
        beeImgApiKey: apiKey,
        heroBgImage,
        siteLogo,
        galleryImages,
        marqueeTextEn,
        marqueeTextBn
      });
      
      setVideoUrls(cleanUrls.length > 0 ? cleanUrls : [""]);
      setMessage({ type: "success", text: "সেটিংস সফলভাবে সেভ হয়েছে!" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "সেটিংস সেভ করতে ব্যর্থ হয়েছে।" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* API Key Section */}
      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-white pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Key className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">API কনফিগারেশন</h2>
            <p className="text-xs font-bold text-black">ইমেজ আপলোড এবং অন্যান্য কাজের জন্য API কী ম্যানেজ করুন</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-black">BeeImg API কী</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <ShieldCheck className="h-5 w-5 text-black/40" />
                </div>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="ea31849f8e4643033e131ff9fe26783a"
                  className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] pl-11 pr-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black font-mono"
                />
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>API কী সেট করুন</span>
              </button>
            </div>
            <p className="mt-2 text-[10px] font-bold text-black/50 uppercase tracking-widest">
              সরাসরি ছবি আপলোডের জন্য প্রয়োজন। এই কী-টি গোপন রাখুন।
            </p>
          </div>
        </div>
      </div>

      {/* Site Identity Section */}
      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-white pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Globe className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">সাইটের পরিচয়</h2>
            <p className="text-xs font-bold text-black">লোগো এবং গ্লোবাল ব্র্যান্ড ইমেজ ম্যানেজ করুন</p>
          </div>
        </div>

        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-black">সাইটের লোগো</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] flex items-center justify-center overflow-hidden relative">
                {previews.logo ? (
                  <>
                    <img src={previews.logo} alt="Preview" className="h-full w-full object-contain opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-black" />
                    </div>
                  </>
                ) : siteLogo ? (
                  <img src={siteLogo} alt="Logo" className="h-full w-full object-contain" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-black/20" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={siteLogo}
                  onChange={(e) => setSiteLogo(e.target.value)}
                  placeholder="লোগো ইউআরএল"
                  className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2 text-xs focus:border-[var(--accent-terracotta)] outline-none text-black"
                />
                <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-black text-white text-xs font-bold cursor-pointer transition hover:bg-black/80 ${uploading.logo ? 'opacity-50' : ''}`}>
                  {uploading.logo ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{uploading.logo ? `${uploadProgress.logo}%` : "লোগো আপলোড"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "logo")} disabled={uploading.logo} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-bold text-black">হিরো ব্যাকগ্রাউন্ড ইমেজ</label>
            <div className="flex items-center gap-4">
              <div className="h-20 w-32 rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] flex items-center justify-center overflow-hidden relative">
                {previews.hero ? (
                  <>
                    <img src={previews.hero} alt="Preview" className="h-full w-full object-cover opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-black" />
                    </div>
                  </>
                ) : heroBgImage ? (
                  <img src={heroBgImage} alt="Hero BG" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-black/20" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={heroBgImage}
                  onChange={(e) => setHeroBgImage(e.target.value)}
                  placeholder="হিরো ইমেজ ইউআরএল"
                  className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-2 text-xs focus:border-[var(--accent-terracotta)] outline-none text-black"
                />
                <label className={`flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-black text-white text-xs font-bold cursor-pointer transition hover:bg-black/80 ${uploading.hero ? 'opacity-50' : ''}`}>
                  {uploading.hero ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                  <span>{uploading.hero ? `${uploadProgress.hero}%` : "হিরো ব্যাকগ্রাউন্ড আপলোড"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "hero")} disabled={uploading.hero} />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marquee Section */}
      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-white pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">হেডার মারকুই টেক্সট</h2>
            <p className="text-xs font-bold text-black">সাইটের একদম উপরে স্ক্রলিং টেক্সট পরিবর্তন করুন</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">মারকুই টেক্সট (ইংরেজি - English)</label>
              <textarea
                value={marqueeTextEn}
                onChange={(e) => setMarqueeTextEn(e.target.value)}
                placeholder="ইংরেজিতে মারকুই টেক্সট লিখুন"
                rows={3}
                className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-black">মারকুই টেক্সট (বাংলা)</label>
              <textarea
                value={marqueeTextBn}
                onChange={(e) => setMarqueeTextBn(e.target.value)}
                placeholder="বাংলায় মারকুই টেক্সট লিখুন"
                rows={3}
                className="w-full rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>মারকুই টেক্সট সেভ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-white pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Images className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">সাইট গ্যালারি</h2>
            <p className="text-xs font-bold text-black">সাইটের জন্য একসাথে অনেক ছবি আপলোড এবং ম্যানেজ করুন</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-center w-full">
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white rounded-2xl bg-[var(--bg-cream-soft)] cursor-pointer hover:bg-[var(--bg-cream)] transition-all ${uploading.gallery ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading.gallery ? (
                  <>
                    <Loader2 className="w-8 h-8 mb-3 animate-spin text-black" />
                    <p className="text-sm font-bold text-black">আপলোড হচ্ছে {uploadProgress.gallery}%</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-8 h-8 mb-3 text-black/40" />
                    <p className="text-sm font-bold text-black">একাধিক ছবি আপলোড করতে ক্লিক করুন</p>
                    <p className="text-xs text-black/50">PNG, JPG অথবা WebP (প্রতিটি সর্বোচ্চ ১০ মেগাবাইট)</p>
                  </>
                )}
              </div>
              <input 
                type="file" 
                className="hidden" 
                multiple 
                accept="image/*" 
                onChange={handleMultipleUpload}
                disabled={uploading.gallery}
              />
            </label>
          </div>

          {(galleryImages.length > 0 || previews.gallery.length > 0) && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {/* Local Previews */}
              {previews.gallery.map((url, index) => (
                <div key={`preview-${index}`} className="group relative aspect-square rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] overflow-hidden">
                  <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover opacity-50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-black" />
                  </div>
                </div>
              ))}
              {/* Existing Images */}
              {galleryImages.map((url, index) => (
                <div key={index} className="group relative aspect-square rounded-xl border-2 border-white bg-[var(--bg-cream-soft)] overflow-hidden">
                  <img src={url} alt={`Gallery ${index}`} className="h-full w-full object-cover" />
                  <button
                    onClick={() => removeGalleryImage(index)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-lg bg-red-500 text-white flex items-center justify-center opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition shadow-lg"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving || uploading.gallery}
              className="flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white transition hover:bg-black/80 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>গ্যালারি সেভ করুন</span>
            </button>
          </div>
        </div>
      </div>

      {/* Video Section */}
      <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3 border-b-2 border-white pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-black">হিরো সেকশন ভিডিও</h2>
            <p className="text-xs font-bold text-black">মেইন হেডারে ভিডিও স্লাইডার ম্যানেজ করুন</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Shimmer width="100%" height="46px" borderRadius="0.75rem" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Shimmer width="100%" height="80px" borderRadius="0.75rem" />
              <Shimmer width="100%" height="80px" borderRadius="0.75rem" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-black">
                  ইউটিউব ভিডিও ইউআরএল
                </label>
                <button
                  onClick={handleAddUrl}
                  className="flex items-center gap-1 text-xs font-bold text-black hover:underline"
                >
                  <Plus className="h-3 w-3" /> আরও যোগ করুন
                </button>
              </div>

              <div className="space-y-4">
                {videoUrls.map((url, index) => (
                  <div key={index} className="space-y-3 rounded-2xl border-2 border-white bg-[var(--bg-cream-soft)] p-4">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={url}
                          onChange={(e) => handleUrlChange(index, e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="w-full rounded-xl border-2 border-white bg-white px-4 py-3 text-sm focus:border-[var(--accent-terracotta)] focus:outline-none text-black"
                        />
                      </div>
                      {videoUrls.length > 1 && (
                        <button
                          onClick={() => handleRemoveUrl(index)}
                          className="flex h-[46px] w-[46px] items-center justify-center rounded-xl border-2 border-white bg-red-50 text-red-600 transition hover:bg-red-100"
                          title="ভিডিও সরান"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    {url && (
                      <div className="overflow-hidden rounded-xl border-2 border-white bg-black">
                        <div className="relative aspect-video w-full max-w-sm mx-auto">
                          <iframe
                            src={getEmbedUrl(url)}
                            width="100%"
                            height="100%"
                            style={{ border: "none" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title={`ভিডিও প্রিভিউ ${index + 1}`}
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-black font-medium italic">
                পরামর্শ: আপনি সাধারণ ইউটিউব লিঙ্ক পেস্ট করতে পারেন। এগুলো স্বয়ংক্রিয়ভাবে হিরো সেকশনে স্লাইডার ফরম্যাটে পরিবর্তিত হবে।
              </p>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-sm font-bold text-white shadow-sm transition btn-swap hover:bg-black/80 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>সেভ হচ্ছে...</span>
                  </>
                ) : (
                  <span>ভিডিও স্লাইডার আপডেট করুন</span>
                )}
              </button>
              
              {message.text && (
                <div className={`flex items-center gap-2 text-sm font-bold ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                  {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  {message.text}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
