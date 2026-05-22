import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function ProjectPreview({ project }) {
  const { i18n, t } = useTranslation();
  const lang = i18n.language && project[i18n.language] ? i18n.language : "en";
  const p = project[lang] || project.en;
  const id =
    project.id || (p.title && p.title.replace(/\s+/g, "-").toLowerCase());

  return (
    <article className="group rounded-2xl border-2 border-[var(--accent-terracotta)] bg-white p-0 shadow-sm overflow-hidden transition-transform duration-200 hover:shadow-md hover:-translate-y-1">
      <div className="p-6">
        <div className="relative">
          {p.image || project.image ? (
            <img
              src={p.image || project.image}
              alt={p.title || p.title}
              className="h-44 w-full rounded-xl object-cover"
            />
          ) : (
            <div className="h-44 rounded-xl border border-dashed border-[var(--accent-terracotta)]/30 bg-[var(--bg-cream-soft)]" />
          )}
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black shadow-sm">
            {p.subtitle}
          </div>
        </div>

        <h3 className="mt-4 text-base sm:text-lg font-black text-black leading-tight line-clamp-2 min-h-[3rem]">
          {p.title}
        </h3>

        <p className="mt-2 text-xs sm:text-sm text-black font-medium line-clamp-2 min-h-[2.5rem]">
          {p.description || p.summary}
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            to={`/projects/${id}`}
            aria-label={t("read_more")}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--accent-terracotta)] px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-colors duration-150 hover:bg-[var(--accent-terracotta-dark)] border-2 border-[var(--accent-terracotta)]"
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
