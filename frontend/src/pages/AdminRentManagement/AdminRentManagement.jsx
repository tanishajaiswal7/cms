import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import toast from "react-hot-toast";
import "./AdminRentManagement.css";

function AdminRentManagement() {
  const [rentRecords, setRentRecords] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedResident, setSelectedResident] = useState(null);

  const [searchFilter, setSearchFilter] = useState({
    residentId: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    residentId: "",
    rentAmount: "",
    additionalCharges: "",
    fine: "",
    month: "",
    dueDate: "",
    notes: "",
  });

  const paidCount = rentRecords.filter((record) => record.status === "paid").length;
  const pendingCount = rentRecords.filter((record) => record.status !== "paid").length;

  const fetchRentRecords = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchFilter.residentId)
        params.append("residentId", searchFilter.residentId);
      if (searchFilter.status) params.append("status", searchFilter.status);

      const response = await axios.get(`/api/rents?${params.toString()}`);
      setRentRecords(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch rent records");
    } finally {
      setLoading(false);
    }
  }, [searchFilter]);

  const fetchResidents = useCallback(async () => {
    try {
      const response = await axios.get("/api/residents");
      setResidents(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch residents");
    }
  }, []);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  useEffect(() => {
    fetchRentRecords();
  }, [fetchRentRecords]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "residentId") {
      const resident = residents.find((r) => r._id === value);
      setSelectedResident(resident);
    }
  };

  const calculateTotal = () => {
    return (
      parseFloat(formData.rentAmount || 0) +
      parseFloat(formData.additionalCharges || 0) +
      parseFloat(formData.fine || 0)
    ).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!formData.residentId) {
        toast.error("Please select a resident");
        return;
      }

      if (!formData.rentAmount) {
        toast.error("Please enter rent amount");
        return;
      }

      if (!formData.month) {
        toast.error("Please select a month");
        return;
      }

      const rentAmount = parseFloat(formData.rentAmount || 0);
      const additionalCharges = parseFloat(formData.additionalCharges || 0);
      const fine = parseFloat(formData.fine || 0);

      const rentData = {
        residentId: formData.residentId,
        rentAmount,
        additionalCharges,
        fine,
        month: formData.month,
        dueDate: formData.dueDate || null,
        notes: formData.notes || "",
      };

      if (editingId) {
        await axios.put(`/api/rents/${editingId}`, rentData);
        toast.success("Rent updated successfully");
      } else {
        await axios.post("/api/rents", rentData);
        toast.success("Rent created successfully");
      }

      setFormData({
        residentId: "",
        rentAmount: "",
        additionalCharges: "",
        fine: "",
        month: "",
        dueDate: "",
        notes: "",
      });

      setSelectedResident(null);
      setEditingId(null);
      setShowForm(false);

      fetchRentRecords();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error creating rent record"
      );
    }
  };

  const handleEdit = (rent) => {
    setFormData({
      residentId: rent.residentId._id,
      rentAmount: rent.rentAmount,
      additionalCharges: rent.additionalCharges,
      fine: rent.fine,
      month: rent.month,
      dueDate: rent.dueDate ? rent.dueDate.split("T")[0] : "",
      notes: rent.notes || "",
    });

    setSelectedResident(rent.residentId);
    setEditingId(rent._id);
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this rent record?")) return;

    try {
      await axios.delete(`/api/rents/${id}`);
      toast.success("Rent deleted");
      fetchRentRecords();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedResident(null);
  };

  return (
    <>
      <Navbar />

      <div className="admin-rent-container">
        <div className="rent-header">
          <div className="page-intro rent-intro">
            <span className="page-kicker">Rent Operations</span>
            <h1 className="page-title">Create, filter, and maintain monthly rent records.</h1>
            <p className="page-subtitle">
              Use the resident directory as the single source of truth, then manage monthly rent, charges, fines, and due dates from one screen.
            </p>
          </div>

          <div className="header-actions">
            <Link className="btn-add-rent btn-outline" to="/admin/residents">
              Manage Residents
            </Link>

            <button
              className="btn-add-rent"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Close Form" : "+ Add Rent"}
            </button>
          </div>
        </div>

        <section className="insight-strip rent-insights">
          <article className="insight-tile">
            <span className="insight-label">Visible Records</span>
            <strong className="insight-value">{rentRecords.length}</strong>
          </article>
          <article className="insight-tile">
            <span className="insight-label">Paid</span>
            <strong className="insight-value">{paidCount}</strong>
          </article>
          <article className="insight-tile">
            <span className="insight-label">Pending</span>
            <strong className="insight-value">{pendingCount}</strong>
          </article>
        </section>

        {/* <div className="instruction-card">
          <h3>How to fill rent form correctly</h3>
          <ol>
            <li>First add/select resident from Resident Master.</li>
            <li>Choose month in <strong>YYYY-MM</strong> format.</li>
            <li>Enter base rent, then optional charges/fine.</li>
            <li>Set due date and notes, then verify total before save.</li>
          </ol>
        </div> */}

        {showForm && (
          <div className="rent-form-card">
            <div className="section-title-row">
              <h2>{editingId ? "Edit Rent" : "Add Rent"}</h2>
              <span>Only residents from Resident Master are shown below</span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Resident *</label>
                  <select
                    name="residentId"
                    value={formData.residentId}
                    onChange={handleInputChange}
                    disabled={editingId}
                    required
                  >
                    <option value="">Select Resident</option>

                    {residents.map((resident) => (
                      <option key={resident._id} value={resident._id}>
                        {resident.name}
                        {resident.buildingName ? ` — ${resident.buildingName}` : ""}
                        {resident.roomNo ? `, Room ${resident.roomNo}` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedResident && (
                  <div className="resident-info-card">
                    <strong>{selectedResident.name}</strong>
                    <span>{selectedResident.email}</span>
                    {selectedResident.buildingName && (
                      <span>Building: {selectedResident.buildingName}</span>
                    )}
                    {selectedResident.roomNo && (
                      <span>Room / Flat: {selectedResident.roomNo}</span>
                    )}
                    {!selectedResident.buildingName && !selectedResident.roomNo && (
                      <span className="no-location">No building/room on record — ask resident to update profile</span>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>Billing Month *</label>
                  <input
                    type="month"
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Rent Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="rentAmount"
                    placeholder="Enter base rent"
                    value={formData.rentAmount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Additional Charges (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="additionalCharges"
                    placeholder="Maintenance / utilities"
                    value={formData.additionalCharges}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Fine (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    name="fine"
                    placeholder="Late fee"
                    value={formData.fine}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    placeholder="Optional notes visible in rent record"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </div>

              </div>

              <div className="total-box">
                Total: ₹{calculateTotal()}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingId ? "Update Rent" : "Create Rent"}
                </button>

                <button type="button" className="btn-cancel" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="filters-card">
          <h3>Filter Rent Records</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Resident</label>
              <select
                value={searchFilter.residentId}
                onChange={(e) => setSearchFilter((prev) => ({ ...prev, residentId: e.target.value }))}
              >
                <option value="">All Residents</option>
                {residents.map((resident) => (
                  <option key={resident._id} value={resident._id}>
                    {resident.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Status</label>
              <select
                value={searchFilter.status}
                onChange={(e) => setSearchFilter((prev) => ({ ...prev, status: e.target.value }))}
              >
                <option value="">All Status</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="records-section">

          {loading ? (
            <div className="loading-panel">Loading rent records...</div>
          ) : rentRecords.length === 0 ? (
            <div className="empty-panel">No rent records found for the current filters.</div>
          ) : (
            <div className="rent-table-wrap">
            <table className="rent-table">

              <thead>
                <tr>
                  <th>Resident</th>
                  <th>Month</th>
                  <th>Rent</th>
                  <th>Charges</th>
                  <th>Fine</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {rentRecords.map((rent) => (

                  <tr key={rent._id}>

                    <td>
                      {typeof rent.residentId === "object" ? (
                        <>
                          {rent.residentId.name}
                          {(rent.residentId.buildingName || rent.residentId.roomNo) && (
                            <small className="resident-location">
                              {rent.residentId.buildingName || "—"}
                              {rent.residentId.roomNo
                                ? `, Room ${rent.residentId.roomNo}`
                                : ""}
                            </small>
                          )}
                        </>
                      ) : (
                        rent.residentId
                      )}
                    </td>

                    <td>{rent.month}</td>

                    <td>₹{rent.rentAmount}</td>

                    <td>₹{rent.additionalCharges}</td>

                    <td>₹{rent.fine}</td>

                    <td className="total">₹{rent.totalAmount}</td>

                    <td>
                      <span className={`status-badge status-${rent.status}`}>
                        {rent.status}
                      </span>
                    </td>

                    <td>
                      {rent.dueDate
                        ? new Date(rent.dueDate).toLocaleDateString()
                        : "N/A"}
                    </td>

                    <td>

                      <button
                        className="btn-edit"
                        onClick={() => handleEdit(rent)}
                      >
                        Edit
                      </button>

                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(rent._id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>
            </div>

          )}

        </div>

      </div>
    </>
  );
}

export default AdminRentManagement;
