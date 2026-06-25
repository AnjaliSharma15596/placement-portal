import { useState, useEffect } from "react";
import axios from "axios";

export default function StudentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("jobs");
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchJobs = async () => {
    const res = await axios.get("${import.meta.env.VITE_API_URL}/jobs");
    setJobs(res.data);
  };

  const fetchMyApplications = async () => {
    const res = await axios.get("${import.meta.env.VITE_API_URL}/my_applications", authHeader);
    setMyApplications(res.data);
  };

  const applyJob = async (job_id) => {
    try {
      await axios.post("${import.meta.env.VITE_API_URL}/apply", { job_id }, authHeader);
      alert("Applied successfully!");
      fetchMyApplications();
    } catch (err) {
      alert(err.response?.data?.error || "Already applied or error!");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: "#3b82f6",
      Shortlisted: "#f59e0b",
      Interview: "#8b5cf6",
      Selected: "#10b981",
      Rejected: "#ef4444",
    };
    return colors[status] || "#gray";
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>Welcome, {name}! 👋</h1>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <button
          onClick={() => setActiveTab("jobs")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "jobs" ? "#1e293b" : "#e2e8f0",
            color: activeTab === "jobs" ? "white" : "black",
            border: "none", borderRadius: "5px", cursor: "pointer"
          }}
        >
          Browse Jobs
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          style={{
            padding: "10px 20px",
            backgroundColor: activeTab === "applications" ? "#1e293b" : "#e2e8f0",
            color: activeTab === "applications" ? "white" : "black",
            border: "none", borderRadius: "5px", cursor: "pointer"
          }}
        >
          My Applications ({myApplications.length})
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === "jobs" && (
        <div>
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "10px", marginBottom: "20px", boxSizing: "border-box", borderRadius: "5px", border: "1px solid #ccc" }}
          />

          {filteredJobs.length === 0 ? (
            <p>Koi job available nahi hai abhi.</p>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} style={{
                border: "1px solid #e2e8f0",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "15px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                <h3 style={{ margin: "0 0 5px" }}>{job.title}</h3>
                <p style={{ color: "#64748b", margin: "0 0 10px" }}>{job.company}</p>
                <p style={{ margin: "0 0 5px" }}>{job.description}</p>
                {job.package && <p style={{ margin: "0 0 5px" }}>💰 Package: {job.package}</p>}
                {job.eligibility && <p style={{ margin: "0 0 5px" }}>📋 Eligibility: {job.eligibility}</p>}
                {job.deadline && <p style={{ margin: "0 0 10px" }}>⏰ Deadline: {job.deadline}</p>}
                <button
                  onClick={() => applyJob(job.id)}
                  style={{
                    padding: "8px 20px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div>
          {myApplications.length === 0 ? (
            <p>Abhi koi application nahi hai.</p>
          ) : (
            myApplications.map((app) => (
              <div key={app.id} style={{
                border: "1px solid #e2e8f0",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "15px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <h3 style={{ margin: "0 0 5px" }}>{app.title}</h3>
                  <p style={{ color: "#64748b", margin: 0 }}>{app.company}</p>
                </div>
                <span style={{
                  padding: "5px 15px",
                  borderRadius: "20px",
                  backgroundColor: getStatusColor(app.status),
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px"
                }}>
                  {app.status}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}