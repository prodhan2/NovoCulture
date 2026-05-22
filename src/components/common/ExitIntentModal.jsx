import { useState, useEffect, useCallback } from "react";
import { X, ExternalLink, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function ExitIntentModal() {
  const [show, setShow] = useState(false);
  const [pendingUrl, setPendingUrl] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  const handleClose = useCallback(() => {
    setShow(false);
    setPendingUrl(null);
    setDismissed(true);
    sessionStorage.setItem("exit_modal_dismissed", "true");
  }, []);

  const handleProceed = useCallback(() => {
    if (pendingUrl) {
      window.open(pendingUrl, "_blank", "noopener,noreferrer");
    }
    setShow(false);
    setPendingUrl(null);
    setDismissed(true);
    sessionStorage.setItem("exit_modal_dismissed", "true");
  }, [pendingUrl]);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("exit_modal_dismissed")) {
      setDismissed(true);
      return;
    }

    const handleClick = (e) => {
      if (dismissed) return;

      // Find the closest anchor tag
      const anchor = e.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Only handle external http/https links
      if (!href.startsWith("http://") && !href.startsWith("https://")) return;

      // Skip if it's the current domain
      try {
        const url = new URL(href);
        if (url.hostname === window.location.hostname) return;
      } catch {
        return;
      }

      // This is an external link — show the modal
      e.preventDefault();
      e.stopPropagation();
      setPendingUrl(href);
      setShow(true);
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [dismissed]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-black/20 hover:text-black transition-colors rounded-full hover:bg-black/5"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="p-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[var(--accent-terracotta)]/10 text-[var(--accent-terracotta)]">
            <ExternalLink className="h-10 w-10" />
          </div>
          
          <h2 className="mb-4 text-3xl font-black text-black tracking-tight">
            আপনি কি বাইরের লিংকে যেতে চান?
          </h2>
          
          <p className="mb-8 text-lg font-medium text-black/60 leading-relaxed">
            আপনি আমাদের ওয়েবসাইট ছেড়ে অন্য একটি ওয়েবসাইটে যাচ্ছেন। 
            যাওয়ার আগে আমাদের অনুদান পেজটি একবার দেখে নিন!
          </p>

          <div className="flex flex-col gap-3">
            <Link
              to="/donation"
              onClick={handleClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent-terracotta)] py-4 text-lg font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-[var(--accent-terracotta-dark)] active:scale-[0.98]"
            >
              <Heart className="h-5 w-5" />
              অনুদান করুন
            </Link>

            <button
              onClick={handleProceed}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-black/20 bg-white py-4 text-lg font-black text-black transition hover:bg-black/5 active:scale-[0.98]"
            >
              <ExternalLink className="h-5 w-5" />
              তবুও যান
            </button>
            
            <button
              onClick={handleClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-4 text-lg font-black text-white transition hover:bg-black/80 active:scale-[0.98]"
            >
              না, আমি থাকছি
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-[var(--accent-terracotta)]/5" />
        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-black/5" />
      </div>
    </div>
  );
}
