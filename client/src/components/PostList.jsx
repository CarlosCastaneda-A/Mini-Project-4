import { useState } from "react";
import { api, formatDate } from "../api.js";
import EditPost from "./EditPost.jsx";

// Renders every post with .map(). Edit / Delete only appear on your own posts
// (the backend sends canEdit and also enforces it with a 403).
export default function PostList({ posts, onUpdated, onDeleted, emptyMessage }) {
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");

    const handleDelete = async (post) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        setError("");
        try {
            await api.deletePost(post.id);
            onDeleted(post.id);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSaved = (updated) => {
        onUpdated(updated);
        setEditingId(null);
    };

    if (posts.length === 0) {
        return (
            <div className="no-posts">
                <h3>No blog posts found.</h3>
                <p>{emptyMessage || "Create your first blog post above."}</p>
            </div>
        );
    }

    return (
        <section className="posts-section">
            {error && <div className="alert alert-error">{error}</div>}

            {posts.map((post) =>
                editingId === post.id ? (
                    <EditPost
                        key={post.id}
                        post={post}
                        onSaved={handleSaved}
                        onCancel={() => setEditingId(null)}
                    />
                ) : (
                    <article className="post-card" key={post.id}>
                        <div className="post-header">
                            <div>
                                <h2>{post.title}</h2>
                                <p className="author">
                                    By <strong>{post.creator}</strong>
                                </p>
                                <p className="date">
                                    Posted: {formatDate(post.createdAt)}
                                    {post.updatedAt && ` (edited ${formatDate(post.updatedAt)})`}
                                </p>
                            </div>
                            <span className="category">{post.category}</span>
                        </div>

                        <div className="post-content">
                            <p>{post.content}</p>
                        </div>

                        {post.canEdit && (
                            <div className="post-actions">
                                <button
                                    type="button"
                                    className="btn btn-edit"
                                    onClick={() => setEditingId(post.id)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-delete"
                                    onClick={() => handleDelete(post)}
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </article>
                )
            )}
        </section>
    );
}
