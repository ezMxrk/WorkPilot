
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import api from "../services/api";

export default function ResetPassword() {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!token) {
            setError("Password reset token is missing.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Password confirmation does not match.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }

        setSubmitting(true);

        try {
            const response = await api.post("/auth/reset-password", {
                token,
                newPassword,
                confirmPassword
            });

            setSuccess(response.data.message);

            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Unable to reset your password. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Choose a new password for your WorkPilot account."
        >
            {!success ? (
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label htmlFor="newPassword">
                            New password
                        </label>

                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter your new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label htmlFor="confirmPassword">
                            Confirm new password
                        </label>

                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your new password"
                            autoComplete="new-password"
                            minLength={8}
                            required
                        />
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <button
                        className="auth-submit"
                        type="submit"
                        disabled={submitting || !token}
                    >
                        {submitting ? "Updating..." : "Reset password"}
                    </button>
                </form>
            ) : (
                <div className="auth-success">
                    {success}
                </div>
            )}

            <div className="auth-switch">
                <Link to="/login">Back to login</Link>
            </div>
        </AuthLayout>
    );
}
