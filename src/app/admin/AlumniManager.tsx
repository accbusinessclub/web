import { useState, useEffect } from "react";
import { api } from "../../api/client";

interface Alumnus {
    id: string;
    year: string;
    name: string;
    panel_name: string;
    linkedin_url: string;
    image_url: string;
    sort_order: number;
}

const EMPTY_FORM = {
    year: new Date().getFullYear().toString(),
    name: "",
    panel_name: "",
    linkedin_url: "",
    image_url: "",
};

export function AlumniManager() {
    const [alumni, setAlumni] = useState<Alumnus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingAlumnus, setEditingAlumnus] = useState<Alumnus | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [toast, setToast] = useState("");
    const [uploading, setUploading] = useState(false);

    const fetchAlumni = async () => {
        try {
            const data = await api.getAlumni();
            setAlumni(data);
        } catch {
            setError("Failed to load alumni.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAlumni(); }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const openAdd = () => {
        setEditingAlumnus(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (alumnus: Alumnus) => {
        setEditingAlumnus(alumnus);
        setForm({
            year: alumnus.year,
            name: alumnus.name,
            panel_name: alumnus.panel_name,
            linkedin_url: alumnus.linkedin_url || "",
            image_url: alumnus.image_url || "",
        });
        setShowModal(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await api.uploadImageFile(file, `alumni-${form.name}`);
            setForm(prev => ({ ...prev, image_url: res.url }));
            showToast("✅ Image uploaded!");
        } catch {
            showToast("❌ Upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!form.name || !form.year || !form.panel_name) return;
        setSaving(true);
        try {
            if (editingAlumnus) {
                const updated = await api.updateAlumni(editingAlumnus.id, form);
                setAlumni((prev) =>
                    prev.map((a) => (a.id === editingAlumnus.id ? updated : a))
                );
                showToast("✅ Alumnus updated!");
            } else {
                const created = await api.addAlumni(form);
                setAlumni((prev) => [created, ...prev]);
                showToast("✅ Alumnus added!");
            }
            setShowModal(false);
        } catch {
            showToast("❌ Failed to save.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteAlumni(id);
            setAlumni((prev) => prev.filter((a) => a.id !== id));
            setDeleteConfirm(null);
            showToast("🗑️ Alumnus deleted.");
        } catch {
            showToast("❌ Failed to delete.");
        }
    };

    const card = (style = {}) => ({
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        ...(style as object),
    });

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading alumni...</div>;
    if (error) return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>{error}</div>;

    // Grouping for the list view
    const years = Array.from(new Set(alumni.map(a => a.year))).sort((a, b) => b.localeCompare(a));

    return (
        <div>
            {toast && (
                <div style={{
                    position: "fixed", top: "20px", right: "20px", background: "#1e293b",
                    color: "white", padding: "12px 20px", borderRadius: "12px", zIndex: 9999,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.3)", fontSize: "15px",
                }}>{toast}</div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Alumni Directory</h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        Manage past executive panels and members
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    style={{
                        background: "#063970", color: "white", border: "none",
                        borderRadius: "12px", padding: "12px 24px", cursor: "pointer",
                        fontSize: "15px", fontWeight: "600",
                    }}
                >
                    + Add Alumnus
                </button>
            </div>

            {years.map(year => (
                <div key={year} style={{ marginBottom: "32px" }}>
                    <h4 style={{ fontSize: "18px", fontWeight: "700", color: "#475569", marginBottom: "16px", borderLeft: "4px solid #063970", paddingLeft: "12px" }}>
                        Executive Panel {year}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                        {alumni.filter(a => a.year === year).map(alumnus => (
                            <div key={alumnus.id} style={card({ padding: "20px", display: "flex", gap: "16px", alignItems: "center", position: "relative" })}>
                                <img
                                    src={alumnus.image_url || "https://via.placeholder.com/60"}
                                    alt={alumnus.name}
                                    style={{ width: "60px", height: "60px", borderRadius: "50%", objectFit: "cover", backgroundColor: "#f1f5f9" }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>{alumnus.name}</div>
                                    <div style={{ color: "#64748b", fontSize: "14px" }}>{alumnus.panel_name}</div>
                                    {alumnus.linkedin_url && (
                                        <a href={alumnus.linkedin_url} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#063970", textDecoration: "none" }}>
                                            LinkedIn ↗
                                        </a>
                                    )}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <button onClick={() => openEdit(alumnus)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }} title="Edit">✏️</button>
                                    <button onClick={() => setDeleteConfirm(alumnus.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px" }} title="Delete">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {alumni.length === 0 && (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "16px" }}>
                    No alumni records found.
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
                }}>
                    <div style={card({ width: "100%", maxWidth: "500px", padding: "32px", maxHeight: "90vh", overflowY: "auto" })}>
                        <h3 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>
                            {editingAlumnus ? "Edit Alumnus" : "Add New Alumnus"}
                        </h3>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                Executive Panel Year *
                            </label>
                            <input
                                type="text"
                                value={form.year}
                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                placeholder="e.g. 2024"
                                style={{
                                    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                    borderRadius: "10px", fontSize: "15px", boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                Name *
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Shakib Rahman"
                                style={{
                                    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                    borderRadius: "10px", fontSize: "15px", boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                Panel Name *
                            </label>
                            <input
                                type="text"
                                value={form.panel_name}
                                onChange={(e) => setForm({ ...form, panel_name: e.target.value })}
                                placeholder="e.g. President"
                                style={{
                                    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                    borderRadius: "10px", fontSize: "15px", boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                LinkedIn Profile Link
                            </label>
                            <input
                                type="text"
                                value={form.linkedin_url}
                                onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                                placeholder="https://linkedin.com/in/..."
                                style={{
                                    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                    borderRadius: "10px", fontSize: "15px", boxSizing: "border-box",
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                Profile Picture
                            </label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input
                                    type="text"
                                    value={form.image_url}
                                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="Image URL"
                                    style={{
                                        flex: 1, padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", fontSize: "15px", boxSizing: "border-box",
                                    }}
                                />
                                <div style={{ position: "relative" }}>
                                    <button style={{
                                        padding: "11px 14px", background: "#f1f5f9", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", cursor: "pointer", fontSize: "14px",
                                    }}>
                                        {uploading ? "⌛" : "📁"}
                                    </button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }}
                                        disabled={uploading}
                                    />
                                </div>
                            </div>
                        </div>

                        {form.image_url && (
                            <div style={{ marginBottom: "24px", textAlign: "center" }}>
                                <img src={form.image_url} alt="preview" style={{
                                    width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #063970",
                                }} />
                            </div>
                        )}

                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowModal(false)} style={{
                                padding: "11px 24px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
                                background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#64748b",
                            }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} style={{
                                padding: "11px 32px", background: "#063970", color: "white", border: "none",
                                borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600",
                            }}>{saving ? "Saving..." : "Save Alumnus"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
                }}>
                    <div style={card({ width: "100%", maxWidth: "400px", padding: "32px", textAlign: "center" })}>
                        <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>Delete Record?</h3>
                        <p style={{ margin: "0 0 24px", color: "#64748b" }}>This will remove the alumnus from the directory.</p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                                padding: "11px 28px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
                                background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#64748b",
                            }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} style={{
                                padding: "11px 28px", background: "#ef4444", color: "white", border: "none",
                                borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600",
                            }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
