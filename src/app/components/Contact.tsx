import { useEffect, useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

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

function openGmail(email: string) {
  const url = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(email)}`;
  window.open(url, "_blank");
}

export function Contact() {
  const [email, setEmail] = useState("info@accbc.edu.bd");
  const [phone, setPhone] = useState("+880 1XXX-XXXXXX");

  useEffect(() => {
    // Prefer contact_email; fall back to footer_email for backward compatibility
    fetchSetting("contact_email", "").then((contactEmail) => {
      if (contactEmail) {
        setEmail(contactEmail);
      } else {
        fetchSetting("footer_email", "info@accbc.edu.bd").then(setEmail);
      }
    });
    fetchSetting("footer_phone", "+880 1XXX-XXXXXX").then(setPhone);
  }, []);

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: email,
      onClick: () => openGmail(email),
      link: "#",
    },
    {
      icon: Phone,
      label: "Phone",
      value: phone || "+880 1XXX-XXXXXX",
      link: phone ? `tel:${phone.replace(/\s/g, "")}` : null,
      onClick: null,
    },
    {
      icon: MapPin,
      label: "Address",
      value: "Adamjee Cantonment College, Dhaka",
      link: null,
      onClick: null,
    },
  ];

  return (
    <section id="contact" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-[#919ea7] max-w-2xl mx-auto">
            Get in touch with us for any queries or information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl text-[#063970] mb-6">Get In Touch</h3>
            <div className="space-y-6">
              {contactInfo.map((info, index) => {
                const Icon = info.icon;
                const content = (
                  <div className="flex items-start space-x-4 p-4 bg-white rounded-lg hover:shadow-md transition-shadow duration-300">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-[#063970] rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-gray-700 mb-1">{info.label}</h4>
                      <p className="text-[#063970]">{info.value}</p>
                    </div>
                  </div>
                );

                if (info.onClick) {
                  return (
                    <button
                      key={index}
                      onClick={info.onClick}
                      className="block w-full text-left cursor-pointer"
                      style={{ background: "none", border: "none", padding: 0 }}
                    >
                      {content}
                    </button>
                  );
                }

                return info.link ? (
                  <a key={index} href={info.link} className="block">
                    {content}
                  </a>
                ) : (
                  <div key={index}>{content}</div>
                );
              })}
            </div>
          </div>

          {/* Google Maps Embed */}
          <div>
            <h3 className="text-2xl text-[#063970] mb-6">Our Location</h3>
            <div className="bg-white rounded-lg overflow-hidden shadow-md h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3650.674550013751!2d90.39066907533733!3d23.79460087864026!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c73d8f078209%3A0xce1bf2a261843766!2sAdamjee%20Cantonment%20College!5e0!3m2!1sen!2sbd!4v1772142979982!5m2!1sen!2sbd%22%20width=%22600%22%20height=%22450%22%20style=%22border:0;%22%20allowfullscreen=%22%22%20loading=%22lazy%22%20referrerpolicy=%22no-referrer-when-downgrade"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="ACCBC Location"
              />
            </div>
            <p className="text-sm text-gray-500 mt-4"></p>
          </div>
        </div>
      </div>
    </section>
  );
}
