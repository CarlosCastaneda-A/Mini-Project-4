import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // true while we check a saved token

    // On first load, restore the session if a token is saved in localStorage
    useEffect(() => {
        if (!getToken()) {
            setLoading(false);
            return;
        }
        api.me()
            .then((data) => setUser(data.user))
            .catch(() => setToken(null)) // expired / invalid token
            .finally(() => setLoading(false));
    }, []);

    const signin = async (form) => {
        const data = await api.signin(form);
        setToken(data.token);
        setUser(data.user);
    };

    const signup = async (form) => {
        const data = await api.signup(form);
        setToken(data.token);
        setUser(data.user);
    };

    const signout = async () => {
        try {
            await api.signout();
        } catch {
            /* token was already invalid - ignore */
        }
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signin, signup, signout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
