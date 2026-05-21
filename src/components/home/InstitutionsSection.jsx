const institutions = [
  { name: "NovoCulture", url: "https://novoculture.org" },
  { name: "NovoCulture Programs", url: "/programs" },
  { name: "NovoCulture Projects", url: "/projects" },
];

function InstitutionsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
          Our Institutions
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
          Related institutions and partner links
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {institutions.map((institution) => (
          <a
            key={institution.name}
            href={institution.url}
            className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-6 text-[var(--text-brown-strong)] shadow-sm"
          >
            <div className="h-20 rounded-xl border border-dashed border-[color:var(--tan-muted)] bg-[var(--bg-cream)]" />
            <p className="mt-4 text-base font-semibold">{institution.name}</p>
          </a>
        ))}
      </div>
    </section>
  );
}

export default InstitutionsSection;
