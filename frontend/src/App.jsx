
import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowUpRight,
    BriefcaseBusiness,
    ChartNoAxesCombined,
    ChevronDown,
    CircleHelp,
    LayoutDashboard,
    LogOut,
    Pencil,
    Plus,
    Search,
    Settings,
    Trash2,
    Users,
    X
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import api from "./services/api";
import { useAuth } from "./context/AuthContext";

const statuses = [
    { value: "saved", label: "Saved" },
    { value: "applied", label: "Applied" },
    { value: "interview", label: "Interview" },
    { value: "accepted", label: "Accepted" },
    { value: "rejected", label: "Rejected" }
];

const navigation = [
    { label: "Dashboard", icon: LayoutDashboard },
    { label: "Applications", icon: BriefcaseBusiness },
    { label: "Analytics", icon: ChartNoAxesCombined }
];

const emptyStats = {
    total: 0,
    saved: 0,
    applied: 0,
    interview: 0,
    rejected: 0,
    accepted: 0
};

function normalizeApplication(application) {
    const rawStatus = String(application.status || "saved").toLowerCase();

    return {
        ...application,
        id: application.id,
        company: application.company || "",
        position: application.position || "",
        status: rawStatus,
        date:
            application.appliedAt ||
            application.applied_at ||
            application.created_at
    };
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    }).format(date);
}

function getErrorMessage(error, fallback) {
    return (
        error.response?.data?.error ||
        error.response?.data?.message ||
        fallback
    );
}

function App() {
    const { user, logout, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [activePage, setActivePage] = useState("Dashboard");
    const [applications, setApplications] = useState([]);
    const [applicationStats, setApplicationStats] = useState(emptyStats);

    const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingApplication, setEditingApplication] = useState(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const [form, setForm] = useState({
        company: "",
        position: "",
        status: "applied"
    });

    // Carica candidature e statistiche dal backend
    useEffect(() => {
        if (authLoading || !user) return;

        loadDashboardData();
    }, [authLoading, user]);

    async function loadDashboardData() {
        setLoading(true);
        setError("");

        try {
            const [applicationsResponse, statsResponse] = await Promise.all([
                api.get("/applications", {
                    params: {
                        page: 1,
                        limit: 100
                    }
                }),
                api.get("/applications/stats")
            ]);

            const records = applicationsResponse.data.data || [];

            setApplications(records.map(normalizeApplication));
            setApplicationStats({
                ...emptyStats,
                ...statsResponse.data
            });
        } catch (err) {
            setError(
                getErrorMessage(err, "Unable to load dashboard data.")
            );
        } finally {
            setLoading(false);
        }
    }

    // Aggiorna le statistiche dopo ogni modifica
    async function refreshStats() {
        try {
            const response = await api.get("/applications/stats");

            setApplicationStats({
                ...emptyStats,
                ...response.data
            });
        } catch (err) {
            setError(
                getErrorMessage(err, "Unable to refresh application statistics.")
            );
        }
    }

    function openCreateModal() {
        setEditingApplication(null);

        setForm({
            company: "",
            position: "",
            status: "applied"
        });

        setFormError("");
        setShowModal(true);
    }

    function openEditModal(application) {
        setEditingApplication(application);

        setForm({
            company: application.company,
            position: application.position,
            status: application.status
        });

        setFormError("");
        setShowModal(true);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError("");

        if (!form.company.trim() || !form.position.trim()) {
            setFormError("Company and position are required.");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                company: form.company.trim(),
                position: form.position.trim(),
                status: form.status
            };

            if (editingApplication) {
                const response = await api.put(
                    `/applications/${editingApplication.id}`,
                    payload
                );

                const updated = normalizeApplication(response.data);

                setApplications((current) =>
                    current.map((item) =>
                        item.id === updated.id ? updated : item
                    )
                );
            } else {
                const response = await api.post("/applications", payload);

                setApplications((current) => [
                    normalizeApplication(response.data),
                    ...current
                ]);
            }

            setShowModal(false);
            await refreshStats();
        } catch (err) {
            setFormError(
                getErrorMessage(err, "Unable to save the application.")
            );
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(application) {
        const confirmed = window.confirm(
            `Delete the application for ${application.company}?`
        );

        if (!confirmed) return;

        try {
            await api.delete(`/applications/${application.id}`);

            setApplications((current) =>
                current.filter((item) => item.id !== application.id)
            );

            await refreshStats();
        } catch (err) {
            setError(
                getErrorMessage(err, "Unable to delete the application.")
            );
        }
    }

    async function handleStatusChange(application, status) {
        try {
            const response = await api.put(
                `/applications/${application.id}`,
                {
                    company: application.company,
                    position: application.position,
                    status
                }
            );

            const updated = normalizeApplication(response.data);

            setApplications((current) =>
                current.map((item) =>
                    item.id === updated.id ? updated : item
                )
            );

            await refreshStats();
        } catch (err) {
            setError(
                getErrorMessage(err, "Unable to update the status.")
            );
        }
    }

    function handleLogout() {
        logout();
        navigate("/login", { replace: true });
    }

    // Ricerca locale delle candidature caricate
    const filteredApplications = useMemo(() => {
        const query = search.toLowerCase();

        return applications.filter((application) =>
            `${application.company} ${application.position}`
                .toLowerCase()
                .includes(query)
        );
    }, [applications, search]);

    // Le statistiche provengono direttamente da PostgreSQL
    const stats = useMemo(() => {
        const total = applicationStats.total;

        const interviews = applicationStats.interview;

        const pending =
            applicationStats.applied + applicationStats.saved;

        const responses =
            applicationStats.interview +
            applicationStats.accepted +
            applicationStats.rejected;

        const responseRate = total > 0
            ? Math.round((responses / total) * 100)
            : 0;

        return [
            {
                label: "Total applications",
                value: total,
                icon: BriefcaseBusiness
            },
            {
                label: "Interviews",
                value: interviews,
                icon: Users
            },
            {
                label: "Pending applications",
                value: pending,
                icon: Activity
            },
            {
                label: "Response rate",
                value: `${responseRate}%`,
                icon: ChartNoAxesCombined
            }
        ];
    }, [applicationStats]);

    const recentApplications = activePage === "Dashboard"
        ? filteredApplications.slice(0, 5)
        : filteredApplications;

    if (authLoading) {
        return <div className="auth-loading">Loading WorkPilot...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <div className="brand">
                    <div className="brand-mark">W</div>
                    <span>
                        Work<span className="brand-light">Pilot</span>
                    </span>
                </div>

                <div className="workspace-label">WORKSPACE</div>

                <nav className="sidebar-nav">
                    {navigation.map(({ label, icon: Icon }) => (
                        <button
                            key={label}
                            className={`nav-item ${activePage === label ? "active" : ""}`}
                            onClick={() => setActivePage(label)}
                        >
                            <Icon size={19} />
                            <span>{label}</span>

                            {label === "Applications" && (
                                <span className="nav-count">
                                    {applicationStats.total}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-bottom">
                    <div className="workspace-label">PREFERENCES</div>

                    <button
                        className={`nav-item ${activePage === "Settings" ? "active" : ""}`}
                        onClick={() => setActivePage("Settings")}
                    >
                        <Settings size={19} />
                        <span>Settings</span>
                    </button>

                    <button
                        className={`nav-item ${activePage === "Help" ? "active" : ""}`}
                        onClick={() => setActivePage("Help")}
                    >
                        <CircleHelp size={19} />
                        <span>Help center</span>
                    </button>

                    <div className="sidebar-profile">
                        <div className="avatar">
                            {(user.email || "U").charAt(0).toUpperCase()}
                        </div>

                        <div className="profile-info">
                            <strong>My account</strong>
                            <span title={user.email}>{user.email}</span>
                        </div>

                        <button
                            className="icon-button profile-menu"
                            aria-label="Logout"
                            title="Logout"
                            onClick={handleLogout}
                        >
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div className="breadcrumb">
                        Workspace <span>/</span> <strong>{activePage}</strong>
                    </div>

                    <div className="topbar-actions">
                        <button
                            className="icon-button"
                            aria-label="Search"
                            onClick={() =>
                                document.getElementById("application-search")?.focus()
                            }
                        >
                            <Search size={19} />
                        </button>

                        <div className="topbar-divider" />

                        <div className="topbar-user">
                            <div className="avatar small">
                                {(user.email || "U").charAt(0).toUpperCase()}
                            </div>
                            <ChevronDown size={16} />
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="dashboard-error">
                        {error}
                        <button
                            onClick={() => setError("")}
                            aria-label="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {activePage === "Dashboard" || activePage === "Applications" ? (
                    <>
                        <section className="page-heading">
                            <div>
                                <div className="eyebrow">OVERVIEW</div>
                                <h1>{activePage}</h1>
                                <p>
                                    {activePage === "Dashboard"
                                        ? "Track your job search and stay on top of every opportunity."
                                        : "Manage and track all your job applications in one place."}
                                </p>
                            </div>

                            <button
                                className="primary-button"
                                onClick={openCreateModal}
                            >
                                <Plus size={18} />
                                Add application
                            </button>
                        </section>

                        {activePage === "Dashboard" && (
                            <section className="stats-grid">
                                {stats.map(({ label, value, icon: Icon }) => (
                                    <div className="stat-card" key={label}>
                                        <div className="stat-top">
                                            <span>{label}</span>
                                            <div className="stat-icon">
                                                <Icon size={19} />
                                            </div>
                                        </div>

                                        <div className="stat-bottom">
                                            <strong>{value}</strong>
                                        </div>
                                    </div>
                                ))}
                            </section>
                        )}

                        {activePage === "Dashboard" && (
                            <section className="panel activity-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h2>Application overview</h2>
                                        <p>Your current application status</p>
                                    </div>
                                </div>

                                <div className="success-content">
                                    <div className="success-details">
                                        {statuses.map(({ value, label }) => (
                                            <div key={value}>
                                                <span className={`success-dot ${value}`} />
                                                {label}
                                                <strong>
                                                    {applicationStats[value]}
                                                </strong>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="content-grid">
                            <div className="panel recent-panel">
                                <div className="panel-heading">
                                    <div>
                                        <h2>
                                            {activePage === "Dashboard"
                                                ? "Recent applications"
                                                : "All applications"}
                                        </h2>
                                        <p>
                                            {applicationStats.total} applications in total
                                        </p>
                                    </div>

                                    {activePage === "Dashboard" && (
                                        <button
                                            className="text-button"
                                            onClick={() => setActivePage("Applications")}
                                        >
                                            View all
                                        </button>
                                    )}
                                </div>

                                <div className="table-toolbar">
                                    <div className="search-box">
                                        <Search size={17} />

                                        <input
                                            id="application-search"
                                            type="text"
                                            placeholder="Search applications..."
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                        />

                                        {search && (
                                            <button
                                                className="clear-search"
                                                onClick={() => setSearch("")}
                                                aria-label="Clear search"
                                            >
                                                <X size={15} />
                                            </button>
                                        )}
                                    </div>

                                    <button
                                        className="filter-button"
                                        onClick={loadDashboardData}
                                        title="Refresh applications and statistics"
                                    >
                                        <Activity size={16} /> Refresh
                                    </button>
                                </div>

                                <div className="table-wrapper">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>COMPANY</th>
                                                <th>POSITION</th>
                                                <th>STATUS</th>
                                                <th>DATE</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="5" className="empty-state">
                                                        Loading applications...
                                                    </td>
                                                </tr>
                                            ) : recentApplications.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="empty-state">
                                                        {search
                                                            ? "No applications found."
                                                            : "No applications yet. Add your first application."}
                                                    </td>
                                                </tr>
                                            ) : (
                                                recentApplications.map((application) => (
                                                    <tr key={application.id}>
                                                        <td>
                                                            <div className="company-cell">
                                                                <div className="company-logo">
                                                                    {application.company.charAt(0).toUpperCase()}
                                                                </div>
                                                                <strong>{application.company}</strong>
                                                            </div>
                                                        </td>

                                                        <td>{application.position}</td>

                                                        <td>
                                                            <select
                                                                className={`status-select ${application.status}`}
                                                                value={application.status}
                                                                onChange={(event) =>
                                                                    handleStatusChange(
                                                                        application,
                                                                        event.target.value
                                                                    )
                                                                }
                                                                aria-label={`Status for ${application.company}`}
                                                            >
                                                                {statuses.map((status) => (
                                                                    <option
                                                                        key={status.value}
                                                                        value={status.value}
                                                                    >
                                                                        {status.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </td>

                                                        <td className="date-cell">
                                                            {formatDate(application.date)}
                                                        </td>

                                                        <td>
                                                            <div className="application-actions">
                                                                <button
                                                                    className="icon-button"
                                                                    title="Edit application"
                                                                    aria-label="Edit application"
                                                                    onClick={() =>
                                                                        openEditModal(application)
                                                                    }
                                                                >
                                                                    <Pencil size={16} />
                                                                </button>

                                                                <button
                                                                    className="icon-button delete-button"
                                                                    title="Delete application"
                                                                    aria-label="Delete application"
                                                                    onClick={() =>
                                                                        handleDelete(application)
                                                                    }
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {activePage === "Dashboard" && (
                            <section className="bottom-grid">
                                <div className="panel response-panel">
                                    <div className="panel-heading">
                                        <div>
                                            <h2>Application success</h2>
                                            <p>Your response breakdown</p>
                                        </div>

                                        <ArrowUpRight size={18} />
                                    </div>

                                    <div className="success-content">
                                        <div className="success-number">
                                            <strong>{stats[3].value}</strong>
                                            <span>Response rate</span>
                                        </div>

                                        <div className="success-details">
                                            <div>
                                                <span className="success-dot interview" />
                                                Interviews
                                                <strong>{applicationStats.interview}</strong>
                                            </div>

                                            <div>
                                                <span className="success-dot applied" />
                                                Applied
                                                <strong>{applicationStats.applied}</strong>
                                            </div>

                                            <div>
                                                <span className="success-dot rejected" />
                                                Rejected
                                                <strong>{applicationStats.rejected}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="panel tip-panel">
                                    <div className="tip-icon">
                                        <Activity size={20} />
                                    </div>

                                    <div>
                                        <span className="eyebrow">QUICK TIP</span>
                                        <h2>Stay consistent</h2>
                                        <p>
                                            Keep your application tracker updated to better
                                            understand your job search progress.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}
                    </>
                ) : (
                    <section className="placeholder-page">
                        <div className="placeholder-icon">
                            <Settings size={25} />
                        </div>

                        <h1>{activePage}</h1>

                        <p>
                            This section will be available in a future WorkPilot update.
                        </p>

                        <button
                            className="primary-button"
                            onClick={() => setActivePage("Dashboard")}
                        >
                            Back to dashboard
                        </button>
                    </section>
                )}
            </main>

            {showModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            setShowModal(false);
                        }
                    }}
                >
                    <form className="application-modal" onSubmit={handleSubmit}>
                        <div className="modal-heading">
                            <div>
                                <h2>
                                    {editingApplication
                                        ? "Edit application"
                                        : "Add application"}
                                </h2>

                                <p>
                                    {editingApplication
                                        ? "Update your job application details."
                                        : "Save a new job opportunity to your tracker."}
                                </p>
                            </div>

                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => setShowModal(false)}
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <label>
                            Company
                            <input
                                autoFocus
                                required
                                maxLength={100}
                                placeholder="e.g. Google"
                                value={form.company}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        company: event.target.value
                                    })
                                }
                            />
                        </label>

                        <label>
                            Position
                            <input
                                required
                                maxLength={100}
                                placeholder="e.g. Frontend Developer"
                                value={form.position}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        position: event.target.value
                                    })
                                }
                            />
                        </label>

                        <label>
                            Status
                            <select
                                value={form.status}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        status: event.target.value
                                    })
                                }
                            >
                                {statuses.map((status) => (
                                    <option key={status.value} value={status.value}>
                                        {status.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {formError && (
                            <div className="auth-error">{formError}</div>
                        )}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="secondary-button"
                                onClick={() => setShowModal(false)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="primary-button"
                                disabled={submitting}
                            >
                                <Plus size={17} />
                                {submitting
                                    ? "Saving..."
                                    : editingApplication
                                        ? "Save changes"
                                        : "Save application"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default App;
