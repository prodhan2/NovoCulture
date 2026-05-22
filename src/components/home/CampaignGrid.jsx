import CampaignCard from "./CampaignCard.jsx";

function CampaignGrid({ campaigns }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-black/50">
            Campaigns
          </p>
          <h2 className="mt-2 text-xl sm:text-3xl font-black text-black">
            Structured donation grid
          </h2>
        </div>
        <p className="max-w-xl text-xs sm:text-sm leading-6 text-black font-medium">
          This section mirrors the common NGO campaign-card layout with
          consistent spacing, progress meters, and repeated action buttons.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {campaigns.map((campaign) => (
          <CampaignCard key={campaign.title} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}

export default CampaignGrid;
