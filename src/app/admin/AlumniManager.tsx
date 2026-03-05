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

    // Drag-and-drop state (scoped per year group)
    const [dragKey, setDragKey] = useState<string | null>(null);   // "year:id"
    const [overKey, setOverKey] = useState<string | null>(null);

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

    // ── Drag-and-drop (within each year group) ───────────────────────────────
    const handleDragStart = (year: string, id: string) => setDragKey(`${year}:${id}`);
    const handleDragOver = (e: React.DragEvent, year: string, id: string) => {
        e.preventDefault();
        setOverKey(`${year}:${id}`);
    };
    const handleDrop = async (dropYear: string, dropId: string) => {
        if (!dragKey) return;
        const [dragYear, dragId] = dragKey.split(":");
        if (dragYear !== dropYear || dragId === dropId) {
            setDragKey(null); setOverKey(null); return;
        }
        const yearGroup = alumni.filter(a => a.year === dragYear);
        const dragIdx = yearGroup.findIndex(a => a.id === dragId);
        const dropIdx = yearGroup.findIndex(a => a.id === dropId);
        const newGroup = [...yearGroup];
        const [moved] = newGroup.splice(dragIdx, 1);
        newGroup.splice(dropIdx, 0, moved);
        const reordered = newGroup.map((a, i) => ({ ...a, sort_order: i + 1 }));
        // Merge back into full list
        setAlumni(prev => {
            const others = prev.filter(a => a.year !== dragYear);
            return [...others, ...reordered].sort((a, b) =>
                b.year.localeCompare(a.year) || a.sort_order - b.sort_order
            );
        });
        setDragKey(null); setOverKey(null);
        try {
            await api.reorderAlumni(reordered.map(a => ({ id: a.id, sort_order: a.sort_order })));
            showToast("✅ Order saved!");
        } catch {
            showToast("❌ Failed to save order.");
        }
    };
    // ─────────────────────────────────────────────────────────────────────────

    const card = (style = {}) => ({
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        ...(style as object),
    });

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading alumni...</div>;
    if (error) return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>{error}</div>;

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

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Alumni Directory</h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        {alumni.length} members · Drag rows to reorder within each year
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

            {/* Year-grouped draggable tables */}
            {years.map(year => {
                const group = alumni.filter(a => a.year === year);
                return (
                    <div key={year} style={{ marginBottom: "32px" }}>
                        <h4 style={{
                            fontSize: "16px", fontWeight: "700", color: "#475569",
                            marginBottom: "12px", borderLeft: "4px solid #063970", paddingLeft: "12px",
                        }}>
                            Executive Panel {year} <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: "14px" }}>({group.length})</span>
                        </h4>
                        <div style={card({ overflow: "hidden" })}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                                        {["#", "", "Name", "Panel Role", "LinkedIn", "Actions"].map(h => (
                                            <th key={h} style={{
                                                padding: "12px 16px", textAlign: "left", fontSize: "12px",
                                                fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px",
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.map((alumnus, idx) => {
                                        const key = `${year}:${alumnus.id}`;
                                        const isDragging = dragKey === key;
                                        const isOver = overKey === key;
                                        return (
                                            <tr
                                                key={alumnus.id}
                                                draggable
                                                onDragStart={() => handleDragStart(year, alumnus.id)}
                                                onDragOver={(e) => handleDragOver(e, year, alumnus.id)}
                                                onDrop={() => handleDrop(year, alumnus.id)}
                                                onDragEnd={() => { setDragKey(null); setOverKey(null); }}
                                                style={{
                                                    borderBottom: "1px solid #f1f5f9",
                                                    background: isOver ? "#eff6ff" : "white",
                                                    transition: "background 0.15s",
                                                    cursor: "grab",
                                                    opacity: isDragging ? 0.4 : 1,
                                                }}
                                            >
                                                <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "15px", userSelect: "none" }}>
                                                    ⠿ {idx + 1}
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <img
                                                        src={alumnus.image_url || "https://via.placeholder.com/44"}
                                                        alt={alumnus.name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
                                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/44"; }}
                                                    />
                                                </td>
                                                <td style={{ padding: "12px 16px", fontWeight: "600", color: "#1e293b", fontSize: "15px" }}>
                                                    {alumnus.name}
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <span style={{
                                                        background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px",
                                                        padding: "4px 12px", fontSize: "13px", fontWeight: "500",
                                                    }}>{alumnus.panel_name}</span>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    {alumnus.linkedin_url ? (
                                                        <a href={alumnus.linkedin_url} target="_blank" rel="noreferrer"
                                                            style={{ fontSize: "13px", color: "#063970", textDecoration: "none", fontWeight: "500" }}>
                                                            LinkedIn ↗
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: "#cbd5e1", fontSize: "13px" }}>—</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{ display: "flex", gap: "8px" }}>
                                                        <button onClick={() => openEdit(alumnus)} style={{
                                                            background: "#f1f5f9", border: "none", borderRadius: "8px",
                                                            padding: "7px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#475569",
                                                        }}>✏️ Edit</button>
                                                        <button onClick={() => setDeleteConfirm(alumnus.id)} style={{
                                                            background: "#fef2f2", border: "none", borderRadius: "8px",
                                                            padding: "7px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#ef4444",
                                                        }}>🗑️ Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            })}

            {alumni.length === 0 && (
                <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "16px" }}>
                    No alumni records yet. Click "Add Alumnus" to get started.
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

                        {(["year", "name", "panel_name", "linkedin_url"] as const).map(field => (
                            <div key={field} style={{ marginBottom: "18px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                    {field === "year" ? "Executive Panel Year" : field === "panel_name" ? "Panel Role" : field === "linkedin_url" ? "LinkedIn URL" : "Name"}
                                    {field !== "linkedin_url" ? " *" : ""}
                                </label>
                                <input
                                    type="text"
                                    value={form[field]}
                                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                    placeholder={
                                        field === "year" ? "e.g. 2024" :
                                            field === "name" ? "e.g. Shakib Rahman" :
                                                field === "panel_name" ? "e.g. President" :
                                                    "https://linkedin.com/in/..."
                                    }
                                    style={{
                                        width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", fontSize: "15px", boxSizing: "border-box", outline: "none",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                        ))}

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
                                        borderRadius: "10px", fontSize: "15px", boxSizing: "border-box", outline: "none",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
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
                                borderRadius: "10px", cursor: saving ? "not-allowed" : "pointer", fontSize: "15px", fontWeight: "600",
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
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
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
