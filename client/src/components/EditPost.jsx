import { useState } from "react";
import { api, CATEGORIES } from "../api.js";

// Edit form. The existing post arrives as a prop and pre-fills the fields.
export default function EditPost({ post, onSaved, onCancel }) {
    const [title, setTitle] = useState(post.title);
    const [category, setCategory] = useState(post.category);
    const [content, setContent] = useState(post.content);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            const updated = await api.updatePost(post.id, { title, category, content });
            onSaved(updated); // parent swaps the old post for this one
        } catch (err) {
            setError(err.message);
            setSaving(false);
        }
    };

    return (
        <article className="post-card editing">
            <h2>Edit Post</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor={`edit-title-${post.id}`}>Blog Title</label>
                    <input
                        type="text"
                        id={`edit-title-${post.id}`}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor={`edit-category-${post.id}`}>Category</label>
                    <select
                        id={`edit-category-${post.id}`}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor={`edit-content-${post.id}`}>Blog Content</label>
                    <textarea
                        id={`edit-content-${post.id}`}
                        rows="8"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <div className="edit-actions">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                    <button type="button" className="btn btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </article>
    );
}
