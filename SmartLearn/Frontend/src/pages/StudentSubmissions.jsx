import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function StudentSubmissions() {
  const { user } = useContext(AuthContext);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCourse, setFilterCourse] = useState("all");
  const [courses, setCourses] = useState([]);
  const [feedbackForm, setFeedbackForm] = useState({ feedback: "", score: 0 });

  useEffect(() => {
    loadSubmissions();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [submissions, filterStatus, filterCourse]);

  async function loadSubmissions() {
    try {
      const res = await api.get("/submissions/professor/submissions");
      setSubmissions(res.data);
      
      // Extract unique courses
      const uniqueCourses = [...new Set(res.data.map(s => ({ id: s.courseId, name: s.courseName })))];
      const coursesMap = new Map();
      uniqueCourses.forEach(c => coursesMap.set(c.id, c.name));
      setCourses(Array.from(coursesMap, ([id, name]) => ({ id, name })));
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...submissions];
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(s => s.status === filterStatus);
    }
    
    if (filterCourse !== "all") {
      filtered = filtered.filter(s => s.courseId === filterCourse);
    }
    
    setFilteredSubmissions(filtered);
  }

  async function handleGiveFeedback(e) {
    e.preventDefault();
    if (!selectedSubmission) return;

    try {
      await api.patch(`/submissions/${selectedSubmission._id}`, {
        feedback: feedbackForm.feedback,
        score: feedbackForm.score,
        status: "graded",
      });
      
      setFeedbackForm({ feedback: "", score: 0 });
      setSelectedSubmission(null);
      loadSubmissions();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to submit feedback");
    }
  }

  function openFeedbackModal(submission) {
    setSelectedSubmission(submission);
    setFeedbackForm({
      feedback: submission.feedback || "",
      score: submission.score || 0,
    });
  }

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === "pending").length,
    graded: submissions.filter(s => s.status === "graded").length,
    avgScore: submissions.length > 0 
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / submissions.length) 
      : 0
  };

  if (loading) return <div style={styles.loading}>Loading submissions...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Student Submissions</h1>
          <p style={styles.subtitle}>Review and provide feedback on student work</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total Submissions</div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardWarning }}>
          <div style={styles.statValue}>{stats.pending}</div>
          <div style={styles.statLabel}>Pending Review</div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statCardSuccess }}>
          <div style={styles.statValue}>{stats.graded}</div>
          <div style={styles.statLabel}>Graded</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.avgScore}%</div>
          <div style={styles.statLabel}>Average Score</div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <label style={styles.filterLabel}>
          Status:
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="graded">Graded</option>
            <option value="reviewed">Reviewed</option>
          </select>
        </label>
        
        <label style={styles.filterLabel}>
          Course:
          <select 
            value={filterCourse} 
            onChange={(e) => setFilterCourse(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="all">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Submissions List */}
      <div style={styles.submissionsList}>
        {filteredSubmissions.length === 0 ? (
          <div style={styles.empty}>No submissions found with the current filters.</div>
        ) : (
          filteredSubmissions.map(submission => (
            <div key={submission._id} style={styles.submissionCard}>
              <div style={styles.submissionHeader}>
                <div>
                  <h3 style={styles.submissionTitle}>
                    {submission.exercise?.title || "Exercise"}
                  </h3>
                  <div style={styles.submissionMeta}>
                    <span style={styles.metaItem}>
                      👤 {submission.student?.username || "Unknown"}
                    </span>
                    <span style={styles.metaItem}>
                      📚 {submission.courseName}
                    </span>
                    <span style={styles.metaItem}>
                      📅 {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div style={styles.submissionBadges}>
                  <span style={
                    submission.status === "pending" ? styles.badgePending :
                    submission.status === "graded" ? styles.badgeGraded :
                    styles.badgeReviewed
                  }>
                    {submission.status}
                  </span>
                  {submission.score !== null && submission.score !== undefined && (
                    <span style={styles.scoreBadge}>{submission.score}%</span>
                  )}
                </div>
              </div>

              <div style={styles.submissionBody}>
                <div style={styles.answerSection}>
                  <strong style={styles.sectionLabel}>Student Answer:</strong>
                  <p style={styles.answerText}>
                    {typeof submission.submittedAnswer === 'string' 
                      ? submission.submittedAnswer 
                      : JSON.stringify(submission.submittedAnswer)}
                  </p>
                </div>

                {submission.feedback && (
                  <div style={styles.feedbackSection}>
                    <strong style={styles.sectionLabel}>Your Feedback:</strong>
                    <p style={styles.feedbackText}>{submission.feedback}</p>
                    {submission.sentimentAnalysis && (
                      <div style={styles.sentimentBadge}>
                        Sentiment: {submission.sentimentAnalysis.label} 
                        ({Math.round(submission.sentimentAnalysis.confidence * 100)}%)
                      </div>
                    )}
                  </div>
                )}

                <div style={styles.submissionActions}>
                  <button 
                    onClick={() => openFeedbackModal(submission)} 
                    style={styles.feedbackBtn}
                  >
                    {submission.feedback ? "Edit Feedback" : "Give Feedback"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Feedback Modal */}
      {selectedSubmission && (
        <div style={styles.modal} onClick={() => setSelectedSubmission(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>
              Provide Feedback
            </h2>
            
            <div style={styles.modalInfo}>
              <p><strong>Student:</strong> {selectedSubmission.student?.username}</p>
              <p><strong>Exercise:</strong> {selectedSubmission.exercise?.title}</p>
              <p><strong>Course:</strong> {selectedSubmission.courseName}</p>
            </div>

            <div style={styles.modalAnswer}>
              <strong>Student's Answer:</strong>
              <p style={styles.modalAnswerText}>
                {typeof selectedSubmission.submittedAnswer === 'string' 
                  ? selectedSubmission.submittedAnswer 
                  : JSON.stringify(selectedSubmission.submittedAnswer, null, 2)}
              </p>
            </div>

            <form onSubmit={handleGiveFeedback} style={styles.form}>
              <label style={styles.label}>
                Score (0-100)
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={feedbackForm.score}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, score: parseInt(e.target.value) })}
                  required
                  style={styles.input}
                />
              </label>

              <label style={styles.label}>
                Feedback
                <textarea
                  value={feedbackForm.feedback}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                  required
                  rows={6}
                  style={styles.textarea}
                  placeholder="Provide detailed feedback for the student..."
                />
              </label>

              <div style={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setSelectedSubmission(null)} 
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px 24px", maxWidth: 1400, margin: "0 auto" },
  loading: { padding: 40, textAlign: "center", color: "#94a3b8" },
  header: { marginBottom: 40 },
  title: { fontSize: 42, fontWeight: 800, margin: 0, color: "#1e293b", letterSpacing: "-0.02em" },
  subtitle: { color: "#64748b", marginTop: 8, fontSize: 16 },
  
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 40 },
  statCard: { 
    padding: 28, 
    background: "#ffffff", 
    border: "1px solid #e2e8f0", 
    borderRadius: 16,
    textAlign: "center"
  },
  statCardWarning: { background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "none" },
  statCardSuccess: { background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)", border: "none" },
  statValue: { fontSize: 36, fontWeight: 800, color: "#1e293b", marginBottom: 8 },
  statLabel: { fontSize: 14, color: "#64748b", fontWeight: 600 },
  
  filters: { display: "flex", gap: 20, marginBottom: 32, flexWrap: "wrap" },
  filterLabel: { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600, color: "#475569" },
  filterSelect: { padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, background: "#f8fafc", minWidth: 200 },
  
  submissionsList: { display: "flex", flexDirection: "column", gap: 20 },
  empty: { textAlign: "center", padding: 80, background: "#f8fafc", borderRadius: 20, color: "#94a3b8", fontSize: 16 },
  
  submissionCard: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden" },
  submissionHeader: { 
    padding: "24px", 
    background: "#f8fafc", 
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start"
  },
  submissionTitle: { fontSize: 20, fontWeight: 700, margin: 0, color: "#1e293b", marginBottom: 12 },
  submissionMeta: { display: "flex", gap: 20, flexWrap: "wrap" },
  metaItem: { fontSize: 14, color: "#64748b" },
  submissionBadges: { display: "flex", gap: 8, flexDirection: "column", alignItems: "flex-end" },
  badgePending: { padding: "6px 14px", borderRadius: 20, background: "#fef3c7", color: "#92400e", fontSize: 12, fontWeight: 600 },
  badgeGraded: { padding: "6px 14px", borderRadius: 20, background: "#d1fae5", color: "#065f46", fontSize: 12, fontWeight: 600 },
  badgeReviewed: { padding: "6px 14px", borderRadius: 20, background: "#e0e7ff", color: "#3730a3", fontSize: 12, fontWeight: 600 },
  scoreBadge: { padding: "6px 14px", borderRadius: 20, background: "#1e293b", color: "#ffffff", fontSize: 14, fontWeight: 700 },
  
  submissionBody: { padding: "24px" },
  answerSection: { marginBottom: 20 },
  sectionLabel: { color: "#475569", fontSize: 14, display: "block", marginBottom: 8 },
  answerText: { 
    padding: "16px", 
    background: "#f8fafc", 
    borderRadius: 12, 
    border: "1px solid #e2e8f0",
    fontSize: 15,
    lineHeight: 1.6,
    color: "#1e293b",
    margin: 0
  },
  feedbackSection: { marginBottom: 20 },
  feedbackText: { 
    padding: "16px", 
    background: "#ecfdf5", 
    borderRadius: 12, 
    border: "1px solid #d1fae5",
    fontSize: 15,
    lineHeight: 1.6,
    color: "#065f46",
    margin: 0,
    marginBottom: 12
  },
  sentimentBadge: { 
    fontSize: 12, 
    color: "#059669", 
    fontWeight: 600,
    padding: "4px 10px",
    background: "#d1fae5",
    borderRadius: 8,
    display: "inline-block"
  },
  submissionActions: { display: "flex", gap: 12 },
  feedbackBtn: {
    padding: "12px 24px",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
  },
  
  modal: { 
    position: "fixed", 
    top: 0, 
    left: 0, 
    right: 0, 
    bottom: 0, 
    background: "rgba(15, 23, 42, 0.7)", 
    backdropFilter: "blur(4px)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    zIndex: 1000,
    padding: 20
  },
  modalContent: { 
    background: "#ffffff", 
    padding: 40, 
    borderRadius: 24, 
    maxWidth: 700, 
    width: "100%", 
    maxHeight: "90vh", 
    overflow: "auto" 
  },
  modalTitle: { fontSize: 28, fontWeight: 700, marginBottom: 24, color: "#1e293b" },
  modalInfo: { 
    padding: 20, 
    background: "#f8fafc", 
    borderRadius: 12, 
    marginBottom: 24,
    fontSize: 15,
    color: "#475569"
  },
  modalAnswer: { marginBottom: 24 },
  modalAnswerText: {
    padding: 16,
    background: "#f8fafc",
    borderRadius: 12,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    color: "#1e293b"
  },
  
  form: { display: "flex", flexDirection: "column", gap: 20 },
  label: { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600, color: "#475569" },
  input: { padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, background: "#f8fafc" },
  textarea: { 
    padding: "12px 16px", 
    border: "1px solid #e2e8f0", 
    borderRadius: 12, 
    fontSize: 15, 
    fontFamily: "inherit", 
    resize: "vertical", 
    background: "#f8fafc",
    lineHeight: 1.6
  },
  formActions: { display: "flex", gap: 12, marginTop: 12 },
  cancelBtn: { 
    flex: 1, 
    padding: "14px 24px", 
    border: "1px solid #e2e8f0", 
    borderRadius: 12, 
    background: "#f8fafc", 
    fontWeight: 600, 
    cursor: "pointer",
    fontSize: 15
  },
  submitBtn: { 
    flex: 1, 
    padding: "14px 24px", 
    border: "none", 
    borderRadius: 12, 
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", 
    color: "white", 
    fontWeight: 600, 
    cursor: "pointer",
    fontSize: 15
  },
};
