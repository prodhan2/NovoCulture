const stats = [
  { value: "1M+", label: "Beneficiaries" },
  { value: "500+", label: "Projects" },
  { value: "64", label: "Districts" },
  { value: "1200+", label: "Volunteers" },
];

function ImpactStats() {
  return (
    <section className="bg-[var(--text-brown-strong)] py-14 text-[var(--bg-cream)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[rgba(224,169,109,0.35)] bg-[rgba(255,245,235,0.06)] p-6 text-center"
            >
              <div className="text-3xl font-bold text-white sm:text-4xl">
                {stat.value}
              </div>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-[rgba(250,240,230,0.82)]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ImpactStats;
