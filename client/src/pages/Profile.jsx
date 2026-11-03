import { useEffect, useState } from "react";
import PostList from "../components/PostList.jsx";
import { api, formatDate } from "../api.js";

// Bonus: My Profile - user details + every post this user has written
export default function Profile() {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.getProfile()
            .then((data) => {
                setProfile(data.user);
                setPosts(data.posts);
            })
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <div className="alert alert-error">{error}</div>;
    if (!profile) return <p className="status">Loading profile...</p>;

    const details = [
        ["User ID", profile.user_id],
        ["Name", profile.name],
        ["Age", profile.age ?? "Not provided"],
        ["Occupation", profile.occupation || "Not provided"],
        ["Current City", profile.city || "Not provided"],
        ["Member Since", formatDate(profile.joinedAt)],
    ];

    return (
        <>
            <section className="create-section">
                <h2>My Profile</h2>
                <dl className="profile-grid">
                    {details.map(([label, value]) => (
                        <div key={label}>
                            <dt>{label}</dt>
                            <dd>{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <section className="filter-section">
                <h2>My Posts ({posts.length})</h2>
            </section>

            <PostList
                posts={posts}
                onUpdated={(updated) =>
                    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
                }
                onDeleted={(id) => setPosts((prev) => prev.filter((p) => p.id !== id))}
                emptyMessage="You haven't posted anything yet. Head to the Home page to write your first post."
            />
        </>
    );
}
