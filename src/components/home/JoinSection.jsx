const joinItems = [
  "Regular Donor",
  "Lifetime & Patron Members",
  "Volunteer",
  "Careers",
];

function JoinSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
          Join Us
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
          Ways to participate in the mission
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-brown)]/85">
          The source homepage uses a clear four-tile join-us section; this keeps
          that same participation structure in a cleaner NovoCulture tone.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {joinItems.map((item) => (
          <button
            key={item}
            type="button"
            className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-6 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 h-14 w-14 rounded-2xl border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)]" />
            <p className="text-lg font-bold text-[var(--text-brown-strong)]">
              {item}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default JoinSection;
