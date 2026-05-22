import { useEffect, useState } from "react";
import { getSettings } from "../services/firestore";
import { useTranslation } from "react-i18next";
import GallerySection from "../components/home/GallerySection.jsx";
import { Video, Image as ImageIcon, Loader2 } from "lucide-react";

export default function MediaPage() {
  const { t } = useTranslation();
  const [mediaType, setMediaType] = useState("photo"); // "photo" or "video"
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then(s => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const videoUrls = settings?.heroVideoUrls || (settings?.heroVideoUrl ? [settings.heroVideoUrl] : []);

  return (
    <section className="w-full min-h-screen bg-[var(--bg-cream)]">
      {/* Header */}
      <div className="w-full bg-white/50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[var(--accent-terracotta)] mb-3">
            Media Library
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-black mb-10 tracking-tight">
            NovoCulture কর্মকাণ্ডের চিত্রশালা
          </h1>
          
          {/* Toggle Buttons - Swap style */}
          <div className="flex items-center justify-center rounded-2xl bg-white shadow-xl overflow-hidden border-4 border-white max-w-sm mx-auto">
            <button
              onClick={() => setMediaType("photo")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${mediaType === "photo" ? "bg-[var(--accent-terracotta)] text-white" : "text-black hover:bg-black/5"}`}
            >
              <ImageIcon className={`h-4 w-4 ${mediaType === "photo" ? "text-white" : "text-[var(--accent-terracotta)]"}`} />
              <span>ছবি গ্যালারি</span>
            </button>
            <button
              onClick={() => setMediaType("video")}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider border-l-2 border-white transition-all duration-300 ${mediaType === "video" ? "bg-[var(--accent-terracotta)] text-white" : "text-black hover:bg-black/5"}`}
            >
              <Video className={`h-4 w-4 ${mediaType === "video" ? "text-white" : "text-[var(--accent-terracotta)]"}`} />
              <span>ভিডিও গ্যালারি</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-10 w-10 animate-spin text-[var(--accent-terracotta)]" />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {mediaType === "photo" ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-bold text-black uppercase tracking-widest">সকল স্থিরচিত্র</h2>
                  </div>
                  <GallerySection />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
                      <Video className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-bold text-black uppercase tracking-widest">সকল ভিডিও চিত্র</h2>
                  </div>
                  
                  {videoUrls.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2">
                      {videoUrls.map((url, idx) => (
                        <div key={idx} className="group relative aspect-video overflow-hidden rounded-3xl border-4 border-white bg-black shadow-2xl transition-all hover:scale-[1.02]">
                          <iframe
                            src={url}
                            width="100%"
                            height="100%"
                            style={{ border: "none" }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            title={`Video ${idx + 1}`}
                          ></iframe>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border-4 border-dashed border-white p-20 text-center bg-white/20">
                      <Video className="mx-auto h-12 w-12 text-black/10 mb-4" />
                      <p className="text-black/40 font-bold">বর্তমানে কোনো ভিডিও নেই।</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
