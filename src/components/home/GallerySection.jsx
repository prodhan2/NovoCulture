import { useEffect, useState } from "react";
import { getMedia, getMediaCategories } from "../../services/firestore";
import { Filter, X, Maximize2 } from "lucide-react";

function GallerySection() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getMedia(), getMediaCategories()])
      .then(([mediaData, categoryData]) => {
        if (cancelled) return;
        setItems(mediaData);
        setCategories(categoryData);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setCategories([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImage]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setSelectedImage(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const filteredItems = selectedCategory === "All" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  if (items.length === 0 && !loading) {
    return (
      <div className="rounded-3xl border-2 border-dashed border-[var(--text-brown)]/10 p-16 text-center">
        <p className="text-[var(--text-brown)]/40 font-bold">বর্তমানে কোনো ছবি নেই। এডমিন প্যানেল থেকে ছবি যোগ করুন।</p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-8">
      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`rounded-full px-6 py-2 text-sm font-bold transition-all border-2 ${
              selectedCategory === "All"
                ? "bg-[var(--text-brown)] text-white border-[var(--text-brown)] shadow-lg scale-105"
                : "bg-white text-[var(--text-brown)] border-[var(--text-brown)]/20 hover:bg-[var(--text-brown)]/5"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`rounded-full px-6 py-2 text-sm font-bold transition-all border-2 ${
                selectedCategory === cat.name
                  ? "bg-[var(--text-brown)] text-white border-[var(--text-brown)] shadow-lg scale-105"
                  : "bg-white text-[var(--text-brown)] border-[var(--text-brown)]/20 hover:bg-[var(--text-brown)]/5"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-terracotta)] border-t-transparent"></div>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid gap-2 grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {filteredItems.map((m, idx) => (
            <div
              key={m.id || idx}
              onClick={() => setSelectedImage(m.url || m.image)}
              className="group aspect-square overflow-hidden rounded-lg sm:rounded-3xl border border-[var(--text-brown)]/5 sm:border-2 bg-white shadow-sm transition-all hover:scale-[1.03] hover:shadow-xl relative cursor-zoom-in"
            >
              <img
                src={m.url || m.image}
                alt={`Gallery ${idx + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-[var(--text-brown)]/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="text-white h-5 w-5 sm:h-8 sm:w-8" />
              </div>
              <div className="absolute bottom-2 left-2 hidden sm:block">
                <span className="rounded-lg bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--text-brown)] shadow-sm border border-[var(--text-brown)]/10">
                  {m.category || "General"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border-2 border-dashed border-[var(--text-brown)]/10 p-16 text-center">
          <p className="text-[var(--text-brown)]/40 font-bold">এই ক্যাটাগরিতে কোনো ছবি নেই।</p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-10 animate-in fade-in duration-300 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="fixed top-6 right-6 z-[110] text-white hover:text-[var(--accent-terracotta)] transition-all p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md border border-white/20 active:scale-90"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X className="h-6 w-6 sm:h-8 sm:w-8" />
          </button>
          <div 
            className="relative max-w-5xl w-full h-full flex items-center justify-center pointer-events-none"
          >
            <img 
              src={selectedImage} 
              alt="Zoomed" 
              className="max-h-full max-w-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300 pointer-events-auto" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default GallerySection;
