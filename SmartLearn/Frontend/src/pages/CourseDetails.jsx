import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext";

export default function CourseDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [course, setCourse] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [courseRes, exercisesRes] = await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/exercises`, { params: { course: id } }),
        ]);

        if (!cancelled) {
          setCourse(courseRes.data);
          setExercises(exercisesRes.data);
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Failed to load course");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmitReview(e) {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await api.post(`/courses/${id}/reviews`, reviewForm);
      setCourse(response.data);
      setReviewForm({ rating: 5, comment: "" });
      alert("✅ Review submitted successfully!");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  }

  function getSentimentEmoji(sentiment) {
    if (!sentiment) return "💬";
    if (sentiment === "positive") return "😊";
    if (sentiment === "negative") return "😞";
    return "😐";
  }

  if (loading) return <div style={{ padding: 16 }}>Loading course...</div>;
  if (error) return <div style={{ padding: 16, color: "crimson" }}>{error}</div>;

  const hasReviewed = course?.reviews?.some(
    (r) => r.student?._id === user?._id || r.student === user?._id
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>{course?.title || "Course"}</h2>
        {course?.description ? <p style={styles.description}>{course.description}</p> : null}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>📚 Exercises</h3>
        {exercises.length === 0 ? (
          <p style={styles.emptyText}>No exercises for this course.</p>
        ) : (
          <ul style={styles.list}>
            {exercises.map((e) => (
              <li key={e._id} style={styles.listItem}>
                {e.title || e.type || "Exercise"}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>⭐ Reviews ({course?.reviews?.length || 0})</h3>

        {!hasReviewed && user && (
          <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
            <h4 style={styles.formTitle}>Leave a Review</h4>
            <label style={styles.label}>
              Rating:
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })
                }
                style={styles.select}
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average)</option>
                <option value={2}>⭐⭐ (2 - Poor)</option>
                <option value={1}>⭐ (1 - Very Poor)</option>
              </select>
            </label>

            <label style={styles.label}>
              Comment:
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                placeholder="Share your thoughts about this course..."
                rows={4}
                style={styles.textarea}
              />
            </label>

            <button type="submit" disabled={submittingReview} style={styles.submitBtn}>
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {hasReviewed && <p style={styles.alreadyReviewed}>✅ You have already reviewed this course</p>}

        <div style={styles.reviewsList}>
          {course?.reviews?.length === 0 ? (
            <p style={styles.emptyText}>No reviews yet. Be the first to review!</p>
          ) : (
            course?.reviews?.map((review, idx) => (
              <div key={idx} style={styles.reviewCard}>
                <div style={styles.reviewHeader}>
                  <div style={styles.rating}>
                    {"⭐".repeat(review.rating)}
                  </div>
                  {review.sentimentAnalysis && (
                    <div style={styles.sentiment}>
                      {getSentimentEmoji(review.sentimentAnalysis.sentiment)}{" "}
                      <span style={styles.sentimentLabel}>
                        {review.sentimentAnalysis.label}
                      </span>
                    </div>
                  )}
                </div>
                <p style={styles.reviewComment}>{review.comment}</p>
                <div style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: 32, maxWidth: 1000, margin: "0 auto" },
  header: { marginBottom: 32 },
  title: { fontSize: 36, fontWeight: 700, marginBottom: 12, color: "#1e293b" },
  description: { fontSize: 16, color: "#64748b", lineHeight: 1.7 },
  section: { marginTop: 32, padding: 28, background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
  sectionTitle: { fontSize: 22, fontWeight: 600, marginBottom: 20, color: "#1e293b" },
  emptyText: { color: "#94a3b8", fontStyle: "italic" },
  list: { listStyle: "none", padding: 0 },
  listItem: { padding: 16, background: "#f8fafc", marginBottom: 10, borderRadius: 12, color: "#1e293b", border: "1px solid #e2e8f0" },
  reviewForm: { padding: 24, background: "#f8fafc", borderRadius: 12, marginBottom: 28, border: "1px solid #e2e8f0" },
  formTitle: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#1e293b" },
  label: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 16, fontSize: 14, fontWeight: 500, color: "#475569" },
  select: { padding: 12, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, background: "#ffffff" },
  textarea: { padding: 14, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, fontFamily: "inherit", resize: "vertical", background: "#ffffff" },
  submitBtn: { padding: "12px 24px", border: "none", borderRadius: 10, background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "white", fontWeight: 600, cursor: "pointer", fontSize: 14 },
  alreadyReviewed: { padding: 14, background: "#d1fae5", borderRadius: 10, color: "#059669", fontWeight: 500 },
  reviewsList: { display: "flex", flexDirection: "column", gap: 16 },
  reviewCard: { padding: 20, background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  reviewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  rating: { fontSize: 18 },
  sentiment: { display: "flex", alignItems: "center", gap: 8, fontSize: 14 },
  sentimentLabel: { color: "#64748b" },
  reviewComment: { marginBottom: 12, lineHeight: 1.6, color: "#374151" },
  reviewDate: { fontSize: 13, color: "#94a3b8" },
};
