import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function MyEnrollments() {
    const { user } = useContext(AuthContext);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEnrollments();
    }, []);

    async function loadEnrollments() {
        try {
            const res = await api.get("/enrollments/my");
            setEnrollments(res.data);
        } catch (err) {
            console.error("Failed to load enrollments:", err);
        } finally {
            setLoading(false);
        }
    }

    async function handleUnenroll(courseId) {
        if (!confirm("Are you sure you want to unenroll from this course?")) return;
        try {
            await api.delete(`/enrollments/course/${courseId}`);
            loadEnrollments();
        } catch (err) {
            alert(err?.response?.data?.message || "Failed to unenroll");
        }
    }

    function getStatusColor(status) {
        switch (status) {
            case "completed": return { bg: "#d1fae5", color: "#059669" };
            case "active": return { bg: "#dbeafe", color: "#2563eb" };
            case "dropped": return { bg: "#fee2e2", color: "#dc2626" };
            default: return { bg: "#f1f5f9", color: "#64748b" };
        }
    }

    if (loading) return <div style={styles.loading}>Loading enrollments...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>📚 My Enrollments</h1>
                    <p style={styles.subtitle}>{enrollments.length} courses enrolled</p>
                </div>
                <Link to="/courses" style={styles.browseBtn}>
                    + Browse Courses
                </Link>
            </div>

            {enrollments.length === 0 ? (
                <div style={styles.empty}>
                    <p>You haven't enrolled in any courses yet.</p>
                    <Link to="/courses" style={styles.emptyLink}>
                        Browse Available Courses
                    </Link>
                </div>
            ) : (
                <div style={styles.grid}>
                    {enrollments.map((enrollment) => (
                        <div key={enrollment._id} style={styles.card}>
                            <div style={styles.cardHeader}>
                                <h3 style={styles.courseTitle}>
                                    {enrollment.course?.title || "Untitled Course"}
                                </h3>
                                <span
                                    style={{
                                        ...styles.statusBadge,
                                        background: getStatusColor(enrollment.status).bg,
                                        color: getStatusColor(enrollment.status).color,
                                    }}
                                >
                                    {enrollment.status}
                                </span>
                            </div>

                            <p style={styles.description}>
                                {enrollment.course?.description?.slice(0, 120) || "No description"}...
                            </p>

                            {/* Progress Bar */}
                            <div style={styles.progressSection}>
                                <div style={styles.progressHeader}>
                                    <span>Progress</span>
                                    <span>{enrollment.progress?.percentage || 0}%</span>
                                </div>
                                <div style={styles.progressBar}>
                                    <div
                                        style={{
                                            ...styles.progressFill,
                                            width: `${enrollment.progress?.percentage || 0}%`,
                                        }}
                                    />
                                </div>
                                <div style={styles.progressDetails}>
                                    <span>
                                        {enrollment.progress?.completedExercises || 0} /{" "}
                                        {enrollment.progress?.totalExercises || 0} exercises
                                    </span>
                                </div>
                            </div>

                            {/* Meta Info */}
                            <div style={styles.meta}>
                                <span>📅 Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</span>
                                {enrollment.progress?.lastAccessedAt && (
                                    <span>
                                        🕒 Last accessed: {new Date(enrollment.progress.lastAccessedAt).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={styles.actions}>
                                <Link to={`/courses/${enrollment.course?._id}`} style={styles.viewBtn}>
                                    Continue Learning
                                </Link>
                                <button
                                    onClick={() => handleUnenroll(enrollment.course?._id)}
                                    style={styles.unenrollBtn}
                                >
                                    Unenroll
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

const styles = {
    container: { padding: 32, maxWidth: 1200, margin: "0 auto" },
    loading: { padding: 32, textAlign: "center", color: "#64748b" },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
    },
    title: { fontSize: 32, fontWeight: 700, margin: 0, color: "#1e293b" },
    subtitle: { color: "#64748b", marginTop: 8 },
    browseBtn: {
        padding: "12px 24px",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "white",
        borderRadius: 12,
        textDecoration: "none",
        fontWeight: 600,
        boxShadow: "0 4px 14px rgba(79, 70, 229, 0.25)",
    },
    empty: {
        textAlign: "center",
        padding: 60,
        background: "#f8fafc",
        borderRadius: 16,
        border: "1px dashed #cbd5e1",
        color: "#64748b",
    },
    emptyLink: {
        display: "inline-block",
        marginTop: 16,
        color: "#4f46e5",
        fontWeight: 600,
        textDecoration: "none",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
        gap: 24,
    },
    card: {
        background: "#ffffff",
        borderRadius: 16,
        padding: 24,
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },
    cardHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    courseTitle: { fontSize: 18, fontWeight: 700, margin: 0, color: "#1e293b" },
    statusBadge: {
        padding: "4px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "capitalize",
    },
    description: { color: "#64748b", fontSize: 14, lineHeight: 1.6, marginBottom: 20 },
    progressSection: { marginBottom: 16 },
    progressHeader: {
        display: "flex",
        justifyContent: "space-between",
        fontSize: 13,
        fontWeight: 500,
        color: "#64748b",
        marginBottom: 8,
    },
    progressBar: {
        height: 8,
        background: "#e2e8f0",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        borderRadius: 4,
        transition: "width 0.3s ease",
    },
    progressDetails: { fontSize: 12, color: "#94a3b8", marginTop: 6 },
    meta: {
        display: "flex",
        flexDirection: "column",
        gap: 4,
        fontSize: 12,
        color: "#94a3b8",
        marginBottom: 16,
    },
    actions: { display: "flex", gap: 10 },
    viewBtn: {
        flex: 1,
        padding: "10px 16px",
        background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
        color: "white",
        borderRadius: 10,
        textDecoration: "none",
        textAlign: "center",
        fontWeight: 600,
        fontSize: 14,
    },
    unenrollBtn: {
        padding: "10px 16px",
        background: "#fef2f2",
        color: "#dc2626",
        border: "1px solid #fee2e2",
        borderRadius: 10,
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
    },
};
