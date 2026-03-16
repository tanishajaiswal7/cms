import { Fragment, useCallback, useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../api/axios";
import { getAssetUrl } from "../../utils/assetUrl";
import "./AdminPanel.css";
import toast from "react-hot-toast";

function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState(null);
  const [adminMessages, setAdminMessages] = useState({});
  const [providers, setProviders] = useState([]);
  
  // Modal states
  const [selectedImage, setSelectedImage] = useState(null);
  const [statusConfirmation, setStatusConfirmation] = useState(null);




  // fetch complaints with search & filter
  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/complaints", {
        params: {
          search,
          status,
          page,
          limit: 5,
        },
      });
      setComplaints(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      // Failed to fetch complaints - using previous state
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  const fetchProviders = useCallback(async () => {
    try {
      const res = await api.get("/api/providers");
      setProviders(res.data);
    } catch (error) {
      // Failed to fetch providers - continuing
    }
  }, []);


useEffect(() => {
  fetchComplaints();
  fetchProviders();
}, [fetchComplaints, fetchProviders]);



//assign-
const assignProvider = async (complaintId, providerId) => {
  try {
    await api.put(`/api/complaints/${complaintId}/assign`, {
      providerId,
    });
    toast.success("Technician assigned");
    fetchComplaints();
  } catch {
    toast.error("Assignment failed");
  }
};


  // update complaint status
  const updateStatus = async (id, newStatus, adminMessage) => {
    try {
      await api.put(`/api/complaints/${id}`, {
        status: newStatus,
        adminMessage,
      });
      toast.success("Status updated successfully");
      setStatusConfirmation(null);
      fetchComplaints();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleStatusChange = (complaintId, newStatus) => {
    setStatusConfirmation({
      complaintId,
      newStatus,
    });
  };

  const confirmStatusUpdate = () => {
    if (statusConfirmation) {
      updateStatus(
        statusConfirmation.complaintId,
        statusConfirmation.newStatus,
        adminMessages[statusConfirmation.complaintId] || ""
      );
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this complaint permanently?")) return;

  try {
    await api.delete(`/api/complaints/${id}`);
    toast.success("Complaint deleted");
    fetchComplaints();
  } catch {
    toast.error("Delete failed");
  }
};


  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="page-intro admin-panel-intro">
          <span className="page-kicker">Complaint Operations</span>
          <h1 className="page-title">Review, assign, and resolve resident complaints.</h1>
          <p className="page-subtitle">
            Search active tickets, update statuses, send resident-facing notes, and dispatch the right technician from one queue.
          </p>
        </div>

        <div className="admin-controls">
          <input
            type="text"
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {loading ? (
          <div className="loading-panel">Loading complaint queue...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-panel">No complaints found for the selected filters.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Problem</th>
                  <th>Category</th>
                  <th>Resident</th>
                  <th>Created On</th>
                  <th>Status</th>
                  <th>Files</th>
                  <th>Assigned Technician</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {complaints.map((c) => (
                  <Fragment key={c._id}>
                    <tr>
                      <td>{c.title}</td>
                      <td>{c.category}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => setExpandedId(expandedId === c._id ? null : c._id)}
                        >
                          {expandedId === c._id ? "Hide" : "View"}
                        </button>
                      </td>
                      <td>{new Date(c.createdAt).toLocaleDateString("en-IN")}</td>
                      <td>
                        <div className="status-wrapper">
                          <span className={`status-badge ${c.status.toLowerCase().replace(" ", "-")}`}>
                            {c.status}
                          </span>

                          <select
                            className="status-dropdown"
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>

                          <textarea
                            className="admin-message-input"
                            placeholder="Message to resident"
                            value={adminMessages[c._id] || ""}
                            onChange={(e) =>
                              setAdminMessages({
                                ...adminMessages,
                                [c._id]: e.target.value,
                              })
                            }
                          />
                          <button
                            className="send-btn"
                            onClick={() => updateStatus(c._id, c.status, adminMessages[c._id])}
                          >
                            Send
                          </button>
                        </div>
                      </td>
                      <td>
                        {c.image && c.image.length > 0 ? (
                          <img
                            className="complaint-thumbnail"
                            src={getAssetUrl(c.image[0])}
                            alt="complaint"
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedImage(c.image[0])}
                            title="Click to view full image"
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </td>
                      <td>
                        <select
                          onChange={(e) => assignProvider(c._id, e.target.value)}
                          defaultValue={c.assignedProvider?._id || ""}
                          className="assign-dropdown"
                        >
                          <option value="">Select</option>
                          {providers.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.role})
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button className="delete-icon" onClick={() => handleDelete(c._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>

                    {expandedId === c._id && (
                      <tr className="expanded-row">
                        <td colSpan="8">
                          <div className="complaint-details">
                            <p>
                              <strong>Resident Name:</strong> {c.createdBy?.name}
                            </p>
                            <p>
                              <strong>Email:</strong> {c.createdBy?.email}
                            </p>
                            <p>
                              <strong>Society:</strong> {c.societyName}
                            </p>
                            <p>
                              <strong>Block:</strong> {c.block || "—"}
                            </p>
                            <p>
                              <strong>Room:</strong> {c.roomNumber}
                            </p>
                            <p>
                              <strong>Description:</strong> {c.description}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "90%",
              maxHeight: "90%",
              overflow: "auto",
            }}
          >
            <img
              src={getAssetUrl(selectedImage)}
              alt="complaint"
              style={{ maxWidth: "100%", height: "auto" }}
            />
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* STATUS UPDATE CONFIRMATION MODAL */}
      {statusConfirmation && (
        <div
          className="modal-overlay"
          onClick={() => setStatusConfirmation(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              maxWidth: "400px",
              textAlign: "center",
            }}
          >
            <h2>Update Status</h2>
            <p style={{ marginBottom: "20px" }}>
              Are you sure you want to change the status to <strong>{statusConfirmation.newStatus}</strong>?
            </p>
            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
              }}
            >
              <button
                onClick={() => setStatusConfirmation(null)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminPanel;
