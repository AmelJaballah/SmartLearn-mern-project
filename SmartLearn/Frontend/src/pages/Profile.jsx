import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    avatar: "",
    department: "",
    specialization: "",
    address: {
      street: "",
      city: "",
      country: "",
      postalCode: "",
    },
    preferences: {
      language: "fr",
      difficulty: "medium",
      notifications: {
        email: true,
        push: true,
      },
    },
  });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await api.get("/profiles/me");
      setProfile(res.data);
      setFormData({
        firstName: res.data.firstName || "",
        lastName: res.data.lastName || "",
        bio: res.data.bio || "",
        phone: res.data.phone || "",
        avatar: res.data.avatar || "",
        department: res.data.department || "",
        specialization: res.data.specialization || "",
        address: {
          street: res.data.address?.street || "",
          city: res.data.address?.city || "",
          country: res.data.address?.country || "",
          postalCode: res.data.address?.postalCode || "",
        },
        preferences: {
          language: res.data.preferences?.language || "fr",
          difficulty: res.data.preferences?.difficulty || "medium",
          notifications: {
            email: res.data.preferences?.notifications?.email ?? true,
            push: res.data.preferences?.notifications?.push ?? true,
          },
        },
      });
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put("/profiles/me", formData);
      setProfile(res.data);
      setEditing(false);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [field]: value },
      });
    } else if (name.startsWith("preferences.")) {
      const field = name.split(".")[1];
      if (field === "notifications") {
        const notifField = name.split(".")[2];
        setFormData({
          ...formData,
          preferences: {
            ...formData.preferences,
            notifications: {
              ...formData.preferences.notifications,
              [notifField]: checked,
            },
          },
        });
      } else {
        setFormData({
          ...formData,
          preferences: { ...formData.preferences, [field]: value },
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (file) {
      // Limit file size to 500KB for base64 storage
      if (file.size > 500000) {
        alert("Image too large. Please choose an image under 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  if (loading) return <div style={styles.loading}>Loading profile...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Header with Avatar */}
        <div style={styles.header}>
          <div style={styles.avatarSection}>
            <div style={styles.avatarWrapper}>
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" style={styles.avatarImage} />
              ) : (
                <div style={styles.avatar}>
                  {user?.username?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              {editing && (
                <label style={styles.avatarUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: "none" }}
                  />
                  📷
                </label>
              )}
            </div>
            <div style={styles.userInfo}>
              <h2 style={styles.username}>{user?.username}</h2>
              <span style={styles.learnerBadge}>
                🎓 Learner
              </span>
              <p style={styles.email}>{user?.email}</p>
            </div>
          </div>
          <div style={styles.headerActions}>
            {editing ? (
              <>
                <button onClick={() => setEditing(false)} style={styles.cancelBtn}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} style={styles.saveBtn}>
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={styles.editBtn}>
                ✏️ Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab("personal")}
            style={activeTab === "personal" ? styles.tabActive : styles.tab}
          >
            👤 Personal
          </button>
          <button
            onClick={() => setActiveTab("address")}
            style={activeTab === "address" ? styles.tabActive : styles.tab}
          >
            📍 Address
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            style={activeTab === "preferences" ? styles.tabActive : styles.tab}
          >
            ⚙️ Preferences
          </button>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {activeTab === "personal" && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Personal Information</h3>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>First Name</label>
                  {editing ? (
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter first name"
                    />
                  ) : (
                    <span style={styles.value}>{profile?.firstName || "Not set"}</span>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Last Name</label>
                  {editing ? (
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter last name"
                    />
                  ) : (
                    <span style={styles.value}>{profile?.lastName || "Not set"}</span>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Phone</label>
                  {editing ? (
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <span style={styles.value}>{profile?.phone || "Not set"}</span>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Member Since</label>
                  <span style={styles.value}>
                    {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div style={styles.bioSection}>
                <label style={styles.label}>Bio</label>
                {editing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    style={styles.textarea}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                ) : (
                  <p style={styles.bioText}>{profile?.bio || "No bio yet. Click edit to add one!"}</p>
                )}
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Address Information</h3>
              <div style={styles.grid}>
                <div style={{ ...styles.field, gridColumn: "1 / -1" }}>
                  <label style={styles.label}>Street Address</label>
                  {editing ? (
                    <input
                      name="address.street"
                      value={formData.address.street}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter street address"
                    />
                  ) : (
                    <span style={styles.value}>{profile?.address?.street || "Not set"}</span>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>City</label>
                  {editing ? (
                    <input
                      name="address.city"
                      value={formData.address.city}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter city"
                    />
                  ) : (
                    <span style={styles.value}>{profile?.address?.city || "Not set"}</span>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Country</label>
                  {editing ? (
                    <input
                      name="address.country"
                      value={formData.address.country}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter country"
                    />
                  ) : (
                    <span style={styles.value}>{profile?.address?.country || "Not set"}</span>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Postal Code</label>
                  {editing ? (
                    <input
                      name="address.postalCode"
                      value={formData.address.postalCode}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder="Enter postal code"
                    />
                  ) : (
                    <span style={styles.value}>{profile?.address?.postalCode || "Not set"}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Learning Preferences</h3>
              <div style={styles.grid}>
                <div style={styles.field}>
                  <label style={styles.label}>Language</label>
                  {editing ? (
                    <select
                      name="preferences.language"
                      value={formData.preferences.language}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="fr">🇫🇷 Français</option>
                      <option value="en">🇬🇧 English</option>
                      <option value="ar">🇸🇦 العربية</option>
                    </select>
                  ) : (
                    <span style={styles.value}>
                      {formData.preferences.language === "fr" ? "🇫🇷 Français" :
                       formData.preferences.language === "en" ? "🇬🇧 English" : "🇸🇦 العربية"}
                    </span>
                  )}
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Preferred Difficulty</label>
                  {editing ? (
                    <select
                      name="preferences.difficulty"
                      value={formData.preferences.difficulty}
                      onChange={handleChange}
                      style={styles.select}
                    >
                      <option value="easy">🟢 Easy</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="hard">🔴 Hard</option>
                    </select>
                  ) : (
                    <span style={styles.value}>
                      {formData.preferences.difficulty === "easy" ? "🟢 Easy" :
                       formData.preferences.difficulty === "medium" ? "🟡 Medium" : "🔴 Hard"}
                    </span>
                  )}
                </div>
              </div>
              
              <h4 style={{ ...styles.sectionTitle, fontSize: 16, marginTop: 24 }}>Notifications</h4>
              <div style={styles.notificationGrid}>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="preferences.notifications.email"
                    checked={formData.preferences.notifications.email}
                    onChange={handleChange}
                    disabled={!editing}
                    style={styles.checkbox}
                  />
                  <span>📧 Email Notifications</span>
                </label>
                <label style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="preferences.notifications.push"
                    checked={formData.preferences.notifications.push}
                    onChange={handleChange}
                    disabled={!editing}
                    style={styles.checkbox}
                  />
                  <span>🔔 Push Notifications</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Account Info Footer */}
        <div style={styles.footer}>
          <div style={styles.footerItem}>
            <span style={styles.footerLabel}>Account ID</span>
            <span style={styles.footerValue}>{user?._id?.slice(-8)}</span>
          </div>
          <div style={styles.footerItem}>
            <span style={styles.footerLabel}>Member</span>
            <span style={styles.footerValue}>Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: "32px 24px", maxWidth: 900, margin: "0 auto" },
  loading: { padding: 40, textAlign: "center", color: "#64748b", fontSize: 16 },
  card: {
    background: "#ffffff",
    borderRadius: 24,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "32px",
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap",
    gap: 20,
  },
  avatarSection: { display: "flex", alignItems: "center", gap: 24 },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontSize: 42,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(79, 70, 229, 0.3)",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid white",
    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
  },
  avatarUpload: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#4f46e5",
    color: "white",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 14,
    border: "3px solid white",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  },
  userInfo: { display: "flex", flexDirection: "column", gap: 6 },
  username: { fontSize: 28, fontWeight: 800, margin: 0, color: "#1e293b" },
  email: { fontSize: 14, color: "#64748b", margin: 0 },
  learnerBadge: {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: 20,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontSize: 13,
    fontWeight: 600,
    width: "fit-content",
  },
  headerActions: { display: "flex", gap: 12 },
  editBtn: {
    padding: "12px 24px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#ffffff",
    color: "#1e293b",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
  },
  cancelBtn: {
    padding: "12px 24px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    background: "#f8fafc",
    color: "#64748b",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
  },
  saveBtn: {
    padding: "12px 24px",
    border: "none",
    borderRadius: 12,
    background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    color: "white",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 15,
  },
  tabs: {
    display: "flex",
    gap: 4,
    padding: "16px 32px 0",
    borderBottom: "1px solid #e2e8f0",
    background: "#ffffff",
    flexWrap: "wrap",
  },
  tab: {
    padding: "14px 20px",
    border: "none",
    background: "none",
    color: "#64748b",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    borderBottom: "3px solid transparent",
    marginBottom: -1,
  },
  tabActive: {
    padding: "14px 20px",
    border: "none",
    background: "none",
    color: "#4f46e5",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
    borderBottom: "3px solid #4f46e5",
    marginBottom: -1,
  },
  tabContent: { padding: "32px" },
  section: {},
  sectionTitle: { fontSize: 20, fontWeight: 700, marginBottom: 24, color: "#1e293b" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 },
  field: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" },
  value: { fontSize: 16, color: "#1e293b", fontWeight: 500 },
  input: {
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 15,
    background: "#f8fafc",
    transition: "border-color 0.2s",
  },
  select: {
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 15,
    background: "#f8fafc",
    cursor: "pointer",
  },
  bioSection: { marginTop: 24 },
  textarea: {
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    fontSize: 15,
    fontFamily: "inherit",
    resize: "vertical",
    width: "100%",
    background: "#f8fafc",
    lineHeight: 1.6,
  },
  bioText: { color: "#475569", lineHeight: 1.7, margin: 0, fontSize: 15 },
  notificationGrid: { display: "flex", flexDirection: "column", gap: 16 },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 15,
    color: "#1e293b",
    cursor: "pointer",
  },
  checkbox: { width: 20, height: 20, cursor: "pointer" },
  footer: {
    display: "flex",
    gap: 32,
    padding: "20px 32px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
  },
  footerItem: { display: "flex", flexDirection: "column", gap: 4 },
  footerLabel: { fontSize: 12, color: "#94a3b8", fontWeight: 500 },
  footerValue: { fontSize: 14, color: "#1e293b", fontWeight: 600 },
};
