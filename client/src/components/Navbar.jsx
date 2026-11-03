import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
    const { user, signout } = useAuth();
    const navigate = useNavigate();

    const handleSignout = async () => {
        await signout();
        navigate("/");
    };

    return (
        <header>
            <div className="container">
                <h1>My Blog</h1>
                <p>Share your thoughts with the world.</p>

                <nav className="nav">
                    <NavLink to="/" end>Home</NavLink>

                    {user ? (
                        <>
                            <NavLink to="/profile">My Profile</NavLink>
                            <span className="nav-user">Hi, {user.name}</span>
                            <button type="button" className="btn btn-nav" onClick={handleSignout}>
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/signin">Sign In</NavLink>
                            <NavLink to="/signup">Sign Up</NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
