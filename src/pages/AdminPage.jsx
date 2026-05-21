import { useState } from "react";
import ProjectsAdmin from "../components/admin/ProjectsAdmin";
import MediaAdmin from "../components/admin/MediaAdmin";
import ContactAdmin from "../components/admin/ContactAdmin";

export default function AdminPage() {
  const [tab, setTab] = useState("projects");

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="inline-flex rounded-md bg-white shadow-sm">
          <button
            onClick={() => setTab("projects")}
            className={`px-3 py-1 ${tab === "projects" ? "bg-[var(--accent-terracotta)] text-white" : "text-[var(--text-brown)]"}`}
          >
            Projects
          </button>
          <button
            onClick={() => setTab("media")}
            className={`px-3 py-1 ${tab === "media" ? "bg-[var(--accent-terracotta)] text-white" : "text-[var(--text-brown)]"}`}
          >
            Media
          </button>
          <button
            onClick={() => setTab("contact")}
            className={`px-3 py-1 ${tab === "contact" ? "bg-[var(--accent-terracotta)] text-white" : "text-[var(--text-brown)]"}`}
          >
            Contact
          </button>
        </div>
      </div>

      <div>
        {tab === "projects" ? (
          <ProjectsAdmin />
        ) : tab === "media" ? (
          <MediaAdmin />
        ) : (
          <ContactAdmin />
        )}
      </div>
    </section>
  );
}
