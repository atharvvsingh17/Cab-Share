import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
} from "../utils/api";

const RequestsPage = () => {
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [recRes, sentRes] = await Promise.all([getReceivedRequests(), getSentRequests()]);
      setReceived(recRes.data.requests.filter(r => r.travelPost !== null));
      setSent(sentRes.data.requests.filter(r => r.travelPost !== null));
    } catch (err) {
      setError("Failed to load requests");
    }
    setLoading(false);
  };

  const handleAccept = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "accepting" }));
    try {
      await acceptRequest(id);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept");
    }
    setActionLoading((prev) => ({ ...prev, [id]: null }));
  };

  const handleReject = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: "rejecting" }));
    try {
      await rejectRequest(id);
      await fetchAll();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to reject");
    }
    setActionLoading((prev) => ({ ...prev, [id]: null }));
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const statusColor = {
    pending: { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.3)", text: "#f59e0b" },
    accepted: { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.3)", text: "#10b981" },
    rejected: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.3)", text: "#ef4444" },
  };

  const RequestCard = ({ req, type }) => {
    const partner = type === "received" ? req.from : req.to;
    const colors = statusColor[req.status];
    
    // Logic: Show contact box for both Received AND Sent tabs
    const shouldShowContact = req.status === "accepted" && partner?.phone;

    return (
      <div style={styles.card} className="animate-slide-up">
        <div style={styles.cardHeader}>
          <div style={styles.avatar}>
            <span style={styles.avatarText}>{partner?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div style={styles.cardInfo}>
            <p style={styles.cardName}>{partner?.name}</p>
            <p style={styles.cardEmail}>{partner?.email}</p>
          </div>
          <span style={{ ...styles.statusBadge, background: colors.bg, borderColor: colors.border, color: colors.text }}>
            {req.status === "pending" ? "⏳ Pending" : req.status === "accepted" ? "✓ Accepted" : "✗ Rejected"}
          </span>
        </div>

        {req.travelPost && (
          <div style={styles.routeCard}>
            <div style={styles.routeHeader}>
              <span style={styles.routeFrom}>{req.travelPost.from}</span>
              <div style={styles.routeArrow}>
                <div style={styles.arrowLine} />
                <span style={styles.arrowHead}>→</span>
              </div>
              <span style={styles.routeTo}>{req.travelPost.to}</span>
            </div>
            <div style={styles.routeDetails}>
              <span style={styles.routeChip}>📅 {formatDate(req.travelPost.date)}</span>
              <span style={styles.routeChip}>🕐 {req.travelPost.timeSlot}</span>
            </div>
          </div>
        )}

        {req.message && (
          <div style={styles.messageBox}>
            <span style={styles.quoteIcon}>"</span>
            <p style={styles.message}>{req.message}</p>
          </div>
        )}

        {/* Contact Details with NEW WhatsApp Button */}
        {shouldShowContact && (
          <div style={styles.contactBox}>
            <div style={styles.contactHeader}>
              <span style={styles.contactBadge}>✓ Connected</span>
            </div>
            
            <div style={styles.contactGrid}>
              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>👤</span>
                <div style={styles.contactContent}>
                  <span style={styles.contactLabel}>Name</span>
                  <span style={styles.contactValue}>{partner?.name || "N/A"}</span>
                </div>
              </div>

              <div style={styles.contactRow}>
                <span style={styles.contactIcon}>📧</span>
                <div style={styles.contactContent}>
                  <span style={styles.contactLabel}>Email</span>
                  <span style={styles.contactValue}>{partner?.email || "N/A"}</span>
                </div>
              </div>

              {partner?.phone && (
                <div style={styles.contactRow}>
                  <span style={styles.contactIcon}>📞</span>
                  <div style={styles.contactContent}>
                    <span style={styles.contactLabel}>Phone</span>
                    <span style={styles.contactValue}>{partner.phone}</span>
                  </div>
                </div>
              )}

              {partner?.bio && (
                <div style={styles.contactRow}>
                  <span style={styles.contactIcon}>💬</span>
                  <div style={styles.contactContent}>
                    <span style={styles.contactLabel}>Bio</span>
                    <span style={styles.contactValue}>{partner.bio}</span>
                  </div>
                </div>
              )}

              {partner?.currentLocation?.address && (
                <div style={styles.contactRow}>
                  <span style={styles.contactIcon}>📍</span>
                  <div style={styles.contactContent}>
                    <span style={styles.contactLabel}>Location</span>
                    <span style={styles.contactValue}>{partner.currentLocation.address}</span>
                  </div>
                </div>
              )}
            </div>

            {partner?.phone && (
              <div style={styles.contactActions}>
                <a 
                  href={`tel:${partner.phone.replace(/\D/g, '')}`} 
                  style={styles.callBtn}
                >
                  <span style={styles.callIcon}>📞</span>
                  Call
                </a>
                
                {/* THE NEW WHATSAPP BUTTON */}
                <a 
                  href={`https://wa.me/${partner.phone.replace(/\D/g, '')}?text=Hi%20${encodeURIComponent(partner.name.split(" ")[0])},%20I%20am%20your%20CabShare%20partner!`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.whatsappBtn}
                >
                  <span style={styles.callIcon}>💬</span>
                  WhatsApp
                </a>
              </div>
            )}
          </div>
        )}

        <p style={styles.timestamp}>
          <span style={styles.timestampIcon}>🕐</span>
          {formatDate(req.createdAt)}
        </p>

        {/* Action Buttons only for received pending requests */}
        {type === "received" && req.status === "pending" && (
          <div style={styles.actions}>
            <button
              style={styles.acceptBtn}
              onClick={() => handleAccept(req._id)}
              disabled={actionLoading[req._id]}
            >
              {actionLoading[req._id] === "accepting" ? "..." : "✓ Accept"}
            </button>
            <button
              style={styles.rejectBtn}
              onClick={() => handleReject(req._id)}
              disabled={actionLoading[req._id]}
            >
              {actionLoading[req._id] === "rejecting" ? "..." : "✗ Decline"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Your Requests</h1>
          <p style={styles.subtitle}>Manage your travel connections</p>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === "received" ? styles.tabActive : {}) }}
            onClick={() => setTab("received")}
          >
            <span>Inbox</span>
            {received.filter(r => r.status === "pending").length > 0 && (
              <span style={styles.badge}>{received.filter(r => r.status === "pending").length}</span>
            )}
          </button>
          <button
            style={{ ...styles.tab, ...(tab === "sent" ? styles.tabActive : {}) }}
            onClick={() => setTab("sent")}
          >
            <span>Sent</span>
          </button>
        </div>

        {error && (
          <div style={styles.errorBox}>
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={styles.center}>
            <div style={styles.loader} />
            <p style={styles.loadingText}>Loading requests...</p>
          </div>
        ) : (
          <div style={styles.list}>
            {(tab === "received" ? received : sent).length === 0 ? (
              <div style={styles.empty}>
                <span style={styles.emptyIcon}>{tab === "received" ? "📥" : "📤"}</span>
                <p style={styles.emptyTitle}>No {tab} requests</p>
                <p style={styles.emptyText}>
                  {tab === "received" 
                    ? "When someone requests to join your trip, you'll see it here"
                    : "Requests you send to others will appear here"}
                </p>
              </div>
            ) : (
              (tab === "received" ? received : sent).map((req, index) => (
                <div key={req._id} style={{ animationDelay: `${index * 0.1}s` }}>
                  <RequestCard req={req} type={tab} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- UPGRADED PREMIUM STYLES ---
const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", paddingBottom: "80px" },
  container: { maxWidth: "720px", margin: "0 auto", padding: "100px 20px 40px" },
  header: { marginBottom: "32px" },
  title: { color: "#f8fafc", fontSize: "36px", fontWeight: "800", margin: "0 0 8px", letterSpacing: "-0.02em" },
  subtitle: { color: "#94a3b8", fontSize: "16px", margin: 0, fontWeight: "500" },
  
  tabs: { display: "flex", gap: "12px", marginBottom: "28px" },
  tab: { 
    flex: 1, 
    padding: "14px 20px", 
    border: "none", 
    borderRadius: "16px", 
    cursor: "pointer", 
    fontSize: "16px", 
    fontWeight: "700", 
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    transition: "all 0.3s",
  },
  tabActive: { 
    background: "#3b82f6",
    borderColor: "transparent",
    color: "#ffffff",
    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)",
  },
  badge: { 
    background: "rgba(255, 255, 255, 0.2)", 
    color: "#ffffff", 
    borderRadius: "100px", 
    padding: "2px 8px", 
    fontSize: "13px", 
    fontWeight: "800",
  },
  
  list: { display: "flex", flexDirection: "column", gap: "16px" },
  
  card: { 
    background: "rgba(15, 23, 42, 0.6)", 
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)", 
    borderRadius: "24px", 
    padding: "24px", 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: "14px" },
  avatar: { 
    width: "52px", 
    height: "52px", 
    borderRadius: "50%", 
    background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center", 
    flexShrink: 0,
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  },
  avatarText: { color: "#ffffff", fontWeight: "800", fontSize: "20px" },
  cardInfo: { flex: 1 },
  cardName: { color: "#f8fafc", fontWeight: "700", fontSize: "17px", margin: "0 0 4px", letterSpacing: "-0.01em" },
  cardEmail: { color: "#94a3b8", fontSize: "14px", margin: 0, fontWeight: "500" },
  statusBadge: { 
    padding: "6px 14px", 
    borderRadius: "100px", 
    fontSize: "13px", 
    fontWeight: "700", 
    border: "1px solid",
    whiteSpace: "nowrap",
  },
  
  routeCard: {
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    padding: "16px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  routeHeader: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" },
  routeFrom: { color: "#60a5fa", fontSize: "16px", fontWeight: "700" },
  routeArrow: { flex: 1, display: "flex", alignItems: "center", gap: "8px" },
  arrowLine: { flex: 1, height: "2px", background: "linear-gradient(90deg, #60a5fa 0%, #3b82f6 100%)" },
  arrowHead: { color: "#3b82f6", fontSize: "20px", fontWeight: "700" },
  routeTo: { color: "#3b82f6", fontSize: "16px", fontWeight: "700" },
  routeDetails: { display: "flex", gap: "10px", flexWrap: "wrap" },
  routeChip: { background: "rgba(255, 255, 255, 0.05)", color: "#cbd5e1", padding: "6px 12px", borderRadius: "10px", fontSize: "13px", fontWeight: "600" },
  
  messageBox: {
    background: "rgba(255, 255, 255, 0.02)",
    borderLeft: "3px solid #f59e0b",
    borderRadius: "12px",
    padding: "14px 16px",
    position: "relative",
  },
  quoteIcon: { position: "absolute", top: "-8px", left: "8px", fontSize: "32px", color: "rgba(245, 158, 11, 0.3)", fontFamily: "Georgia, serif" },
  message: { color: "#cbd5e1", fontSize: "14px", fontStyle: "italic", margin: 0, lineHeight: "1.6", paddingLeft: "20px" },
  
  contactBox: { 
    background: "rgba(59, 130, 246, 0.05)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    borderRadius: "18px", 
    padding: "20px",
    marginTop: "8px",
  },
  contactHeader: { marginBottom: "16px" },
  contactBadge: {
    display: "inline-block",
    background: "rgba(16, 185, 129, 0.2)",
    color: "#10b981",
    padding: "6px 14px",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "700",
  },
  contactGrid: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" },
  contactRow: { 
    display: "flex", 
    alignItems: "center",
    gap: "14px",
    padding: "14px",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "14px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  contactIcon: { fontSize: "22px", flexShrink: 0 },
  contactContent: { flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  contactLabel: { color: "#94a3b8", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" },
  contactValue: { color: "#f8fafc", fontSize: "15px", fontWeight: "600", wordBreak: "break-word" },
  
  /* NEW: Contact Actions Layout */
  contactActions: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  callBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: "700",
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
    transition: "all 0.3s",
  },
  whatsappBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    background: "#10b981", /* Emerald green matches the WhatsApp vibe and theme perfectly */
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: "700",
    textDecoration: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
    transition: "all 0.3s",
  },
  callIcon: { fontSize: "20px" },
  
  timestamp: { display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "13px", margin: 0, fontWeight: "500" },
  timestampIcon: { fontSize: "14px" },
  
  actions: { display: "flex", gap: "12px" },
  acceptBtn: { 
    flex: 1, 
    background: "rgba(16, 185, 129, 0.1)", 
    border: "1px solid rgba(16, 185, 129, 0.2)", 
    color: "#10b981", 
    borderRadius: "14px", 
    padding: "14px", 
    fontSize: "15px", 
    fontWeight: "700", 
    cursor: "pointer",
    transition: "all 0.3s",
  },
  rejectBtn: { 
    flex: 1, 
    background: "rgba(239, 68, 68, 0.1)", 
    border: "1px solid rgba(239, 68, 68, 0.2)", 
    color: "#ef4444", 
    borderRadius: "14px", 
    padding: "14px", 
    fontSize: "15px", 
    fontWeight: "700", 
    cursor: "pointer",
    transition: "all 0.3s",
  },
  
  center: { textAlign: "center", padding: "80px 20px" },
  loader: {
    width: "48px",
    height: "48px",
    border: "4px solid rgba(255, 255, 255, 0.05)",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto 20px",
  },
  loadingText: { color: "#94a3b8", fontSize: "16px", fontWeight: "500" },
  
  empty: { textAlign: "center", padding: "80px 20px" },
  emptyIcon: { fontSize: "64px", display: "block", marginBottom: "20px" },
  emptyTitle: { color: "#f8fafc", fontSize: "22px", fontWeight: "700", margin: "0 0 12px" },
  emptyText: { color: "#94a3b8", fontSize: "15px", margin: 0, lineHeight: "1.6", maxWidth: "400px", marginLeft: "auto", marginRight: "auto" },
  
  errorBox: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "14px",
    padding: "14px 18px",
    color: "#ef4444",
    fontSize: "14px",
    marginBottom: "20px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
};

export default RequestsPage;