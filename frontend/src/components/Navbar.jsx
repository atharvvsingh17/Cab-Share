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
    { label: "Home", icon: "🏠", path: "/home" },
    { label: "Requests", icon: "📋", path: "/requests", badge: pendingCount },
    { label: "Profile", icon: "👤", path: "/profile" },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.logo} onClick={() => navigate("/home")}>
          <div style={styles.logoCircle}>🚗</div>
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
              <span style={styles.linkIcon}>{item.icon}</span>
              <span style={styles.linkText}>{item.label}</span>
              {item.badge > 0 && <span style={styles.badge}>{item.badge}</span>}
            </button>
          ))}
        </div>
        
        <div style={styles.right}>
          <div style={styles.userInfo}>
            <span style={styles.greeting}>Hey, {user?.name?.split(" ")[0]}!</span>
          </div>
          <button style={styles.logoutBtn} onClick={handleLogout}>
            <span style={styles.logoutIcon}>→</span>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: "rgba(26, 31, 58, 0.9)",
    backdropFilter: "blur(30px)",
    borderBottom: "1.5px solid rgba(255, 248, 240, 0.1)",
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    height: "72px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "32px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  logoCircle: {
    width: "44px",
    height: "44px",
    background: "linear-gradient(135deg, #FF6B35 0%, #FF5E78 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #FF6B35 0%, #FFC857 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontFamily: "'Outfit', sans-serif",
    letterSpacing: "-0.02em",
  },
  links: { 
    display: "flex", 
    gap: "8px",
    flex: 1,
    justifyContent: "center",
  },
  link: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "transparent",
    border: "none",
    color: "rgba(255, 248, 240, 0.6)",
    padding: "10px 18px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.3s",
    position: "relative",
  },
  activeLink: {
    background: "rgba(255, 107, 53, 0.15)",
    color: "#FF6B35",
    boxShadow: "0 2px 8px rgba(255,107,53,0.2)",
  },
  linkIcon: { fontSize: "18px" },
  linkText: { fontWeight: "600" },
  badge: {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF5E78 100%)",
    color: "#FFF8F0",
    borderRadius: "100px",
    padding: "2px 7px",
    fontSize: "11px",
    fontWeight: "800",
    minWidth: "20px",
    textAlign: "center",
    boxShadow: "0 2px 6px rgba(255,107,53,0.3)",
    animation: "pulse 2s ease-in-out infinite",
  },
  right: { 
    display: "flex", 
    alignItems: "center", 
    gap: "16px",
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },
  greeting: { 
    color: "rgba(255, 248, 240, 0.8)", 
    fontSize: "14px",
    fontWeight: "600",
  },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255, 248, 240, 0.08)",
    border: "1.5px solid rgba(255, 248, 240, 0.15)",
    borderRadius: "12px",
    color: "rgba(255, 248, 240, 0.7)",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  logoutIcon: {
    fontSize: "18px",
    fontWeight: "700",
  },
};

export default Navbar;