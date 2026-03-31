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
      {}
      <div style={{...styles.blob, ...styles.blob1}} />
      <div style={{...styles.blob, ...styles.blob2}} />
      
      <div style={styles.card} className="animate-slide-up">
        {/* Logo with Premium Blue gradient */}
        <div style={styles.logoArea}>
          <div style={styles.logoCircle}>
            <span style={styles.logoIcon}>🚗</span>
          </div>
          <h1 style={styles.logoText}>CabShare</h1>
          <p style={styles.tagline}>Travel together, save together</p>
        </div>

        {step === 1 && (
          <>
            {/* Toggle with Midnight Glass theme */}
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
                <strong style={{ color: "#f8fafc" }}>{form.email}</strong>
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

      {}
      <p style={styles.footer}>Join thousands sharing rides across India</p>
    </div>
  );
};


const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #020617 0%, #0f172a 100%)", /* Deep Midnight Background */
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
    opacity: 0.3,
    animation: "float 20s ease-in-out infinite",
  },
  blob1: {
    width: "400px",
    height: "400px",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.4) 0%, transparent 70%)", /* Deep Blue Glow */
    top: "-100px",
    left: "-100px",
  },
  blob2: {
    width: "500px",
    height: "500px",
    background: "radial-gradient(circle, rgba(96, 165, 250, 0.3) 0%, transparent 70%)", /* Light Blue Glow */
    bottom: "-150px",
    right: "-150px",
    animationDelay: "7s",
  },
  
  
  card: {
    background: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "32px",
    padding: "48px",
    width: "100%",
    maxWidth: "460px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
  },
  
  logoArea: { textAlign: "center", marginBottom: "40px" },
  logoCircle: {
    width: "80px",
    height: "80px",
    margin: "0 auto 20px",
    background: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)", /* Premium Blue Gradient */
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 24px rgba(59, 130, 246, 0.3)",
  },
  logoIcon: { fontSize: "40px" },
  logoText: {
    fontSize: "36px",
    fontWeight: "800",
    color: "#f8fafc", /* Solid white to prevent the browser rendering box issue */
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    marginBottom: "8px",
    letterSpacing: "-0.02em",
  },
  tagline: { color: "#94a3b8", fontSize: "15px", fontWeight: "500" },
  

  toggle: {
    display: "flex",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
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
    color: "#94a3b8",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  toggleActive: {
    background: "#3b82f6",
    color: "#ffffff",
    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.39)",
  },
  
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { color: "#cbd5e1", fontSize: "13px", fontWeight: "600", marginLeft: "4px", textTransform: "uppercase", letterSpacing: "0.5px" },
  
  
  input: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "14px",
    padding: "16px 18px",
    color: "#ffffff",
    fontSize: "16px",
    outline: "none",
    transition: "all 0.3s",
    fontWeight: "500",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  },
  otpInput: {
    fontSize: "28px",
    textAlign: "center",
    letterSpacing: "16px",
    fontWeight: "700",
    paddingLeft: "28px",
  },
  

  btn: {
    background: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "14px",
    padding: "18px",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.3)",
    transition: "all 0.3s",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "14px",
    padding: "14px",
    color: "#94a3b8",
    fontSize: "15px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "all 0.3s",
  },
  
  error: { 
    color: "#ef4444", 
    fontSize: "14px", 
    margin: "0",
    padding: "12px",
    background: "rgba(239, 68, 68, 0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(239, 68, 68, 0.2)",
  },
  success: { 
    color: "#10b981", 
    fontSize: "14px", 
    margin: "0",
    padding: "12px",
    background: "rgba(16, 185, 129, 0.1)",
    borderRadius: "10px",
    border: "1px solid rgba(16, 185, 129, 0.2)",
  },
  
  otpHeader: { textAlign: "center", marginBottom: "8px" },
  otpIcon: { fontSize: "48px", display: "block", marginBottom: "12px" },
  otpInfo: { color: "#94a3b8", fontSize: "15px", lineHeight: "1.6" },
  
  footer: { marginTop: "32px", color: "#64748b", fontSize: "14px", fontWeight: "500" },
};

export default AuthPage;