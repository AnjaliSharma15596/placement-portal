import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);

      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "hr") navigate("/hr");
      else navigate("/student");
    } catch (err) {
      setError("Invalid email or password!");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "16px",
        padding: "50px 40px",
        width: "100%",
        maxWidth: "420px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Logo/Title */}
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <div style={{
            width: "60px", height: "60px",
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 15px",
            fontSize: "28px"
          }}>🎓</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "26px", color: "#1e293b" }}>Welcome Back</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Apne account mein login karein</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            color: "#ef4444",
            fontSize: "14px",
            textAlign: "center"
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="aapka@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "15px",
                boxSizing: "border-box",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "2px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "15px",
                boxSizing: "border-box",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "14px",
              background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              letterSpacing: "0.5px"
            }}
          >
            Login →
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", color: "#64748b", fontSize: "14px" }}>
          Account nahi hai?{" "}
          <a href="/register" style={{ color: "#3b82f6", fontWeight: "600", textDecoration: "none" }}>
            Register karein
          </a>
        </p>
      </div>
    </div>
  );
}