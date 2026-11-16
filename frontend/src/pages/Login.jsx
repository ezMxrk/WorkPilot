
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(email.trim(), password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to log in. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to continue to your WorkPilot account."
        >
            <form className="auth-form" onSubmit={handleSubmit}>
                <div className="auth-field">
                    <label htmlFor="email">Email address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                    />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                    className="auth-submit"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? "Signing in..." : "Sign in"}
                </button>
            </form>

            <div className="auth-switch">
                Don't have an account? <Link to="/register">Create one</Link>
            </div>
        </AuthLayout>
    );
}
