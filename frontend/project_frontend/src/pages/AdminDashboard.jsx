import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const statusOptions = ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

  useEffect(() => {
    fetchStats();
    fetchApplications();
  }, []);

  const fetchStats = async () => {
    const res = await axios.get("${import.meta.env.VITE_API_URL}/admin/stats", authHeader);
    setStats(res.data);
  };

  const fetchApplications = async () => {
    const res = await axios.get("${import.meta.env.VITE_API_URL}/all_applications", authHeader);
    setApplications(res.data);
  };

  const updateStatus = async (appId, status) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/update_status/${appId}`, { status }, authHeader);
    fetchApplications();
    fetchStats();
  };

  const statCards = stats ? [
    { label: "Total Students", value: stats.total_students, color: "#3b82f6" },
    { label: "Total Companies", value: stats.total_companies, color: "#8b5cf6" },
    { label: "Total Applications", value: stats.total_applications, color: "#f59e0b" },
    { label: "Selection Rate", value: `${stats.selection_rate}%`, color: "#10b981" },
  ] : [];

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Admin Dashboard — {name} 🛡️</h1>

      {/* Stats Cards */}
      <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", margin: "20px 0" }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            border: `2px solid ${card.color}`,
            borderRadius: "10px",
            padding: "20px",
            minWidth: "180px",
            textAlign: "center"
          }}>
            <p style={{ color: "#64748b", margin: "0 0 5px", fontSize: "14px" }}>{card.label}</p>
            <h2 style={{ color: card.color, margin: 0 }}>{card.value}</h2>
          </div>
        ))}
      </div>

      {/* All Applications */}
      <h2>All Applications</h2>
      {applications.length === 0 ? (
        <p>Koi application nahi hai abhi.</p>
      ) : (
        applications.map((app) => (
          <div key={app.id} style={{
            border: "1px solid #e2e8f0",
            padding: "20px", borderRadius: "10px",
            marginBottom: "15px",
            display: "flex", justifyContent: "space-between", alignItems: "center"
          }}>
            <div>
              <h3 style={{ margin: "0 0 5px" }}>{app.student_name}</h3>
              <p style={{ color: "#64748b", margin: 0 }}>{app.title} — {app.company}</p>
            </div>
            <select
              value={app.status}
              onChange={(e) => updateStatus(app.id, e.target.value)}
              style={{ padding: "8px", borderRadius: "5px" }}
            >
              {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        ))
      )}
    </div>
  );
}