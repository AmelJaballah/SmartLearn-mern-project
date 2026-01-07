import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function ProfessorCourses() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("courses");

  // Course creation form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    category: "",
  });

  // Exercise creation form
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [exerciseForm, setExerciseForm] = useState({
    course: "",
    title: "",
    description: "",
    type: "short-answer",
    difficulty: "medium",
    content: "",
    solution: "",
    correctAnswer: "",
    options: ["", "", "", ""],
    points: 100,
  });

  useEffect(() => {
    loadData();
  }, [user]);

  async function loadData() {
    try {
      const [coursesRes, exercisesRes, submissionsRes] = await Promise.all([
        api.get("/courses"),
        api.get("/exercises"),
        api.get("/submissions/professor/submissions"),
      ]);

      const myCourses = coursesRes.data.filter((c) => c.professor === user?._id);
      setCourses(myCourses);

      const courseIds = myCourses.map((c) => c._id);
      const myExercises = exercisesRes.data.filter((e) => courseIds.includes(e.course));
      setExercises(myExercises);
      
      setSubmissions(submissionsRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    try {
      await api.post("/courses", {
        ...courseForm,
        professor: user._id,
        isPublished: false,
      });
      setCourseForm({ title: "", description: "", category: "" });
      setShowCourseForm(false);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create course");
    }
  }

  async function handleCreateExercise(e) {
    e.preventDefault();
    try {
      const exerciseData = {
        ...exerciseForm,
        createdBy: user._id,
        content: exerciseForm.content,
      };

      if (exerciseForm.type === "multiple-choice") {
        exerciseData.options = exerciseForm.options.filter((o) => o.trim());
      }

      await api.post("/exercises", exerciseData);
      setExerciseForm({
        course: "",
        title: "",
        description: "",
        type: "short-answer",
        difficulty: "medium",
        content: "",
        solution: "",
        correctAnswer: "",
        options: ["", "", "", ""],
        points: 100,
      });
      setShowExerciseForm(false);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create exercise");
    }
  }

  async function handleDeleteCourse(courseId) {
    if (!confirm("Delete this course?")) return;
    try {
      await api.delete(`/courses/${courseId}`);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  }

  async function handleDeleteExercise(exerciseId) {
    if (!confirm("Delete this exercise?")) return;
    try {
      await api.delete(`/exercises/${exerciseId}`);
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  }

  async function handleTogglePublish(courseId, isPublished) {
    try {
      await api.patch(`/courses/${courseId}`, { isPublished: !isPublished });
      loadData();
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update");
    }
  }

  function getExercisesForCourse(courseId) {
    return exercises.filter((e) => e.course === courseId);
  }

  function getSubmissionsForCourse(courseId) {
    const courseExerciseIds = getExercisesForCourse(courseId).map(e => e._id);
    return submissions.filter(s => courseExerciseIds.includes(s.exercise?._id));
  }

  function getPendingSubmissionsCount(courseId) {
    return getSubmissionsForCourse(courseId).filter(s => s.status === 'pending').length;
  }

  if (loading) return <div style={styles.loading}>Loading...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Courses</h1>
          <p style={styles.subtitle}>Manage your courses and exercises</p>
        </div>
        <div style={styles.headerActions}>
          <button onClick={() => setShowCourseForm(true)} style={styles.createBtn}>
            + New Course
          </button>
          <button onClick={() => setShowExerciseForm(true)} style={styles.createBtnSecondary}>
            + New Exercise
          </button>
        </div>
      </div>

      <div style={styles.tabs}>
        <button
          onClick={() => setView("courses")}
          style={{ ...styles.tab, ...(view === "courses" ? styles.tabActive : {}) }}
        >
          Courses ({courses.length})
        </button>
        <button
          onClick={() => setView("exercises")}
          style={{ ...styles.tab, ...(view === "exercises" ? styles.tabActive : {}) }}
        >
          Exercises ({exercises.length})
        </button>
      </div>

      {view === "courses" ? (
        <div>
          {courses.length === 0 ? (
            <div style={styles.empty}>
              <p>No courses yet. Create your first course!</p>
              <button onClick={() => setShowCourseForm(true)} style={styles.emptyBtn}>
                Create Course
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {courses.map((course) => (
                <div key={course._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{course.title}</h3>
                    <span style={course.isPublished ? styles.publishedBadge : styles.draftBadge}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p style={styles.cardDesc}>{course.description}</p>
                  <div style={styles.cardMeta}>
                    <span>👥 {course.students?.length || 0} students</span>
                    <span>📝 {getExercisesForCourse(course._id).length} exercises</span>
                    <span>📋 {getSubmissionsForCourse(course._id).length} submissions</span>
                    {getPendingSubmissionsCount(course._id) > 0 && (
                      <span style={styles.pendingBadge}>
                        ⏳ {getPendingSubmissionsCount(course._id)} pending
                      </span>
                    )}
                  </div>
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleTogglePublish(course._id, course.isPublished)}
                      style={styles.actionBtn}
                    >
                      {course.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button onClick={() => setSelectedCourse(course)} style={styles.actionBtn}>
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {exercises.length === 0 ? (
            <div style={styles.empty}>
              <p>No exercises yet.</p>
              <button onClick={() => setShowExerciseForm(true)} style={styles.emptyBtn}>
                Create Exercise
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {exercises.map((exercise) => (
                <div key={exercise._id} style={styles.card}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>{exercise.title}</h3>
                    <span style={styles.difficultyBadge}>{exercise.difficulty}</span>
                  </div>
                  <p style={styles.cardDesc}>{exercise.description}</p>
                  <div style={styles.cardMeta}>
                    <span>{exercise.type}</span>
                    <span>{exercise.points} pts</span>
                  </div>
                  {exercise.solution && (
                    <div style={styles.solutionPreview}>
                      Solution: {exercise.solution.slice(0, 50)}...
                    </div>
                  )}
                  <div style={styles.cardActions}>
                    <button
                      onClick={() => handleDeleteExercise(exercise._id)}
                      style={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Course Creation Modal */}
      {showCourseForm && (
        <div style={styles.modal} onClick={() => setShowCourseForm(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Course</h2>
            <form onSubmit={handleCreateCourse} style={styles.form}>
              <label style={styles.label}>
                Title
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Enter course title"
                />
              </label>
              <label style={styles.label}>
                Description
                <textarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  required
                  rows={4}
                  style={styles.textarea}
                  placeholder="Describe your course"
                />
              </label>
              <label style={styles.label}>
                Category
                <input
                  type="text"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  style={styles.input}
                  placeholder="e.g., Mathematics, Programming"
                />
              </label>
              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowCourseForm(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Exercise Creation Modal */}
      {showExerciseForm && (
        <div style={styles.modal} onClick={() => setShowExerciseForm(false)}>
          <div style={styles.modalContentLarge} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>Create New Exercise</h2>
            <form onSubmit={handleCreateExercise} style={styles.form}>
              <div style={styles.formRow}>
                <label style={styles.label}>
                  Course
                  <select
                    value={exerciseForm.course}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, course: e.target.value })}
                    required
                    style={styles.select}
                  >
                    <option value="">Select a course</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </label>
                <label style={styles.label}>
                  Type
                  <select
                    value={exerciseForm.type}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, type: e.target.value })}
                    style={styles.select}
                  >
                    <option value="short-answer">Short Answer</option>
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                    <option value="math">Math</option>
                    <option value="coding">Coding</option>
                  </select>
                </label>
              </div>

              <label style={styles.label}>
                Title
                <input
                  type="text"
                  value={exerciseForm.title}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, title: e.target.value })}
                  required
                  style={styles.input}
                  placeholder="Exercise title"
                />
              </label>

              <label style={styles.label}>
                Question / Content
                <textarea
                  value={exerciseForm.content}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, content: e.target.value })}
                  required
                  rows={3}
                  style={styles.textarea}
                  placeholder="Enter the question or problem statement"
                />
              </label>

              <label style={styles.label}>
                Description
                <textarea
                  value={exerciseForm.description}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, description: e.target.value })}
                  required
                  rows={2}
                  style={styles.textarea}
                  placeholder="Brief description of the exercise"
                />
              </label>

              {exerciseForm.type === "multiple-choice" && (
                <div style={styles.optionsSection}>
                  <label style={styles.label}>Options</label>
                  {exerciseForm.options.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const newOptions = [...exerciseForm.options];
                        newOptions[idx] = e.target.value;
                        setExerciseForm({ ...exerciseForm, options: newOptions });
                      }}
                      style={styles.input}
                      placeholder={`Option ${idx + 1}`}
                    />
                  ))}
                </div>
              )}

              <label style={styles.label}>
                Correct Answer
                <input
                  type="text"
                  value={exerciseForm.correctAnswer}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, correctAnswer: e.target.value })}
                  style={styles.input}
                  placeholder="The correct answer"
                />
              </label>

              <label style={styles.label}>
                Solution (Step-by-step explanation)
                <textarea
                  value={exerciseForm.solution}
                  onChange={(e) => setExerciseForm({ ...exerciseForm, solution: e.target.value })}
                  rows={4}
                  style={styles.textarea}
                  placeholder="Explain how to solve this exercise step by step"
                />
              </label>

              <div style={styles.formRow}>
                <label style={styles.label}>
                  Difficulty
                  <select
                    value={exerciseForm.difficulty}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, difficulty: e.target.value })}
                    style={styles.select}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </label>
                <label style={styles.label}>
                  Points
                  <input
                    type="number"
                    value={exerciseForm.points}
                    onChange={(e) => setExerciseForm({ ...exerciseForm, points: parseInt(e.target.value) })}
                    min={0}
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={styles.formActions}>
                <button type="button" onClick={() => setShowExerciseForm(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" style={styles.submitBtn}>
                  Create Exercise
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div style={styles.modal} onClick={() => setSelectedCourse(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 style={styles.modalTitle}>{selectedCourse.title}</h2>
            <p style={styles.modalDesc}>{selectedCourse.description}</p>
            <div style={styles.modalInfo}>
              <p><strong>Category:</strong> {selectedCourse.category || "N/A"}</p>
              <p><strong>Students:</strong> {selectedCourse.students?.length || 0}</p>
              <p><strong>Status:</strong> {selectedCourse.isPublished ? "Published" : "Draft"}</p>
            </div>
            <h3 style={styles.modalSubtitle}>Exercises ({getExercisesForCourse(selectedCourse._id).length})</h3>
            <div style={styles.exerciseList}>
              {getExercisesForCourse(selectedCourse._id).length === 0 ? (
                <p style={styles.noExercises}>No exercises yet</p>
              ) : (
                getExercisesForCourse(selectedCourse._id).map((ex) => (
                  <div key={ex._id} style={styles.exerciseItem}>
                    <div>
                      <strong>{ex.title}</strong>
                      <span style={styles.exerciseMeta}> - {ex.difficulty} - {ex.points}pts</span>
                    </div>
                    {ex.solution && <small style={styles.hasSolution}>Has solution</small>}
                  </div>
                ))
              )}
            </div>

            <h3 style={styles.modalSubtitle}>
              Submissions ({getSubmissionsForCourse(selectedCourse._id).length})
              {getPendingSubmissionsCount(selectedCourse._id) > 0 && (
                <span style={{ ...styles.pendingBadge, marginLeft: 12 }}>
                  {getPendingSubmissionsCount(selectedCourse._id)} pending review
                </span>
              )}
            </h3>
            <div style={styles.submissionsSummary}>
              {getSubmissionsForCourse(selectedCourse._id).length === 0 ? (
                <p style={styles.noExercises}>No submissions yet</p>
              ) : (
                <>
                  <div style={styles.submissionsStats}>
                    <div style={styles.statBox}>
                      <div style={styles.statNumber}>
                        {getSubmissionsForCourse(selectedCourse._id).filter(s => s.status === 'graded').length}
                      </div>
                      <div style={styles.statLabel}>Graded</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statNumber}>
                        {getPendingSubmissionsCount(selectedCourse._id)}
                      </div>
                      <div style={styles.statLabel}>Pending</div>
                    </div>
                    <div style={styles.statBox}>
                      <div style={styles.statNumber}>
                        {getSubmissionsForCourse(selectedCourse._id).length > 0
                          ? Math.round(
                              getSubmissionsForCourse(selectedCourse._id)
                                .filter(s => s.score !== null && s.score !== undefined)
                                .reduce((sum, s) => sum + s.score, 0) /
                              getSubmissionsForCourse(selectedCourse._id).filter(s => s.score !== null && s.score !== undefined).length || 1
                            )
                          : 0}%
                      </div>
                      <div style={styles.statLabel}>Avg Score</div>
                    </div>
                  </div>
                  <Link to="/student-submissions" style={styles.viewAllSubmissionsBtn}>
                    View All Submissions →
                  </Link>
                </>
              )}
            </div>

            <h3 style={styles.modalSubtitle}>Student Feedback ({selectedCourse.reviews?.length || 0})</h3>
            <div style={styles.reviewList}>
              {(!selectedCourse.reviews || selectedCourse.reviews.length === 0) ? (
                <p style={styles.noExercises}>No reviews yet</p>
              ) : (
                selectedCourse.reviews.map((review, idx) => (
                  <div key={idx} style={styles.reviewItem}>
                    <div style={styles.reviewHeader}>
                      <span style={styles.rating}>{"⭐".repeat(review.rating)}</span>
                      {review.sentimentAnalysis && (
                        <span style={{
                          ...styles.sentimentBadge,
                          background: review.sentimentAnalysis.label === "positive" ? "#dcfce7" :
                            review.sentimentAnalysis.label === "negative" ? "#fee2e2" : "#f1f5f9",
                          color: review.sentimentAnalysis.label === "positive" ? "#166534" :
                            review.sentimentAnalysis.label === "negative" ? "#991b1b" : "#475569"
                        }}>
                          {review.sentimentAnalysis.label} ({Math.round(review.sentimentAnalysis.confidence * 100)}%)
                        </span>
                      )}
                    </div>
                    <p style={styles.reviewComment}>{review.comment || "No comment"}</p>
                    <small style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</small>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => setSelectedCourse(null)} style={styles.closeBtn}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: "40px 24px", maxWidth: 1200, margin: "0 auto" },
  loading: { padding: 40, textAlign: "center", color: "#94a3b8" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 },
  title: { fontSize: 42, fontWeight: 800, margin: 0, color: "#1e293b", letterSpacing: "-0.02em" },
  subtitle: { color: "#64748b", marginTop: 8 },
  headerActions: { display: "flex", gap: 12 },
  createBtn: {
    padding: "14px 28px",
    border: "none",
    borderRadius: 14,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  createBtnSecondary: {
    padding: "14px 28px",
    border: "2px solid #e2e8f0",
    borderRadius: 14,
    background: "#ffffff",
    color: "#1e293b",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
  },
  tabs: { display: "flex", gap: 8, marginBottom: 32, borderBottom: "1px solid #f1f5f9", paddingBottom: 4 },
  tab: {
    padding: "14px 28px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontWeight: 600,
    borderBottom: "3px solid transparent",
    color: "#94a3b8",
    fontSize: 15,
  },
  tabActive: { borderBottomColor: "#4f46e5", color: "#4f46e5" },
  empty: { textAlign: "center", padding: 80, background: "#f8fafc", borderRadius: 24, border: "1px dashed #cbd5e1" },
  emptyBtn: {
    marginTop: 20,
    padding: "12px 24px",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    border: "none",
    borderRadius: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 24 },
  card: { padding: 28, background: "#ffffff", border: "1px solid #f1f5f9", borderRadius: 20 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 16 },
  cardTitle: { fontSize: 20, fontWeight: 700, margin: 0, color: "#1e293b" },
  publishedBadge: { fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "#d1fae5", color: "#059669", fontWeight: 600 },
  draftBadge: { fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "#f1f5f9", color: "#94a3b8", fontWeight: 600 },
  pendingBadge: { fontSize: 12, padding: "4px 10px", borderRadius: 16, background: "#fef3c7", color: "#92400e", fontWeight: 600 },
  difficultyBadge: { fontSize: 12, padding: "4px 12px", borderRadius: 20, background: "#fef3c7", color: "#92400e", fontWeight: 600, textTransform: "capitalize" },
  cardDesc: { fontSize: 15, marginBottom: 20, color: "#64748b", lineHeight: 1.6 },
  cardMeta: { display: "flex", gap: 20, fontSize: 13, marginBottom: 20, color: "#94a3b8", flexWrap: "wrap" },
  solutionPreview: { fontSize: 13, color: "#059669", background: "#d1fae5", padding: "8px 12px", borderRadius: 8, marginBottom: 16 },
  cardActions: { display: "flex", gap: 10 },
  actionBtn: { flex: 1, padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, background: "#f8fafc", color: "#1e293b", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  deleteBtn: { padding: "10px 16px", border: "1px solid #fee2e2", borderRadius: 10, color: "#dc2626", background: "#fef2f2", fontWeight: 600, fontSize: 14, cursor: "pointer" },
  modal: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modalContent: { background: "#ffffff", padding: 40, borderRadius: 24, maxWidth: 500, width: "90%", maxHeight: "85vh", overflow: "auto" },
  modalContentLarge: { background: "#ffffff", padding: 40, borderRadius: 24, maxWidth: 700, width: "90%", maxHeight: "85vh", overflow: "auto" },
  modalTitle: { fontSize: 28, fontWeight: 700, marginBottom: 24, color: "#1e293b" },
  modalDesc: { color: "#64748b", marginBottom: 24 },
  modalInfo: { marginBottom: 24 },
  modalSubtitle: { fontSize: 18, fontWeight: 600, marginBottom: 16, color: "#1e293b" },
  exerciseList: { marginBottom: 24 },
  noExercises: { color: "#94a3b8", fontStyle: "italic" },
  exerciseItem: { padding: 16, background: "#f8fafc", borderRadius: 12, marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" },
  exerciseMeta: { fontSize: 13, color: "#64748b" },
  hasSolution: { color: "#059669", fontWeight: 500 },
  submissionsSummary: { marginBottom: 24 },
  submissionsStats: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 },
  statBox: { padding: 20, background: "#f8fafc", borderRadius: 12, textAlign: "center", border: "1px solid #e2e8f0" },
  statNumber: { fontSize: 32, fontWeight: 800, color: "#1e293b", marginBottom: 4 },
  statLabel: { fontSize: 13, color: "#64748b", fontWeight: 600 },
  viewAllSubmissionsBtn: {
    display: "block",
    padding: "12px 20px",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    textAlign: "center",
    borderRadius: 12,
    textDecoration: "none",
    fontWeight: 600,
    fontSize: 14
  },
  closeBtn: { padding: "12px 24px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", fontWeight: 600, cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  formRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600, color: "#475569" },
  input: { padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, background: "#f8fafc" },
  select: { padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, background: "#f8fafc" },
  textarea: { padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, fontFamily: "inherit", resize: "vertical", background: "#f8fafc" },
  optionsSection: { display: "flex", flexDirection: "column", gap: 8 },
  formActions: { display: "flex", gap: 12, marginTop: 12 },
  cancelBtn: { flex: 1, padding: "14px 24px", border: "1px solid #e2e8f0", borderRadius: 12, background: "#f8fafc", fontWeight: 600, cursor: "pointer" },
  submitBtn: { flex: 1, padding: "14px 24px", border: "none", borderRadius: 12, background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "white", fontWeight: 600, cursor: "pointer" },
  reviewList: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 },
  reviewItem: { padding: 16, background: "#f8fafc", borderRadius: 12, border: "1px solid #e2e8f0" },
  reviewHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  rating: { fontSize: 14 },
  sentimentBadge: { fontSize: 11, padding: "2px 8px", borderRadius: 12, fontWeight: 600, textTransform: "capitalize" },
  reviewComment: { fontSize: 14, color: "#334155", margin: 0, lineHeight: 1.5 },
  reviewDate: { fontSize: 12, color: "#94a3b8", marginTop: 8, display: "block" },
};
