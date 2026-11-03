import { useState } from "react";
import { Link } from "react-router-dom";
import { api, CATEGORIES } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

// Controlled form for creating a post (replaces the EJS create form).
export default function BlogPostForm({ onCreated }) {
    const { user } = useAuth();

    // One state variable per field, bound to inputs with `value`
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!user) {
        return (
            <section className="create-section">
                <h2>Create a New Blog Post</h2>
                <p>
                    Please <Link to="/signin">sign in</Link> or <Link to="/signup">sign up</Link>{" "}
                    to publish a post.
                </p>
            </section>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault(); // stop the browser's default page reload
        setError("");
        setSubmitting(true);
        try {
            const newPost = await api.createPost({ title, category, content });
            onCreated(newPost);
            setTitle("");
            setCategory("");
            setContent("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="create-section">
            <h2>Create a New Blog Post</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <p className="muted posting-as">
                    Posting as <strong>{user.name}</strong>
                </p>

                <div className="form-group">
                    <label htmlFor="title">Blog Title</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter your blog title"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="content">Blog Content</label>
                    <textarea
                        id="content"
                        rows="7"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Write your blog post here..."
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Publishing..." : "Publish Post"}
                </button>
            </form>
        </section>
    );
}
