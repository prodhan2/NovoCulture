function CampaignCard({ campaign }) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[color:var(--tan-secondary)] bg-white shadow-sm">
      <div className="h-44 border-b border-[color:var(--tan-secondary)] bg-[var(--bg-cream-soft)]">
        <div className="flex h-full items-center justify-center border-2 border-dashed border-[color:var(--tan-muted)] text-sm font-medium text-[var(--text-brown)]/70">
          Image Placeholder
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-brown)]/70">
              Ongoing Campaign
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--text-brown-strong)]">
              {campaign.title}
            </h3>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm text-[var(--text-brown)]/75">
              <span>{campaign.funded}% funded</span>
              <span>{campaign.funded}%</span>
            </div>
            <div className="h-2 rounded-full bg-[rgba(224,169,109,0.35)]">
              <div
                className="h-2 rounded-full bg-[var(--accent-terracotta)]"
                style={{ width: `${campaign.funded}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-[var(--text-brown)]/80">
            <span>Goal: {campaign.goal}</span>
            <span>Raised: {campaign.raised}</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--accent-terracotta)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-terracotta-dark)]"
        >
          Donate
        </button>
      </div>
    </article>
  );
}

export default CampaignCard;
