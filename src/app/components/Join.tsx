import { useState, useEffect } from "react";
import { UserPlus, CheckCircle } from "lucide-react";

export function Join() {
  const [formLink, setFormLink] = useState("https://forms.google.com/");
  const [contactEmail, setContactEmail] = useState("info@accbc.edu.bd");

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

  useEffect(() => {
    fetchSetting("registration_link", "https://forms.google.com/").then(setFormLink);

    // Prefer contact_email; fall back to footer_email
    fetchSetting("contact_email", "").then((email) => {
      if (email) {
        setContactEmail(email);
      } else {
        fetchSetting("footer_email", "info@accbc.edu.bd").then(setContactEmail);
      }
    });
  }, []);

  const benefits = [
    "Access to exclusive business workshops and seminars",
    "Networking opportunities with industry professionals",
    "Develop leadership and entrepreneurial skills",
    "Participate in case competitions and events",
    "Certificate of membership and achievement",
    "Career guidance and mentorship programs",
  ];

  const handleJoinClick = () => {
    window.open(formLink, "_blank");
  };

  return (
    <section id="join" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">
              Join ABC
            </h2>
            <p className="text-lg text-[#919ea7] max-w-2xl mx-auto">
              Become a part of our vibrant community and unlock endless opportunities
              for personal and professional growth
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#063970] to-[#084a95] rounded-2xl p-8 sm:p-12 text-white shadow-xl">
            <div className="flex items-center justify-center mb-8">
              <UserPlus size={64} className="text-white/90" />
            </div>

            <h3 className="text-2xl text-center mb-8">Membership Benefits</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-white/90" />
                  <span className="text-white/90">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={handleJoinClick}
                className="bg-white text-[#063970] px-10 py-4 rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <span>Apply for Membership</span>
                <UserPlus size={20} />
              </button>
              <p className="text-white/70 text-sm mt-4">
                Fill out our Google Form to start your membership journey
              </p>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-600">
            <p className="text-sm">
              For any queries, please contact us at{" "}
              <a href={`mailto:${contactEmail}`} className="text-[#063970] hover:underline">
                {contactEmail}
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
