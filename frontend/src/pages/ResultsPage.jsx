import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { searchTravelPosts, sendRequest } from "../utils/api";

const ResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestStatus, setRequestStatus] = useState({});

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await searchTravelPosts({ from, to, date });
        setPosts(res.data.posts);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch results");
      }
      setLoading(false);
    };
    fetchResults();
  }, [from, to, date]);

  const handleSendRequest = async (post) => {
    setRequestStatus((prev) => ({ ...prev, [post._id]: "sending" }));
    try {
      await sendRequest({ travelPostId: post._id, message: "Hi! I'd like to share a cab with you." });
      setRequestStatus((prev) => ({ ...prev, [post._id]: "sent" }));
    } catch (err) {
      setRequestStatus((prev) => ({ ...prev, [post._id]: err.response?.data?.error || "Failed" }));
    }
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <button style={styles.backBtn} onClick={() => navigate("/home")}>← Back</button>
          <div>
            <h1 style={styles.title}>Travel Partners</h1>
            <p style={styles.subtitle}>
              <span style={styles.route}>{from} → {to}</span>
              <span style={styles.dot}>·</span>
              {formatDate(date)}
            </p>
          </div>
        </div>

        {loading && (
          <div style={styles.center}>
            <div style={styles.spinner} />
            <p style={styles.loadingText}>Finding travel partners...</p>
          </div>
        )}

        {error && <div style={styles.emptyBox}><p style={styles.error}>{error}</p></div>}

        {!loading && !error && posts.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyIcon}>🔍</p>
            <p style={styles.emptyTitle}>No partners found</p>
            <p style={styles.emptyText}>No one is travelling this route on this date yet.</p>
            <button style={styles.postBtn} onClick={() => navigate("/home")}>Post Your Travel Instead →</button>
          </div>
        )}

        {!loading && posts.length > 0 && (
          <>
            <p style={styles.count}>{posts.length} partner{posts.length > 1 ? "s" : ""} found</p>
            <div style={styles.grid}>
              {posts.map((post) => {
                const remainingSeats = post.seatsAvailable - (post.acceptedPartners || 0);
                const currentPeople = 1 + (post.acceptedPartners || 0);
                
                return (
                  <div key={post._id} style={styles.card}>
                    <div style={styles.cardTop}>
                      <div style={styles.avatar}>
                        {post.user.profilePhoto ? <img src={post.user.profilePhoto} style={styles.avatarImg} alt="" /> : <span style={styles.avatarText}>{post.user.name[0].toUpperCase()}</span>}
                      </div>
                      <div>
                        <p style={styles.userName}>{post.user.name}</p>
                        <p style={styles.userEmail}>{post.user.email}</p>
                      </div>
                      <div style={styles.seatsBadge}>
                        💺 {remainingSeats}/{post.seatsAvailable} left
                      </div>
                    </div>

                    <div style={styles.routeBox}>
                      <div style={styles.routeItem}>
                        <span style={styles.routeDot}>●</span>
                        <span style={styles.routeText}>{post.from}</span>
                      </div>
                      <div style={styles.routeLine} />
                      <div style={styles.routeItem}>
                        <span style={styles.routeDotEnd}>●</span>
                        <span style={styles.routeText}>{post.to}</span>
                      </div>
                    </div>

                    <div style={styles.details}>
                      <span style={styles.detailChip}>📅 {formatDate(post.date)}</span>
                      <span style={styles.detailChip}>🕐 {post.timeSlot}</span>
                      <span style={styles.detailChip}>👥 {currentPeople} travelling</span>
                    </div>

                    {post.totalFare > 0 && (
                      <div style={styles.fareBox}>
                        <div style={styles.fareItem}>
                          <span style={styles.fareLabel}>💰 Total Fare</span>
                          <span style={styles.fareValue}>₹{post.totalFare}</span>
                        </div>
                        <div style={styles.fareItem}>
                          <span style={styles.fareLabel}>💵 Per Person ({currentPeople} people)</span>
                          <span style={styles.fareHighlight}>₹{post.farePerPerson}</span>
                        </div>
                      </div>
                    )}

                    {post.note && <p style={styles.note}>"{post.note}"</p>}
                    {post.user.bio && <p style={styles.bio}>{post.user.bio}</p>}

                    {remainingSeats === 0 ? (
                      <button style={styles.fullBtn} disabled>
                        🚫 Fully Booked
                      </button>
                    ) : (
                      <button
                        style={{ ...styles.requestBtn, ...(requestStatus[post._id] === "sent" ? styles.requestBtnSent : {}), ...(requestStatus[post._id] === "sending" ? styles.requestBtnDisabled : {}) }}
                        onClick={() => handleSendRequest(post)}
                        disabled={requestStatus[post._id] === "sent" || requestStatus[post._id] === "sending"}
                      >
                        {requestStatus[post._id] === "sent" ? "✅ Request Sent" : requestStatus[post._id] === "sending" ? "Sending..." : typeof requestStatus[post._id] === "string" && requestStatus[post._id] ? `❌ ${requestStatus[post._id]}` : "🤝 Send Partner Request"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)", fontFamily: "'DM Sans', sans-serif" },
  container: { maxWidth: "800px", margin: "0 auto", padding: "40px 24px" },
  header: { display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "32px" },
  backBtn: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "rgba(255,255,255,0.6)", padding: "10px 16px", cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap", marginTop: "4px" },
  title: { color: "#fff", fontSize: "28px", fontWeight: "800", margin: "0 0 6px", fontFamily: "'Syne', sans-serif" },
  subtitle: { color: "rgba(255,255,255,0.5)", fontSize: "15px", margin: 0 },
  route: { color: "#FAB400", fontWeight: "600" },
  dot: { margin: "0 8px", color: "rgba(255,255,255,0.3)" },
  count: { color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "16px" },
  grid: { display: "flex", flexDirection: "column", gap: "16px" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" },
  cardTop: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "48px", height: "48px", borderRadius: "50%", background: "rgba(250,180,0,0.15)", border: "2px solid rgba(250,180,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%", objectFit: "cover" },
  avatarText: { color: "#FAB400", fontWeight: "700", fontSize: "18px" },
  userName: { color: "#fff", fontWeight: "700", fontSize: "16px", margin: 0 },
  userEmail: { color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 },
  seatsBadge: { marginLeft: "auto", background: "rgba(250,180,0,0.1)", border: "1px solid rgba(250,180,0,0.2)", color: "#FAB400", padding: "4px 12px", borderRadius: "100px", fontSize: "13px", fontWeight: "600" },
  routeBox: { display: "flex", flexDirection: "column", gap: "4px", padding: "0 4px" },
  routeItem: { display: "flex", alignItems: "center", gap: "10px" },
  routeDot: { color: "#51cf66", fontSize: "10px" },
  routeDotEnd: { color: "#ff6b6b", fontSize: "10px" },
  routeLine: { width: "2px", height: "16px", background: "rgba(255,255,255,0.1)", marginLeft: "4px" },
  routeText: { color: "#fff", fontSize: "15px", fontWeight: "500" },
  details: { display: "flex", gap: "8px", flexWrap: "wrap" },
  detailChip: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 12px", color: "rgba(255,255,255,0.6)", fontSize: "13px" },
  fareBox: { background: "rgba(250,180,0,0.08)", border: "1px solid rgba(250,180,0,0.2)", borderRadius: "12px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  fareItem: { display: "flex", flexDirection: "column", gap: "4px" },
  fareLabel: { color: "rgba(255,255,255,0.5)", fontSize: "12px" },
  fareValue: { color: "#FAB400", fontSize: "16px", fontWeight: "700" },
  fareHighlight: { color: "#FAB400", fontSize: "20px", fontWeight: "800" },
  note: { color: "rgba(255,255,255,0.5)", fontSize: "14px", fontStyle: "italic", margin: 0 },
  bio: { color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 },
  requestBtn: { background: "#FAB400", color: "#0a0a0f", border: "none", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  requestBtnSent: { background: "rgba(81,207,102,0.15)", color: "#51cf66", cursor: "default" },
  requestBtnDisabled: { opacity: 0.6, cursor: "not-allowed" },
  fullBtn: { background: "rgba(255,107,107,0.1)", color: "#ff6b6b", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "12px", padding: "14px", fontSize: "15px", fontWeight: "700", cursor: "not-allowed" },
  center: { textAlign: "center", padding: "80px 0" },
  spinner: { width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTop: "3px solid #FAB400", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" },
  loadingText: { color: "rgba(255,255,255,0.4)", fontSize: "15px" },
  emptyBox: { textAlign: "center", padding: "80px 0" },
  emptyIcon: { fontSize: "48px", margin: "0 0 16px" },
  emptyTitle: { color: "#fff", fontSize: "20px", fontWeight: "700", margin: "0 0 8px" },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: "15px", margin: "0 0 24px" },
  postBtn: { background: "#FAB400", color: "#0a0a0f", border: "none", borderRadius: "12px", padding: "14px 24px", fontSize: "15px", fontWeight: "700", cursor: "pointer" },
  error: { color: "#ff6b6b" },
};

export default ResultsPage;