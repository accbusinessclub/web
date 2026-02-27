import { useState, useEffect } from "react";
import { api } from "../../api/client";

export function RegistrationEditor() {
    const [link, setLink] = useState("");
    const [originalLink, setOriginalLink] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        api.getSetting("registration_link")
            .then((data) => { setLink(data.value); setOriginalLink(data.value); })
            .catch(() => setError("Failed to load. Is the backend running?"))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleSave = async () => {
        if (!link.trim()) return;
        setSaving(true);
        try {
            await api.updateSetting("registration_link", link.trim());
            setOriginalLink(link.trim());
            showToast("✅ Registration link updated!");
        } catch {
            showToast("❌ Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const isChanged = link !== originalLink;

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading...</div>;
    if (error) return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>{error}</div>;

    return (
        <div style={{ maxWidth: "700px" }}>
            {toast && (
                <div style={{
                    position: "fixed", top: "20px", right: "20px", background: "#1e293b",
                    color: "white", padding: "12px 20px", borderRadius: "12px", zIndex: 9999,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)", fontSize: "15px",
                }}>{toast}</div>
            )}

            {/* Info card */}
            <div style={{
                background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "14px",
                padding: "18px 22px", marginBottom: "24px", display: "flex", gap: "14px", alignItems: "flex-start",
            }}>
                <span style={{ fontSize: "24px", flexShrink: 0 }}>ℹ️</span>
                <div>
                    <p style={{ margin: "0 0 4px", fontWeight: "600", color: "#1e3a8a", fontSize: "14px" }}>
                        About the Registration Link
                    </p>
                    <p style={{ margin: 0, color: "#3b82f6", fontSize: "13px" }}>
                        This is the Google Form URL that opens when visitors click the <strong>"Apply for Membership"</strong> button on the homepage. Update it whenever you create a new registration form.
                    </p>
                </div>
            </div>

            {/* Editor */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                    📋 Google Form Registration Link
                </h3>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block", fontSize: "13px", fontWeight: "600",
                        color: "#374151", marginBottom: "8px",
                    }}>
                        Google Form URL
                    </label>
                    <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://docs.google.com/forms/d/..."
                        style={{
                            width: "100%", padding: "13px 16px", border: "1.5px solid #e2e8f0",
                            borderRadius: "12px", fontSize: "15px", outline: "none",
                            boxSizing: "border-box", fontFamily: "monospace",
                            color: "#1e293b",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#063970")}
                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                </div>

                {/* Current link preview */}
                {link && (
                    <div style={{
                        background: "#f8fafc", borderRadius: "10px", padding: "14px 16px",
                        marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
                    }}>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <p style={{ margin: "0 0 3px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
                                Preview link
                            </p>
                            <p style={{
                                margin: 0, fontSize: "13px", color: "#3b82f6",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}>
                                {link}
                            </p>
                        </div>
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe",
                                borderRadius: "8px", padding: "7px 14px", fontSize: "13px",
                                fontWeight: "600", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                            }}
                        >
                            Test Link ↗
                        </a>
                    </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isChanged || !link.trim()}
                        style={{
                            flex: 1, padding: "13px", background: isChanged && link.trim() ? "#063970" : "#94a3b8",
                            color: "white", border: "none", borderRadius: "12px",
                            cursor: saving || !isChanged ? "not-allowed" : "pointer",
                            fontSize: "15px", fontWeight: "700", transition: "background 0.2s",
                        }}
                    >
                        {saving ? "Saving..." : isChanged ? "💾 Save Link" : "✅ Saved"}
                    </button>
                    {isChanged && (
                        <button
                            onClick={() => setLink(originalLink)}
                            style={{
                                padding: "13px 20px", background: "white", color: "#64748b",
                                border: "1.5px solid #e2e8f0", borderRadius: "12px",
                                cursor: "pointer", fontSize: "15px", fontWeight: "600",
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
