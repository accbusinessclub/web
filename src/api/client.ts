const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getToken() {
    return sessionStorage.getItem("admin_token");
}

async function request(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }
    return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

export const api = {
    // Auth
    login: async (username: string, password: string) => {
        const res = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify({ username, password }),
        });
        return res.json();
    },

    // Hero
    getHero: async () => {
        const res = await request("/hero");
        return res.json();
    },
    updateHero: async (data: object) => {
        const res = await request("/hero", {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return res.json();
    },

    // Executives
    getExecutives: async () => {
        const res = await request("/executives");
        return res.json();
    },
    addExecutive: async (data: object) => {
        const res = await request("/executives", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.json();
    },
    updateExecutive: async (id: string, data: object) => {
        const res = await request(`/executives/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return res.json();
    },
    deleteExecutive: async (id: string) => {
        const res = await request(`/executives/${id}`, { method: "DELETE" });
        return res.json();
    },
    reorderExecutives: async (order: { id: string; sort_order: number }[]) => {
        const res = await request("/executives/reorder/batch", {
            method: "PUT",
            body: JSON.stringify({ order }),
        });
        return res.json();
    },

    // Images
    getImages: async () => {
        const res = await request("/images");
        return res.json();
    },
    uploadImageFile: async (file: File, caption: string) => {
        const formData = new FormData();
        formData.append("image", file);
        formData.append("caption", caption);
        const res = await request("/images/upload", {
            method: "POST",
            body: formData,
        });
        return res.json();
    },
    addImageUrl: async (url: string, caption: string) => {
        const res = await request("/images/url", {
            method: "POST",
            body: JSON.stringify({ url, caption }),
        });
        return res.json();
    },
    deleteImage: async (id: string) => {
        const res = await request(`/images/${id}`, { method: "DELETE" });
        return res.json();
    },
    reorderImages: async (order: { id: string; sort_order: number }[]) => {
        const res = await request("/images/reorder/batch", {
            method: "PUT",
            body: JSON.stringify({ order }),
        });
        return res.json();
    },

    // Settings
    getSetting: async (key: string) => {
        const res = await request(`/settings/${key}`);
        return res.json();
    },
    updateSetting: async (key: string, value: string) => {
        const res = await request(`/settings/${key}`, {
            method: "PUT",
            body: JSON.stringify({ value }),
        });
        return res.json();
    },

    // Alumni
    getAlumni: async () => {
        const res = await request("/alumni");
        return res.json();
    },
    addAlumni: async (data: object) => {
        const res = await request("/alumni", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.json();
    },
    updateAlumni: async (id: string, data: object) => {
        const res = await request(`/alumni/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return res.json();
    },
    deleteAlumni: async (id: string) => {
        const res = await request(`/alumni/${id}`, { method: "DELETE" });
        return res.json();
    },
    reorderAlumni: async (order: { id: string; sort_order: number }[]) => {
        const res = await request("/alumni/reorder/batch", {
            method: "PUT",
            body: JSON.stringify({ order }),
        });
        return res.json();
    },

    changePassword: async (currentPassword: string, newPassword: string) => {
        const res = await request("/auth/password", {
            method: "PUT",
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        return res.json();
    },

    forgotPassword: async (email: string) => {
        const res = await request("/auth/forgot-password", {
            method: "POST",
            body: JSON.stringify({ email }),
        });
        return res.json();
    },
    verifyOTP: async (email: string, otp: string) => {
        const res = await request("/auth/verify-otp", {
            method: "POST",
            body: JSON.stringify({ email, otp }),
        });
        return res.json();
    },
    resetPassword: async (email: string, newPassword: string) => {
        const res = await request("/auth/reset-password", {
            method: "POST",
            body: JSON.stringify({ email, newPassword }),
        });
        return res.json();
    },
};
