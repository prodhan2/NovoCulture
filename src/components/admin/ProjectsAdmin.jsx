import { useEffect, useState } from "react";
import {
  getProjects,
  addProject,
  setProject,
  deleteProject,
} from "../../services/firestore";

export default function ProjectsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getProjects()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCreate() {
    const now = new Date().toISOString();
    const template = {
      created_at: now,
      updated_at: now,
      date: now,
      en: { title: "New project", subtitle: "", description: "", image: "" },
      bn: { title: "", subtitle: "", description: "", image: "" },
    };
    const id = await addProject(template);
    setItems((s) => [{ id, ...template }, ...s]);
  }

  async function handleSave(item) {
    const now = new Date().toISOString();
    const payload = {
      created_at: item.created_at || item.date || now,
      updated_at: now,
      date: item.date || item.created_at || now,
      en: {
        title: item.en?.title || "",
        subtitle: item.en?.subtitle || "",
        description: item.en?.description || "",
        image: item.en?.image || item.image || "",
      },
      bn: {
        title: item.bn?.title || "",
        subtitle: item.bn?.subtitle || "",
        description: item.bn?.description || "",
        image: item.bn?.image || "",
      },
    };

    await setProject(item.id, payload);
    setEditing(null);
  }

  async function handleDelete(id) {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    setItems((s) => s.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={handleCreate}
          className="rounded bg-[var(--accent-terracotta)] px-4 py-2 text-white"
        >
          Create project
        </button>
        <span className="text-sm text-[var(--text-brown)]/70">
          Manage projects stored in Firestore
        </span>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {items.map((p) => (
            <div key={p.id} className="rounded border p-3">
              {editing === p.id ? (
                <ProjectEditor
                  item={p}
                  onChange={(u) =>
                    setItems((s) => s.map((x) => (x.id === p.id ? u : x)))
                  }
                  onSave={() => handleSave(items.find((x) => x.id === p.id))}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{p.en?.title || p.id}</div>
                    <div className="text-sm text-[var(--text-brown)]/75">
                      {p.en?.subtitle}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditing(p.id)}
                      className="px-3 py-1 rounded bg-white border"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-3 py-1 rounded bg-white border text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectEditor({ item, onChange, onSave, onCancel }) {
  const p = { ...item };
  function update(path, val) {
    const next = JSON.parse(JSON.stringify(item));
    const parts = path.split(".");
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++)
      cur = cur[parts[i]] = cur[parts[i]] || {};
    cur[parts[parts.length - 1]] = val;
    onChange(next);
  }

  return (
    <div className="space-y-2">
      <input
        value={item.en?.title || ""}
        onChange={(e) => update("en.title", e.target.value)}
        className="w-full rounded border px-2 py-1"
      />
      <input
        value={item.en?.subtitle || ""}
        onChange={(e) => update("en.subtitle", e.target.value)}
        className="w-full rounded border px-2 py-1"
      />
      <textarea
        value={item.en?.description || ""}
        onChange={(e) => update("en.description", e.target.value)}
        className="w-full rounded border px-2 py-1"
        placeholder="Description"
      />
      <input
        value={item.en?.image || item.image || ""}
        onChange={(e) => update("en.image", e.target.value)}
        className="w-full rounded border px-2 py-1"
        placeholder="Image URL"
      />

      <hr />
      <div className="text-sm font-medium">BN (Bengali)</div>
      <input
        value={item.bn?.title || ""}
        onChange={(e) => update("bn.title", e.target.value)}
        className="w-full rounded border px-2 py-1"
        placeholder="BN title"
      />
      <input
        value={item.bn?.subtitle || ""}
        onChange={(e) => update("bn.subtitle", e.target.value)}
        className="w-full rounded border px-2 py-1"
        placeholder="BN subtitle"
      />
      <textarea
        value={item.bn?.description || ""}
        onChange={(e) => update("bn.description", e.target.value)}
        className="w-full rounded border px-2 py-1"
        placeholder="BN description"
      />
      <input
        value={item.bn?.image || ""}
        onChange={(e) => update("bn.image", e.target.value)}
        className="w-full rounded border px-2 py-1"
        placeholder="BN image URL"
      />
      <div className="flex gap-2">
        <button
          onClick={onSave}
          className="rounded bg-[var(--accent-terracotta)] px-3 py-1 text-white"
        >
          Save
        </button>
        <button onClick={onCancel} className="rounded px-3 py-1 border">
          Cancel
        </button>
      </div>
    </div>
  );
}
