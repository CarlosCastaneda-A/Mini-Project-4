import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signin() {
    const { signin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await signin({ user_id: userId, password });
            navigate(location.state?.from || "/");
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <section className="create-section auth-card">
            <h2>Sign In</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="user_id">User ID</label>
                    <input
                        type="text"
                        id="user_id"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter your user ID"
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <p className="muted auth-switch">
                Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
        </section>
    );
}
