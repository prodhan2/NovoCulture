import { useState } from "react";
import { useTranslation } from "react-i18next";

function HeroSection() {
  const [fund, setFund] = useState("");
  const [contact, setContact] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!fund || !contact || !amount) {
      setStatus("Please complete the donation form fields.");
      return;
    }

    setStatus(`Submitted: ${fund} | ${contact} | BDT ${amount}`);
  }

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-[color:var(--tan-secondary)]/60 bg-[var(--bg-cream-soft)] shadow-[0_18px_50px_rgba(74,37,17,0.08)]">
        <div className="grid min-h-[640px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative flex items-end p-6 sm:p-10 lg:p-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(224,169,109,0.3),transparent_35%),linear-gradient(135deg,#fff5eb_0%,#faf0e6_48%,#f3dfc6_100%)]" />
            <div className="absolute left-8 top-10 h-24 w-24 rounded-full border border-[color:var(--tan-secondary)] bg-white/60" />
            <div className="absolute bottom-12 right-10 h-40 w-40 rounded-[1.75rem] border border-[color:var(--tan-secondary)] bg-[rgba(255,245,235,0.8)]" />
            <div className="absolute left-1/2 top-10 h-28 w-28 -translate-x-1/2 rounded-full border border-dashed border-[color:var(--tan-muted)]/80 bg-white/30" />

            {(() => {
              const { t, i18n } = useTranslation();
              return (
                <div className="relative z-10 max-w-2xl space-y-6 rounded-2xl border border-[color:var(--tan-secondary)]/65 bg-white/75 p-6 backdrop-blur-sm sm:p-8">
                  <span className="inline-flex rounded-full border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-brown-strong)]">
                    {t("hero_tagline", "Explore. Support. Inspire.")}
                  </span>
                  <div className="space-y-4">
                    <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight text-[var(--text-brown-strong)] sm:text-5xl lg:text-6xl">
                      {t("hero_title", "NovoCulture homepage structure")}
                    </h1>
                    <p className="max-w-xl text-sm leading-7 text-[var(--text-brown)]/85 sm:text-base">
                      {t(
                        "hero_description",
                        "Warm, educational, and culturally grounded presentation for outreach, donation drives, and community programs across the foundation.",
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="rounded-lg bg-[var(--accent-terracotta)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-terracotta-dark)]"
                    >
                      {t("donate", "Donate Now")}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[color:var(--tan-secondary)] bg-white px-5 py-3 text-sm font-semibold text-[var(--text-brown)] transition hover:bg-[var(--bg-cream)]"
                    >
                      {t("learn_more", "Learn More")}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      t("community_outreach", "Community outreach"),
                      t("transparent_giving", "Transparent giving"),
                      t("education_support", "Education support"),
                    ].map((value) => (
                      <div
                        key={value}
                        className="rounded-xl border border-[color:var(--tan-secondary)]/70 bg-[var(--bg-cream)] px-4 py-3 text-sm font-medium text-[var(--text-brown)]"
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="relative border-t border-[color:var(--tan-secondary)]/45 lg:border-l lg:border-t-0">
            <div className="flex h-full flex-col justify-between gap-6 p-6 sm:p-10 lg:p-14">
              <form
                className="space-y-4 rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-5 shadow-sm"
                onSubmit={handleSubmit}
              >
                <h2 className="text-2xl font-bold text-[var(--text-brown-strong)]">
                  Make a Donation
                </h2>
                <div className="space-y-3 text-sm text-[var(--text-brown)]/85">
                  <label className="block">
                    <span className="mb-1 block font-medium" htmlFor="fund">
                      Fund
                    </span>
                    <select
                      id="fund"
                      value={fund}
                      onChange={(event) => setFund(event.target.value)}
                      className="h-11 w-full rounded-lg border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] px-3 outline-none transition focus:border-[var(--accent-terracotta)] focus:ring-2 focus:ring-[rgba(217,107,39,0.2)]"
                    >
                      <option value="">Select</option>
                      <option value="General Donation">General Donation</option>
                      {/* <option value="Zakat">Zakat</option> */}
                      <option value="Eid Gift">Eid Gift</option>
                      {/* <option value="Relief">Relief</option> */}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-medium" htmlFor="contact">
                      Mobile / Email
                    </span>
                    <input
                      id="contact"
                      type="text"
                      value={contact}
                      onChange={(event) => setContact(event.target.value)}
                      placeholder="Mobile number or email"
                      className="h-11 w-full rounded-lg border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] px-3 outline-none transition focus:border-[var(--accent-terracotta)] focus:ring-2 focus:ring-[rgba(217,107,39,0.2)]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block font-medium" htmlFor="amount">
                      Amount
                    </span>
                    <input
                      id="amount"
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(event) => setAmount(event.target.value)}
                      placeholder="Amount (BDT)"
                      className="h-11 w-full rounded-lg border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] px-3 outline-none transition focus:border-[var(--accent-terracotta)] focus:ring-2 focus:ring-[rgba(217,107,39,0.2)]"
                    />
                  </label>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-[var(--accent-terracotta)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-terracotta-dark)]"
                  >
                    Donate
                  </button>
                </div>
                <p className="text-xs leading-6 text-[var(--text-brown)]/70">
                  {status || "Donations to NovoCulture may be tax-deductible."}
                </p>
              </form>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {["Education", "Scholarship", "Healthcare"].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-[color:var(--tan-secondary)] bg-white p-4"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-brown)]/70">
                      Campaign
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[var(--text-brown-strong)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
