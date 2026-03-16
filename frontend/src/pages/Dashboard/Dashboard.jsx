import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../api/axios";
import { getAssetUrl } from "../../utils/assetUrl";
import "./Dashboard.css";
import toast from "react-hot-toast";

function Dashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const resolvedCount = complaints.filter((item) => item.status === "Resolved").length;
  const activeCount = complaints.filter((item) => item.status !== "Resolved").length;

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/api/complaints");
      setComplaints(res.data.data);
    } catch (error) {
      // Failed to fetch complaints - continue with empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this complaint?")) return;

    try {
      await api.delete(`/api/complaints/${id}`);
      toast.success("Complaint deleted");
      fetchComplaints();
    } catch {
      toast.error("Failed to delete complaint");
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <section className="dashboard-header-block">
          <div className="dashboard-header">
            <div className="page-intro dashboard-intro">
              <span className="page-kicker">Resident Portal</span>
              <h1 className="page-title">Track your complaints and follow every update.</h1>
              <p className="page-subtitle">
                Review active issues, view admin responses, and raise a new complaint whenever your property needs support.
              </p>
            </div>

            <Link to="/complaints/new" className="raise-btn">
              Raise Complaint
            </Link>
          </div>

          <div className="insight-strip dashboard-insights">
            <article className="insight-tile">
              <span className="insight-label">Total</span>
              <strong className="insight-value">{complaints.length}</strong>
            </article>
            <article className="insight-tile">
              <span className="insight-label">Active</span>
              <strong className="insight-value">{activeCount}</strong>
            </article>
            <article className="insight-tile">
              <span className="insight-label">Resolved</span>
              <strong className="insight-value">{resolvedCount}</strong>
            </article>
          </div>
        </section>

        {loading ? (
          <div className="loading-panel">Loading your complaint timeline...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>You haven’t raised any complaints yet.</p>
            <p>Create your first ticket to start tracking issue progress.</p>
          </div>
        ) : (
          <div className="complaints-list">
            {complaints.map((c) => (
              <div className="complaint-card" key={c._id}>
                
                {/* TITLE + STATUS + DELETE */}
                <div className="complaint-header">
                  <h3>{c.title}</h3>

                  <div className="status-actions">
                    <span
                      className={`status ${c.status
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {c.status}
                    </span>

                    {c.status === "Pending" && (
                      <button
                        className="delete-btn inline-delete"
                        onClick={() => handleDelete(c._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {/* META */}
                <p className="complaint-meta">
                  <strong>Category:</strong> {c.category} •{" "}
                  <strong>Created:</strong>{" "}
                  {new Date(c.createdAt).toLocaleDateString("en-IN")}
                </p>

                {/* DESCRIPTION */}
                <p className="complaint-desc">{c.description}</p>

                {/* ADMIN MESSAGE */}
                {c.adminMessage && (
                  <div className="admin-message">
                    <strong>Admin Team:</strong> {c.adminMessage}
                  </div>
                )}

                {/* ASSIGNED TECHNICIAN */}
                {c.assignedProvider && c.assignedProvider.active && (
                  <div className="technician-box">
                    <strong>Assigned Technician</strong>
                    <p>
                      👤 {c.assignedProvider.name} ({c.assignedProvider.role})
                    </p>

                    <div className="phone-row">
                      <span>📞 {c.assignedProvider.phone}</span>
                      <span
                        className="copy-icon"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            c.assignedProvider.phone
                          );
                          toast.success("Phone number copied");
                        }}
                      >
                        📋
                      </span>
                    </div>
                  </div>
                )}

                {/* IMAGES */}
                {c.images && c.images.length > 0 && (
                  <div className="complaint-images">
                    {c.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={getAssetUrl(img)}
                        alt="complaint"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Dashboard;
