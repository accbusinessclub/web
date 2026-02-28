import { Linkedin } from "lucide-react";
import { useState, useEffect } from "react";
import { api } from "../../api/client";

interface Alumnus {
    id: string;
    year: string;
    name: string;
    panel_name: string;
    linkedin_url: string;
    image_url: string;
    sort_order: number;
}

interface YearGroup {
    year: string;
    members: Alumnus[];
}

export function Alumni() {
    const [alumni, setAlumni] = useState<Alumnus[] | null>(null);
    const [selectedYear, setSelectedYear] = useState<string>("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlumni();
    }, []);

    const fetchAlumni = async () => {
        try {
            const data = await api.getAlumni();
            setAlumni(data);
        } catch (err) {
            console.error("Failed to fetch alumni:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="py-20 text-center text-[#64748b]">
                <div className="animate-pulse">Loading alumni...</div>
            </div>
        );
    }

    if (!alumni || alumni.length === 0) {
        return (
            <section id="alumni" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">Our Alumni</h2>
                    <p className="text-lg text-[#919ea7]">Coming soon...</p>
                </div>
            </section>
        );
    }

    const yearGroups: YearGroup[] = [];
    const distinctYears = Array.from(new Set(alumni.map(a => a.year))).sort((a, b) => b.localeCompare(a));

    distinctYears.forEach(year => {
        yearGroups.push({
            year,
            members: alumni.filter(a => a.year === year).sort((a, b) => a.sort_order - b.sort_order)
        });
    });

    const years = ["all", ...distinctYears];
    const filteredGroups = selectedYear === "all"
        ? yearGroups
        : yearGroups.filter(g => g.year === selectedYear);

    return (
        <section id="alumni" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">
                        Our Alumni
                    </h2>
                    <p className="text-lg text-[#919ea7] max-w-2xl mx-auto">
                        Celebrating our past leaders who have contributed to ACCBC's legacy
                    </p>
                </div>

                <div className="flex flex-wrap justify-center gap-3 mb-12">
                    {years.map((year) => (
                        <button
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            className={`px-6 py-2 rounded-lg transition-all duration-200 ${selectedYear === year
                                    ? "bg-[#063970] text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {year === "all" ? "All Years" : year}
                        </button>
                    ))}
                </div>

                <div className="space-y-16">
                    {filteredGroups.map((group) => (
                        <div key={group.year}>
                            <h3 className="text-2xl sm:text-3xl text-[#063970] mb-8 text-center font-bold">
                                Executive Panel {group.year}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {group.members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
                                    >
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-[#063970] bg-white">
                                                {member.image_url ? (
                                                    <img
                                                        src={member.image_url}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[#919ea7] text-xs">
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <h4 className="text-lg font-bold text-[#063970] mb-1">
                                                {member.name}
                                            </h4>
                                            <p className="text-sm text-[#919ea7] mb-4">
                                                {member.panel_name}
                                            </p>

                                            {member.linkedin_url && (
                                                <a
                                                    href={member.linkedin_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center w-10 h-10 bg-[#0A66C2] rounded-lg hover:bg-[#004182] transition-colors duration-200"
                                                    aria-label={`${member.name}'s LinkedIn Profile`}
                                                >
                                                    <Linkedin className="w-5 h-5 text-white" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
