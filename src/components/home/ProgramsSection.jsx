const programs = [
  {
    title: "NovoCulture Skill Development Institute",
    description: "Regular programs for skill growth and personal development.",
  },
  {
    title: "Disaster Scholarship & Rehabilitation",
    description: "Flood, cyclone, fire, and emergency humanitarian assistance.",
  },
  {
    title: "Skill-based Entrepreneurship",
    description:
      "Creating opportunities for under-capitalized youth to start ventures.",
  },
  {
    title: "Economic Empowerment",
    description: "Income-generating support for working poor households.",
  },
  {
    title: "Outreach Programs",
    description: "Ongoing initiatives to spread knowledge and awareness.",
  },
  {
    title: "Tree Planting",
    description:
      "Environment-friendly public welfare efforts to build a greener world.",
  },
];

function ProgramsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            Ongoing Programs
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
            Multiple activity cards with carousel-style navigation
          </h2>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            className="h-10 w-10 rounded-full border border-[color:var(--tan-secondary)] bg-white text-[var(--text-brown)]"
          >
            ←
          </button>
          <button
            type="button"
            className="h-10 w-10 rounded-full border border-[color:var(--tan-secondary)] bg-white text-[var(--text-brown)]"
          >
            →
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {programs.map((program) => (
          <article
            key={program.title}
            className="min-w-[280px] flex-1 rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-5 shadow-sm"
          >
            <div className="h-40 rounded-xl border border-dashed border-[color:var(--tan-muted)] bg-[var(--bg-cream)]" />
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-brown)]/70">
              Regular Programs
            </p>
            <h3 className="mt-2 text-lg font-bold text-[var(--text-brown-strong)]">
              {program.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--text-brown)]/85">
              {program.description}
            </p>
            <button
              type="button"
              className="mt-5 inline-flex rounded-lg bg-[var(--accent-terracotta)] px-4 py-2.5 text-sm font-semibold text-white"
            >
              View Details
            </button>
          </article>
        ))}
      </div>

      <div className="mt-4 flex justify-end sm:hidden">
        <button
          type="button"
          className="rounded-full border border-[color:var(--tan-secondary)] bg-white px-4 py-2 text-sm text-[var(--text-brown)]"
        >
          Programs
        </button>
      </div>
    </section>
  );
}

export default ProgramsSection;
