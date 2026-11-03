import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();

    // One state object for the whole form, updated by a single change handler
    const [form, setForm] = useState({
        user_id: "",
        password: "",
        name: "",
        age: "",
        occupation: "",
        city: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await signup(form);
            navigate("/");
        } catch (err) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <section className="create-section auth-card">
            <h2>Sign Up</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="user_id">User ID</label>
                    <input
                        type="text"
                        id="user_id"
                        name="user_id"
                        value={form.user_id}
                        onChange={handleChange}
                        placeholder="3-20 letters, numbers or underscores"
                        autoComplete="username"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="At least 6 characters"
                        autoComplete="new-password"
                        minLength={6}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="name">Your Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="age">Age (optional)</label>
                        <input
                            type="number"
                            id="age"
                            name="age"
                            min="1"
                            max="120"
                            value={form.age}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="occupation">Occupation (optional)</label>
                        <input
                            type="text"
                            id="occupation"
                            name="occupation"
                            value={form.occupation}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="city">Current City (optional)</label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Creating account..." : "Sign Up"}
                </button>
            </form>

            <p className="muted auth-switch">
                Already have an account? <Link to="/signin">Sign in</Link>
            </p>
        </section>
    );
}
