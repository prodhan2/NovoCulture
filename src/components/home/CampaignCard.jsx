import { useTranslation } from "react-i18next";

function CampaignCard({ campaign }) {
  const { t } = useTranslation();
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--accent-terracotta)] bg-white shadow-sm">
      <div className="h-44 border-b border-[var(--accent-terracotta)] bg-[var(--bg-cream-soft)]">
        <div className="flex h-full items-center justify-center border-2 border-dashed border-[var(--accent-terracotta)]/30 text-sm font-bold text-black">
          Image Placeholder
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-black">
              Ongoing Campaign
            </p>
            <h3 className="mt-2 text-base sm:text-lg font-black text-black line-clamp-2 min-h-[3rem]">
              {campaign.title}
            </h3>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between text-sm font-bold text-black">
              <span>{campaign.funded}% funded</span>
              <span>{campaign.funded}%</span>
            </div>
            <div className="h-2 rounded-full bg-black/10">
              <div
                className="h-2 rounded-full bg-[var(--accent-terracotta)]"
                style={{ width: `${campaign.funded}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-black">
            <span>Goal: {campaign.goal}</span>
            <span>Raised: {campaign.raised}</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-[var(--accent-terracotta)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--accent-terracotta-dark)] border-2 border-[var(--accent-terracotta)]"
        >
          {t("donate", "অনুদান করুন")}
        </button>
      </div>
    </article>
  );
}

export default CampaignCard;
