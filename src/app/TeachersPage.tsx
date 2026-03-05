import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

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

const ROLE_LABEL: Record<string, string> = {
    moderator: "Moderator",
    co_moderator: "Co-Moderator",
    teacher: "Teacher",
};

const ROLE_COLOR: Record<string, string> = {
    moderator: "#063970",
    co_moderator: "#0a5cb5",
    teacher: "#475569",
};

export function TeachersPage() {
    const [teachers, setTeachers] = useState<Teacher[] | null>(null);

    useEffect(() => {
        fetch(`${BASE}/teachers`)
            .then((r) => r.json())
            .then((data) => setTeachers(Array.isArray(data) ? data : []))
            .catch(() => setTeachers([]));
    }, []);

    // Moderators first, then teachers
    const ordered = teachers
        ? [
            ...teachers.filter((t) => t.role === "moderator"),
            ...teachers.filter((t) => t.role === "co_moderator"),
            ...teachers.filter((t) => t.role === "teacher"),
        ]
        : [];

    return (
        <div className="min-h-screen" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
            <Navbar />

            {/* Hero banner */}
            <div
                style={{
                    background: "linear-gradient(135deg, #063970 0%, #084a95 50%, #0a5cb5 100%)",
                    paddingTop: "96px",
                    paddingBottom: "60px",
                    textAlign: "center",
                }}
            >
                <h1 style={{ color: "white", fontSize: "clamp(28px,5vw,48px)", fontWeight: "800", margin: "0 0 12px", letterSpacing: "-0.5px" }}>
                    Teachers Panel
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "17px", margin: 0 }}>
                    Meet the faculty members who lead, guide, and inspire ACCBC
                </p>
            </div>

            {/* Cards */}
            <section style={{ background: "#f1f5f9", padding: "60px 20px", minHeight: "400px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {teachers === null ? (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                gap: "24px",
                            }}
                        >
                            {[...Array(4)].map((_, i) => (
                                <div key={i} style={{ background: "white", borderRadius: "16px", padding: "32px", textAlign: "center" }}>
                                    <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#e2e8f0", margin: "0 auto 16px", animation: "pulse 1.5s infinite" }} />
                                    <div style={{ height: "16px", background: "#e2e8f0", borderRadius: "8px", marginBottom: "8px" }} />
                                    <div style={{ height: "12px", background: "#f1f5f9", borderRadius: "8px", width: "70%", margin: "0 auto" }} />
                                </div>
                            ))}
                        </div>
                    ) : ordered.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "16px", padding: "60px 0" }}>
                            No teachers listed yet.
                        </p>
                    ) : (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                                gap: "24px",
                            }}
                        >
                            {ordered.map((teacher) => (
                                <div
                                    key={teacher.id}
                                    style={{
                                        background: "white",
                                        borderRadius: "16px",
                                        padding: "32px 20px",
                                        textAlign: "center",
                                        boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                                        border: "1.5px solid #e2e8f0",
                                        transition: "transform 0.2s, box-shadow 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(6,57,112,0.12)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLDivElement).style.transform = "";
                                        (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
                                    }}
                                >
                                    <div
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            margin: "0 auto 16px",
                                            border: `3px solid ${ROLE_COLOR[teacher.role] ?? "#063970"}`,
                                        }}
                                    >
                                        <ImageWithFallback
                                            src={teacher.image_url}
                                            alt={teacher.name}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>

                                    <span
                                        style={{
                                            display: "inline-block",
                                            background: ROLE_COLOR[teacher.role] ?? "#063970",
                                            color: "white",
                                            fontSize: "10px",
                                            fontWeight: "700",
                                            letterSpacing: "0.8px",
                                            textTransform: "uppercase",
                                            borderRadius: "20px",
                                            padding: "3px 12px",
                                            marginBottom: "10px",
                                        }}
                                    >
                                        {ROLE_LABEL[teacher.role] ?? "Teacher"}
                                    </span>

                                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px" }}>
                                        {teacher.name}
                                    </h3>
                                    {teacher.designation && (
                                        <p style={{ color: "#475569", fontSize: "13px", margin: "0 0 4px", fontWeight: "500" }}>
                                            {teacher.designation}
                                        </p>
                                    )}
                                    {teacher.department && (
                                        <p style={{ color: "#94a3b8", fontSize: "12px", margin: 0 }}>
                                            {teacher.department}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}
