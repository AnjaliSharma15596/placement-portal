import { useState, useEffect } from "react";
import axios from "axios";

export default function HRDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState("post");
  const [form, setForm] = useState({
    title: "", company: "", description: "",
    package: "", eligibility: "", deadline: ""
  });
  const name = localStorage.getItem("name");
  const token = localStorage.getItem("token");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const statusOptions = ["Applied", "Shortlisted", "Interview", "Selected", "Rejected"];

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    const res = await axios.get("${import.meta.env.VITE_API_URL}/jobs");
    setJobs(res.data);
  };

  const fetchApplications = async () => {
    const res = await axios.get("${import.meta.env.VITE_API_URL}/all_applications", authHeader);
    setApplications(res.data);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      await axios.post("${import.meta.env.VITE_API_URL}/add_job", form, authHeader);
      alert("Job posted!");
      setForm({ title: "", company: "", description: "", package: "", eligibility: "", deadline: "" });
      fetchJobs();
    } catch (err) {
      alert(err.response?.data?.error || "Error posting job!");
    }
  };

  const deleteJob = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/delete_job/${id}`, authHeader);
    fetchJobs();
  };

  const updateStatus = async (appId, status) => {
    await axios.post(`${import.meta.env.VITE_API_URL}/update_status/${appId}`, { status }, authHeader);
    fetchApplications();
  };

  const inputStyle = {
    width: "100%", padding: "10px",
    marginBottom: "15px", boxSizing: "border-box",
    borderRadius: "5px", border: "1px solid #ccc"
  };

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1>HR Dashboard — {name} 👔</h1>

      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        {["post", "jobs", "applications"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 20px",
            backgroundColor: activeTab === tab ? "#1e293b" : "#e2e8f0",
            color: activeTab === tab ? "white" : "black",
            border: "none", borderRadius: "5px", cursor: "pointer"
          }}>
            {tab === "post" ? "Post Job" : tab === "jobs" ? "My Jobs" : "Applications"}
          </button>
        ))}
      </div>

      {/* Post Job Tab */}
      {activeTab === "post" && (
        <form onSubmit={handlePost}>
          {[
            { key: "title", placeholder: "Job Title" },
            { key: "company", placeholder: "Company Name" },
            { key: "package", placeholder: "Package (e.g. 8 LPA)" },
            { key: "eligibility", placeholder: "Eligibility (e.g. 7.0 CGPA)" },
            { key: "deadline", placeholder: "Deadline (e.g. 2024-12-31)" },
          ].map(({ key, placeholder }) => (
            <input key={key} type="text" placeholder={placeholder}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              style={inputStyle} required={key === "title" || key === "company"}
            />
          ))}
          <textarea
            placeholder="Job Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...inputStyle, height: "100px" }}
          />
          <button type="submit" style={{
            padding: "10px 30px", backgroundColor: "#1e293b",
            color: "white", border: "none", borderRadius: "5px", cursor: "pointer"
          }}>
            Post Job
          </button>
        </form>
      )}

      {/* My Jobs Tab */}
      {activeTab === "jobs" && (
        <div>
          {jobs.length === 0 ? <p>Koi job post nahi ki abhi.</p> : jobs.map((job) => (
            <div key={job.id} style={{
              border: "1px solid #e2e8f0", padding: "20px",
              borderRadius: "10px", marginBottom: "15px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: "0 0 5px" }}>{job.title}</h3>
                <p style={{ color: "#64748b", margin: 0 }}>{job.company}</p>
              </div>
              <button onClick={() => deleteJob(job.id)} style={{
                padding: "8px 15px", backgroundColor: "#ef4444",
                color: "white", border: "none", borderRadius: "5px", cursor: "pointer"
              }}>Delete</button>
            </div>
          ))}
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === "applications" && (
        <div>
          {applications.length === 0 ? <p>Koi application nahi aayi abhi.</p> : applications.map((app) => (
            <div key={app.id} style={{
              border: "1px solid #e2e8f0", padding: "20px",
              borderRadius: "10px", marginBottom: "15px",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <div>
                <h3 style={{ margin: "0 0 5px" }}>{app.student_name}</h3>
                <p style={{ color: "#64748b", margin: "0 0 5px" }}>{app.title} — {app.company}</p>
              </div>
              <select
                value={app.status}
                onChange={(e) => updateStatus(app.id, e.target.value)}
                style={{ padding: "8px", borderRadius: "5px" }}
              >
                {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}