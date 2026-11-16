
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUser() {
            const token = sessionStorage.getItem("workpilot_token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get("/auth/me");
                setUser(response.data.user);
            } catch {
                sessionStorage.removeItem("workpilot_token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        loadUser();
    }, []);

    async function login(email, password) {
        const response = await api.post("/auth/login", {
            email,
            password
        });

        sessionStorage.setItem(
            "workpilot_token",
            response.data.token
        );

        setUser(response.data.user);

        return response.data.user;
    }

    async function register(email, password) {
        await api.post("/auth/register", {
            email,
            password
        });

        return login(email, password);
    }

    function logout() {
        sessionStorage.removeItem("workpilot_token");
        setUser(null);
    }

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout
    }), [user, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
}
