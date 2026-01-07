import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../api/axios";
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




  // fetch complaints with search & filter
  const fetchComplaints = async () => {
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
      console.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchProviders = async () => {
  try {
    const res = await api.get("/api/providers");
    setProviders(res.data);
  } catch (error) {
    console.error("Failed to fetch providers");
  }
};


useEffect(() => {
  fetchComplaints();
  fetchProviders();
}, [search, status, page]);



//assign-
const assignProvider = async (complaintId, providerId) => {
  try {
    await api.put(`/api/complaints/${complaintId}/assign`, {
      providerId,
    });
    toast.success("Technician assigned");
    fetchComplaints();
  } catch (error) {
    toast.error("Assignment failed");
  }
};


  // update complaint status
  const updateStatus = async (id, newStatus,adminMessage) => {
    try {
      await api.put(`/api/complaints/${id}`, {
        status: newStatus,
        adminMessage,
      });
      toast.success("Status updated successfully");
      fetchComplaints();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id) => {
  if (!window.confirm("Delete this complaint permanently?")) return;

  try {
    await api.delete(`/api/complaints/${id}`);
    toast.success("Complaint deleted");
    fetchComplaints();
  } catch (error) {
    toast.error("Delete failed");
  }
};


  return (
    <>
      <Navbar />
      <div className="admin-container">
        <h1>Admin Panel</h1>
        <p>Manage and resolve complaints</p>

        {/* SEARCH & FILTER */}
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

        {/* TABLE */}
        {loading ? (
          <p>Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p>No complaints found.</p>
        ) : (
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
                <>
                  {/* MAIN ROW */}
                  <tr key={c._id}>
                    <td>{c.title}</td>
                    <td>{c.category}</td>

                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          setExpandedId(
                            expandedId === c._id ? null : c._id
                          )
                        }
                      >
                        {expandedId === c._id ? "Hide" : "View"}
                      </button>
                    </td>
                    <td>
  {new Date(c.createdAt).toLocaleDateString("en-IN")}
</td>

  <td>
  <div className="status-wrapper">
    <span
      className={`status-badge ${c.status
        .toLowerCase()
        .replace(" ", "-")}`}
    >
      {c.status}
    </span>

    <select
      className="status-dropdown"
      value={c.status}
      onChange={(e) =>
        updateStatus(c._id, e.target.value)
      }
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
  required
/>
<button
  className="send-btn"
  onClick={() =>
    updateStatus(c._id, c.status, adminMessages[c._id])
  }
>
  Send
</button>


  </div>
</td>


                   <td>
  {c.images && c.images.length > 0 ? (
    <img
      src={`http://localhost:5000/${c.images[0]}`}
      alt="complaint"
      style={{ width: "60px", borderRadius: "6px" }}
    />
  ) : (
    <span>No image</span>
  )}
</td>
<td>
  <select
    onChange={(e) =>
      assignProvider(c._id, e.target.value)
    }
    defaultValue=""
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
  <button
    className="delete-icon"
    onClick={() => handleDelete(c._id)}
  >
    🗑️
  </button>
</td>

                  </tr>

                  {/* EXPANDED DETAILS ROW */}
                  {expandedId === c._id && (
                    <tr className="expanded-row">
                      <td colSpan="5">
                        <div className="complaint-details">
                          <p>
                            <strong>Resident Name:</strong>{" "}
                            {c.createdBy?.name}
                          </p>
                          <p>
                            <strong>Email:</strong>{" "}
                            {c.createdBy?.email}
                          </p>
                          <p>
                            <strong>Society:</strong>{" "}
                            {c.societyName}
                          </p>
                          <p>
                            <strong>Block:</strong>{" "}
                            {c.block || "—"}
                          </p>
                          <p>
                            <strong>Room:</strong>{" "}
                            {c.roomNumber}
                          </p>
                          <p>
                            <strong>Description:</strong>{" "}
                            {c.description}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
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
    </>
  );
}

export default AdminPanel;
