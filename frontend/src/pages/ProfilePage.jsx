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

        {/* My Travel Posts */}
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
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)", fontFamily: "'DM Sans', sans-serif" },
  container: { maxWidth: "700px", margin: "0 auto", padding: "40px 24px", display: "flex", flexDirection: "column", gap: "24px" },
  profileCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "24px", padding: "28px", display: "flex", flexDirection: "column", gap: "20px" },
  profileTop: { display: "flex", alignItems: "flex-start", gap: "16px" },
  avatar: { width: "72px", height: "72px", borderRadius: "50%", background: "rgba(250,180,0,0.15)", border: "3px solid rgba(250,180,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#FAB400", fontWeight: "800", fontSize: "28px" },
  profileInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  profileName: { color: "#fff", fontSize: "22px", fontWeight: "800", margin: 0, fontFamily: "'Syne', sans-serif" },
  profileEmail: { color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 },
  verifiedBadge: { display: "inline-block", background: "rgba(81,207,102,0.1)", border: "1px solid rgba(81,207,102,0.2)", color: "#51cf66", padding: "3px 10px", borderRadius: "100px", fontSize: "11px", fontWeight: "700", marginTop: "4px", width: "fit-content" },
  editBtn: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", padding: "8px 16px", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" },
  saveBtn: { background: "#FAB400", border: "none", borderRadius: "10px", color: "#0a0a0f", padding: "8px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer", whiteSpace: "nowrap" },
  cancelBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "rgba(255,255,255,0.4)", padding: "8px 16px", fontSize: "13px", cursor: "pointer", alignSelf: "flex-start" },
  profileFields: { display: "flex", flexDirection: "column", gap: "12px" },
  field: { display: "flex", flexDirection: "column", gap: "6px", padding: "12px 16px", background: "rgba(255,255,255,0.02)", borderRadius: "12px" },
  fieldLabel: { color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: "600" },
  fieldValue: { color: "#fff", fontSize: "15px" },
  editInput: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "10px 14px", color: "#fff", fontSize: "15px", outline: "none", width: "100%", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" },
  success: { color: "#51cf66", fontSize: "13px", margin: 0 },
  error: { color: "#ff6b6b", fontSize: "13px", margin: 0 },
  section: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionTitle: { color: "#fff", fontSize: "20px", fontWeight: "800", margin: 0, fontFamily: "'Syne', sans-serif" },
  postsList: { display: "flex", flexDirection: "column", gap: "12px" },
  postCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "18px", display: "flex", flexDirection: "column", gap: "10px" },
  postRoute: { display: "flex", alignItems: "center", gap: "10px" },
  postFrom: { color: "#fff", fontWeight: "700", fontSize: "16px" },
  postArrow: { color: "#FAB400", fontSize: "18px" },
  postTo: { color: "#fff", fontWeight: "700", fontSize: "16px" },
  postMeta: { display: "flex", gap: "6px", flexWrap: "wrap" },
  metaChip: { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "4px 10px", borderRadius: "8px", fontSize: "12px" },
  activeChip: { background: "rgba(81,207,102,0.1)", color: "#51cf66" },
  inactiveChip: { background: "rgba(255,107,107,0.1)", color: "#ff6b6b" },
  postNote: { color: "rgba(255,255,255,0.4)", fontSize: "13px", fontStyle: "italic", margin: 0 },
  deleteBtn: { background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "#ff6b6b", borderRadius: "8px", padding: "7px 14px", fontSize: "13px", cursor: "pointer", alignSelf: "flex-start" },
  emptyPosts: { textAlign: "center", padding: "40px", background: "rgba(255,255,255,0.02)", borderRadius: "16px", color: "rgba(255,255,255,0.4)", fontSize: "15px" },
  emptyHint: { fontSize: "13px", marginTop: "8px", color: "rgba(255,255,255,0.25)" },
  center: { textAlign: "center", padding: "80px" },
  loadingText: { color: "rgba(255,255,255,0.4)" },
};

export default ProfilePage;