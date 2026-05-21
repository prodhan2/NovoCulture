import { projects as localProjects } from "../data/projects.js";
import { useTranslation } from "react-i18next";
import ProjectPreview from "../components/home/ProjectPreview.jsx";
import useFirestoreProjects from "../hooks/useFirestoreProjects";

function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const sourceMode = "auto"; // fixed to auto; source selector removed

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
          {t("projects_label", "Projects")}
        </p>
        <h1 className="mt-2 text-3xl font-bold text-[var(--text-brown-strong)] sm:text-4xl">
          {t("projects_heading", "NovoCulture project updates")}
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--text-brown)]/85 sm:text-base">
          {t(
            "projects_description",
            "These two posts have been added as structured project updates so the site now reflects your actual community activity rather than a generic placeholder page.",
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(() => {
          const {
            projects: fsProjects,
            loading,
            error,
          } = useFirestoreProjects();

          let sourceProjects = localProjects;

          if (sourceMode === "demo") {
            sourceProjects = localProjects;
          } else if (sourceMode === "live") {
            sourceProjects = fsProjects && fsProjects.length ? fsProjects : [];
          } else {
            // auto
            sourceProjects =
              fsProjects && fsProjects.length ? fsProjects : localProjects;
          }

          if (sourceMode !== "demo") {
            if (loading) return <p>Loading projects...</p>;
            if (error)
              return <p className="text-sm text-red-600">Error: {error}</p>;
          }

          if (!sourceProjects || !sourceProjects.length) {
            return (
              <p className="text-sm text-[var(--text-brown)]/80">
                {t("projects_none", "No projects found.")}
              </p>
            );
          }

          return sourceProjects.map((project) => (
            <ProjectPreview
              key={project.id || project.en.title}
              project={project}
            />
          ));
        })()}
      </div>
    </section>
  );
}

export default ProjectsPage;
