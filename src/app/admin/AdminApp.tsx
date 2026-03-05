import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { ExecManager } from "./ExecManager";
import { HeroEditor } from "./HeroEditor";
import { ImageManager } from "./ImageManager";
import { RegistrationEditor } from "./RegistrationEditor";
import { FooterEditor } from "./FooterEditor";
import { AlumniManager } from "./AlumniManager";
import { SecuritySettings } from "./SecuritySettings";
import { TeacherManager } from "./TeacherManager";
import { AdvisorManager } from "./AdvisorManager";

type Section = "executives" | "alumni" | "teachers" | "advisors" | "hero" | "images" | "registration" | "footer" | "security";


const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
    { id: "executives", label: "Executive Panel", icon: "👥" },
    { id: "alumni", label: "Alumni Panel", icon: "🎓" },
    { id: "teachers", label: "Teachers Panel", icon: "👨‍🏫" },
    { id: "advisors", label: "Advisor Panel", icon: "🏅" },
    { id: "hero", label: "Hero Section", icon: "✏️" },
    { id: "images", label: "Image Gallery", icon: "🖼️" },
    { id: "registration", label: "Registration Link", icon: "📋" },
    { id: "footer", label: "Footer Settings", icon: "📞" },
    { id: "security", label: "Security", icon: "🔒" },
];


export function AdminApp() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<Section>("executives");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // ── Auto-logout after 15 min inactivity ──────────────────────────────────
    const INACTIVE_MS = 15 * 60 * 1000;  // 15 minutes
    const WARN_BEFORE_MS = 60 * 1000;       // show warning 60 s before logout
    const POLL_MS = 30 * 1000;       // check every 30 s

    const [showWarning, setShowWarning] = useState(false);
    const [warnCountdown, setWarnCountdown] = useState(60);
    const warnTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const resetActivity = useCallback(() => {
        sessionStorage.setItem("admin_last_activity", Date.now().toString());
    }, []);

    // Record activity on mount + on user interactions (throttled via lastSet ref)
    const lastSetRef = useRef(0);
    useEffect(() => {
        resetActivity();
        const handler = () => {
            const now = Date.now();
            if (now - lastSetRef.current > 10_000) {
                lastSetRef.current = now;
                resetActivity();
            }
        };
        window.addEventListener("mousemove", handler);
        window.addEventListener("keydown", handler);
        window.addEventListener("touchstart", handler);
        window.addEventListener("scroll", handler, true);
        return () => {
            window.removeEventListener("mousemove", handler);
            window.removeEventListener("keydown", handler);
            window.removeEventListener("touchstart", handler);
            window.removeEventListener("scroll", handler, true);
        };
    }, [resetActivity]);

    // Poll for inactivity
    useEffect(() => {
        const poll = setInterval(() => {
            const last = parseInt(sessionStorage.getItem("admin_last_activity") || "0", 10);
            const idle = Date.now() - last;
            if (idle >= INACTIVE_MS) {
                handleLogout();
            } else if (idle >= INACTIVE_MS - WARN_BEFORE_MS && !showWarning) {
                setShowWarning(true);
                setWarnCountdown(Math.round((INACTIVE_MS - idle) / 1000));
            }
        }, POLL_MS);
        return () => clearInterval(poll);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showWarning]);

    // Warning modal countdown
    useEffect(() => {
        if (!showWarning) return;
        setWarnCountdown(60);
        warnTimerRef.current = setInterval(() => {
            setWarnCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(warnTimerRef.current!);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => { if (warnTimerRef.current) clearInterval(warnTimerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showWarning]);

    const stayLoggedIn = () => {
        if (warnTimerRef.current) clearInterval(warnTimerRef.current);
        setShowWarning(false);
        resetActivity();
    };
    // ─────────────────────────────────────────────────────────────────────────

    const handleLogout = () => {
        sessionStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_last_activity");
        navigate("/admin/login");
    };


    const sidebarW = sidebarOpen ? 260 : 70;


    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                background: "#f1f5f9",
            }}
        >
            {/* ── Inactivity Warning Modal ───────────────────────────────────── */}
            {showWarning && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                    }}
                >
                    <div
                        style={{
                            background: "white",
                            borderRadius: "20px",
                            padding: "40px 36px",
                            maxWidth: "400px",
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
                        }}
                    >
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>⏱️</div>
                        <h2 style={{ margin: "0 0 8px", fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>
                            Session Expiring
                        </h2>
                        <p style={{ color: "#64748b", fontSize: "15px", margin: "0 0 24px" }}>
                            You'll be logged out due to inactivity in
                        </p>
                        <div
                            style={{
                                fontSize: "52px",
                                fontWeight: "800",
                                color: warnCountdown <= 10 ? "#ef4444" : "#f59e0b",
                                fontVariantNumeric: "tabular-nums",
                                marginBottom: "28px",
                                transition: "color 0.3s",
                            }}
                        >
                            {warnCountdown}s
                        </div>
                        <button
                            onClick={stayLoggedIn}
                            style={{
                                width: "100%",
                                padding: "14px",
                                background: "#063970",
                                color: "white",
                                border: "none",
                                borderRadius: "12px",
                                fontSize: "16px",
                                fontWeight: "700",
                                cursor: "pointer",
                            }}
                        >
                            ✅ Stay Logged In
                        </button>
                    </div>
                </div>
            )}
            {/* Sidebar */}
            <aside
                style={{
                    width: `${sidebarW}px`,
                    background: "linear-gradient(180deg, #063970 0%, #042a54 100%)",
                    color: "white",
                    display: "flex",
                    flexDirection: "column",
                    transition: "width 0.3s ease",
                    position: "fixed",
                    top: 0,
                    left: 0,
                    height: "100vh",
                    zIndex: 100,
                    overflow: "hidden",
                    boxShadow: "4px 0 20px rgba(6,57,112,0.3)",
                }}
            >
                {/* Sidebar Header */}
                <div
                    style={{
                        padding: "24px 20px",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minHeight: "80px",
                    }}
                >
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: "rgba(255,255,255,0.1)",
                            border: "none",
                            borderRadius: "8px",
                            padding: "8px",
                            cursor: "pointer",
                            color: "white",
                            fontSize: "16px",
                            flexShrink: 0,
                        }}
                    >
                        {sidebarOpen ? "◀" : "▶"}
                    </button>
                    {sidebarOpen && (
                        <div>
                            <div style={{ fontWeight: "700", fontSize: "16px", lineHeight: 1.2 }}>
                                ACCBC Admin
                            </div>
                            <div style={{ fontSize: "12px", opacity: 0.6, marginTop: "2px" }}>
                                Control Panel
                            </div>
                        </div>
                    )}
                </div>


                {/* Nav Items */}
                <nav style={{ padding: "16px 12px", flex: 1 }}>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "13px 14px",
                                marginBottom: "6px",
                                background:
                                    activeSection === item.id
                                        ? "rgba(255,255,255,0.18)"
                                        : "transparent",
                                border:
                                    activeSection === item.id
                                        ? "1px solid rgba(255,255,255,0.2)"
                                        : "1px solid transparent",
                                borderRadius: "12px",
                                color: "white",
                                cursor: "pointer",
                                textAlign: "left",
                                fontSize: "15px",
                                fontWeight: activeSection === item.id ? "600" : "400",
                                transition: "all 0.2s",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                            }}
                        >
                            <span style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</span>
                            {sidebarOpen && <span>{item.label}</span>}
                        </button>
                    ))}
                </nav>


                {/* Sidebar Footer */}
                <div style={{ padding: "16px 12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                    <a
                        href="/"
                        target="_blank"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "11px 14px",
                            color: "rgba(255,255,255,0.7)",
                            textDecoration: "none",
                            borderRadius: "10px",
                            fontSize: "14px",
                            marginBottom: "6px",
                            whiteSpace: "nowrap",
                        }}
                    >
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>🌐</span>
                        {sidebarOpen && "View Live Site"}
                    </a>
                    <button
                        onClick={handleLogout}
                        style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "11px 14px",
                            background: "rgba(239,68,68,0.15)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: "10px",
                            color: "#fca5a5",
                            cursor: "pointer",
                            fontSize: "14px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                        }}
                    >
                        <span style={{ fontSize: "18px", flexShrink: 0 }}>🚪</span>
                        {sidebarOpen && "Logout"}
                    </button>
                </div>
            </aside>


            {/* Main Content */}
            <main
                style={{
                    flex: 1,
                    marginLeft: `${sidebarW}px`,
                    transition: "margin-left 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* Top Bar */}
                <header
                    style={{
                        background: "white",
                        padding: "0 32px",
                        height: "64px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        borderBottom: "1px solid #e2e8f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 90,
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin: 0,
                                fontSize: "20px",
                                fontWeight: "700",
                                color: "#063970",
                            }}
                        >
                            {NAV_ITEMS.find((n) => n.id === activeSection)?.icon}{" "}
                            {NAV_ITEMS.find((n) => n.id === activeSection)?.label}
                        </h2>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <div
                            style={{
                                width: "36px",
                                height: "36px",
                                background: "#063970",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontWeight: "700",
                                fontSize: "14px",
                            }}
                        >
                            A
                        </div>
                        <span style={{ fontWeight: "600", color: "#1e293b" }}>Admin</span>
                    </div>
                </header>


                {/* Page Content */}
                <div style={{ padding: "32px", flex: 1 }}>
                    {activeSection === "executives" && <ExecManager />}
                    {activeSection === "alumni" && <AlumniManager />}
                    {activeSection === "teachers" && <TeacherManager />}
                    {activeSection === "advisors" && <AdvisorManager />}
                    {activeSection === "hero" && <HeroEditor />}
                    {activeSection === "images" && <ImageManager />}
                    {activeSection === "registration" && <RegistrationEditor />}
                    {activeSection === "footer" && <FooterEditor />}
                    {activeSection === "security" && <SecuritySettings />}
                </div>
            </main>
        </div>
    );
}



