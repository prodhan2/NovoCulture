import { useNavigate } from "react-router-dom";
import GallerySection from "../components/home/GallerySection.jsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getSettings, getAboutContent } from "../services/firestore";
import { Loader2, Video, Image as ImageIcon, ArrowLeft, User, Briefcase, Mail } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function SectionPage({ title }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [aboutSections, setAboutSections] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const lang = i18n?.language && i18n.language.startsWith("bn") ? "bn" : "en";

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (title === "About Us") setLoading(true);
      try {
        const [s, about] = await Promise.all([
          getSettings(),
          title === "About Us" ? getAboutContent() : Promise.resolve([])
        ]);
        if (mounted) {
          setSettings(s);
          if (title === "About Us") {
            const sections = about.filter(item => item.type !== "team");
            const team = about.filter(item => item.type === "team");
            setAboutSections(sections);
            setTeamMembers(team);
          } else {
            setAboutSections(about);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [title]);

  if (title === "About Us") {
    return (
      <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-terracotta)]">
            {t("nav.about")}
          </p>
          <h1 className="mt-3 text-3xl font-black text-[var(--text-brown-strong)] sm:text-5xl mb-12 tracking-tight">
            NovoCulture
          </h1>

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-terracotta)]" />
            </div>
          ) : (
            <div className="space-y-24">
              {aboutSections.length > 0 && (
                <div className="space-y-16">
                  {aboutSections.map((section) => (
                    <div key={section.id} className="space-y-6 max-w-4xl">
                      <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-brown-strong)] border-l-4 border-[var(--accent-terracotta)] pl-6">
                        {section[lang]?.title || section.en?.title}
                      </h2>
                      <div className="prose prose-lg prose-stone max-w-none prose-headings:text-[var(--text-brown-strong)] prose-p:text-[var(--text-brown)]/80 prose-strong:text-[var(--text-brown-strong)] prose-ul:list-disc prose-ol:list-decimal">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {section[lang]?.content || section.en?.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {teamMembers.length > 0 && (
                <div className="space-y-12 pt-16 border-t-2 border-[var(--text-brown)]/5">
                  <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-5xl font-black text-[var(--text-brown-strong)] mb-4 tracking-tighter">
                      আমাদের টিম
                    </h2>
                    <p className="text-base sm:text-lg text-[var(--text-brown)]/60 font-bold leading-relaxed">
                      নভোকালচার এর মূল চালিকাশক্তি হলো আমাদের নিবেদিতপ্রাণ টিম। শিক্ষা এবং মানবতার সেবায় আমরা সবাই একতাবদ্ধ।
                    </p>
                    <div className="mt-6 h-1 w-16 bg-[var(--accent-terracotta)] mx-auto rounded-full" />
                  </div>
                  
                  <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {teamMembers.map((member) => (
                      <div 
                        key={member.id} 
                        onClick={() => navigate(`/executive-body/${member.id}`)}
                        className="group relative bg-white p-3 sm:p-4 rounded-2xl border-2 border-[var(--text-brown)]/5 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer"
                      >
                        <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-[var(--accent-terracotta)]/5 transition-transform group-hover:scale-150" />
                        
                        <div className="relative flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
                          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full border-2 border-[var(--accent-terracotta)]/20 p-0.5 bg-white shrink-0 overflow-hidden shadow-sm">
                            {member.userPhoto ? (
                              <img src={member.userPhoto} alt={member.userName} className="h-full w-full object-cover rounded-full" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-[var(--bg-cream)] text-[var(--text-brown)] rounded-full">
                                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 w-full">
                            <h3 className="text-[11px] sm:text-sm font-black text-[var(--text-brown-strong)] mb-0.5 truncate group-hover:text-[var(--accent-terracotta)] transition-colors">
                              {member.userName}
                            </h3>
                            <div className="flex items-center justify-center sm:justify-start gap-1 text-[var(--accent-terracotta)] font-black text-[7px] sm:text-[8px] uppercase tracking-wider mb-1">
                              <Briefcase className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
                              <span className="truncate">{member.position}</span>
                            </div>
                            {member.userEmail && (
                              <div className="hidden sm:flex items-center gap-1.5 text-[8px] font-bold text-[var(--text-brown)]/40">
                                <Mail className="h-2.5 w-2.5" />
                                <span className="truncate">{member.userEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aboutSections.length === 0 && teamMembers.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed border-[var(--text-brown)]/10 rounded-3xl">
                  <p className="text-[var(--text-brown)]/50 text-lg">{t("no_content_available")}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="w-full px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-black bg-white p-8 shadow-sm sm:p-12">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-black">
          Placeholder page
        </p>
        <h1 className="mt-3 text-3xl font-bold text-black sm:text-4xl">
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
