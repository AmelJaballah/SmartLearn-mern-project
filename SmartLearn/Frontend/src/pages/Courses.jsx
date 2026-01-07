import { useEffect, useState } from "react";
import api from "../api/axios";
import CourseCard from "../components/CourseCard";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await api.get("/courses");
        if (!cancelled) setCourses(res.data);
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load courses");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div style={styles.loading}>Loading courses...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Explore Courses</h1>
        <p style={styles.subtitle}>{courses.length} courses available to start learning</p>
      </div>

      {courses.length === 0 ? (
        <div style={styles.empty}>No courses available yet.</div>
      ) : (
        <div style={styles.grid}>
          {courses.map((c) => (
            <CourseCard key={c._id} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px 24px", maxWidth: 1200, margin: "0 auto" },
  loading: {
    padding: 48,
    color: "#94a3b8",
    textAlign: "center",
    fontSize: "1.1rem",
  },
  error: {
    padding: 24,
    color: "#dc2626",
    background: "#fee2e2",
    borderRadius: 16,
    margin: 24,
    border: "1px solid #fecaca",
  },
  header: { marginBottom: 48 },
  title: {
    fontSize: 48,
    fontWeight: 800,
    marginBottom: 12,
    color: "#1e293b",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    color: "#64748b",
    fontSize: "1.1rem",
  },
  empty: {
    textAlign: "center",
    padding: 80,
    color: "#94a3b8",
    background: "#f8fafc",
    borderRadius: 24,
    border: "1px dashed #cbd5e1",
    fontSize: "1.1rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
    gap: 24,
  },
};
