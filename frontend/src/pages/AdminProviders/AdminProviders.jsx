import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../api/axios";
import "./AdminProviders.css";
import toast from "react-hot-toast";

function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [form, setForm] = useState({
    name: "",
    role: "",
    phone: "",
  });

  const toggleStatus = async (id) => {
  try {
    await api.put(`/api/providers/${id}/toggle`);
    toast.success("Status updated");
    fetchProviders();
  } catch {
    toast.error("Failed to update status");
  }
};


  // ✅ fetch providers
  const fetchProviders = async () => {
    try {
      const res = await api.get("/api/providers");
      setProviders(res.data);
    } catch {
      toast.error("Failed to load providers");
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  // input handler
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ add provider
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/providers", form);
      toast.success("Provider added");
      setForm({ name: "", role: "", phone: "" });
      fetchProviders();
    } catch {
      toast.error("Failed to add provider");
    }
  };

 

  return (
    <>
      <Navbar />

      <div className="provider-container">
        <div className="page-intro provider-intro">
          <span className="page-kicker">Provider Network</span>
          <h1 className="page-title">Manage active service providers for complaint assignments.</h1>
          <p className="page-subtitle">
            Keep your technician directory accurate so complaints can be routed to the right specialist without delay.
          </p>
        </div>

        <form className="provider-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Provider name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="">Select Role</option>
            <option value="Electrician">Electrician</option>
            <option value="Plumber">Plumber</option>
            <option value="Maintenance">Maintenance</option>
          </select>

          <input
            type="text"
            name="phone"
            placeholder="Phone number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <button type="submit">Add Provider</button>
        </form>

        {providers.length === 0 ? (
          <div className="empty-panel">No providers added yet. Create your first provider above.</div>
        ) : (
          <table className="provider-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th colSpan="2">Status</th>
              </tr>
            </thead>

            <tbody>
              {providers.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.role}</td>
                  <td>{p.phone}</td>

                  <td>
                    <span className={`status-badge ${p.active ? "active" : "inactive"}`}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <button className="toggle-btn" onClick={() => toggleStatus(p._id)}>
                      {p.active ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default AdminProviders;
