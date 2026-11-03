// All communication with the Node/Express backend lives here.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const CATEGORIES = ["Tech", "Lifestyle", "Education"];

const TOKEN_KEY = "blog_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
};

async function request(path, { method = "GET", body } = {}) {
    const headers = {};
    if (body) headers["Content-Type"] = "application/json";

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let res;
    try {
        res = await fetch(`${API_URL}${path}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error(`Cannot reach the server at ${API_URL}. Is the backend running?`);
    }

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const error = new Error(data.error || "Something went wrong.");
        error.status = res.status;
        throw error;
    }
    return data;
}

export const api = {
    // auth
    signup: (form) => request("/auth/signup", { method: "POST", body: form }),
    signin: (form) => request("/auth/signin", { method: "POST", body: form }),
    me: () => request("/auth/me"),
    signout: () => request("/auth/signout", { method: "POST" }),

    // blog posts
    getPosts: (category = "All") => request(`/blogs?category=${encodeURIComponent(category)}`),
    createPost: (post) => request("/blogs", { method: "POST", body: post }),
    updatePost: (id, post) => request(`/blogs/${id}`, { method: "PUT", body: post }),
    deletePost: (id) => request(`/blogs/${id}`, { method: "DELETE" }),

    // bonus: profile
    getProfile: () => request("/profile"),
};

export const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : "");
