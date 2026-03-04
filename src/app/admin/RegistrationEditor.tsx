import { useState, useEffect } from "react";
import { api } from "../../api/client";

/* ─── tiny shared helpers ─────────────────────────────────────────── */

function useSetting(key: string) {
    const [value, setValue] = useState("");
    const [original, setOriginal] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        api.getSetting(key)
            .then((data) => { setValue(data.value ?? ""); setOriginal(data.value ?? ""); })
            .catch(() => setError("Failed to load. Is the backend running?"))
            .finally(() => setLoading(false));
    }, [key]);

    const save = async () => {
        setSaving(true);
        try {
            await api.updateSetting(key, value.trim());
            setOriginal(value.trim());
            return true;
        } catch {
            return false;
        } finally {
            setSaving(false);
        }
    };

    return { value, setValue, original, setOriginal, loading, saving, error, save, isChanged: value !== original };
}

/* ─── shared toast ────────────────────────────────────────────────── */

function Toast({ msg }: { msg: string }) {
    if (!msg) return null;
    return (
        <div style={{
            position: "fixed", top: "20px", right: "20px",
            background: "#1e293b", color: "white",
            padding: "12px 20px", borderRadius: "12px", zIndex: 9999,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)", fontSize: "15px",
        }}>
            {msg}
        </div>
    );
}

/* ─── Registration Link card ──────────────────────────────────────── */

function RegistrationLinkCard({ onToast }: { onToast: (m: string) => void }) {
    const { value, setValue, original, loading, saving, error, save, isChanged } = useSetting("registration_link");

    if (loading) return <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading…</div>;
    if (error) return <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>;

    const handleSave = async () => {
        const ok = await save();
        onToast(ok ? "✅ Registration link updated!" : "❌ Failed to save.");
    };

    return (
        <div>
            {/* Info banner */}
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
                        This is the Google Form URL that opens when visitors click the{" "}
                        <strong>"Apply for Membership"</strong> button on the homepage.
                        Update it whenever you create a new registration form.
                    </p>
                </div>
            </div>

            {/* Editor card */}
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
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="https://docs.google.com/forms/d/…"
                        style={{
                            width: "100%", padding: "13px 16px", border: "1.5px solid #e2e8f0",
                            borderRadius: "12px", fontSize: "15px", outline: "none",
                            boxSizing: "border-box", fontFamily: "monospace", color: "#1e293b",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#063970")}
                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                </div>

                {/* Preview */}
                {value && (
                    <div style={{
                        background: "#f8fafc", borderRadius: "10px", padding: "14px 16px",
                        marginBottom: "20px", display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: "12px",
                    }}>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <p style={{ margin: "0 0 3px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
                                Preview link
                            </p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#3b82f6", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {value}
                            </p>
                        </div>
                        <a
                            href={value} target="_blank" rel="noreferrer"
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
                        disabled={saving || !isChanged || !value.trim()}
                        style={{
                            flex: 1, padding: "13px",
                            background: isChanged && value.trim() ? "#063970" : "#94a3b8",
                            color: "white", border: "none", borderRadius: "12px",
                            cursor: saving || !isChanged ? "not-allowed" : "pointer",
                            fontSize: "15px", fontWeight: "700", transition: "background 0.2s",
                        }}
                    >
                        {saving ? "Saving…" : isChanged ? "💾 Save Link" : "✅ Saved"}
                    </button>
                    {isChanged && (
                        <button
                            onClick={() => setValue(original)}
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

/* ─── Contact Email card ──────────────────────────────────────────── */

function ContactEmailCard({ onToast }: { onToast: (m: string) => void }) {
    const { value, setValue, original, loading, saving, error, save, isChanged } = useSetting("contact_email");

    if (loading) return <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>Loading…</div>;
    if (error) return <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>{error}</div>;

    const handleSave = async () => {
        if (!value.trim() || !value.includes("@")) {
            onToast("⚠️ Please enter a valid email address.");
            return;
        }
        const ok = await save();
        onToast(ok ? "✅ Contact email updated!" : "❌ Failed to save.");
    };

    return (
        <div>
            {/* Info banner */}
            <div style={{
                background: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "14px",
                padding: "18px 22px", marginBottom: "24px", display: "flex", gap: "14px", alignItems: "flex-start",
            }}>
                <span style={{ fontSize: "24px", flexShrink: 0 }}>✉️</span>
                <div>
                    <p style={{ margin: "0 0 4px", fontWeight: "600", color: "#14532d", fontSize: "14px" }}>
                        About the Contact Us Email
                    </p>
                    <p style={{ margin: 0, color: "#16a34a", fontSize: "13px" }}>
                        This email address is displayed in the <strong>Contact Us</strong> section of the website and
                        receives messages sent by visitors through the contact form or mailto link.
                        Update it whenever the primary contact address changes.
                    </p>
                </div>
            </div>

            {/* Editor card */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                    ✉️ Contact Us Email Address
                </h3>

                <div style={{ marginBottom: "20px" }}>
                    <label style={{
                        display: "block", fontSize: "13px", fontWeight: "600",
                        color: "#374151", marginBottom: "8px",
                    }}>
                        Email Address
                    </label>
                    <input
                        type="email"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="contact@accbc.org"
                        style={{
                            width: "100%", padding: "13px 16px", border: "1.5px solid #e2e8f0",
                            borderRadius: "12px", fontSize: "15px", outline: "none",
                            boxSizing: "border-box", color: "#1e293b",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#16a34a")}
                        onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                    />
                </div>

                {/* Preview */}
                {value && (
                    <div style={{
                        background: "#f8fafc", borderRadius: "10px", padding: "14px 16px",
                        marginBottom: "20px", display: "flex", alignItems: "center",
                        justifyContent: "space-between", gap: "12px",
                    }}>
                        <div style={{ flex: 1, overflow: "hidden" }}>
                            <p style={{ margin: "0 0 3px", fontSize: "11px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" }}>
                                Current email
                            </p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#16a34a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {value}
                            </p>
                        </div>
                        <a
                            href={`mailto:${value}`}
                            style={{
                                background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0",
                                borderRadius: "8px", padding: "7px 14px", fontSize: "13px",
                                fontWeight: "600", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                            }}
                        >
                            Open Mailto ↗
                        </a>
                    </div>
                )}

                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={handleSave}
                        disabled={saving || !isChanged || !value.trim()}
                        style={{
                            flex: 1, padding: "13px",
                            background: isChanged && value.trim() ? "#16a34a" : "#94a3b8",
                            color: "white", border: "none", borderRadius: "12px",
                            cursor: saving || !isChanged ? "not-allowed" : "pointer",
                            fontSize: "15px", fontWeight: "700", transition: "background 0.2s",
                        }}
                    >
                        {saving ? "Saving…" : isChanged ? "💾 Save Email" : "✅ Saved"}
                    </button>
                    {isChanged && (
                        <button
                            onClick={() => setValue(original)}
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

/* ─── Main export ─────────────────────────────────────────────────── */

export function RegistrationEditor() {
    const [toast, setToast] = useState("");

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    return (
        <div style={{ maxWidth: "700px", display: "flex", flexDirection: "column", gap: "40px" }}>
            <Toast msg={toast} />

            {/* ── Section 1: Registration Link ── */}
            <section>
                <h2 style={{
                    margin: "0 0 20px", fontSize: "22px", fontWeight: "800", color: "#1e293b",
                    paddingBottom: "12px", borderBottom: "2px solid #e2e8f0",
                }}>
                    📋 Registration Link
                </h2>
                <RegistrationLinkCard onToast={showToast} />
            </section>

            {/* ── Section 2: Contact Us Email ── */}
            <section>
                <h2 style={{
                    margin: "0 0 20px", fontSize: "22px", fontWeight: "800", color: "#1e293b",
                    paddingBottom: "12px", borderBottom: "2px solid #e2e8f0",
                }}>
                    ✉️ Contact Us Email
                </h2>
                <ContactEmailCard onToast={showToast} />
            </section>
        </div>
    );
}
