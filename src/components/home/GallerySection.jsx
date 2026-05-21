import { useEffect, useState } from "react";
import { getMedia } from "../../services/firestore";

function GallerySection() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getMedia()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fallback = ["https://picsum.photos/id/237/600/400"];

  // Firestore already orders by date desc; show only the latest 4
  const images =
    items && items.length
      ? items.slice(0, 4).map((i) => i.url || i.image || fallback[0])
      : fallback;

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            Photos
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
            Gallery-style content grid
          </h2>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {images.map((src, idx) => (
          <div
            key={idx}
            className="aspect-[4/3] overflow-hidden rounded-2xl border border-[color:var(--tan-secondary)] bg-[var(--bg-cream-soft)]"
          >
            <img
              src={src}
              alt={`Gallery ${idx + 1}`}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default GallerySection;
