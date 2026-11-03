import { useEffect, useState } from "react";
import BlogPostForm from "../components/BlogPostForm.jsx";
import PostList from "../components/PostList.jsx";
import { api, CATEGORIES } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
    const { user, loading: authLoading } = useAuth();
    const [posts, setPosts] = useState([]);
    const [category, setCategory] = useState("All");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch posts on load, when the filter changes, and when the user signs in/out
    // (canEdit depends on who is asking).
    useEffect(() => {
        if (authLoading) return;
        let cancelled = false;
        setLoading(true);
        api.getPosts(category)
            .then((data) => {
                if (cancelled) return;
                console.log("Posts from backend:", data); // frontend <-> backend connection check
                setPosts(data);
                setError("");
            })
            .catch((err) => !cancelled && setError(err.message))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [category, authLoading, user?.user_id]);

    // State updates that make the list change instantly, no page reload
    const handleCreated = (post) => {
        if (category === "All" || category === post.category) {
            setPosts((prev) => [post, ...prev]);
        }
    };

    const handleUpdated = (updated) => {
        setPosts((prev) => {
            const next = prev.map((p) => (p.id === updated.id ? updated : p));
            // if the category changed and a filter is active, it may no longer belong here
            return category === "All" ? next : next.filter((p) => p.category === category);
        });
    };

    const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

    return (
        <>
            <BlogPostForm onCreated={handleCreated} />

            <section className="filter-section">
                <h2>Blog Posts</h2>
                <div className="filter-control">
                    <label htmlFor="filter">Filter by Category:</label>
                    <select id="filter" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="All">All</option>
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
            </section>

            {error && <div className="alert alert-error">{error}</div>}

            {loading ? (
                <p className="status">Loading posts...</p>
            ) : (
                !error && (
                    <PostList
                        posts={posts}
                        onUpdated={handleUpdated}
                        onDeleted={handleDeleted}
                        emptyMessage={
                            category === "All"
                                ? "Create your first blog post above."
                                : `No posts in ${category} yet.`
                        }
                    />
                )
            )}
        </>
    );
}
