import { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import axios from "../../api/axios";
import toast from "react-hot-toast";
import "./AdminResidents.css";

function AdminResidents() {
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    buildingName: "",
    roomNo: "",
    notes: "",
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/residents");
      setResidents(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch residents");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddResident = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Name, email and password are required");
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        buildingName: formData.buildingName.trim(),
        roomNo: formData.roomNo.trim(),
        notes: formData.notes.trim(),
      };

      await axios.post("/api/residents", payload);
      toast.success("Resident added successfully");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        buildingName: "",
        roomNo: "",
        notes: "",
      });

      fetchResidents();
    } catch (error) {
      const apiMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message;
      toast.error(apiMessage || "Failed to add resident");
    }
  };

  const handleRemoveResident = async (residentRecordId) => {
    if (!window.confirm("Remove this resident from active list?")) return;

    try {
      await axios.delete(`/api/residents/${residentRecordId}`);
      toast.success("Resident removed from list");
      fetchResidents();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove resident");
    }
  };

  return (
    <>
      <Navbar />

      <div className="admin-residents-container">
        <div className="residents-header-card">
          <div className="page-intro residents-intro">
            <span className="page-kicker">Resident Directory</span>
            <h1 className="page-title">Manage the active residents used across the system.</h1>
            <p className="page-subtitle">
              Resident records power complaint ownership, rent assignment, and admin communication throughout the application.
            </p>
          </div>
        </div>

        <div className="residents-form-card">
          <h2>Add Resident</h2>
          <form onSubmit={handleAddResident}>
            <div className="residents-form-grid">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  name="name"
                  placeholder="Resident full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="resident@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={6}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  name="phone"
                  placeholder="10-digit mobile"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                  name="address"
                  placeholder="Resident address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Building Name</label>
                <input
                  name="buildingName"
                  placeholder="Block / Tower"
                  value={formData.buildingName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Room / Flat No</label>
                <input
                  name="roomNo"
                  placeholder="Example: 302"
                  value={formData.roomNo}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group full-width">
                <label>Notes</label>
                <textarea
                  name="notes"
                  placeholder="Optional note"
                  value={formData.notes}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary">Add Resident</button>
          </form>
        </div>

        <div className="residents-list-card">
          <div className="list-header-row">
            <h2>Active Residents</h2>
            <span>{residents.length} records</span>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="table-wrap">
              <table className="residents-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Building</th>
                    <th>Room</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {residents.length === 0 ? (
                    <tr>
                      <td colSpan="7">No residents added yet.</td>
                    </tr>
                  ) : (
                    residents.map((resident) => (
                      <tr key={resident.residentRecordId}>
                        <td>{resident.name}</td>
                        <td>{resident.email}</td>
                        <td>{resident.phone || "—"}</td>
                        <td>{resident.buildingName || "—"}</td>
                        <td>{resident.roomNo || "—"}</td>
                        <td>{resident.notes || "—"}</td>
                        <td>
                          <button
                            className="btn-danger"
                            onClick={() => handleRemoveResident(resident.residentRecordId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminResidents;
