import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import {
  getReceivedRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  getPartnerDetails,
} from "../utils/api";

const RequestsPage = () => {
  const [tab, setTab] = useState("received");
  const [received, setReceived] = useState([]);
  const [sent, setSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [partnerDetails, setPartnerDetails] = useState(null);
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

  const handleViewPartner = async (id) => {
    try {
      const res = await getPartnerDetails(id);
      setPartnerDetails(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load partner details");
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  const statusColor = {
    pending: "#FAB400",
    accepted: "#51cf66",
    rejected: "#ff6b6b",
  };

  const RequestCard = ({ req, type }) => (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.avatar}>
          <span style={styles.avatarText}>
            {(type === "received" ? req.from?.name : req.to?.name)?.[0]?.toUpperCase()}
          </span>
        </div>
        <div style={styles.cardInfo}>
          <p style={styles.cardName}>{type === "received" ? req.from?.name : req.to?.name}</p>
          <p style={styles.cardEmail}>{type === "received" ? req.from?.email : req.to?.email}</p>
        </div>
        <span style={{ ...styles.statusBadge, color: statusColor[req.status], borderColor: statusColor[req.status] + "33", background: statusColor[req.status] + "11" }}>
          {req.status}
        </span>
      </div>

      {req.travelPost && (
        <div style={styles.postInfo}>
          <span style={styles.postRoute}>
            📍 {req.travelPost.from} → {req.travelPost.to}
          </span>
          <span style={styles.postDate}>📅 {formatDate(req.travelPost.date)}</span>
          <span style={styles.postDate}>🕐 {req.travelPost.timeSlot}</span>
        </div>
      )}

      {req.message && <p style={styles.message}>"{req.message}"</p>}

      <p style={styles.time}>Sent {formatDate(req.createdAt)}</p>

      {type === "received" && req.status === "pending" && (
        <div style={styles.actions}>
          <button
            style={styles.acceptBtn}
            onClick={() => handleAccept(req._id)}
            disabled={actionLoading[req._id]}
          >
            {actionLoading[req._id] === "accepting" ? "Accepting..." : "✅ Accept"}
          </button>
          <button
            style={styles.rejectBtn}
            onClick={() => handleReject(req._id)}
            disabled={actionLoading[req._id]}
          >
            {actionLoading[req._id] === "rejecting" ? "Rejecting..." : "❌ Reject"}
          </button>
        </div>
      )}

      
      {req.status === "accepted" && (
        <button style={styles.viewBtn} onClick={() => handleViewPartner(req._id)}>
          👤 View Partner Details
        </button>
      )}
    </div>
  );

  return (
    <div style={styles.page}>
      <Navbar />
      <div style={styles.container}>
        <h1 style={styles.title}>Partner Requests</h1>

      
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(tab === "received" ? styles.tabActive : {}) }}
            onClick={() => setTab("received")}
          >
            📥 Received {received.filter(r => r.status === "pending").length > 0 && <span style={styles.badge}>{received.filter(r => r.status === "pending").length}</span>}
          </button>
          <button
            style={{ ...styles.tab, ...(tab === "sent" ? styles.tabActive : {}) }}
            onClick={() => setTab("sent")}
          >
            📤 Sent
          </button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        {loading ? (
          <div style={styles.center}><p style={styles.loadingText}>Loading requests...</p></div>
        ) : (
          <div style={styles.list}>
            {(tab === "received" ? received : sent).length === 0 ? (
              <div style={styles.empty}>
                <p style={styles.emptyIcon}>{tab === "received" ? "📥" : "📤"}</p>
                <p style={styles.emptyText}>No {tab} requests yet</p>
              </div>
            ) : (
              (tab === "received" ? received : sent).map((req) => (
                <RequestCard key={req._id} req={req} type={tab} />
              ))
            )}
          </div>
        )}
      </div>

      
      {partnerDetails && (
        <div style={styles.modalOverlay} onClick={() => setPartnerDetails(null)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setPartnerDetails(null)}>✕</button>
            <h2 style={styles.modalTitle}>🤝 Your Travel Partner</h2>
            <div style={styles.partnerCard}>
              <div style={styles.partnerAvatar}>
                <span style={styles.partnerAvatarText}>
                  {partnerDetails.partner?.name?.[0]?.toUpperCase()}
                </span>
              </div>
              <h3 style={styles.partnerName}>{partnerDetails.partner?.name}</h3>
              <div style={styles.partnerDetails}>
                <div style={styles.partnerRow}>
                  <span style={styles.partnerLabel}>📧 Email</span>
                  <span style={styles.partnerValue}>{partnerDetails.partner?.email}</span>
                </div>
                {partnerDetails.partner?.phone && (
                  <div style={styles.partnerRow}>
                    <span style={styles.partnerLabel}>📞 Phone</span>
                    <span style={styles.partnerValue}>{partnerDetails.partner?.phone}</span>
                  </div>
                )}
                {partnerDetails.partner?.bio && (
                  <div style={styles.partnerRow}>
                    <span style={styles.partnerLabel}>👤 Bio</span>
                    <span style={styles.partnerValue}>{partnerDetails.partner?.bio}</span>
                  </div>
                )}
                {partnerDetails.partner?.currentLocation?.address && (
                  <div style={styles.partnerRow}>
                    <span style={styles.partnerLabel}>📍 Location</span>
                    <span style={styles.partnerValue}>{partnerDetails.partner?.currentLocation?.address}</span>
                  </div>
                )}
              </div>
              {partnerDetails.travelPost && (
                <div style={styles.travelInfo}>
                  <p style={styles.travelRoute}>
                    {partnerDetails.travelPost.from} → {partnerDetails.travelPost.to}
                  </p>
                  <p style={styles.travelDate}>{partnerDetails.travelPost.timeSlot}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 100%)", fontFamily: "'DM Sans', sans-serif" },
  container: { maxWidth: "700px", margin: "0 auto", padding: "40px 24px" },
  title: { color: "#fff", fontSize: "32px", fontWeight: "800", margin: "0 0 28px", fontFamily: "'Syne', sans-serif" },
  tabs: { display: "flex", gap: "8px", background: "rgba(255,255,255,0.04)", borderRadius: "14px", padding: "5px", marginBottom: "24px" },
  tab: { flex: 1, padding: "11px", border: "none", borderRadius: "10px", cursor: "pointer", fontSize: "14px", fontWeight: "600", background: "transparent", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" },
  tabActive: { background: "#FAB400", color: "#0a0a0f" },
  badge: { background: "#0a0a0f", color: "#FAB400", borderRadius: "100px", padding: "1px 7px", fontSize: "11px", fontWeight: "800" },
  list: { display: "flex", flexDirection: "column", gap: "12px" },
  card: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "18px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" },
  cardHeader: { display: "flex", alignItems: "center", gap: "12px" },
  avatar: { width: "44px", height: "44px", borderRadius: "50%", background: "rgba(250,180,0,0.15)", border: "2px solid rgba(250,180,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  avatarText: { color: "#FAB400", fontWeight: "700", fontSize: "16px" },
  cardInfo: { flex: 1 },
  cardName: { color: "#fff", fontWeight: "700", fontSize: "15px", margin: 0 },
  cardEmail: { color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0 },
  statusBadge: { padding: "4px 12px", borderRadius: "100px", fontSize: "12px", fontWeight: "700", border: "1px solid", textTransform: "capitalize" },
  postInfo: { display: "flex", gap: "8px", flexWrap: "wrap" },
  postRoute: { background: "rgba(250,180,0,0.08)", color: "#FAB400", padding: "5px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600" },
  postDate: { background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.5)", padding: "5px 10px", borderRadius: "8px", fontSize: "13px" },
  message: { color: "rgba(255,255,255,0.5)", fontSize: "13px", fontStyle: "italic", margin: 0 },
  time: { color: "rgba(255,255,255,0.25)", fontSize: "12px", margin: 0 },
  actions: { display: "flex", gap: "8px" },
  acceptBtn: { flex: 1, background: "rgba(81,207,102,0.15)", border: "1px solid rgba(81,207,102,0.3)", color: "#51cf66", borderRadius: "10px", padding: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  rejectBtn: { flex: 1, background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "#ff6b6b", borderRadius: "10px", padding: "10px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  viewBtn: { background: "#FAB400", color: "#0a0a0f", border: "none", borderRadius: "10px", padding: "11px", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
  center: { textAlign: "center", padding: "60px 0" },
  loadingText: { color: "rgba(255,255,255,0.4)" },
  empty: { textAlign: "center", padding: "60px 0" },
  emptyIcon: { fontSize: "40px", margin: "0 0 12px" },
  emptyText: { color: "rgba(255,255,255,0.4)", fontSize: "15px" },
  error: { color: "#ff6b6b", fontSize: "14px" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: "24px" },
  modal: { background: "#0d1117", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "420px", position: "relative" },
  closeBtn: { position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontSize: "14px" },
  modalTitle: { color: "#fff", fontSize: "22px", fontWeight: "800", margin: "0 0 24px", fontFamily: "'Syne', sans-serif" },
  partnerCard: { display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" },
  partnerAvatar: { width: "72px", height: "72px", borderRadius: "50%", background: "rgba(250,180,0,0.15)", border: "3px solid rgba(250,180,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" },
  partnerAvatarText: { color: "#FAB400", fontWeight: "800", fontSize: "28px" },
  partnerName: { color: "#fff", fontSize: "20px", fontWeight: "800", margin: 0 },
  partnerDetails: { width: "100%", display: "flex", flexDirection: "column", gap: "10px" },
  partnerRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: "10px" },
  partnerLabel: { color: "rgba(255,255,255,0.4)", fontSize: "13px" },
  partnerValue: { color: "#fff", fontSize: "14px", fontWeight: "600" },
  travelInfo: { background: "rgba(250,180,0,0.08)", border: "1px solid rgba(250,180,0,0.2)", borderRadius: "12px", padding: "12px 16px", textAlign: "center", width: "100%", boxSizing: "border-box" },
  travelRoute: { color: "#FAB400", fontWeight: "700", fontSize: "16px", margin: "0 0 4px" },
  travelDate: { color: "rgba(255,255,255,0.5)", fontSize: "13px", margin: 0 },
};

export default RequestsPage;