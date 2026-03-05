import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";

interface Advisor {
    id: string;
    name: string;
    designation: string;
    image_url: string;
    sort_order: number;
}

const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export function AdvisorsPage() {
    const [advisors, setAdvisors] = useState<Advisor[] | null>(null);

    useEffect(() => {
        fetch(`${BASE}/advisors`)
            .then((r) => r.json())
            .then((data) => setAdvisors(Array.isArray(data) ? data : []))
            .catch(() => setAdvisors([]));
    }, []);

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
                    Advisors Panel
                </h1>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "17px", margin: 0 }}>
                    Distinguished advisors who support and shape the vision of ACCBC
                </p>
            </div>

            {/* Cards */}
            <section style={{ background: "#f1f5f9", padding: "60px 20px", minHeight: "400px" }}>
                <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                    {advisors === null ? (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} style={{ background: "white", borderRadius: "16px", padding: "32px", textAlign: "center" }}>
                                    <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#e2e8f0", margin: "0 auto 16px" }} />
                                    <div style={{ height: "16px", background: "#e2e8f0", borderRadius: "8px", marginBottom: "8px" }} />
                                    <div style={{ height: "12px", background: "#f1f5f9", borderRadius: "8px", width: "60%", margin: "0 auto" }} />
                                </div>
                            ))}
                        </div>
                    ) : advisors.length === 0 ? (
                        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "16px", padding: "60px 0" }}>
                            No advisors listed yet.
                        </p>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "24px" }}>
                            {advisors.map((advisor) => (
                                <div
                                    key={advisor.id}
                                    style={{
                                        background: "white",
                                        borderRadius: "16px",
                                        padding: "28px 20px",
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
                                            width: "96px",
                                            height: "96px",
                                            borderRadius: "50%",
                                            overflow: "hidden",
                                            margin: "0 auto 16px",
                                            border: "3px solid #063970",
                                        }}
                                    >
                                        <ImageWithFallback
                                            src={advisor.image_url}
                                            alt={advisor.name}
                                            loading="lazy"
                                            decoding="async"
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                    </div>

                                    <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px" }}>
                                        {advisor.name}
                                    </h3>
                                    {advisor.designation && (
                                        <p style={{ color: "#64748b", fontSize: "13px", margin: 0, fontWeight: "500" }}>
                                            {advisor.designation}
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
