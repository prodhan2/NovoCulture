import BlogSection from "../components/home/BlogSection.jsx";
import FeatureHighlights from "../components/home/FeatureHighlights.jsx";
import FundsSection from "../components/home/FundsSection.jsx";
import GallerySection from "../components/home/GallerySection.jsx";
import InstitutionsSection from "../components/home/InstitutionsSection.jsx";
import JoinSection from "../components/home/JoinSection.jsx";
import ProjectPreview from "../components/home/ProjectPreview.jsx";
import NewsletterSection from "../components/home/NewsletterSection.jsx";
import HeroSection from "../components/home/HeroSection.jsx";
import ProgramsSection from "../components/home/ProgramsSection.jsx";
import { projects } from "../data/projects.js";
import { useTranslation } from "react-i18next";

function HomePage() {
  const { t } = useTranslation();

  return (
    <>
      <HeroSection />
      <FeatureHighlights />
      <ProgramsSection />
      <FundsSection />
      <JoinSection />
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            {t("projects_label", "Projects")}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
            {t("recent_updates", "Recent NovoCulture updates")}
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {projects.map((project) => (
            <ProjectPreview key={project.title} project={project} />
          ))}
        </div>
      </section>
      <GallerySection />
      <BlogSection />
      <InstitutionsSection />
      <NewsletterSection />
    </>
  );
}

export default HomePage;
