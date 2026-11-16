
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import { useAuth } from "../context/AuthContext";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            await register(email.trim(), password);
            navigate("/dashboard", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.response?.data?.message ||
                "Unable to create your account. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Start managing your job applications with WorkPilot."
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
                        placeholder="At least 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />
                </div>

                <div className="auth-field">
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        minLength={8}
                        required
                    />
                </div>

                {error && <div className="auth-error">{error}</div>}

                <button
                    className="auth-submit"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? "Creating account..." : "Create account"}
                </button>
            </form>

            <div className="auth-switch">
                Already have an account? <Link to="/login">Sign in</Link>
            </div>
        </AuthLayout>
    );
}
