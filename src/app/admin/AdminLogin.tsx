import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../../api/client";
import { Eye, EyeOff } from "lucide-react";

export function AdminLogin() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await api.login(username, password);
            if (res.success) {
                sessionStorage.setItem("admin_token", res.token);
                navigate("/admin");
            } else {
                setError("Invalid username or password");
            }
        } catch {
            setError("Cannot connect to server. Make sure the backend is running on port 3001.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "14px 16px",
        background: "rgba(255,255,255,0.1)",
        border: "1px solid rgba(255,255,255,0.2)",
        borderRadius: "12px",
        color: "white",
        fontSize: "16px",
        outline: "none",
        boxSizing: "border-box" as const,
        transition: "border-color 0.2s",
    };

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
            }}
        >
            <div
                style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "24px",
                    padding: "48px 40px",
                    width: "100%",
                    maxWidth: "420px",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
                    position: "relative"
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div
                        style={{
                            width: "72px",
                            height: "72px",
                            background: "rgba(255,255,255,0.15)",
                            borderRadius: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 20px",
                            fontSize: "28px",
                        }}
                    >
                        🛡️
                    </div>
                    <h1
                        style={{
                            color: "white",
                            fontSize: "28px",
                            fontWeight: "700",
                            margin: "0 0 8px",
                            letterSpacing: "-0.5px",
                        }}
                    >
                        Admin Panel
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.6)", margin: 0, fontSize: "15px" }}>
                        Adamjee Cantonment College Business Club
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: "20px" }}>
                        <label
                            style={{
                                display: "block",
                                color: "rgba(255,255,255,0.75)",
                                fontSize: "13px",
                                fontWeight: "500",
                                marginBottom: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={inputStyle}
                            onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.6)")}
                            onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
                        />
                    </div>

                    <div style={{ marginBottom: "28px" }}>
                        <label
                            style={{
                                display: "block",
                                color: "rgba(255,255,255,0.75)",
                                fontSize: "13px",
                                fontWeight: "500",
                                marginBottom: "8px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                            }}
                        >
                            Password
                        </label>
                        <div style={{ position: "relative" }}>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    ...inputStyle,
                                    paddingRight: "48px",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.6)")}
                                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.2)")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: "absolute",
                                    right: "12px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "8px",
                                }}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div
                            style={{
                                background: "rgba(239,68,68,0.2)",
                                border: "1px solid rgba(239,68,68,0.4)",
                                borderRadius: "10px",
                                padding: "12px 16px",
                                color: "#fca5a5",
                                fontSize: "14px",
                                marginBottom: "20px",
                                textAlign: "center",
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "15px",
                            background: loading ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.9)",
                            color: "#063970",
                            border: "none",
                            borderRadius: "12px",
                            fontSize: "16px",
                            fontWeight: "700",
                            cursor: loading ? "not-allowed" : "pointer",
                            transition: "all 0.2s",
                            letterSpacing: "0.3px",
                        }}
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
