import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/register`, {
        name, email, password, role
      });
      setSuccess("Registration successful! Login karein.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed!");
    }
  };

  const roles = [
    { value: "student", label: "🎓 Student", desc: "Jobs browse aur apply karo" },
    { value: "hr", label: "🏢 HR", desc: "Jobs post aur applications manage karo" },
    { value: "admin", label: "🛡️ Admin", desc: "Complete portal manage karo" },
  ];

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
        maxWidth: "460px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)"
      }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <div style={{
            width: "60px", height: "60px",
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 15px",
            fontSize: "28px"
          }}>🚀</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "26px", color: "#1e293b" }}>Create Account</h2>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Placement Portal pe register karein</p>
        </div>

        {error && (
          <div style={{
            backgroundColor: "#fef2f2", border: "1px solid #fecaca",
            borderRadius: "8px", padding: "12px", marginBottom: "20px",
            color: "#ef4444", fontSize: "14px", textAlign: "center"
          }}>⚠️ {error}</div>
        )}
        {success && (
          <div style={{
            backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: "8px", padding: "12px", marginBottom: "20px",
            color: "#10b981", fontSize: "14px", textAlign: "center"
          }}>✅ {success}</div>
        )}

        <form onSubmit={handleRegister}>
          {/* Name */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>
              Full Name
            </label>
            <input
              type="text" placeholder="Aapka naam"
              value={name} onChange={(e) => setName(e.target.value)} required
              style={{
                width: "100%", padding: "12px 16px",
                border: "2px solid #e2e8f0", borderRadius: "8px",
                fontSize: "15px", boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>
              Email Address
            </label>
            <input
              type="email" placeholder="aapka@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
              style={{
                width: "100%", padding: "12px 16px",
                border: "2px solid #e2e8f0", borderRadius: "8px",
                fontSize: "15px", boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>
              Password
            </label>
            <input
              type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required
              style={{
                width: "100%", padding: "12px 16px",
                border: "2px solid #e2e8f0", borderRadius: "8px",
                fontSize: "15px", boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
            />
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: "25px" }}>
            <label style={{ display: "block", marginBottom: "12px", fontWeight: "600", color: "#374151", fontSize: "14px" }}>
              Role Select Karein
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {roles.map((r) => (
                <div
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  style={{
                    padding: "12px 16px",
                    border: `2px solid ${role === r.value ? "#3b82f6" : "#e2e8f0"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    backgroundColor: role === r.value ? "#eff6ff" : "white",
                    display: "flex", alignItems: "center", gap: "12px",
                    transition: "all 0.2s"
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{r.label.split(" ")[0]}</span>
                  <div>
                    <div style={{ fontWeight: "600", fontSize: "14px", color: "#1e293b" }}>
                      {r.label.split(" ").slice(1).join(" ")}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{r.desc}</div>
                  </div>
                  {role === r.value && (
                    <span style={{ marginLeft: "auto", color: "#3b82f6", fontWeight: "bold" }}>✓</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: "100%", padding: "14px",
              background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
              color: "white", border: "none", borderRadius: "8px",
              fontSize: "16px", fontWeight: "600", cursor: "pointer"
            }}
          >
            Register →
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "25px", color: "#64748b", fontSize: "14px" }}>
          Already account hai?{" "}
          <a href="/login" style={{ color: "#3b82f6", fontWeight: "600", textDecoration: "none" }}>
            Login karein
          </a>
        </p>
      </div>
    </div>
  );
}