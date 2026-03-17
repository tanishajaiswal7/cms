import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../api/axios";
import { validateIndianPhone } from "../../utils/phoneValidation";
import "./AdminProviders.css";
import toast from "react-hot-toast";

function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [phoneError, setPhoneError] = useState("");
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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Real-time phone validation
    if (name === "phone" && value.trim() !== "") {
      const validation = validateIndianPhone(value);
      setPhoneError(validation.error || "");
    } else if (name === "phone") {
      setPhoneError("");
    }
  };

  // ✅ add provider
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.role || !form.phone) {
      toast.error("Name, role and phone are required");
      return;
    }

    // Validate phone
    const phoneValidation = validateIndianPhone(form.phone);
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error);
      return;
    }

    try {
      await api.post("/api/providers", form);
      toast.success("Provider added");
      setForm({ name: "", role: "", phone: "" });
      setPhoneError("");
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
            placeholder="10-digit mobile number"
            value={form.phone}
            onChange={handleChange}
            maxLength={10}
            required
          />
          {phoneError && <span style={{ color: "red", fontSize: "0.9rem", marginTop: "0.25rem", display: "block" }}>{phoneError}</span>}

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
