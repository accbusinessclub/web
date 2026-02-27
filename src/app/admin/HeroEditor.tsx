import { useState, useEffect } from "react";
import { api } from "../../api/client";

interface HeroData {
    title_line1: string;
    title_line2: string;
    subtitle: string;
    btn1_text: string;
    btn2_text: string;
}

export function HeroEditor() {
    const [form, setForm] = useState<HeroData>({
        title_line1: "",
        title_line2: "",
        subtitle: "",
        btn1_text: "",
        btn2_text: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.getHero()
            .then((data) => setForm(data))
            .catch(() => setError("Failed to load hero data. Is the backend running?"))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateHero(form);
            showToast("✅ Hero section updated!");
        } catch {
            showToast("❌ Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    const fieldConfig = [
        { key: "title_line1", label: "Title — Line 1", placeholder: "e.g. Adamjee Cantonment College" },
        { key: "title_line2", label: "Title — Line 2", placeholder: "e.g. Business Club" },
        { key: "subtitle", label: "Subtitle / Description", placeholder: "Empowering Tomorrow's Leaders..." },
        { key: "btn1_text", label: "Primary Button Text", placeholder: "e.g. Join the Club" },
        { key: "btn2_text", label: "Secondary Button Text", placeholder: "e.g. Explore Events" },
    ] as const;

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading...</div>;
    if (error) return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>{error}</div>;

    return (
        <div style={{ maxWidth: "900px" }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: "20px", right: "20px", background: "#1e293b",
                    color: "white", padding: "12px 20px", borderRadius: "12px", zIndex: 9999,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)", fontSize: "15px",
                }}>{toast}</div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
                {/* Form */}
                <div style={{
                    background: "white", borderRadius: "16px",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: "28px",
                }}>
                    <h3 style={{ margin: "0 0 24px", fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                        Edit Hero Content
                    </h3>

                    {fieldConfig.map(({ key, label, placeholder }) => (
                        <div key={key} style={{ marginBottom: "20px" }}>
                            <label style={{
                                display: "block", fontSize: "13px", fontWeight: "600",
                                color: "#374151", marginBottom: "8px",
                            }}>
                                {label}
                            </label>
                            {key === "subtitle" ? (
                                <textarea
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    rows={3}
                                    style={{
                                        width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", fontSize: "15px", outline: "none",
                                        boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={form[key]}
                                    onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    style={{
                                        width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", fontSize: "15px", outline: "none", boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            )}
                        </div>
                    ))}

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        style={{
                            width: "100%", padding: "14px", background: "#063970", color: "white",
                            border: "none", borderRadius: "12px", cursor: "pointer",
                            fontSize: "15px", fontWeight: "700",
                        }}
                    >
                        {saving ? "Saving..." : "💾 Save Changes"}
                    </button>
                </div>

                {/* Live Preview */}
                <div>
                    <h3 style={{ margin: "0 0 16px", fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                        Live Preview
                    </h3>
                    <div style={{
                        background: "linear-gradient(135deg, #063970 0%, #084a95 100%)",
                        borderRadius: "16px", padding: "40px 28px", textAlign: "center",
                        color: "white", boxShadow: "0 8px 30px rgba(6,57,112,0.3)",
                    }}>
                        <h1 style={{ fontSize: "26px", fontWeight: "700", margin: "0 0 6px", lineHeight: 1.3 }}>
                            {form.title_line1 || "Title Line 1"}
                        </h1>
                        <h1 style={{ fontSize: "26px", fontWeight: "700", margin: "0 0 16px", lineHeight: 1.3 }}>
                            {form.title_line2 || "Title Line 2"}
                        </h1>
                        <p style={{ fontSize: "14px", opacity: 0.85, margin: "0 0 24px", lineHeight: 1.5 }}>
                            {form.subtitle || "Subtitle text..."}
                        </p>
                        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                            <div style={{
                                background: "white", color: "#063970", padding: "10px 20px",
                                borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                            }}>
                                {form.btn1_text || "Button 1"}
                            </div>
                            <div style={{
                                background: "transparent", border: "2px solid white", color: "white",
                                padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
                            }}>
                                {form.btn2_text || "Button 2"}
                            </div>
                        </div>
                    </div>
                    <p style={{ marginTop: "12px", color: "#94a3b8", fontSize: "13px", textAlign: "center" }}>
                        Preview updates as you type
                    </p>
                </div>
            </div>
        </div>
    );
}
