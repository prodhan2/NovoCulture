function AboutPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
        <div className="relative min-h-[420px] overflow-hidden rounded-2xl border border-[color:var(--tan-secondary)] bg-[linear-gradient(135deg,#fff5eb_0%,#faf0e6_48%,#f3dfc6_100%)] p-6">
          <div className="absolute left-8 top-8 h-56 w-3/4 rounded-2xl border border-[color:var(--tan-secondary)] bg-white/70" />
          <div className="absolute bottom-8 right-8 h-44 w-5/12 rounded-2xl border border-[color:var(--tan-secondary)] bg-[rgba(255,245,235,0.85)]" />
          <div className="absolute bottom-20 left-10 h-32 w-32 rounded-xl border border-dashed border-[color:var(--tan-muted)] bg-white" />
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
              About Preview
            </p>
            <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
              About Our Foundation
            </h2>
          </div>

          <div className="space-y-4 text-sm leading-7 text-[var(--text-brown)]/85 sm:text-base">
            <p>
              This section carries the warm cream background, rounded geometry,
              and culturally grounded tone requested in the instruction file.
            </p>
            <p>
              The composition is intentionally calm and educational, with space
              for founder story, mission summary, and a clear reading path.
            </p>
          </div>

          <ul className="space-y-3 text-sm text-[var(--text-brown)] sm:text-base">
            {[
              "Transparent reporting",
              "Community-first programs",
              "Long-term impact",
            ].map((value) => (
              <li key={value} className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[var(--accent-terracotta)]" />
                <span>{value}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="rounded-lg bg-[var(--accent-terracotta)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-terracotta-dark)]"
          >
            Read More
          </button>
        </div>
      </div>
    </section>
  );
}

export default AboutPreview;
