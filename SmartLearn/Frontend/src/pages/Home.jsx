import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user } = useContext(AuthContext);

  return (
    <div style={styles.container}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to SmartLearn</h1>
        <p style={styles.heroSubtitle}>
          AI-Powered Learning Platform for Math Excellence
        </p>
        <p style={styles.heroDesc}>
          Generate exercises with AI, get instant feedback, and learn with an intelligent chatbot tutor
        </p>

        {user ? (
          <div style={styles.heroActions}>
            <Link to="/my-enrollments" style={styles.primaryBtn}>
              📖 Continue Learning
            </Link>
            <Link to="/courses" style={styles.secondaryBtn}>
              🔍 Browse Courses
            </Link>
          </div>
        ) : (
          <div style={styles.heroActions}>
            <Link to="/register" style={styles.primaryBtn}>
              Get Started
            </Link>
            <Link to="/login" style={styles.secondaryBtn}>
              Login
            </Link>
          </div>
        )}
      </section>

      <section style={styles.features}>
        <h2 style={styles.featuresTitle}>Platform Features</h2>
        <div style={styles.featuresGrid}>
          <FeatureCard
            title="AI Exercise Generator"
            description="Generate custom math exercises using RAG-powered AI based on your curriculum"
          />
          <FeatureCard
            title="AI Chatbot Tutor"
            description="Get instant help from an intelligent math tutor available 24/7"
          />
          <FeatureCard
            title="Course Management"
            description="Create and manage courses with exercises, submissions, and student progress"
          />
          <FeatureCard
            title="Analytics Dashboard"
            description="Track student progress, exercise completion, and learning patterns"
          />
          <FeatureCard
            title="Auto Grading"
            description="Automatic verification of math answers using SymPy integration"
          />
          <FeatureCard
            title="Personalized Learning"
            description="Adaptive difficulty and targeted recommendations based on performance"
          />
        </div>
      </section>

      {!user && (
        <section style={styles.cta}>
          <h2 style={styles.ctaTitle}>Ready to Transform Your Learning?</h2>
          <p style={styles.ctaDesc}>Join SmartLearn today and experience AI-powered education</p>
          <Link to="/register" style={styles.ctaBtn}>
            Create Free Account
          </Link>
        </section>
      )}
    </div>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div style={styles.featureCard}>
      <h3 style={styles.featureTitle}>{title}</h3>
      <p style={styles.featureDesc}>{description}</p>
    </div>
  );
}

const styles = {
  container: { padding: "40px 24px", maxWidth: 1200, margin: "0 auto" },
  hero: {
    textAlign: "center",
    padding: "100px 40px",
    background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
    color: "white",
    borderRadius: 32,
    marginBottom: 80,
    position: "relative",
    overflow: "hidden",
  },
  heroTitle: {
    fontSize: 64,
    fontWeight: 900,
    marginBottom: 24,
    letterSpacing: "-0.03em",
    background: "linear-gradient(135deg, #ffffff 0%, #e2e8f0 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: { fontSize: 28, marginBottom: 20, opacity: 0.9, fontWeight: 500 },
  heroDesc: {
    fontSize: 18,
    marginBottom: 48,
    opacity: 0.8,
    maxWidth: 680,
    margin: "0 auto 48px",
    lineHeight: 1.8
  },
  heroActions: { display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" },
  primaryBtn: {
    padding: "18px 44px",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    textDecoration: "none",
    borderRadius: 16,
    fontWeight: 700,
    fontSize: 17,
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.4)",
    transition: "all 0.3s ease",
  },
  secondaryBtn: {
    padding: "18px 44px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    color: "white",
    textDecoration: "none",
    borderRadius: 16,
    fontWeight: 700,
    fontSize: 17,
    border: "2px solid rgba(255,255,255,0.3)",
    transition: "all 0.3s ease",
  },
  features: { marginBottom: 80 },
  featuresTitle: {
    fontSize: 48,
    fontWeight: 800,
    textAlign: "center",
    marginBottom: 64,
    color: "#1e293b",
    letterSpacing: "-0.02em",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 28,
  },
  featureCard: {
    padding: 40,
    background: "#ffffff",
    border: "1px solid #f1f5f9",
    borderRadius: 24,
    transition: "all 0.3s ease",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.02)",
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 16,
    color: "#1e293b",
    letterSpacing: "-0.01em",
  },
  featureDesc: { fontSize: 16, color: "#64748b", lineHeight: 1.7 },
  cta: {
    textAlign: "center",
    padding: 72,
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    borderRadius: 32,
    border: "1px solid #e2e8f0",
  },
  ctaTitle: {
    fontSize: 42,
    fontWeight: 800,
    marginBottom: 20,
    color: "#1e293b",
    letterSpacing: "-0.02em",
  },
  ctaDesc: { fontSize: 20, color: "#64748b", marginBottom: 36, lineHeight: 1.6 },
  ctaBtn: {
    display: "inline-block",
    padding: "18px 48px",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    textDecoration: "none",
    borderRadius: 16,
    fontWeight: 700,
    fontSize: 17,
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
    transition: "all 0.3s ease",
  },
};
