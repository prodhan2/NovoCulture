import { Link } from "react-router-dom";
import GallerySection from "../components/home/GallerySection.jsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getSettings } from "../services/firestore";

function SectionPage({ title }) {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState(null);
  const lang = i18n?.language && i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await getSettings();
        if (mounted) setSettings(s);
      } catch (err) {
        // ignore
      }
    }
    load();
    return () => (mounted = false);
  }, []);
  if (title === "Media") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            Media
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--text-brown-strong)] sm:text-4xl">
            NovoCulture Media
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-brown)]/85 sm:text-base">
            A collection of videos and photo highlights from NovoCulture
            programs and community events. Browse our recent media and reach out
            if you need high-resolution assets or permissions.
          </p>

          <div className="mt-8">
            <GallerySection />
          </div>
        </div>
      </section>
    );
  }

  if (title === "About Us") {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            About
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--text-brown-strong)] sm:text-4xl">
            NovoCulture
          </h1>

          <div className="mt-6 space-y-6 text-[var(--text-brown)]/90">
            <p className="text-sm leading-7 sm:text-base">
              NovoCulture is a community-focused nonprofit dedicated to
              education, scholarship, and community development. We run programs
              that provide learning opportunities, emergency aid, and livelihood
              support across local communities.
            </p>

            <section>
              <h2 className="text-lg font-semibold text-[var(--text-brown-strong)]">
                Our Mission
              </h2>
              <p className="mt-2 text-sm leading-7">
                To empower communities through education, sustainable
                development, and compassionate humanitarian services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--text-brown-strong)]">
                Source of Income
              </h2>
              <p className="mt-2 text-sm leading-7">
                NovoCulture is funded through a combination of public donations,
                zakat contributions, grants, program fees, and fundraising
                events. We strive for financial transparency and responsible
                stewardship of funds.
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                <li className="rounded-lg border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] p-3">
                  <strong>Public Donations:</strong> One-time and recurring
                  gifts
                  <div className="mt-2">
                    <strong>Address:</strong>{" "}
                    <span dir="auto">
                      {settings?.contact?.[lang]?.address ??
                        t("contact.address")}
                    </span>
                  </div>
                  contributions managed per donors' guidance
                </li>
                <li className="rounded-lg border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] p-3">
                  <strong>Grants:</strong> Restricted and unrestricted grants
                </li>
                <li className="rounded-lg border border-[color:var(--tan-secondary)] bg-[var(--bg-cream)] p-3">
                  <strong>Fundraising Events:</strong> Campaigns and community
                  events
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--text-brown-strong)]">
                Income & Expenditure (Sample)
              </h2>
              <p className="mt-2 text-sm leading-7">
                The numbers below are sample/demo figures. Replace with your
                organization’s audited financials for publication.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-[color:var(--tan-secondary)] bg-white p-4">
                  <h3 className="text-sm font-semibold">Income — FY 2025</h3>
                  <ul className="mt-3 text-sm">
                    <li>Public donations: BDT 4,200,000</li>
                    <li>Zakat & religious giving: BDT 1,100,000</li>
                    <li>Grants: BDT 2,500,000</li>
                    <li>Events & other: BDT 700,000</li>
                    <li className="mt-2 font-semibold">
                      Total income: BDT 8,500,000
                    </li>
                  </ul>
                </div>

                <div className="rounded-lg border border-[color:var(--tan-secondary)] bg-white p-4">
                  <h3 className="text-sm font-semibold">
                    Expenditure — FY 2025
                  </h3>
                  <ul className="mt-3 text-sm">
                    <li>Program services: BDT 5,100,000</li>
                    <li>Administrative: BDT 1,200,000</li>
                    <li>Fundraising: BDT 600,000</li>
                    <li className="mt-2 font-semibold">
                      Total expenses: BDT 6,900,000
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-sm">
                For full audited reports and detailed expenditure breakdowns,
                contact the NovoCulture office or provide reports on this site
                when available.
              </p>
            </section>
          </div>
        </div>
      </section>
    );
  }

  if (title === "Contact") {
    return (
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-8 shadow-sm sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            Contact
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--text-brown-strong)] sm:text-4xl">
            Get in touch
          </h1>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm leading-7 text-[var(--text-brown)]/90">
                For media, partnerships, or program enquiries, reach out to the
                NovoCulture team using the contact details below or send us a
                message using the form.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-[var(--text-brown)]/90">
                <li>
                  <strong>Address:</strong>{" "}
                  {settings?.contact?.[lang]?.address ?? t("contact.address")}
                </li>
                <li>
                  <strong>Phone:</strong>{" "}
                  {settings?.contact?.[lang]?.phone ?? t("contact.phone")}
                </li>
                <li>
                  <strong>Email:</strong>{" "}
                  <a
                    href={`mailto:${settings?.contact?.email ?? t("contact.email")}`}
                    className="text-[var(--accent-terracotta)]"
                  >
                    {settings?.contact?.email ?? t("contact.email")}
                  </a>
                </li>
                <li>
                  <strong>Office hours:</strong> Mon–Fri, 9:00 AM — 5:00 PM
                </li>
              </ul>
            </div>

            <div>
              <form className="space-y-4 rounded-lg border border-[color:var(--tan-secondary)] bg-[var(--bg-cream-soft)] p-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Your name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name"
                    className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Message
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Write your message"
                    className="w-full rounded-lg border border-[color:var(--tan-secondary)] px-3 py-2"
                  />
                </div>
                <div>
                  <button
                    type="button"
                    className="inline-flex rounded-lg bg-[var(--accent-terracotta)] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Send message
                  </button>
                  <span className="ml-3 text-xs text-[var(--text-brown)]/70">
                    (Demo only — not wired to a backend)
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-8 shadow-sm sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
          Placeholder page
        </p>
        <h1 className="mt-3 text-3xl font-bold text-[var(--text-brown-strong)] sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-brown)]/85 sm:text-base">
          This route exists to keep the navigation functional while the project
          stays aligned with the NovoCulture palette and layout rules.
        </p>
      </div>
    </section>
  );
}

export default SectionPage;
