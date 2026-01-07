import { Link } from "react-router-dom";

export default function CourseCard({ course }) {
  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>{course.title || "Untitled course"}</h3>
        {course.category && <span style={styles.category}>{course.category}</span>}
      </div>

      {course.description && (
        <p style={styles.desc}>
          {course.description.slice(0, 150)}
          {course.description.length > 150 ? "..." : ""}
        </p>
      )}

      <div style={styles.meta}>
        {course.students && (
          <span style={styles.metaItem}>
            {course.students.length} {course.students.length === 1 ? "student" : "students"}
          </span>
        )}
        {course.isPublished !== undefined && (
          <span style={course.isPublished ? styles.publishedBadge : styles.draftBadge}>
            {course.isPublished ? "Published" : "Draft"}
          </span>
        )}
      </div>

      <Link to={`/courses/${course._id}`} style={styles.link}>
        View Course
      </Link>
    </div>
  );
}

const styles = {
  card: {
    background: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: 20,
    padding: 28,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
    minHeight: "240px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontWeight: 700,
    fontSize: 20,
    color: "#1e293b",
    margin: 0,
    lineHeight: 1.3,
    letterSpacing: "-0.01em",
  },
  category: {
    fontSize: 12,
    fontWeight: 600,
    color: "#7c3aed",
    background: "#f5f3ff",
    padding: "4px 12px",
    borderRadius: 20,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  desc: {
    color: "#64748b",
    fontSize: 15,
    lineHeight: 1.6,
    margin: 0,
    flex: 1,
  },
  meta: {
    display: "flex",
    gap: 16,
    alignItems: "center",
    fontSize: 13,
    color: "#94a3b8",
  },
  metaItem: {
    fontWeight: 500,
  },
  publishedBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: "#059669",
    background: "#d1fae5",
    padding: "4px 10px",
    borderRadius: 12,
  },
  draftBadge: {
    fontSize: 12,
    fontWeight: 600,
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: 12,
  },
  link: {
    textDecoration: "none",
    color: "#ffffff",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    fontWeight: 600,
    fontSize: 15,
    padding: "12px 24px",
    borderRadius: 12,
    textAlign: "center",
    transition: "all 0.3s ease",
  },
};
