import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, verifyOtp } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (mode === "register") {
        await registerUser({ name: form.name, email: form.email, phone: form.phone });
        setSuccess("Check your email for the OTP!");
      } else {
        await loginUser({ email: form.email });
        setSuccess("Check your email for the OTP!");
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await verifyOtp({ email: form.email, otp });
      login(res.data.token, res.data.user);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP");
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      {/* Animated background blobs */}
      <div style={{...styles.blob, ...styles.blob1}} />
      <div style={{...styles.blob, ...styles.blob2}} />
      
      <div style={styles.card} className="animate-slide-up">
        {/* Logo with sunset gradient */}
        <div style={styles.logoArea}>
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>🚗</span>
          </div>
          <h1 style={styles.logoText}>CabShare</h1>
          <p style={styles.tagline}>Travel together, save together</p>
        </div>

        {step === 1 && (
          <>
            {/* Toggle with warm gradient */}
            <div style={styles.toggle}>
              <button
                style={{ ...styles.toggleBtn, ...(mode === "login" ? styles.toggleActive : {}) }}
                onClick={() => { setMode("login"); setError(""); }}
              >
                Login
              </button>
              <button
                style={{ ...styles.toggleBtn, ...(mode === "register" ? styles.toggleActive : {}) }}
                onClick={() => { setMode("register"); setError(""); }}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {mode === "register" && (
                <>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                      style={styles.input}
                      name="name"
                      placeholder="Enter your name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number (optional)</label>
                    <input
                      style={styles.input}
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <input
                  style={styles.input}
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {error && <p style={styles.error}>{error}</p>}

              <button style={styles.btn} type="submit" disabled={loading}>
                {loading ? "Sending..." : mode === "login" ? "Continue with Email" : "Get Started"}
              </button>
            </form>
          </>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <div style={styles.otpHeader}>
              <span style={styles.otpIcon}>📧</span>
              <p style={styles.otpInfo}>
                We sent a code to<br/>
                <strong>{form.email}</strong>
              </p>
            </div>
            
            {success && <p style={styles.success}>{success}</p>}
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter 6-digit code</label>
              <input
                style={{ ...styles.input, ...styles.otpInput }}
                placeholder="000000"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(""); }}
                maxLength={6}
                type="tel"
                pattern="[0-9]*"
                inputMode="numeric"
                required
              />
            </div>
            
            {error && <p style={styles.error}>{error}</p>}
            
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            
            <button
              type="button"
              style={styles.backBtn}
              onClick={() => { setStep(1); setOtp(""); setError(""); setSuccess(""); }}
            >
              ← Back to email
            </button>
          </form>
        )}
      </div>

      {/* Footer tagline */}
      <p style={styles.footer}>Join thousands sharing rides across India</p>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1A1F3A 0%, #2D1B4E 100%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
    padding: "40px 20px",
  },
  blob: {
    position: "absolute",
    borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
    filter: "blur(80px)",
    opacity: 0.4,
    animation: "float 20s ease-in-out infinite",
  },
  blob1: {
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(255,107,53,0.3) 0%, transparent 70%)",
    top: "-100px",
    left: "-100px",
  },
  blob2: {
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(168,111,255,0.25) 0%, transparent 70%)",
    bottom: "-150px",
    right: "-150px",
    animationDelay: "7s",
  },
  card: {
    background: "rgba(255, 248, 240, 0.05)",
    backdropFilter: "blur(30px)",
    border: "1px solid rgba(255, 248, 240, 0.1)",
    borderRadius: "32px",
    padding: "48px",
    width: "100%",
    maxWidth: "460px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,248,240,0.1)",
  },
  logoArea: {
    textAlign: "center",
    marginBottom: "40px",
  },
  logoCircle: {
    width: "80px",
    height: "80px",
    margin: "0 auto 20px",
    background: "linear-gradient(135deg, #FF6B35 0%, #FF5E78 100%)",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(255,107,53,0.4)",
  },
  logoIcon: { fontSize: "40px" },
  logoText: {
    fontSize: "36px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #FF6B35 0%, #FFC857 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    fontFamily: "'Outfit', sans-serif",
    marginBottom: "8px",
  },
  tagline: {
    color: "rgba(255, 248, 240, 0.6)",
    fontSize: "15px",
    fontWeight: "500",
  },
  toggle: {
    display: "flex",
    background: "rgba(255, 248, 240, 0.08)",
    borderRadius: "16px",
    padding: "6px",
    marginBottom: "32px",
    gap: "6px",
  },
  toggleBtn: {
    flex: 1,
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "700",
    background: "transparent",
    color: "rgba(255, 248, 240, 0.5)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  toggleActive: {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF5E78 100%)",
    color: "#FFF8F0",
    boxShadow: "0 4px 12px rgba(255,107,53,0.3)",
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { 
    color: "rgba(255, 248, 240, 0.7)", 
    fontSize: "14px", 
    fontWeight: "600",
    marginLeft: "4px",
  },
  input: {
    background: "rgba(255, 248, 240, 0.08)",
    border: "1.5px solid rgba(255, 248, 240, 0.15)",
    borderRadius: "14px",
    padding: "16px 18px",
    color: "#FFF8F0",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s",
    fontWeight: "500",
  },
  otpInput: {
    fontSize: "28px",
    textAlign: "center",
    letterSpacing: "16px",
    fontWeight: "700",
    paddingLeft: "28px",
  },
  btn: {
    background: "linear-gradient(135deg, #FF6B35 0%, #FF5E78 100%)",
    color: "#FFF8F0",
    border: "none",
    borderRadius: "14px",
    padding: "18px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 16px rgba(255,107,53,0.4)",
    transition: "all 0.3s",
  },
  backBtn: {
    background: "transparent",
    border: "1.5px solid rgba(255, 248, 240, 0.15)",
    borderRadius: "14px",
    padding: "14px",
    color: "rgba(255, 248, 240, 0.6)",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
  },
  error: { 
    color: "#FF6B6B", 
    fontSize: "14px", 
    margin: "0",
    padding: "12px",
    background: "rgba(255,107,107,0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(255,107,107,0.2)",
  },
  success: { 
    color: "#4ECDC4", 
    fontSize: "14px", 
    margin: "0",
    padding: "12px",
    background: "rgba(78,205,196,0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(78,205,196,0.2)",
  },
  otpHeader: {
    textAlign: "center",
    marginBottom: "8px",
  },
  otpIcon: { fontSize: "48px", display: "block", marginBottom: "12px" },
  otpInfo: { 
    color: "rgba(255, 248, 240, 0.7)", 
    fontSize: "15px",
    lineHeight: "1.6",
  },
  footer: {
    marginTop: "32px",
    color: "rgba(255, 248, 240, 0.4)",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default AuthPage;