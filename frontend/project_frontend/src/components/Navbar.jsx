import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav style={{
      backgroundColor: "#1e293b",
      color: "white",
      padding: "15px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <h2 style={{ margin: 0 }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Placement Portal
        </Link>
      </h2>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        {!role && (
          <>
            <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Login</Link>
            <Link to="/register" style={{ color: "white", textDecoration: "none" }}>Register</Link>
          </>
        )}

        {role === "student" && (
          <Link to="/student" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
        )}

        {role === "hr" && (
          <Link to="/hr" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
        )}

        {role === "admin" && (
          <Link to="/admin" style={{ color: "white", textDecoration: "none" }}>Dashboard</Link>
        )}

        {role && (
          <>
            <span style={{ color: "#94a3b8" }}>Hi, {name}!</span>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
                backgroundColor: "#ef4444",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}