const features = [
  {
    title: "Education",
    description:
      "Integrated syllabus of religious and general education, institution-based opportunities, and skill-building initiatives.",
  },
  {
    title: "Scholarship & Services",
    description:
      "Scholarship, rehabilitation, water, winter clothing, iftar, Qurbani, and livelihood-oriented humanitarian programs.",
  },
  {
    title: "Outreach",
    description:
      "Books, halaqah, training, online-offline activities, and ongoing awareness initiatives.",
  },
];

function FeatureHighlights() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-6 shadow-sm"
          >
            <div className="mb-4 h-12 w-12 rounded-xl border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)]" />
            <h2 className="text-xl font-bold text-[var(--text-brown-strong)]">
              {feature.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-brown)]/85">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default FeatureHighlights;
