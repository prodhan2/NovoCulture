import { useEffect, useState } from "react";
import { getMedia, addMedia, deleteMedia } from "../../services/firestore";

export default function MediaAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");

  useEffect(() => {
    let cancelled = false;
    getMedia()
      .then((d) => {
        if (cancelled) return;
        setItems(d);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleAdd() {
    if (!url) return alert("Enter image URL");
    const payload = { url, date: new Date().toISOString() };
    const id = await addMedia(payload);
    setItems((s) => [{ id, ...payload }, ...s]);
    setUrl("");
  }

  async function handleDelete(id) {
    if (!confirm("Delete this media?")) return;
    await deleteMedia(id);
    setItems((s) => s.filter((m) => m.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Image URL"
          className="rounded border px-2 py-1"
        />
        <button
          onClick={handleAdd}
          className="rounded bg-[var(--accent-terracotta)] px-3 py-1 text-white"
        >
          Add
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {items.map((m) => (
            <div key={m.id} className="rounded border p-2">
              <img
                src={m.url}
                alt="media"
                className="h-32 w-full object-cover"
              />
              <div className="mt-2 flex justify-between">
                <div className="text-sm text-[var(--text-brown)]/70">
                  {new Date(m.date).toLocaleString()}
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
