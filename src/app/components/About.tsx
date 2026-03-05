import { Target, Eye, Award, Calendar } from "lucide-react";

export function About() {
  const features = [
    {
      icon: Target,
      title: "Mission",
      description:
        "To nurture members’ skills and professional growth through interactive sessions, business learning, mentorship, competitions and collaborative activities that prepare students for leadership and real-world challenges.",
    },
    {
      icon: Eye,
      title: "Vision",
      description:
        "To develop competent leaders, grow and support business enthusiasts and critical thinkers through collaboration, discipline and shared learning, while fostering harmony and leadership continuity between senior and junior members.",
    },
    {
      icon: Award,
      title: "Achievements",
      description:
        "Successfully organized 50+ business events, hosted industry leaders, and connected 500+ students with career opportunities in the business sector.",
    },
    {
      icon: Calendar,
      title: "Established",
      description:
        "Founded in 2015, ABC has been at the forefront of business education and professional development for Adamjee Cantonment College students.",
    },
  ];

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">
            About ABC
          </h2>
          <p className="text-lg text-[#919ea7] max-w-3xl mx-auto">
            The Adamjee Cantonment College Business Club is dedicated to fostering
            business knowledge, leadership skills, and entrepreneurial spirit among
            students through workshops, seminars, and networking events.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 rounded-lg p-8 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[#063970] rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl text-[#063970] mb-2">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
