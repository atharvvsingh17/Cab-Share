import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getReceivedRequests } from "../utils/api";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await getReceivedRequests();
        const pending = res.data.requests.filter(r => r.status === "pending").length;
        setPendingCount(pending);
      } catch (err) {
        console.error("Failed to fetch requests");
      }
    };
    fetchPending();
    
    
    const interval = setInterval(fetchPending, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { label: "🏠 Home", path: "/home" },
    { label: "📋 Requests", path: "/requests", badge: pendingCount },
    { label: "👤 Profile", path: "/profile" },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.logo} onClick={() => navigate("/home")}>
          <span>🚕</span>
          <span style={styles.logoText}>CabShare</span>
        </div>
        <div style={styles.links}>
          {navItems.map((item) => (
            <button
              key={item.path}
              style={{
                ...styles.link,
                ...(location.pathname === item.path ? styles.activeLink : {}),
              }}
              onClick={() => navigate(item.path)}
            >
              {item.label}
              {item.badge > 0 && <span style={styles.badge}>{item.badge}</span>}
            </button>
          ))}
        </div>
        <div style={styles.right}>
          <span style={styles.userName}>👋 {user?.name?.split(" ")[0]}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: "rgba(10,10,15,0.95)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  inner: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "0 24px",
    height: "64px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  logoText: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#FAB400",
    fontFamily: "'Syne', sans-serif",
  },
  links: { display: "flex", gap: "4px" },
  link: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.5)",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    position: "relative",
  },
  activeLink: {
    background: "rgba(250,180,0,0.1)",
    color: "#FAB400",
  },
  badge: {
    background: "#ff6b6b",
    color: "#fff",
    borderRadius: "100px",
    padding: "1px 6px",
    fontSize: "10px",
    fontWeight: "800",
    minWidth: "16px",
    textAlign: "center",
  },
  right: { display: "flex", alignItems: "center", gap: "12px" },
  userName: { color: "rgba(255,255,255,0.6)", fontSize: "14px" },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    color: "rgba(255,255,255,0.4)",
    padding: "6px 14px",
    fontSize: "13px",
    cursor: "pointer",
  },
};

export default Navbar;