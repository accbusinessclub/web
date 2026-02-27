import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Executive {
  id: string;
  name: string;
  member_id: string;
  designation: string;
  image_url: string;
  sort_order: number;
}

const DEFAULT_PANEL_MEMBERS: Executive[] = [
  { id: "1", name: "Fahim Ahmed", member_id: "ACC-2023-001", designation: "President", image_url: "https://images.unsplash.com/photo-1623880840102-7df0a9f3545b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", sort_order: 1 },
  { id: "2", name: "Sadia Rahman", member_id: "ACC-2023-012", designation: "Vice President", image_url: "https://images.unsplash.com/photo-1765648636207-22c892e8fae9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", sort_order: 2 },
  { id: "3", name: "Rashed Khan", member_id: "ACC-2023-024", designation: "General Secretary", image_url: "https://images.unsplash.com/photo-1584940120505-117038d90b05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", sort_order: 3 },
  { id: "4", name: "Ayesha Sultana", member_id: "ACC-2023-035", designation: "Finance Secretary", image_url: "https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", sort_order: 4 },
  { id: "5", name: "Nafia Hasan", member_id: "ACC-2023-047", designation: "Event Coordinator", image_url: "https://images.unsplash.com/photo-1589220286904-3dcef62c68ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", sort_order: 5 },
  { id: "6", name: "Tanvir Hossain", member_id: "ACC-2023-058", designation: "Media & PR Head", image_url: "https://images.unsplash.com/photo-1770894807442-108cc33c0a7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", sort_order: 6 },
];

export function Panel() {
  const [panelMembers, setPanelMembers] = useState<Executive[]>(DEFAULT_PANEL_MEMBERS);

  useEffect(() => {
    fetch("http://localhost:3001/api/executives")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPanelMembers(data);
      })
      .catch(() => {
        // Backend not available; use defaults
      });
  }, []);

  return (
    <section id="panel" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">
            Executive Committee
          </h2>
          <p className="text-lg text-[#919ea7] max-w-2xl mx-auto">
            Meet the dedicated team leading ACCBC towards excellence and innovation
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {panelMembers.map((member, index) => (
            <div
              key={member.id || index}
              className="bg-white rounded-lg p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-[#063970]/10">
                  <ImageWithFallback
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="text-xl text-[#063970] mb-1">{member.name}</h3>
              <p className="text-sm text-[#919ea7] mb-2">{member.member_id}</p>
              <p className="text-gray-700">{member.designation}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
