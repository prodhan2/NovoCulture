import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ProjectPreview({ project }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language && project[i18n.language] ? i18n.language : "en";
  const p = project[lang] || project.en;
  const id =
    project.id || (p.title && p.title.replace(/\s+/g, "-").toLowerCase());

  return (
    <article className="group rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-0 shadow-sm overflow-hidden transition-transform duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="p-6">
        <div className="relative">
          {p.image || project.image ? (
            <img
              src={p.image || project.image}
              alt={p.title || p.title}
              className="h-44 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="h-44 rounded-xl border border-dashed border-[color:var(--tan-muted)] bg-[var(--bg-cream-soft)]" />
          )}
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text-brown)] shadow-sm">
            {p.subtitle}
          </div>
        </div>

        <h3 className="mt-4 text-xl font-bold text-[var(--text-brown-strong)] leading-tight">
          {p.title}
        </h3>

        <p className="mt-2 text-sm text-[var(--text-brown)]/85 line-clamp-1">
          {p.description || p.summary}
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            to={`/projects/${id}`}
            aria-label={t("read_more")}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent-terracotta)] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[color:var(--accent-terracotta)]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-terracotta)] focus-visible:ring-offset-2"
          >
            <span>{t("read_more")}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default ProjectPreview;
