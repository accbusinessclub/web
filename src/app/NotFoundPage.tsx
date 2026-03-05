import { useNavigate } from "react-router";

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #063970 0%, #084a95 50%, #0a5cb5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                padding: "20px",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Background decorative circles */}
            <div style={{
                position: "absolute", width: "600px", height: "600px",
                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)",
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                pointerEvents: "none",
            }} />
            <div style={{
                position: "absolute", width: "400px", height: "400px",
                borderRadius: "50%", border: "1px solid rgba(255,255,255,0.08)",
                top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                pointerEvents: "none",
            }} />

            <div style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                {/* Shield icon */}
                <div style={{
                    width: "88px", height: "88px",
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "24px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 32px",
                    fontSize: "40px",
                }}>
                    🛡️
                </div>

                {/* 404 number */}
                <div style={{
                    fontSize: "clamp(96px, 20vw, 160px)",
                    fontWeight: "800",
                    color: "white",
                    lineHeight: 1,
                    letterSpacing: "-4px",
                    marginBottom: "8px",
                    opacity: 0.95,
                }}>
                    404
                </div>

                {/* Divider */}
                <div style={{
                    width: "60px", height: "3px",
                    background: "rgba(255,255,255,0.35)",
                    borderRadius: "2px",
                    margin: "0 auto 28px",
                }} />

                {/* Heading */}
                <h1 style={{
                    color: "white",
                    fontSize: "clamp(22px, 4vw, 30px)",
                    fontWeight: "700",
                    margin: "0 0 12px",
                    letterSpacing: "-0.5px",
                }}>
                    Page Not Found
                </h1>

                {/* Sub-text */}
                <p style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "16px",
                    margin: "0 0 48px",
                    maxWidth: "380px",
                    lineHeight: 1.6,
                }}>
                    The page you're looking for doesn't exist or has been moved.
                    Head back to the ACCBC homepage.
                </p>

                {/* Buttons */}
                <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                    <button
                        onClick={() => navigate("/")}
                        style={{
                            padding: "14px 32px",
                            background: "rgba(255,255,255,0.95)",
                            color: "#063970",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            letterSpacing: "0.2px",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "white")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.95)")}
                    >
                        🏠 Go Home
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            padding: "14px 32px",
                            background: "rgba(255,255,255,0.1)",
                            color: "white",
                            border: "1px solid rgba(255,255,255,0.25)",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            backdropFilter: "blur(10px)",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                    >
                        ← Go Back
                    </button>
                </div>

                {/* Footer brand */}
                <p style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "13px",
                    marginTop: "60px",
                    letterSpacing: "0.3px",
                }}>
                    Adamjee Cantonment College Business Club
                </p>
            </div>
        </div>
    );
}
