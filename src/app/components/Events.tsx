import { Calendar, MapPin } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Events() {
  const upcomingEvents = [
    {
      title: "Business Leadership Summit 2026",
      date: "March 15, 2026",
      location: "ACC Auditorium",
      description:
        "Join us for an inspiring day with industry leaders sharing insights on modern business leadership and innovation strategies.",
      image: "https://images.unsplash.com/photo-1763739527636-d3d8cac52d6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    },
    {
      title: "Startup Workshop Series",
      date: "March 22, 2026",
      location: "Innovation Lab, ACC",
      description:
        "A comprehensive workshop series covering ideation, business planning, funding, and scaling your startup venture.",
      image: "https://images.unsplash.com/photo-1643299397136-a6cf89431e19?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    },
  ];

  const pastEvents = [
    {
      title: "Annual Business Networking Night",
      date: "January 20, 2026",
      location: "ACC Campus",
      description:
        "A successful networking event connecting students with local entrepreneurs and business professionals.",
      image: "https://images.unsplash.com/photo-1550305080-4e029753abcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    },
    {
      title: "Business Case Competition 2025",
      date: "December 10, 2025",
      location: "ACC Main Hall",
      description:
        "Teams competed to solve real-world business challenges, with winners receiving mentorship opportunities.",
      image: "https://images.unsplash.com/photo-1711385532992-9d620284a943?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
    },
  ];

  const EventCard = ({ event, isUpcoming }: { event: any; isUpcoming: boolean }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
        />
        {isUpcoming && (
          <div className="absolute top-4 right-4 bg-[#063970] text-white px-3 py-1 rounded-full text-sm">
            Upcoming
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="text-xl text-[#063970] mb-3">{event.title}</h3>
        <div className="flex items-center text-[#919ea7] text-sm mb-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{event.date}</span>
        </div>
        <div className="flex items-center text-[#919ea7] text-sm mb-4">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{event.location}</span>
        </div>
        <p className="text-gray-600 mb-4">{event.description}</p>
        <button className="text-[#063970] hover:underline">
          View Details →
        </button>
      </div>
    </div>
  );

  return (
    <section id="events" className="py-20 bg-white">
      
    </section>
  );
}
