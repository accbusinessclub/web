import { useState, useEffect } from "react";
import { api } from "../../api/client";

interface Teacher {
    id: string;
    name: string;
    designation: string;
    department: string;
    role: string;
    image_url: string;
    sort_order: number;
}

const EMPTY_FORM = { name: "", designation: "", department: "", role: "teacher", image_url: "" };
const ROLES = [
    { value: "teacher", label: "Teacher" },
    { value: "moderator", label: "Moderator" },
    { value: "co_moderator", label: "Co-Moderator" },
];

export function TeacherManager() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Teacher | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [toast, setToast] = useState("");
    const [uploading, setUploading] = useState(false);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);

    useEffect(() => {
        api.getTeachers()
            .then((data) => setTeachers(Array.isArray(data) ? data : []))
            .catch(() => setError("Failed to load teachers."))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

    const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
    const openEdit = (t: Teacher) => {
        setEditing(t);
        setForm({ name: t.name, designation: t.designation, department: t.department, role: t.role, image_url: t.image_url || "" });
        setShowModal(true);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const res = await api.uploadImageFile(file, `teacher-${form.name}`);
            setForm(prev => ({ ...prev, image_url: res.url }));
            showToast("✅ Image uploaded!");
        } catch { showToast("❌ Upload failed."); }
        finally { setUploading(false); }
    };

    const handleSave = async () => {
        if (!form.name) return;
        setSaving(true);
        try {
            if (editing) {
                const updated = await api.updateTeacher(editing.id, form);
                setTeachers(prev => prev.map(t => t.id === editing.id ? updated : t));
                showToast("✅ Teacher updated!");
            } else {
                const created = await api.addTeacher(form);
                setTeachers(prev => [...prev, created]);
                showToast("✅ Teacher added!");
            }
            setShowModal(false);
        } catch { showToast("❌ Failed to save."); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteTeacher(id);
            setTeachers(prev => prev.filter(t => t.id !== id));
            setDeleteConfirm(null);
            showToast("🗑️ Teacher deleted.");
        } catch { showToast("❌ Failed to delete."); }
    };

    // Drag-and-drop
    const handleDragStart = (idx: number) => setDragIdx(idx);
    const handleDragOver = (e: React.DragEvent, idx: number) => { e.preventDefault(); setOverIdx(idx); };
    const handleDrop = async (dropIdx: number) => {
        if (dragIdx === null || dragIdx === dropIdx) { setDragIdx(null); setOverIdx(null); return; }
        const newList = [...teachers];
        const [moved] = newList.splice(dragIdx, 1);
        newList.splice(dropIdx, 0, moved);
        const updated = newList.map((t, i) => ({ ...t, sort_order: i + 1 }));
        setTeachers(updated);
        setDragIdx(null); setOverIdx(null);
        try {
            await api.reorderTeachers(updated.map(t => ({ id: t.id, sort_order: t.sort_order })));
            showToast("✅ Order saved!");
        } catch { showToast("❌ Failed to save order."); }
    };

    const card = (style = {}) => ({ background: "white", borderRadius: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", ...(style as object) });

    const ROLE_COLOR: Record<string, string> = { moderator: "#063970", co_moderator: "#0a5cb5", teacher: "#475569" };
    const ROLE_LABEL: Record<string, string> = { moderator: "Moderator", co_moderator: "Co-Moderator", teacher: "Teacher" };

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading...</div>;
    if (error) return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>{error}</div>;

    return (
        <div>
            {toast && <div style={{ position: "fixed", top: "20px", right: "20px", background: "#1e293b", color: "white", padding: "12px 20px", borderRadius: "12px", zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", fontSize: "15px" }}>{toast}</div>}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Teachers Panel</h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>{teachers.length} members (includes Moderator & Co-Moderator) · Drag to reorder</p>
                </div>
                <button onClick={openAdd} style={{ background: "#063970", color: "white", border: "none", borderRadius: "12px", padding: "12px 24px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>
                    + Add Teacher
                </button>
            </div>

            <div style={card({ overflow: "hidden" })}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            {["#", "", "Name", "Designation", "Department", "Role", "Actions"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((t, idx) => (
                            <tr key={t.id} draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                                style={{ borderBottom: "1px solid #f1f5f9", background: overIdx === idx ? "#eff6ff" : "white", transition: "background 0.15s", cursor: "grab", opacity: dragIdx === idx ? 0.4 : 1 }}>
                                <td style={{ padding: "12px 16px", color: "#94a3b8", userSelect: "none" }}>⠿ {idx + 1}</td>
                                <td style={{ padding: "12px 16px" }}>
                                    <img src={t.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23CBD5E1'/%3E%3Ccircle cx='50' cy='38' r='16' fill='%2394A3B8'/%3E%3Cellipse cx='50' cy='85' rx='28' ry='20' fill='%2394A3B8'/%3E%3C/svg%3E"}
                                        alt={t.name} style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
                                        onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%23CBD5E1'/%3E%3Ccircle cx='50' cy='38' r='16' fill='%2394A3B8'/%3E%3Cellipse cx='50' cy='85' rx='28' ry='20' fill='%2394A3B8'/%3E%3C/svg%3E"; }} />
                                </td>
                                <td style={{ padding: "12px 16px", fontWeight: "600", color: "#1e293b" }}>{t.name}</td>
                                <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "14px" }}>{t.designation || "—"}</td>
                                <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "14px" }}>{t.department || "—"}</td>
                                <td style={{ padding: "12px 16px" }}>
                                    <span style={{ background: ROLE_COLOR[t.role] || "#475569", color: "white", borderRadius: "8px", padding: "3px 12px", fontSize: "12px", fontWeight: "600" }}>
                                        {ROLE_LABEL[t.role] || t.role}
                                    </span>
                                </td>
                                <td style={{ padding: "12px 16px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => openEdit(t)} style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#475569" }}>✏️ Edit</button>
                                        <button onClick={() => setDeleteConfirm(t.id)} style={{ background: "#fef2f2", border: "none", borderRadius: "8px", padding: "7px 14px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#ef4444" }}>🗑️ Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {teachers.length === 0 && <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>No teachers yet. Click "Add Teacher" to get started.</div>}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                    <div style={card({ width: "100%", maxWidth: "500px", padding: "32px", maxHeight: "90vh", overflowY: "auto" })}>
                        <h3 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>{editing ? "Edit Teacher" : "Add New Teacher"}</h3>

                        {(["name", "designation", "department"] as const).map(field => (
                            <div key={field} style={{ marginBottom: "18px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
                                    {field === "name" ? "Full Name *" : field === "designation" ? "Designation" : "Department"}
                                </label>
                                <input type="text" value={form[field]}
                                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                    placeholder={field === "name" ? "e.g. Dr. Ahmed Rahman" : field === "designation" ? "e.g. Professor" : "e.g. Business Studies"}
                                    style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "15px", boxSizing: "border-box", outline: "none" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                            </div>
                        ))}

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Role *</label>
                            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                                style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "15px", background: "white", cursor: "pointer", outline: "none" }}
                                onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </select>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Profile Photo</label>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <input type="text" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                    placeholder="Image URL" style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "15px", boxSizing: "border-box", outline: "none" }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")} onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")} />
                                <div style={{ position: "relative" }}>
                                    <button style={{ padding: "11px 14px", background: "#f1f5f9", border: "1.5px solid #e2e8f0", borderRadius: "10px", cursor: "pointer", fontSize: "14px" }}>{uploading ? "⌛" : "📁"}</button>
                                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer" }} disabled={uploading} />
                                </div>
                            </div>
                        </div>

                        {form.image_url && <div style={{ marginBottom: "24px", textAlign: "center" }}>
                            <img src={form.image_url} alt="preview" style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #063970" }} />
                        </div>}

                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowModal(false)} style={{ padding: "11px 24px", border: "1.5px solid #e2e8f0", borderRadius: "10px", background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#64748b" }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} style={{ padding: "11px 32px", background: "#063970", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>{saving ? "Saving..." : "Save"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirm */}
            {deleteConfirm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
                    <div style={card({ width: "100%", maxWidth: "400px", padding: "32px", textAlign: "center" })}>
                        <div style={{ fontSize: "48px", marginBottom: "12px" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>Delete Teacher?</h3>
                        <p style={{ margin: "0 0 24px", color: "#64748b" }}>This will permanently remove this record.</p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button onClick={() => setDeleteConfirm(null)} style={{ padding: "11px 28px", border: "1.5px solid #e2e8f0", borderRadius: "10px", background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#64748b" }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} style={{ padding: "11px 28px", background: "#ef4444", color: "white", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
