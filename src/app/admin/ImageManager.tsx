import { useState, useEffect } from "react";
import { api } from "../../api/client";

interface ImageItem {
    id: string;
    url: string;
    caption: string;
    filename: string | null;
    sort_order: number;
    created_at: string;
}

export function ImageManager() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState("");
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [tab, setTab] = useState<"file" | "url">("file");
    const [urlInput, setUrlInput] = useState("");
    const [captionInput, setCaptionInput] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [dragIdx, setDragIdx] = useState<number | null>(null);
    const [overIdx, setOverIdx] = useState<number | null>(null);

    const fetchImages = async () => {
        try {
            const data = await api.getImages();
            setImages(data);
        } catch {
            setError("Failed to load images. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchImages(); }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(""), 3000);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setFilePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleUploadFile = async () => {
        if (!selectedFile) return;
        setUploading(true);
        try {
            const img = await api.uploadImageFile(selectedFile, captionInput);
            if (img.error) throw new Error(img.error);
            setImages((prev) => [...prev, img]);
            setSelectedFile(null);
            setFilePreview(null);
            setCaptionInput("");
            // reset file input
            const inp = document.getElementById("img-file-input") as HTMLInputElement;
            if (inp) inp.value = "";
            showToast("✅ Image uploaded!");
        } catch (err: unknown) {
            showToast("❌ Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
        } finally {
            setUploading(false);
        }
    };

    const handleAddUrl = async () => {
        if (!urlInput.trim()) return;
        setUploading(true);
        try {
            const img = await api.addImageUrl(urlInput, captionInput);
            setImages((prev) => [...prev, img]);
            setUrlInput("");
            setCaptionInput("");
            showToast("✅ Image added!");
        } catch {
            showToast("❌ Failed to add image.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteImage(id);
            setImages((prev) => prev.filter((img) => img.id !== id));
            setDeleteConfirm(null);
            showToast("🗑️ Image deleted.");
        } catch {
            showToast("❌ Failed to delete.");
        }
    };

    // Drag-and-drop reorder
    const handleDragStart = (idx: number) => setDragIdx(idx);
    const handleDragOver = (e: React.DragEvent, idx: number) => {
        e.preventDefault();
        setOverIdx(idx);
    };
    const handleDrop = async (dropIdx: number) => {
        if (dragIdx === null || dragIdx === dropIdx) {
            setDragIdx(null); setOverIdx(null); return;
        }
        const newList = [...images];
        const [moved] = newList.splice(dragIdx, 1);
        newList.splice(dropIdx, 0, moved);
        const updated = newList.map((img, i) => ({ ...img, sort_order: i }));
        setImages(updated);
        setDragIdx(null); setOverIdx(null);
        try {
            await api.reorderImages(updated.map((img) => ({ id: img.id, sort_order: img.sort_order })));
            showToast("✅ Order saved!");
        } catch {
            showToast("❌ Failed to save order.");
        }
    };

    const getFullUrl = (url: string) =>
        url.startsWith("/uploads/") ? `http://localhost:3001${url}` : url;

    if (loading) return <div style={{ textAlign: "center", padding: "60px", color: "#64748b" }}>Loading images...</div>;
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

            {/* Upload Panel */}
            <div style={{
                background: "white", borderRadius: "16px", padding: "28px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: "28px",
            }}>
                <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                    Upload New Image
                </h3>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f1f5f9", borderRadius: "10px", padding: "4px" }}>
                    {(["file", "url"] as const).map((t) => (
                        <button key={t} onClick={() => setTab(t)} style={{
                            flex: 1, padding: "10px", border: "none", borderRadius: "8px", cursor: "pointer",
                            fontWeight: "600", fontSize: "14px",
                            background: tab === t ? "white" : "transparent",
                            color: tab === t ? "#063970" : "#64748b",
                            boxShadow: tab === t ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.2s",
                        }}>
                            {t === "file" ? "📁 Upload File" : "🔗 Paste URL"}
                        </button>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", alignItems: "start" }}>
                    <div>
                        {tab === "file" ? (
                            <div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ display: "none" }}
                                    id="img-file-input"
                                />
                                <label htmlFor="img-file-input" style={{
                                    display: "block", padding: "32px", border: "2px dashed #cbd5e1",
                                    borderRadius: "12px", textAlign: "center", cursor: "pointer",
                                    color: "#64748b", fontSize: "14px", marginBottom: "16px",
                                    background: selectedFile ? "#f0fdf4" : "white",
                                    borderColor: selectedFile ? "#86efac" : "#cbd5e1",
                                }}>
                                    {selectedFile ? `📎 ${selectedFile.name}` : "📁 Click to choose an image file"}
                                </label>
                            </div>
                        ) : (
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Image URL</label>
                                <input
                                    type="text"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                    style={{
                                        width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                        borderRadius: "10px", fontSize: "15px", outline: "none", boxSizing: "border-box",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: "16px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "8px" }}>Caption (optional)</label>
                            <input
                                type="text"
                                value={captionInput}
                                onChange={(e) => setCaptionInput(e.target.value)}
                                placeholder="e.g. Annual business summit 2024"
                                style={{
                                    width: "100%", padding: "11px 14px", border: "1.5px solid #e2e8f0",
                                    borderRadius: "10px", fontSize: "15px", outline: "none", boxSizing: "border-box",
                                }}
                                onFocus={(e) => (e.target.style.borderColor = "#063970")}
                                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                            />
                        </div>

                        <button
                            onClick={tab === "file" ? handleUploadFile : handleAddUrl}
                            disabled={uploading || (tab === "file" ? !selectedFile : !urlInput.trim())}
                            style={{
                                width: "100%", padding: "12px", background: "#063970", color: "white",
                                border: "none", borderRadius: "10px", cursor: uploading ? "not-allowed" : "pointer",
                                fontSize: "15px", fontWeight: "600", opacity: uploading ? 0.7 : 1,
                            }}
                        >
                            {uploading ? "Uploading..." : tab === "file" ? "📤 Upload Image" : "➕ Add Image"}
                        </button>
                    </div>

                    {/* Preview */}
                    <div style={{ textAlign: "center" }}>
                        {(filePreview || (tab === "url" && urlInput)) && (
                            <div>
                                <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 8px" }}>Preview</p>
                                <img
                                    src={filePreview || urlInput}
                                    alt="preview"
                                    style={{
                                        width: "100%", maxHeight: "200px", objectFit: "cover",
                                        borderRadius: "12px", border: "2px solid #e2e8f0",
                                    }}
                                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
                                />
                            </div>
                        )}
                        {!filePreview && !(tab === "url" && urlInput) && (
                            <div style={{
                                border: "2px dashed #e2e8f0", borderRadius: "12px", padding: "40px 20px",
                                color: "#94a3b8", fontSize: "13px",
                            }}>
                                Preview will appear here
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Gallery Grid with drag-to-reorder */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "#1e293b" }}>
                        Gallery ({images.length} images)
                    </h3>
                    {images.length > 0 && (
                        <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
                            ⠿ Drag cards to reorder
                        </p>
                    )}
                </div>

                {images.length === 0 ? (
                    <div style={{
                        background: "white", borderRadius: "16px", padding: "60px", textAlign: "center",
                        color: "#94a3b8", fontSize: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                    }}>
                        No images yet. Upload one above!
                    </div>
                ) : (
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                        gap: "16px",
                    }}>
                        {images.map((img, idx) => (
                            <div
                                key={img.id}
                                draggable
                                onDragStart={() => handleDragStart(idx)}
                                onDragOver={(e) => handleDragOver(e, idx)}
                                onDrop={() => handleDrop(idx)}
                                onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
                                style={{
                                    background: "white", borderRadius: "14px", overflow: "hidden",
                                    boxShadow: overIdx === idx ? "0 0 0 3px #063970" : "0 2px 12px rgba(0,0,0,0.06)",
                                    opacity: dragIdx === idx ? 0.4 : 1,
                                    cursor: "grab",
                                    transition: "box-shadow 0.15s, opacity 0.15s",
                                }}
                            >
                                {/* Serial badge */}
                                <div style={{ position: "relative" }}>
                                    <div style={{
                                        position: "absolute", top: "8px", left: "8px", zIndex: 2,
                                        background: "rgba(6,57,112,0.85)", color: "white",
                                        borderRadius: "8px", padding: "3px 9px", fontSize: "12px", fontWeight: "700",
                                    }}>
                                        #{idx + 1}
                                    </div>
                                    <div style={{ height: "160px", overflow: "hidden" }}>
                                        <img
                                            src={getFullUrl(img.url)}
                                            alt={img.caption || "Image"}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='160'%3E%3Crect fill='%23f1f5f9' width='220' height='160'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%2394a3b8' dy='.3em' font-size='13'%3EImage not found%3C/text%3E%3C/svg%3E";
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ padding: "12px" }}>
                                    <p style={{
                                        margin: "0 0 4px", fontSize: "13px", color: "#1e293b",
                                        fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                    }}>
                                        {img.caption || "No caption"}
                                    </p>
                                    <p style={{ margin: "0 0 10px", fontSize: "11px", color: "#94a3b8" }}>
                                        {new Date(img.created_at).toLocaleDateString()}
                                    </p>
                                    <button
                                        onClick={() => setDeleteConfirm(img.id)}
                                        style={{
                                            width: "100%", padding: "8px", background: "#fef2f2",
                                            border: "1px solid #fecaca", borderRadius: "8px",
                                            color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "600",
                                        }}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirm Modal */}
            {deleteConfirm && (
                <div style={{
                    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
                    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px",
                }}>
                    <div style={{
                        background: "white", borderRadius: "16px", padding: "32px",
                        width: "100%", maxWidth: "400px", textAlign: "center",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
                    }}>
                        <div style={{ fontSize: "52px", marginBottom: "16px" }}>🗑️</div>
                        <h3 style={{ margin: "0 0 8px", fontSize: "20px", fontWeight: "700" }}>Delete Image?</h3>
                        <p style={{ margin: "0 0 24px", color: "#64748b" }}>This will permanently delete the image.</p>
                        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                            <button onClick={() => setDeleteConfirm(null)} style={{
                                padding: "11px 28px", border: "1.5px solid #e2e8f0", borderRadius: "10px",
                                background: "white", cursor: "pointer", fontSize: "15px", fontWeight: "600", color: "#64748b",
                            }}>Cancel</button>
                            <button onClick={() => handleDelete(deleteConfirm)} style={{
                                padding: "11px 28px", background: "#ef4444", color: "white",
                                border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600",
                            }}>Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
