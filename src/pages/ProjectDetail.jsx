import { useParams, Link } from "react-router-dom";
import { projects } from "../data/projects.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getProject as fetchProject } from "../services/firestore";

function ProjectDetail() {
  const { id } = useParams();
  const { i18n, t } = useTranslation();
  const project = projects.find((p) => p.id === id);

  const [remoteProject, setRemoteProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (project) return; // already have local
    let cancelled = false;
    setLoading(true);
    fetchProject(id)
      .then((p) => {
        if (cancelled) return;
        setRemoteProject(p);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message || String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, project]);

  // Determine source: prefer local, else remote
  const sourceProject = project || remoteProject;

  if (!sourceProject) {
    if (loading) {
      return (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p>Loading...</p>
        </section>
      );
    }

    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p>{t("project_not_found", "Project not found.")}</p>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Link to="/projects" className="text-(--accent-terracotta)">
          {t("back_to_projects", "Back to projects")}
        </Link>
      </section>
    );
  }

  const lang =
    i18n.language && sourceProject[i18n.language] ? i18n.language : "en";
  const p = sourceProject[lang] || sourceProject.en || {};
  const timeline =
    sourceProject.updated_at ||
    sourceProject.created_at ||
    sourceProject.date ||
    p.date;
  const heroImage = p.image || sourceProject.image;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-(--text-brown)/70 hover:text-(--accent-terracotta)"
        >
          <span>←</span>
          <span>{t("back_to_projects", "Back to projects")}</span>
        </Link>
      </div>

      <div className="grid gap-8">
        <div>
          {heroImage ? (
            <div className="mb-6 overflow-hidden rounded-2xl border border-(--tan-secondary) bg-white shadow-sm">
              <img
                src={heroImage}
                alt={p.title}
                className="h-80 w-full object-cover sm:h-100"
              />
            </div>
          ) : null}

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-(--text-brown)/70">
            {p.subtitle}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-(--text-brown-strong) sm:text-5xl">
            {p.title}
          </h1>

          <article className="mt-8 rounded-2xl border border-(--tan-secondary) bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-(--text-brown)/60">
              {t("project_body", "Project body")}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-8 text-(--text-brown)/85 sm:text-lg">
              {p.description
                ? p.description
                    .split("\n")
                    .map((line, idx) =>
                      line.trim() ? <p key={idx}>{line}</p> : null,
                    )
                : Array.isArray(p.details)
                  ? p.details.map((detail) => <p key={detail}>• {detail}</p>)
                  : null}
            </div>
          </article>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-(--tan-secondary) bg-white p-5 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-(--text-brown)/60">
          {t("project_info", "Project info")}
        </div>
        <div className="mt-4 space-y-4 text-sm text-(--text-brown)/85">
          <div>
            <div className="text-xs text-(--text-brown)/60">
              {t("published", "Published")}
            </div>
            <div className="mt-1 font-medium text-(--text-brown-strong)">
              {timeline ? "" + timeline : ""}
            </div>
          </div>

          {p.tone ? (
            <div>
              <div className="text-xs text-(--text-brown)/60">
                {t("tone", "Tone")}
              </div>
              <div className="mt-1 font-medium text-(--text-brown-strong)">
                {p.tone}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default ProjectDetail;
