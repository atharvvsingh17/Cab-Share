import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { createTravelPost } from "../utils/api";

const TIME_SLOTS = [
  "06:00 AM - 08:00 AM",
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
  "08:00 PM - 10:00 PM",
];

const HomePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("search");
  const [search, setSearch] = useState({ from: "", to: "", date: "" });
  const [post, setPost] = useState({ from: "", to: "", date: "", timeSlot: "", seatsAvailable: 1, note: "", totalFare: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  
  const farePerPerson = post.seatsAvailable > 0 && post.totalFare 
    ? Math.round(Number(post.totalFare) / (Number(post.seatsAvailable) + 1))
    : 0;

  const totalPeople = post.seatsAvailable ? Number(post.seatsAvailable) + 1 : 1;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!search.from || !search.to || !search.date) {
      setError("Please fill all search fields");
      return;
    }
    navigate(`/results?from=${search.from}&to=${search.to}&date=${search.date}`);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await createTravelPost(post);
      setSuccess("Travel post created! Others can now find you 🚀");
      setPost({ from: "", to: "", date: "", timeSlot: "", seatsAvailable: 1, note: "", totalFare: "" });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create post");
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.hero}>
          <div style={styles.heroBadge}>✈️ Premium Commute</div>
          <h1 style={styles.heroTitle}>
            Find Your<br />
            <span style={styles.heroAccent}>Travel Partner</span>
          </h1>
          <p style={styles.heroSub}>
            Search for verified professionals travelling to your destination and split the fare.
          </p>
        </div>

        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(activeTab === "search" ? styles.tabActive : {}) }}
            onClick={() => { setActiveTab("search"); setError(""); setSuccess(""); }}
          >
            🔍 Search Partners
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === "post" ? styles.tabActive : {}) }}
            onClick={() => { setActiveTab("post"); setError(""); setSuccess(""); }}
          >
            ➕ Post My Travel
          </button>
        </div>

        {activeTab === "search" && (
          <form onSubmit={handleSearch} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📍 From</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Mumbai"
                  value={search.from}
                  onChange={(e) => setSearch({ ...search, from: e.target.value })}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📍 To</label>
                <input
                  style={styles.input}
                  placeholder="e.g. Pune"
                  value={search.to}
                  onChange={(e) => setSearch({ ...search, to: e.target.value })}
                  required
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📅 Date</label>
                <input
                  style={styles.input}
                  type="date"
                  value={search.date}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setSearch({ ...search, date: e.target.value })}
                  required
                />
              </div>
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.btn} type="submit">
              🔍 Find Travel Partners
            </button>
          </form>
        )}

        {activeTab === "post" && (
          <form onSubmit={handlePost} style={styles.form}>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📍 From</label>
                <input style={styles.input} placeholder="e.g. Mumbai" value={post.from} onChange={(e) => setPost({ ...post, from: e.target.value })} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📍 To</label>
                <input style={styles.input} placeholder="e.g. Pune" value={post.to} onChange={(e) => setPost({ ...post, to: e.target.value })} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>📅 Date</label>
                <input style={styles.input} type="date" value={post.date} min={new Date().toISOString().split("T")[0]} onChange={(e) => setPost({ ...post, date: e.target.value })} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>🕐 Time Slot</label>
                <select style={styles.input} value={post.timeSlot} onChange={(e) => setPost({ ...post, timeSlot: e.target.value })} required>
                  <option value="" style={{ color: "#000" }}>Select a time slot</option>
                  {TIME_SLOTS.map((slot) => <option key={slot} value={slot} style={{ color: "#000" }}>{slot}</option>)}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>💺 Seats Available (excluding you)</label>
                <input style={styles.input} type="number" min="1" max="6" value={post.seatsAvailable} onChange={(e) => setPost({ ...post, seatsAvailable: e.target.value })} />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>💰 Total Cab Fare (₹)</label>
                <input style={styles.input} type="number" min="0" placeholder="e.g. 500" value={post.totalFare} onChange={(e) => setPost({ ...post, totalFare: e.target.value })} />
              </div>
              <div style={{...styles.inputGroup, gridColumn: "1 / -1"}}>
                <label style={styles.label}>📝 Note (optional)</label>
                <input style={styles.input} placeholder="e.g. Prefer early morning..." value={post.note} onChange={(e) => setPost({ ...post, note: e.target.value })} />
              </div>
            </div>

            {post.totalFare && post.seatsAvailable > 0 && (
              <div style={styles.fareBox}>
                <div style={styles.fareRow}>
                  <span style={styles.fareLabel}>💰 Total Fare</span>
                  <span style={styles.fareValue}>₹{post.totalFare}</span>
                </div>
                <div style={styles.fareRow}>
                  <span style={styles.fareLabel}>👥 Total People</span>
                  <span style={styles.fareValue}>{totalPeople} (You + {post.seatsAvailable})</span>
                </div>
                <div style={{ ...styles.fareRow, ...styles.fareTotal }}>
                  <span style={styles.fareLabel}>💵 Per Person</span>
                  <span style={styles.fareValue}>₹{farePerPerson}</span>
                </div>
              </div>
            )}

            {error && <p style={styles.error}>{error}</p>}
            {success && <p style={styles.success}>{success}</p>}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Posting..." : "➕ Post My Travel"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" },
  container: { maxWidth: "800px", margin: "0 auto", padding: "48px 24px", paddingTop: "100px" },
  hero: { textAlign: "center", marginBottom: "48px" },
  
  
  heroBadge: { display: "inline-block", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", color: "#60a5fa", padding: "8px 20px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "20px" },
  
  heroTitle: { fontSize: "clamp(40px, 5vw, 64px)", fontWeight: "800", color: "#f8fafc", margin: "0 0 16px", lineHeight: "1.1", letterSpacing: "-1px" },
  heroAccent: { color: "#3b82f6" }, /* Premium Blue instead of Yellow */
  heroSub: { color: "#94a3b8", fontSize: "18px", maxWidth: "520px", margin: "0 auto", lineHeight: "1.6" },
  
  
  tabs: { display: "flex", gap: "8px", background: "rgba(255, 255, 255, 0.03)", borderRadius: "16px", padding: "6px", marginBottom: "24px", border: "1px solid rgba(255, 255, 255, 0.05)" },
  tab: { flex: 1, padding: "14px", border: "none", borderRadius: "12px", cursor: "pointer", fontSize: "15px", fontWeight: "600", background: "transparent", color: "#94a3b8", transition: "all 0.3s ease" },
  tabActive: { background: "#3b82f6", color: "#ffffff", boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)" },
  
  
  form: { 
    background: "rgba(15, 23, 42, 0.6)", 
    backdropFilter: "blur(16px)", 
    WebkitBackdropFilter: "blur(16px)", /* Safari support */
    border: "1px solid rgba(255, 255, 255, 0.08)", 
    borderRadius: "24px", 
    padding: "40px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
  },
  
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#cbd5e1", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  
  
  input: { 
    background: "rgba(255, 255, 255, 0.03)", 
    border: "1px solid rgba(255, 255, 255, 0.1)", 
    borderRadius: "14px", 
    padding: "16px", 
    color: "#ffffff", 
    fontSize: "15px", 
    outline: "none", 
    width: "100%", 
    boxSizing: "border-box",
    transition: "all 0.2s ease"
  },
  
  
  fareBox: { background: "rgba(59, 130, 246, 0.05)", border: "1px solid rgba(59, 130, 246, 0.2)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
  fareRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  fareTotal: { borderTop: "1px solid rgba(59, 130, 246, 0.2)", paddingTop: "12px", marginTop: "4px" },
  fareLabel: { color: "#94a3b8", fontSize: "14px", fontWeight: "600" },
  fareValue: { color: "#60a5fa", fontSize: "18px", fontWeight: "800" },
  
  
  btn: { 
    background: "#3b82f6", 
    color: "#ffffff", 
    border: "none", 
    borderRadius: "14px", 
    padding: "18px", 
    fontSize: "16px", 
    fontWeight: "700", 
    cursor: "pointer",
    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.3)",
    transition: "all 0.2s ease"
  },
  
  error: { color: "#ef4444", fontSize: "14px", fontWeight: "500", margin: "0", background: "rgba(239,68,68,0.1)", padding: "10px", borderRadius: "8px" },
  success: { color: "#10b981", fontSize: "14px", fontWeight: "500", margin: "0", background: "rgba(16,185,129,0.1)", padding: "10px", borderRadius: "8px" },
};

export default HomePage;