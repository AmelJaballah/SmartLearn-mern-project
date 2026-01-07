import { useContext, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await register(username, email, password);
      navigate("/courses");
    } catch (err) {
      setError(err?.response?.data?.message || "Register failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join SmartLearn today</p>

        <form onSubmit={onSubmit} style={styles.form}>
          <label style={styles.label}>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={styles.input}
              placeholder="Choose a username"
            />
          </label>
          <label style={styles.label}>
            Email
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              style={styles.input}
              placeholder="Enter your email"
            />
          </label>
          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={styles.input}
              placeholder="Create a password (min 6 chars)"
            />
          </label>

         
          {error ? <div style={styles.error}>{error}</div> : null}

          <button disabled={submitting} type="submit" style={styles.submitBtn}>
            {submitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p style={styles.linkText}>
          Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "calc(100vh - 100px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    background: "#f8fafc",
  },
  card: {
    background: "#ffffff",
    padding: 40,
    borderRadius: 20,
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
    width: "100%",
    maxWidth: 420,
    border: "1px solid #e2e8f0",
  },
  title: { fontSize: 28, fontWeight: 700, marginBottom: 8, color: "#1e293b", textAlign: "center" },
  subtitle: { color: "#64748b", textAlign: "center", marginBottom: 32 },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  label: { display: "flex", flexDirection: "column", gap: 8, fontSize: 14, fontWeight: 600, color: "#475569" },
  input: { padding: "12px 16px", border: "1px solid #e2e8f0", borderRadius: 12, fontSize: 15, background: "#f8fafc" },
  roleContainer: { display: "flex", gap: 12 },
  roleLabel: {
    flex: 1,
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    cursor: "pointer",
    textAlign: "center",
    fontSize: 14,
    fontWeight: 600,
    color: "#64748b",
    background: "#f8fafc",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  roleActive: {
    borderColor: "#4f46e5",
    background: "#eef2ff",
    color: "#4f46e5",
  },
  radio: { margin: 0 },
  error: {
    color: "#dc2626",
    background: "#fee2e2",
    padding: "12px 16px",
    borderRadius: 10,
    fontSize: 14,
    border: "1px solid #fecaca",
  },
  submitBtn: {
    padding: "14px 24px",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontWeight: 600,
    fontSize: 16,
    cursor: "pointer",
    marginTop: 8,
  },
  linkText: { textAlign: "center", marginTop: 24, color: "#64748b" },
  link: { color: "#4f46e5", fontWeight: 600 },
};
