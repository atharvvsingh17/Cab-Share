import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, verifyOtp } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState("login"); // login | register
  const [step, setStep] = useState(1); // 1: form, 2: otp
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
        setSuccess("OTP sent to your email! ✈️");
      } else {
        await loginUser({ email: form.email });
        setSuccess("OTP sent to your email! ✈️");
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
      {/* Background */}
      <div style={styles.bgOverlay} />
      <div style={styles.bgGrid} />

      <div style={styles.card}>

        <div style={styles.logo}>
          <span style={styles.logoIcon}>🚕</span>
          <span style={styles.logoText}>CabShare</span>
        </div>
        <p style={styles.tagline}>Find your travel partner, share the ride.</p>


        {step === 1 && (
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
              Register
            </button>
          </div>
        )}


        {step === 1 && (
          <form onSubmit={handleSubmit} style={styles.form}>
            {mode === "register" && (
              <>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    name="name"
                    placeholder="Itachi Uchiha"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Phone (optional)</label>
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
                placeholder="you@gmail.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            {error && <p style={styles.error}>{error}</p>}

            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Sending OTP..." : `${mode === "login" ? "Login" : "Register"} with OTP →`}
            </button>
          </form>
        )}

       
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <p style={styles.otpInfo}>
              📧 OTP sent to <strong>{form.email}</strong>
            </p>
            {success && <p style={styles.success}>{success}</p>}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Enter OTP</label>
              <input
                style={{ ...styles.input, ...styles.otpInput }}
                placeholder="● ● ● ● ● ●"
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setError(""); }}
                maxLength={6}
                required
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? "Verifying..." : "Verify OTP →"}
            </button>
            <button
              type="button"
              style={styles.backBtn}
              onClick={() => { setStep(1); setOtp(""); setError(""); setSuccess(""); }}
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0f1e 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'DM Sans', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgOverlay: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse at 20% 50%, rgba(250,180,0,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,120,255,0.06) 0%, transparent 50%)",
    pointerEvents: "none",
  },
  bgGrid: {
    position: "fixed",
    inset: 0,
    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
    backgroundSize: "50px 50px",
    pointerEvents: "none",
  },
  card: {
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "48px 40px",
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
    boxShadow: "0 32px 80px rgba(0,0,0,0.4)",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "8px",
  },
  logoIcon: { fontSize: "32px" },
  logoText: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#FAB400",
    letterSpacing: "-0.5px",
    fontFamily: "'Syne', sans-serif",
  },
  tagline: {
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    marginBottom: "32px",
    marginTop: "0",
  },
  toggle: {
    display: "flex",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "12px",
    padding: "4px",
    marginBottom: "28px",
    gap: "4px",
  },
  toggleBtn: {
    flex: 1,
    padding: "10px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    transition: "all 0.2s",
  },
  toggleActive: {
    background: "#FAB400",
    color: "#0a0a0f",
  },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: "500" },
  input: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "14px 16px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "border-color 0.2s",
  },
  otpInput: {
    fontSize: "24px",
    textAlign: "center",
    letterSpacing: "12px",
    fontWeight: "700",
  },
  btn: {
    background: "#FAB400",
    color: "#0a0a0f",
    border: "none",
    borderRadius: "12px",
    padding: "16px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    transition: "opacity 0.2s",
  },
  backBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "12px",
    color: "rgba(255,255,255,0.4)",
    fontSize: "14px",
    cursor: "pointer",
  },
  error: { color: "#ff6b6b", fontSize: "13px", margin: "0" },
  success: { color: "#51cf66", fontSize: "13px", margin: "0" },
  otpInfo: { color: "rgba(255,255,255,0.6)", fontSize: "14px", margin: "0" },
};

export default AuthPage;