import { useState, useEffect } from "react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface Teacher {
    id: string;
    name: string;
    designation: string;
    department: string;
    role: string;
    image_url: string;
    sort_order: number;
}

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export function Moderator() {
    const [people, setPeople] = useState<Teacher[]>([]);

    useEffect(() => {
        fetch(`${BASE}/teachers`)
            .then((r) => r.json())
            .then((data: Teacher[]) => {
                if (Array.isArray(data)) {
                    setPeople(data.filter((t) => t.role === "moderator" || t.role === "co_moderator"));
                }
            })
            .catch(() => { });
    }, []);

    if (people.length === 0) return null;

    const moderator = people.find((p) => p.role === "moderator");
    const coModerator = people.find((p) => p.role === "co_moderator");
    const display = [moderator, coModerator].filter(Boolean) as Teacher[];

    return (
        <section id="moderators" className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl text-[#063970] mb-4">
                        Club Moderators
                    </h2>
                    <p className="text-lg text-[#919ea7] max-w-2xl mx-auto">
                        The dedicated teacher members who guide and oversee the club's activities
                    </p>
                </div>

                <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "40px",
                        flexWrap: "wrap",
                    }}
                >
                    {display.map((person) => (
                        <div
                            key={person.id}
                            style={{
                                background: "white",
                                borderRadius: "16px",
                                padding: "32px 28px",
                                textAlign: "center",
                                boxShadow: "0 4px 24px rgba(6,57,112,0.10)",
                                border: "1.5px solid #e2e8f0",
                                minWidth: "220px",
                                maxWidth: "280px",
                                flex: "1 1 220px",
                            }}
                        >
                            <div
                                style={{
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    margin: "0 auto 20px",
                                    border: "4px solid #063970",
                                    boxShadow: "0 4px 16px rgba(6,57,112,0.15)",
                                }}
                            >
                                <ImageWithFallback
                                    src={person.image_url}
                                    alt={person.name}
                                    loading="lazy"
                                    decoding="async"
                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                            </div>

                            {/* Role badge */}
                            <span
                                style={{
                                    display: "inline-block",
                                    background: "#063970",
                                    color: "white",
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    letterSpacing: "1px",
                                    textTransform: "uppercase",
                                    borderRadius: "20px",
                                    padding: "4px 14px",
                                    marginBottom: "12px",
                                }}
                            >
                                {person.role === "moderator" ? "Moderator" : "Co-Moderator"}
                            </span>

                            <h3
                                style={{
                                    fontSize: "18px",
                                    fontWeight: "700",
                                    color: "#1e293b",
                                    margin: "0 0 6px",
                                }}
                            >
                                {person.name}
                            </h3>
                            {person.designation && (
                                <p style={{ color: "#475569", fontSize: "14px", margin: "0 0 4px" }}>
                                    {person.designation}
                                </p>
                            )}
                            {person.department && (
                                <p style={{ color: "#94a3b8", fontSize: "13px", margin: 0 }}>
                                    {person.department}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
