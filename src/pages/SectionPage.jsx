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
      <section className="w-full px-4 py-8 sm:py-16 sm:px-8 lg:px-16 bg-white">
        <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-black/40 mb-2">
            {t("nav.about")}
          </p>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-black mb-12 tracking-tighter leading-none break-words">
            NovoCulture
          </h1>
          <div className="h-2 w-16 sm:w-32 bg-black rounded-full mb-20" />

          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-black" />
            </div>
          ) : (
            <div className="space-y-32">
              {aboutSections.length > 0 && (
                <div className="space-y-24">
                  {aboutSections.map((section) => (
                    <div key={section.id} className="space-y-8 max-w-5xl">
                      <h2 className="text-2xl sm:text-4xl font-black text-black border-l-8 border-black pl-8 tracking-tight break-words">
                        {section[lang]?.title || section.en?.title}
                      </h2>
                      <div 
                        className="prose prose-xl prose-stone max-w-none prose-headings:text-black prose-headings:font-black prose-p:text-black prose-p:font-bold prose-p:leading-relaxed prose-strong:text-black prose-strong:font-black prose-ul:list-disc prose-ol:list-decimal prose-li:font-bold quill-content"
                        dangerouslySetInnerHTML={{ __html: section[lang]?.content || section.en?.content }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {teamMembers.length > 0 && (
                <div className="space-y-16 pt-20 border-t-4 border-black">
                  <div className="max-w-3xl">
                    <h2 className="text-3xl sm:text-6xl font-black text-black mb-6 tracking-tighter">
                      আমাদের টিম
                    </h2>
                    <p className="text-lg sm:text-xl text-black font-bold leading-relaxed opacity-60">
                      নভোকালচার এর মূল চালিকাশক্তি হলো আমাদের নিবেদিতপ্রাণ টিম। শিক্ষা এবং মানবতার সেবায় আমরা সবাই একতাবদ্ধ।
                    </p>
                    <div className="mt-8 h-2 w-20 bg-black rounded-full" />
                  </div>
                  
                  <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {teamMembers.map((member) => (
                      <div 
                        key={member.id} 
                        onClick={() => navigate(`/executive-body/${member.id}`)}
                        className="group relative bg-white p-4 rounded-2xl border-2 border-black shadow-sm transition-all hover:bg-black hover:text-white cursor-pointer overflow-hidden h-fit"
                      >
                        <div className="relative flex items-center gap-4">
                          {/* Left Side Image */}
                          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl border-2 border-black bg-white shrink-0 overflow-hidden shadow-sm group-hover:border-white transition-colors">
                            {member.userPhoto ? (
                              <img src={member.userPhoto} alt={member.userName} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-black/5 text-black">
                                <User className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          {/* Right Side Others */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-black text-black mb-1 truncate group-hover:text-white transition-colors">
                              {member.userName}
                            </h3>
                            <div className="flex items-center gap-1.5 text-black font-black text-[9px] uppercase tracking-widest group-hover:text-white/70 transition-colors">
                              <Briefcase className="h-3 w-3" />
                              <span className="truncate">{member.position}</span>
                            </div>
                            {member.userEmail && (
                              <div className="flex items-center gap-2 mt-1.5 text-[9px] font-bold text-black/40 group-hover:text-white/40 transition-colors">
                                <Mail className="h-3 w-3" />
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
                <div className="text-center py-20 border-4 border-dashed border-black rounded-[3rem]">
                  <p className="text-black/30 text-2xl font-black uppercase tracking-tighter">{t("no_content_available")}</p>
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
