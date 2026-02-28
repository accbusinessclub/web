import { useState } from "react";
import { api } from "../../api/client";
import { Shield, Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

export function SecuritySettings() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });

    // Validation checks
    const hasLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasSpecialOrDigit = /[^A-Za-z0-9]/.test(newPassword) || /[0-9]/.test(newPassword);

    const isFormValid = hasLength && hasUpper && hasLower && hasSpecialOrDigit && newPassword === confirmPassword && currentPassword;

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isFormValid) return;

        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const res = await api.changePassword(currentPassword, newPassword);
            if (res.success) {
                setMessage({ type: "success", text: "✅ Password updated successfully!" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({ type: "error", text: `❌ ${res.error || "Failed to update password"}` });
            }
        } catch (err) {
            setMessage({ type: "error", text: "❌ Connection error. Try again." });
        } finally {
            setLoading(false);
        }
    };

    const cardStyle = {
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        padding: "32px",
        maxWidth: "600px",
        margin: "0 auto",
    };

    const inputStyle = {
        width: "100%",
        padding: "12px 16px",
        border: "1.5px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "15px",
        outline: "none",
        transition: "all 0.2s",
        boxSizing: "border-box" as const,
    };

    const ValidationItem = ({ label, met }: { label: string; met: boolean }) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: met ? "#10b981" : "#94a3b8", marginBottom: "4px" }}>
            {met ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
            {label}
        </div>
    );

    return (
        <div style={{ padding: "20px" }}>
            <div style={cardStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ padding: "10px", background: "#eff6ff", borderRadius: "12px", color: "#2563eb" }}>
                        <Shield size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>Update Admin Password</h3>
                        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>Modify your login credentials regularly for better security</p>
                    </div>
                </div>

                <form onSubmit={handleUpdate}>
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Current Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPass.current ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                style={inputStyle}
                                required
                            />
                            <button type="button" onClick={() => setShowPass({ ...showPass, current: !showPass.current })} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                                {showPass.current ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>New Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPass.new ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={inputStyle}
                                required
                            />
                            <button type="button" onClick={() => setShowPass({ ...showPass, new: !showPass.new })} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                                {showPass.new ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        <div style={{ marginTop: "12px", padding: "12px", background: "#f8fafc", borderRadius: "8px" }}>
                            <ValidationItem label="At least 8 characters" met={hasLength} />
                            <ValidationItem label="At least one uppercase letter" met={hasUpper} />
                            <ValidationItem label="At least one lowercase letter" met={hasLower} />
                            <ValidationItem label="At least one symbol or number" met={hasSpecialOrDigit} />
                        </div>
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#475569", marginBottom: "8px" }}>Confirm New Password</label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPass.confirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ ...inputStyle, borderColor: confirmPassword && newPassword !== confirmPassword ? "#ef4444" : "#e2e8f0" }}
                                required
                            />
                            <button type="button" onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8" }}>
                                {showPass.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                            <p style={{ color: "#ef4444", fontSize: "12px", margin: "4px 0 0" }}>Passwords do not match</p>
                        )}
                    </div>

                    {message.text && (
                        <div style={{
                            padding: "12px 16px",
                            borderRadius: "10px",
                            marginBottom: "20px",
                            fontSize: "14px",
                            background: message.type === "success" ? "#ecfdf5" : "#fef2f2",
                            color: message.type === "success" ? "#047857" : "#b91c1c",
                            border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`
                        }}>
                            {message.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isFormValid}
                        style={{
                            width: "100%",
                            padding: "14px",
                            background: isFormValid ? "#063970" : "#cbd5e1",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor: isFormValid && !loading ? "pointer" : "not-allowed",
                            transition: "all 0.2s"
                        }}
                    >
                        {loading ? "Updating..." : "Update Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
