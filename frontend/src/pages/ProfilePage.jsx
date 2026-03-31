import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getProfile, updateProfile, getMyPosts, deleteTravelPost } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const ProfilePage = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, postsRes] = await Promise.all([getProfile(), getMyPosts()]);
      setProfile(profileRes.data.user);
      setForm({
        name: profileRes.data.user.name,
        phone: profileRes.data.user.phone || "",
        bio: profileRes.data.user.bio || "",
        currentLocation: profileRes.data.user.currentLocation?.address || "",
      });
      setMyPosts(postsRes.data.posts);
    } catch (err) {
      setError("Failed to load profile");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updateData = {
        name: form.name,
        phone: form.phone,
        bio: form.bio,
        currentLocation: form.currentLocation
          ? { address: form.currentLocation, lat: null, lng: null }
          : undefined,
      };
      const res = await updateProfile(updateData);
      setProfile(res.data.user);
      setUser(res.data.user);
      setEditing(false);
      setSuccess("Profile updated! 🚀");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update");
    }
    setSaving(false);
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm("Delete this travel post?")) return;
    try {
      await deleteTravelPost(id);
      setMyPosts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      setError("Failed to delete post");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div style={styles.page}>
        <Navbar />
        <div style={styles.center}><p style={styles.loadingText}>Loading profile...</p></div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          <div style={styles.profileTop}>
            <div style={styles.avatar}>
              <span style={styles.avatarText}>{profile?.name?.[0]?.toUpperCase()}</span>
            </div>
            <div style={styles.profileInfo}>
              {editing ? (
                <input
                  style={styles.editInput}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                />
              ) : (
                <h2 style={styles.profileName}>{profile?.name}</h2>
              )}
              <p style={styles.profileEmail}>{profile?.email}</p>
              <span style={styles.verifiedBadge}>✅ Verified</span>
            </div>
            <button
              style={editing ? styles.saveBtn : styles.editBtn}
              onClick={editing ? handleSave : () => setEditing(true)}
              disabled={saving}
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "✏️ Edit Profile"}
            </button>
          </div>

          {editing && (
            <button style={styles.cancelBtn} onClick={() => setEditing(false)}>
              Cancel
            </button>
          )}

          {success && <p style={styles.success}>{success}</p>}
          {error && <p style={styles.error}>{error}</p>}

          <div style={styles.profileFields}>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>📞 Phone</span>
              {editing ? (
                <input
                  style={styles.editInput}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              ) : (
                <span style={styles.fieldValue}>{profile?.phone || "Not set"}</span>
              )}
            </div>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>👤 Bio</span>
              {editing ? (
                <textarea
                  style={{ ...styles.editInput, minHeight: "80px", resize: "vertical" }}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <span style={styles.fieldValue}>{profile?.bio || "No bio yet"}</span>
              )}
            </div>
            <div style={styles.field}>
              <span style={styles.fieldLabel}>📍 Current Location</span>
              {editing ? (
                <input
                  style={styles.editInput}
                  value={form.currentLocation}
                  onChange={(e) => setForm({ ...form, currentLocation: e.target.value })}
                  placeholder="e.g. Andheri West, Mumbai"
                />
              ) : (
                <span style={styles.fieldValue}>
                  {profile?.currentLocation?.address || "Not set"}
                </span>
              )}
            </div>
          </div>
        </div>

        {}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>My Travel Posts</h3>
          {myPosts.length === 0 ? (
            <div style={styles.emptyPosts}>
              <p>🗺️ No travel posts yet.</p>
              <p style={styles.emptyHint}>Go to Home and post your travel to find partners!</p>
            </div>
          ) : (
            <div style={styles.postsList}>
              {myPosts.map((post) => (
                <div key={post._id} style={styles.postCard}>
                  <div style={styles.postRoute}>
                    <span style={styles.postFrom}>{post.from}</span>
                    <span style={styles.postArrow}>→</span>
                    <span style={styles.postTo}>{post.to}</span>
                  </div>
                  <div style={styles.postMeta}>
                    <span style={styles.metaChip}>📅 {formatDate(post.date)}</span>
                    <span style={styles.metaChip}>🕐 {post.timeSlot}</span>
                    <span style={styles.metaChip}>💺 {post.seatsAvailable} seats</span>
                    <span style={{ ...styles.metaChip, ...(post.isActive ? styles.activeChip : styles.inactiveChip) }}>
                      {post.isActive ? "● Active" : "● Inactive"}
                    </span>
                  </div>
                  {post.note && <p style={styles.postNote}>"{post.note}"</p>}
                  <button style={styles.deleteBtn} onClick={() => handleDeletePost(post._id)}>
                    🗑️ Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: "60px" },
  container: { maxWidth: "700px", margin: "0 auto", padding: "100px 24px 40px", display: "flex", flexDirection: "column", gap: "32px" },
  
  /* Glassmorphism Profile Card */
  profileCard: { 
    background: "rgba(15, 23, 42, 0.6)", 
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)", 
    borderRadius: "24px", 
    padding: "32px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
  },
  
  profileTop: { display: "flex", alignItems: "flex-start", gap: "20px" },
  
  avatar: { 
    width: "72px", 
    height: "72px", 
    borderRadius: "50%", 
    background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)", 
    border: "3px solid rgba(59, 130, 246, 0.3)", 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)"
  },
  avatarText: { color: "#ffffff", fontWeight: "800", fontSize: "28px" },
  
  profileInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "6px" },
  profileName: { color: "#f8fafc", fontSize: "24px", fontWeight: "800", margin: 0, letterSpacing: "-0.02em" },
  profileEmail: { color: "#94a3b8", fontSize: "14px", margin: 0 },
  
  verifiedBadge: { 
    display: "inline-block", 
    background: "rgba(16, 185, 129, 0.1)", 
    border: "1px solid rgba(16, 185, 129, 0.2)", 
    color: "#10b981", 
    padding: "4px 12px", 
    borderRadius: "100px", 
    fontSize: "12px", 
    fontWeight: "700", 
    marginTop: "6px", 
    width: "fit-content" 
  },
  
  
  editBtn: { 
    background: "rgba(255, 255, 255, 0.05)", 
    border: "1px solid rgba(255, 255, 255, 0.1)", 
    borderRadius: "12px", 
    color: "#cbd5e1", 
    padding: "10px 18px", 
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer", 
    whiteSpace: "nowrap",
    transition: "all 0.2s ease"
  },
  saveBtn: { 
    background: "#3b82f6", 
    border: "none", 
    borderRadius: "12px", 
    color: "#ffffff", 
    padding: "10px 18px", 
    fontSize: "13px", 
    fontWeight: "700", 
    cursor: "pointer", 
    whiteSpace: "nowrap",
    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)",
    transition: "all 0.2s ease"
  },
  cancelBtn: { 
    background: "transparent", 
    border: "1px solid rgba(255, 255, 255, 0.1)", 
    borderRadius: "12px", 
    color: "#94a3b8", 
    padding: "8px 16px", 
    fontSize: "13px", 
    fontWeight: "600",
    cursor: "pointer", 
    alignSelf: "flex-start",
    transition: "all 0.2s ease"
  },
  
  
  profileFields: { display: "flex", flexDirection: "column", gap: "12px" },
  field: { 
    display: "flex", 
    flexDirection: "column", 
    gap: "8px", 
    padding: "14px 18px", 
    background: "rgba(255, 255, 255, 0.02)", 
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "14px" 
  },
  fieldLabel: { color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  fieldValue: { color: "#f8fafc", fontSize: "15px", fontWeight: "500" },
  editInput: { 
    background: "rgba(255, 255, 255, 0.03)", 
    border: "1px solid rgba(255, 255, 255, 0.1)", 
    borderRadius: "10px", 
    padding: "12px 14px", 
    color: "#ffffff", 
    fontSize: "15px", 
    outline: "none", 
    width: "100%", 
    boxSizing: "border-box", 
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: "all 0.2s ease"
  },
  
  success: { color: "#10b981", background: "rgba(16, 185, 129, 0.1)", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", margin: 0 },
  error: { color: "#ef4444", background: "rgba(239, 68, 68, 0.1)", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", fontWeight: "600", margin: 0 },
  
  /* Travel Posts Section */
  section: { display: "flex", flexDirection: "column", gap: "20px" },
  sectionTitle: { color: "#f8fafc", fontSize: "22px", fontWeight: "800", margin: 0, letterSpacing: "-0.01em" },
  postsList: { display: "flex", flexDirection: "column", gap: "16px" },
  
  postCard: { 
    background: "rgba(255, 255, 255, 0.02)", 
    border: "1px solid rgba(255, 255, 255, 0.05)", 
    borderRadius: "20px", 
    padding: "20px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "14px" 
  },
  postRoute: { display: "flex", alignItems: "center", gap: "12px" },
  postFrom: { color: "#f8fafc", fontWeight: "700", fontSize: "16px" },
  postArrow: { color: "#3b82f6", fontSize: "18px", fontWeight: "700" },
  postTo: { color: "#f8fafc", fontWeight: "700", fontSize: "16px" },
  
  postMeta: { display: "flex", gap: "8px", flexWrap: "wrap" },
  metaChip: { background: "rgba(255, 255, 255, 0.05)", color: "#cbd5e1", padding: "6px 12px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" },
  activeChip: { background: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" },
  inactiveChip: { background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", border: "1px solid rgba(239, 68, 68, 0.2)" },
  
  postNote: { color: "#94a3b8", fontSize: "13px", fontStyle: "italic", margin: 0, background: "rgba(255, 255, 255, 0.02)", padding: "10px", borderRadius: "8px" },
  
  deleteBtn: { 
    background: "rgba(239, 68, 68, 0.1)", 
    border: "1px solid rgba(239, 68, 68, 0.2)", 
    color: "#ef4444", 
    borderRadius: "10px", 
    padding: "8px 16px", 
    fontSize: "13px", 
    fontWeight: "600",
    cursor: "pointer", 
    alignSelf: "flex-start",
    transition: "all 0.2s ease"
  },
  
  emptyPosts: { textAlign: "center", padding: "40px", background: "rgba(255, 255, 255, 0.02)", border: "1px dashed rgba(255, 255, 255, 0.1)", borderRadius: "20px", color: "#94a3b8", fontSize: "15px" },
  emptyHint: { fontSize: "13px", marginTop: "8px", color: "#64748b" },
  
  center: { textAlign: "center", padding: "100px 24px" },
  loadingText: { color: "#94a3b8", fontSize: "16px", fontWeight: "500" },
};

export default ProfilePage;