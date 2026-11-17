
import { useState } from "react";
import { Link } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import api from "../services/api";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");
        setSubmitting(true);

        try {
            const response = await api.post("/auth/forgot-password", {
                email: email.trim()
            });

            setSuccess(response.data.message);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Unable to process your request. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="Enter your email address and we'll send you a link to reset your password."
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

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="auth-success">
                        {success}
                    </div>
                )}

                <button
                    className="auth-submit"
                    type="submit"
                    disabled={submitting}
                >
                    {submitting ? "Sending..." : "Send reset link"}
                </button>
            </form>

            <div className="auth-switch">
                Remember your password?{" "}
                <Link to="/login">Back to login</Link>
            </div>
        </AuthLayout>
    );
}
