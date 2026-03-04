import { useEffect, useState } from "react";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function openGmail(email: string) {
  const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`;
  window.open(url, "_blank");
}

async function fetchSetting(key: string, fallback: string): Promise<string> {
  try {
    const res = await fetch(`${BASE_URL}/settings/${key}`);
    if (!res.ok) return fallback;
    const data = await res.json();
    return data.value || fallback;
  } catch {
    return fallback;
  }
}

interface FooterData {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  emailIcon: string;
}

const DEFAULTS: FooterData = {
  phone: "",
  email: "abc@acc.edu.bd",
  facebook: "https://facebook.com/accbc",
  instagram: "https://instagram.com/accbc",
  linkedin: "https://linkedin.com/company/accbc",
  emailIcon: "mailto:abc@acc.edu.bd",
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<FooterData>(DEFAULTS);

  useEffect(() => {
    Promise.all([
      fetchSetting("footer_phone", DEFAULTS.phone),
      fetchSetting("contact_email", ""), // check new contact_email first
      fetchSetting("footer_email", DEFAULTS.email),
      fetchSetting("footer_facebook", DEFAULTS.facebook),
      fetchSetting("footer_instagram", DEFAULTS.instagram),
      fetchSetting("footer_linkedin", DEFAULTS.linkedin),
      fetchSetting("footer_email_icon", DEFAULTS.emailIcon),
    ]).then(([phone, contactEmail, footerEmail, facebook, instagram, linkedin, emailIcon]) => {
      setData({
        phone,
        email: contactEmail || footerEmail, // Prioritize contactEmail
        facebook,
        instagram,
        linkedin,
        emailIcon
      });
    });
  }, []);

  const socialLinks = [
    { icon: Facebook, href: data.facebook, label: "Facebook", onClick: null as null | (() => void) },
    { icon: Instagram, href: data.instagram, label: "Instagram", onClick: null as null | (() => void) },
    { icon: Linkedin, href: data.linkedin, label: "LinkedIn", onClick: null as null | (() => void) },
    { icon: Mail, href: null as string | null, label: "Email", onClick: () => openGmail(data.email) },
  ];

  return (
    <footer className="bg-[#063970] text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Club Logo & Description */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl mb-4">ACCBC</h3>
            <p className="text-white/80 text-sm">
              Possibilities are Infinite, Those Who Dare Win.
            </p>
            {/* Contact Info */}
            {(data.phone || data.email) && (
              <div className="mt-4 space-y-1 text-white/70 text-sm">
                {data.phone && (
                  <p>📞 <a href={`tel:${data.phone}`} className="hover:text-white transition-colors">{data.phone}</a></p>
                )}
                {data.email && (
                  <p>✉️ <button onClick={() => openGmail(data.email)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", fontSize: "inherit", padding: 0 }} className="hover:text-white transition-colors">{data.email}</button></p>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="mb-4">Quick Links</h4>
            <ul className="space-y-2 text-white/80 text-sm">
              <li><a href="#home" className="hover:text-white transition-colors">Home</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#events" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="#join" className="hover:text-white transition-colors">Join Us</a></li>
            </ul>
          </div>

          {/* Social Links */}
          <div className="text-center md:text-left">
            <h4 className="mb-4">Connect With Us</h4>
            <div className="flex space-x-4 justify-center md:justify-start">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                const cls = "w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors";
                if (social.onClick) {
                  return (
                    <button
                      key={index}
                      onClick={social.onClick}
                      className={cls}
                      aria-label={social.label}
                      style={{ border: "none", cursor: "pointer", color: "white" }}
                    >
                      <Icon size={18} />
                    </button>
                  );
                }
                return (
                  <a
                    key={index}
                    href={social.href ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                    aria-label={social.label}
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 text-center text-sm text-white/80">
          <p>© {currentYear} Adamjee Cantonment College Business Club. All rights reserved.</p>
          <p className="mt-2">Developed by a stranger</p>
        </div>
      </div>
    </footer>
  );
}
