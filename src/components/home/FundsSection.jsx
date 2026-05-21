const funds = [
  {
    title: "NovoCulture Community Center",
    description:
      "A hub for diverse programs serving the welfare of the country, nation, and community.",
  },
  {
    title: "Qurbani for All",
    description:
      "Providing Qurbani meat distribution to support people in need in underprivileged areas.",
  },
  {
    title: "Recurring Donation Fund",
    description:
      "Support via automated recurring donations on a daily or monthly basis.",
  },
];

function FundsSection() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[color:var(--tan-secondary)] bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            Donation Funds
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
            Donor-focused funding blocks with a slider feel
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--text-brown)]/85">
            This section follows the source site’s donation-fund pattern with
            large cards, a heading pair, and prominent donate actions.
          </p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {funds.map((fund) => (
            <article
              key={fund.title}
              className="min-w-[320px] flex-1 rounded-2xl border border-[color:var(--tan-secondary)] bg-[var(--bg-cream-soft)] p-5"
            >
              <div className="h-48 rounded-2xl border border-dashed border-[color:var(--tan-muted)] bg-white" />
              <h3 className="mt-4 text-lg font-bold text-[var(--text-brown-strong)]">
                {fund.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--text-brown)]/85">
                {fund.description}
              </p>
              <button
                type="button"
                className="mt-5 inline-flex rounded-lg bg-[var(--accent-terracotta)] px-5 py-2.5 text-sm font-semibold text-white"
              >
                Donate
              </button>
            </article>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            className="rounded-full border border-[color:var(--tan-secondary)] bg-white px-4 py-2 text-sm text-[var(--text-brown)]"
          >
            Prev
          </button>
          <button
            type="button"
            className="rounded-full border border-[color:var(--tan-secondary)] bg-white px-4 py-2 text-sm text-[var(--text-brown)]"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}

export default FundsSection;
