
import { BriefcaseBusiness } from "lucide-react";
import { Link } from "react-router-dom";
import "./AuthLayout.css";

export default function AuthLayout({ children, title, subtitle }) {
    return (
        <main className="auth-page">
            <section className="auth-card">
                <Link to="/" className="auth-brand">
                    <span className="auth-brand-icon">
                        <BriefcaseBusiness size={22} />
                    </span>
                    <span>WorkPilot</span>
                </Link>

                <div className="auth-heading">
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>

                {children}
            </section>

            <p className="auth-footer">
                © 2026 WorkPilot. All rights reserved.
            </p>
        </main>
    );
}
