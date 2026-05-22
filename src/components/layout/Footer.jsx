import { Globe, Link2, Mail, MapPin, Phone, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import LogoMark from "./LogoMark.jsx";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { getSettings } from "../../services/firestore";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Projects", to: "/projects" },
  { label: "Media", to: "/media" },
];

function Footer() {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState(null);

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

  const lang = i18n?.language && i18n.language.startsWith("bn") ? "bn" : "en";
  return (
    <footer className="bg-[var(--accent-terracotta)] text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-4 text-white">
            <LogoMark compact />
          </div>
          <p className="text-sm leading-6 text-white/90">
            নভোকালচার একটি অরাজনৈতিক ও অলাভজনক সামাজিক প্ল্যাটফর্ম, যা শিক্ষা, নৈতিকতা এবং মানবতার সেবায় নিবেদিত। আমরা জ্ঞান ও সেবার মাধ্যমে একটি আলোকিত সমাজ গঠনে কাজ করছি।
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Quick Links
          </h2>
          <ul className="space-y-3 text-sm text-white/90">
            {quickLinks.map((item) => (
              <li key={item.to}>
                <Link
                  className="transition hover:text-white"
                  to={item.to}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            More Links
          </h2>
          <ul className="space-y-3 text-sm text-white/90">
            <li>
              <Link
                className="transition hover:text-white"
                to="/donation"
              >
                Donate Now
              </Link>
            </li>
            <li>
              <Link
                className="transition hover:text-white"
                to="/contact"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                className="transition hover:text-white"
                to="/media"
              >
                News & Media
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-white">
            Contact
          </h2>
          <div className="space-y-3 text-sm text-white/90">
            <p className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span dir="auto">
                {settings?.contact?.[lang]?.address ?? t("contact.address")}
              </span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="h-4 w-4 shrink-0" />
              {settings?.contact?.[lang]?.phone ?? t("contact.phone")}
            </p>
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 shrink-0" />
              {settings?.contact?.email ?? t("contact.email")}
            </p>
            <div className="flex items-center gap-3 pt-2 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Globe className="h-4 w-4" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Share2 className="h-4 w-4" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <Link2 className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-sm text-white/70 sm:px-6 lg:px-8">
        Copyright © 2026 Charity Foundation. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
