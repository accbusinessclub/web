import { useState, useEffect, useRef } from "react";
import { api } from "../../api/client";

interface Executive {
    id: string;
    name: string;
    member_id: string;
    designation: string;
    image_url: string;
    sort_order: number;
}

const EMPTY_FORM = {
    name: "",
    member_id: "",
    designation: "",
    image_url: "",
};

export function ExecManager() {
    const [executives, setExecutives] = useState<Executive[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingExec, setEditingExec] = useState<Executive | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);
    const [toast, setToast] = useState("");

    const fetchExecutives = async () => {
        try {
            const data = await api.getExecutives();
            setExecutives(data);
        } catch {
            setError("Failed to load executives. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExecutives(); }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const openAdd = () => {
        setEditingExec(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (exec: Executive) => {
        setEditingExec(exec);
        setForm({
            name: exec.name,
            member_id: exec.member_id,
            designation: exec.designation,
            image_url: exec.image_url,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.name || !form.member_id || !form.designation) return;
        setSaving(true);
        try {
            if (editingExec) {
                const updated = await api.updateExecutive(editingExec.id, form);
                setExecutives((prev) =>
                    prev.map((e) => (e.id === editingExec.id ? updated : e))
                );
                showToast("✅ Executive updated!");
            } else {
                const created = await api.addExecutive(form);
                setExecutives((prev) => [...prev, created]);
                showToast("✅ Executive added!");
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
            await api.deleteExecutive(id);
            setExecutives((prev) => prev.filter((e) => e.id !== id));
            setDeleteConfirm(null);
            showToast("🗑️ Executive deleted.");
        } catch {
            showToast("❌ Failed to delete.");
        }
    };

    // Drag and drop reorder
    const handleDragStart = (idx: number) => setDragIdx(idx);
    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        setOverIdx(idx);
    };
    const handleDrop = async (dropIdx: number) => {
        if (dragIdx === null || dragIdx === dropIdx) {
            setDragIdx(null);
            setOverIdx(null);
            return;
        }
        const newList = [...executives];
        const [moved] = newList.splice(dragIdx, 1);
        newList.splice(dropIdx, 0, moved);
        const updated = newList.map((e, i) => ({ ...e, sort_order: i + 1 }));
        setExecutives(updated);
        setDragIdx(null);
        setOverIdx(null);
        try {
            await api.reorderExecutives(updated.map((e) => ({ id: e.id, sort_order: e.sort_order })));
            showToast("✅ Order saved!");
        } catch {
            showToast("❌ Failed to save order.");
        }
    };

    const card = (style = {}) => ({
        background: "white",
        borderRadius: "16px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        ...(style as object),
    });

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading executives...</div>;
    if (error) return <div style={{ textAlign: "center", padding: "60px", color: "#ef4444" }}>{error}</div>;

    return (
        <div>
            {/* Toast */}
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
                    <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "700", color: "#1e293b" }}>Executive Members</h3>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "14px" }}>
                        {executives.length} members · Drag rows to reorder
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    style={{
                        background: "#063970", color: "white", border: "none",
                        borderRadius: "12px", padding: "12px 24px", cursor: "pointer",
                        fontSize: "15px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px",
                    }}
                >
                    + Add Executive
                </button>
            </div>

            {/* Table */}
            <div style={card({ overflow: "hidden" })}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                            {["#", "", "Name", "Member ID", "Designation", "Actions"].map((h) => (
                                <th key={h} style={{
                                    padding: "14px 16px", textAlign: "left", fontSize: "13px",
                                    fontWeight: "600", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px",
                                }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {executives.map((exec, idx) => (
                            <tr
                                key={exec.id}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                                style={{
                                    borderBottom: "1px solid #f1f5f9",
                                    background: overIdx === idx ? "#eff6ff" : "white",
                                    transition: "background 0.15s",
                                    cursor: "grab",
                                    opacity: dragIdx === idx ? 0.4 : 1,
                                }}
                            >
                                <td style={{ padding: "14px 16px", color: "#94a3b8", fontSize: "15px", userSelect: "none" }}>
                                    ⠿ {idx + 1}
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <img
                                        src={exec.image_url}
                                        alt={exec.name}
                                        style={{ width: "44px", height: "44px", borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0" }}
                                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/44"; }}
                                    />
                                </td>
                                <td style={{ padding: "14px 16px", fontWeight: "600", color: "#1e293b", fontSize: "15px" }}>
                                    {exec.name}
                                </td>
                                <td style={{ padding: "14px 16px", color: "#64748b", fontSize: "14px", fontFamily: "monospace" }}>
                                    {exec.member_id}
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{
                                        background: "#eff6ff", color: "#1d4ed8", borderRadius: "8px",
                                        padding: "4px 12px", fontSize: "13px", fontWeight: "500",
                                    }}>{exec.designation}</span>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={() => openEdit(exec)} style={{
                                            background: "#f1f5f9", border: "none", borderRadius: "8px",
                                            padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#475569",
                                        }}>✏️ Edit</button>
                                        <button onClick={() => setDeleteConfirm(exec.id)} style={{
                                            background: "#fef2f2", border: "none", borderRadius: "8px",
                                            padding: "8px 16px", cursor: "pointer", fontSize: "13px", fontWeight: "600", color: "#ef4444",
                                        }}>🗑️ Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {executives.length === 0 && (
                    <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8", fontSize: "16px" }}>
                        No executives yet. Click "Add Executive" to get started.
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
                }}>
                    <div style={card({ width: "100%", maxWidth: "500px", padding: "32px" })}>
                        <h3 style={{ margin: "0 0 24px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>
                            {editingExec ? "Edit Executive" : "Add New Executive"}
                        </h3>
                        {(["name", "member_id", "designation", "image_url"] as const).map((field) => (
                            <div key={field} style={{ marginBottom: "18px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px", textTransform: "capitalize" }}>
                                    {field.replace("_", " ")} {field !== "image_url" ? "*" : ""}
                                </label>
                                <input
                                    type="text"
                                    value={form[field]}
                                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                                    placeholder={
                                        field === "name" ? "e.g. Fahim Ahmed" :
                                            field === "member_id" ? "e.g. ACC-2023-001" :
                                                field === "designation" ? "e.g. President" :
                                                    "https://... (image URL)"
                                    }
                                    style={{
                                        width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", fontSize: "15px", outline: "none", boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                        ))}
                        {form.image_url && (
                            <div style={{ marginBottom: "18px", textAlign: "center" }}>
                                <img src={form.image_url} alt="preview" style={{
                                    width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "3px solid #063970",
                                }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                            </div>
                        )}
                        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                            <button onClick={() => setShowModal(false)} style={{
                                padding: "11px 24px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
                                background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#64748b",
                            }}>Cancel</button>
                            <button onClick={handleSave} disabled={saving} style={{
                                padding: "11px 24px", background: "#063970", color: "white", border: "none",
                                borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600",
                            }}>{saving ? "Saving..." : "Save"}</button>
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
                        <div style={{ fontSize: "52px", marginBottom: "16px" }}>⚠️</div>
                        <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700", color: "#1e293b" }}>Delete Executive?</h3>
                        <p style={{ margin: "0 0 24px", color: "#64748b" }}>This action cannot be undone.</p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                                padding: "11px 28px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
                                background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#64748b",
                            }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} style={{
                                padding: "11px 28px", background: "#ef4444", color: "white", border: "none",
                                borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600",
                            }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
