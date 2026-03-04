import { useState, useEffect, useCallback } from "react";
import { api } from "../../api/client";

type FieldKey =
    | "footer_phone"
    | "footer_email"
    | "footer_facebook"
    | "footer_instagram"
    | "footer_linkedin"
    | "footer_email_icon";

interface Fields {
    footer_phone: string;
    footer_email: string;
    footer_facebook: string;
    footer_instagram: string;
    footer_linkedin: string;
    footer_email_icon: string;
}

const DEFAULTS: Fields = {
    footer_phone: "+8801969426245",
    footer_email: "abc@acc.edu.bd",
    footer_facebook: "https://facebook.com/accbc",
    footer_instagram: "https://instagram.com/accbc",
    footer_linkedin: "https://linkedin.com/company/accbc",
    footer_email_icon: "mailto:abc@acc.edu.bd",
};

// ─── Standalone Field component (OUTSIDE FooterEditor) ───────────────────────
// Must be outside so React doesn't recreate it on every render, which would
// cause the input to lose focus on every keystroke.
function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder: string;
    type?: string;
}) {
    return (
        <div>
            <label style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "6px",
                textTransform: "uppercase" as const,
                letterSpacing: "0.4px",
            }}>
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    padding: "12px 14px",
                    border: "1.5px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box" as const,
                    color: "#1e293b",
                    fontFamily: "inherit",
                    background: "white",
                    transition: "border-color 0.15s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#063970")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
            />
        </div>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export function FooterEditor() {
    const [fields, setFields] = useState<Fields>(DEFAULTS);
    const [original, setOriginal] = useState<Fields>(DEFAULTS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        const keys = Object.keys(DEFAULTS) as FieldKey[];
        Promise.all(
            keys.map((k) =>
                api.getSetting(k)
                    .then((d) => ({ key: k, value: d.value ?? DEFAULTS[k] }))
                    .catch(() => ({ key: k, value: DEFAULTS[k] }))
            )
        ).then((results) => {
            const loaded = { ...DEFAULTS };
            for (const r of results) loaded[r.key as FieldKey] = r.value;
            setFields(loaded);
            setOriginal(loaded);
        }).catch(() => setError("Failed to load. Is the backend running?"))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    // useCallback so the handler reference is stable across renders
    const handleChange = useCallback((key: FieldKey) => (val: string) => {
        setFields((prev) => ({ ...prev, [key]: val }));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const keys = Object.keys(fields) as FieldKey[];
            await Promise.all(
                keys.map((k) => api.updateSetting(k, (fields[k] ?? "").trim()))
            );
            setOriginal({ ...fields });
            showToast("✅ Footer settings saved!");
        } catch (err) {
            console.error("Footer save error:", err);
            showToast("❌ Failed to save. Check the backend.");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => setFields({ ...original });
    const isChanged = JSON.stringify(fields) !== JSON.stringify(original);

    if (loading)
        return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading...</div>;
    if (error)
        return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>{error}</div>;

    return (
        <div style={{ maxWidth: "760px" }}>
            {/* Toast */}
            {toast && (
                <div style={{
                    position: "fixed", top: "20px", right: "20px", background: "#1e293b",
                    color: "white", padding: "12px 20px", borderRadius: "12px", zIndex: 9999,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)", fontSize: "15px",
                }}>
                    {toast}
                </div>
            )}

            {/* Info Banner */}
            <div style={{
                background: "#eff6ff", border: "1.5px solid #bfdbfe", borderRadius: "14px",
                padding: "16px 20px", marginBottom: "24px", display: "flex", gap: "14px", alignItems: "flex-start",
            }}>
                <span style={{ fontSize: "22px", flexShrink: 0 }}>ℹ️</span>
                <div>
                    <p style={{ margin: "0 0 3px", fontWeight: "600", color: "#1e3a8a", fontSize: "14px" }}>
                        Footer Contact &amp; Social Settings
                    </p>
                    <p style={{ margin: 0, color: "#3b82f6", fontSize: "13px" }}>
                        Changes here update the contact information and social media links shown in the site footer.
                    </p>
                </div>
            </div>

            {/* Contact Info Card */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "26px 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "20px",
            }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
                    📞 Contact Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Field
                        label="Phone Number"
                        value={fields.footer_phone}
                        onChange={handleChange("footer_phone")}
                        placeholder="+8801969426245"
                        type="tel"
                    />
                    <Field
                        label="Contact Email"
                        value={fields.footer_email}
                        onChange={handleChange("footer_email")}
                        placeholder="abc@acc.edu.bd"
                        type="email"
                    />
                </div>
            </div>

            {/* Social Links Card */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "26px 28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "24px",
            }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: "700", color: "#1e293b" }}>
                    🔗 Social Media Links
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <Field
                        label="Facebook URL"
                        value={fields.footer_facebook}
                        onChange={handleChange("footer_facebook")}
                        placeholder="https://facebook.com/accbc"
                        type="url"
                    />
                    <Field
                        label="Instagram URL"
                        value={fields.footer_instagram}
                        onChange={handleChange("footer_instagram")}
                        placeholder="https://instagram.com/accbc"
                        type="url"
                    />
                    <Field
                        label="LinkedIn URL"
                        value={fields.footer_linkedin}
                        onChange={handleChange("footer_linkedin")}
                        placeholder="https://linkedin.com/company/accbc"
                        type="url"
                    />
                    <Field
                        label="Email Icon Link (mailto:)"
                        value={fields.footer_email_icon}
                        onChange={handleChange("footer_email_icon")}
                        placeholder="mailto:abc@acc.edu.bd"
                        type="url"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
                <button
                    onClick={handleSave}
                    disabled={saving || !isChanged}
                    style={{
                        flex: 1, padding: "13px", borderRadius: "12px",
                        background: isChanged ? "#063970" : "#94a3b8",
                        color: "white", border: "none",
                        cursor: saving || !isChanged ? "not-allowed" : "pointer",
                        fontSize: "15px", fontWeight: "700", transition: "background 0.2s",
                    }}
                >
                    {saving ? "Saving..." : isChanged ? "💾 Save Footer Settings" : "✅ Saved"}
                </button>
                {isChanged && (
                    <button
                        onClick={handleReset}
                        style={{
                            padding: "13px 22px", background: "white", color: "#64748b",
                            border: "1.5px solid #e2e8f0", borderRadius: "12px",
                            cursor: "pointer", fontSize: "15px", fontWeight: "600",
                        }}
                    >
                        Reset
                    </button>
                )}
            </div>
        </div>
    );
}
