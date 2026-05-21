const posts = [
  {
    title: "301st Episode of Live Q&A Held",
    description:
      "A compact blog layout that mirrors the source site’s story cards with title, excerpt, and date.",
    date: "May 9, 2026",
  },
  {
    title: "Five-Day Imam Training Completed",
    description:
      "Structured article card with concise summary and date metadata for news content.",
    date: "May 2, 2026",
  },
  {
    title: "Hajj Training Workshop 2026 Held in Two Sessions",
    description:
      "Another content card to preserve the news-grid feel of the original homepage.",
    date: "April 19, 2026",
  },
];

function BlogSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--text-brown)]/70">
            Blog
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[var(--text-brown-strong)] sm:text-3xl">
            Story feed and announcements
          </h2>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.title}
            className="rounded-2xl border border-[color:var(--tan-secondary)] bg-white p-6 shadow-sm"
          >
            <div className="h-40 rounded-xl border border-dashed border-[color:var(--tan-muted)] bg-[var(--bg-cream)]" />
            <h3 className="mt-4 text-lg font-bold text-[var(--text-brown-strong)]">
              {post.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--text-brown)]/85">
              {post.description}
            </p>
            <p className="mt-3 text-sm font-medium text-[var(--accent-terracotta)]">
              {post.date}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BlogSection;
