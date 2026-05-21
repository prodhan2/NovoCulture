import { useTranslation } from "react-i18next";

function NewsletterSection() {
  const { t } = useTranslation();

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-[color:var(--tan-secondary)] bg-[var(--bg-cream-soft)] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
          {t("subscribe_newsletter", "Subscribe for regular newsletter")}
        </p>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <input
            type="email"
            placeholder={t("enter_email", "Enter your email")}
            className="h-12 flex-1 rounded-lg border border-[color:var(--tan-secondary)] bg-white px-4 text-sm text-[var(--text-brown)] outline-none"
          />
          <button
            type="button"
            className="h-12 rounded-lg bg-[var(--accent-terracotta)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-terracotta-dark)]"
          >
            {t("subscribe", "Subscribe")}
          </button>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
