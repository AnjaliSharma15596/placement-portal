import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  const features = [
    { icon: "🏢", title: "Company Postings", desc: "HR companies directly job openings post karti hain" },
    { icon: "🎓", title: "Student Applications", desc: "Students browse karke directly apply kar sakte hain" },
    { icon: "📊", title: "Admin Control", desc: "Complete placement drive management ek jagah" },
    { icon: "🔄", title: "Real-time Tracking", desc: "Application status live track karo — Applied se Selected tak" },
  ];

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      {/* Hero Section */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
        color: "white",
        textAlign: "center",
        padding: "80px 30px",
      }}>
        <h1 style={{ fontSize: "48px", margin: "0 0 20px" }}>
          Placement Management Portal
        </h1>
        <p style={{ fontSize: "20px", color: "#cbd5e1", marginBottom: "40px" }}>
          Students, Companies aur Admin ke liye ek complete hiring system
        </p>
        <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              padding: "14px 30px",
              backgroundColor: "white",
              color: "#1e293b",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer"
            }}
          >
            Get Started →
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              padding: "14px 30px",
              backgroundColor: "transparent",
              color: "white",
              border: "2px solid white",
              borderRadius: "8px",
              fontSize: "16px",
              cursor: "pointer"
            }}
          >
            Login
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: "60px 30px", backgroundColor: "#f8fafc" }}>
        <h2 style={{ textAlign: "center", marginBottom: "40px", fontSize: "32px" }}>
          Features
        </h2>
        <div style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "900px",
          margin: "0 auto"
        }}>
          {features.map((f) => (
            <div key={f.title} style={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "30px",
              width: "200px",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
            }}>
              <div style={{ fontSize: "40px", marginBottom: "15px" }}>{f.icon}</div>
              <h3 style={{ margin: "0 0 10px", fontSize: "16px" }}>{f.title}</h3>
              <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div style={{
        backgroundColor: "#1e293b",
        color: "white",
        textAlign: "center",
        padding: "60px 30px"
      }}>
        <h2 style={{ fontSize: "32px", marginBottom: "15px" }}>Ready to get started?</h2>
        <p style={{ color: "#94a3b8", marginBottom: "30px", fontSize: "18px" }}>
          Abhi register karo aur apna placement journey shuru karo
        </p>
        <button
          onClick={() => navigate("/register")}
          style={{
            padding: "14px 40px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          Register Now
        </button>
      </div>
    </div>
  );
}