import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  function onLogout() {
    logout();
    navigate("/");
  }

  return (
    <header style={styles.header}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.brand}>
          SmartLearn
        </Link>

        <div style={styles.links}>
          <Link to="/" style={styles.link}>
            Home
          </Link>
          {user && (
            <>
              <Link to="/courses" style={styles.link}>
                📚 Courses
              </Link>
              <Link to="/my-enrollments" style={styles.link}>
                📖 My Learning
              </Link>
              <Link to="/exercise-generator" style={styles.link}>
                ✏️ Practice
              </Link>
              <Link to="/chatbot" style={styles.link}>
                🤖 AI Tutor
              </Link>
            </>
          )}

          {user ? (
            <>
              <Link to="/profile" style={styles.profileLink}>
                👤 {user.username}
              </Link>
              <button onClick={onLogout} style={styles.button}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>
                Login
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

const styles = {
  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    padding: "14px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  nav: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 24,
  },
  brand: {
    fontWeight: 800,
    fontSize: "1.35rem",
    textDecoration: "none",
    color: "#4f46e5",
    letterSpacing: "-0.025em",
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  link: {
    textDecoration: "none",
    color: "#475569",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: "0.9rem",
    fontWeight: 500,
    transition: "all 0.2s",
  },
  profileLink: {
    textDecoration: "none",
    color: "#4f46e5",
    padding: "8px 14px",
    borderRadius: 8,
    fontSize: "0.9rem",
    fontWeight: 600,
    background: "#eef2ff",
    transition: "all 0.2s",
  },
  registerBtn: {
    textDecoration: "none",
    padding: "8px 18px",
    borderRadius: 8,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "#ffffff",
    fontWeight: 600,
    fontSize: "0.875rem",
  },
  button: {
    padding: "8px 16px",
    border: "none",
    borderRadius: 8,
    background: "#fee2e2",
    color: "#dc2626",
    fontWeight: 600,
    fontSize: "0.875rem",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
};
