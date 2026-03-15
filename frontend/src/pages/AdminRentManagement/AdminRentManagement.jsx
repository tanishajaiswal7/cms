import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import toast from "react-hot-toast";
import "./AdminRentManagement.css";

function AdminRentManagement() {
  const { user } = useAuth();
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

  useEffect(() => {
    fetchResidents();
  }, []);

  useEffect(() => {
    fetchRentRecords();
  }, [searchFilter]);

  const fetchRentRecords = async () => {
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
  };

  const fetchResidents = async () => {
    try {
      const response = await axios.get("/api/users/residents");
      setResidents(response.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch residents");
    }
  };

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

      // const totalAmount = rentAmount + additionalCharges + fine;

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
    } catch (error) {
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
          <h1>📋 Rent Management</h1>

          <button
            className="btn-add-rent"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancel" : "+ Add Rent"}
          </button>
        </div>

        {showForm && (
          <div className="rent-form-card">
            <h2>{editingId ? "Edit Rent" : "Add Rent"}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">

                <select
                  name="residentId"
                  value={formData.residentId}
                  onChange={handleInputChange}
                  disabled={editingId}
                >
                  <option value="">Select Resident</option>

                  {residents.map((resident) => (
                    <option key={resident._id} value={resident._id}>
                      {resident.name}
                    </option>
                  ))}
                </select>

                <input
                  type="month"
                  name="month"
                  value={formData.month}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="rentAmount"
                  placeholder="Rent Amount"
                  value={formData.rentAmount}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="additionalCharges"
                  placeholder="Additional Charges"
                  value={formData.additionalCharges}
                  onChange={handleInputChange}
                />

                <input
                  type="number"
                  name="fine"
                  placeholder="Fine"
                  value={formData.fine}
                  onChange={handleInputChange}
                />

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                />

                <textarea
                  name="notes"
                  placeholder="Notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                />

              </div>

              <div className="total-box">
                Total: ₹{calculateTotal()}
              </div>

              <button type="submit" className="btn-submit">
                {editingId ? "Update Rent" : "Create Rent"}
              </button>

              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
            </form>
          </div>
        )}

        <div className="records-section">

          {loading ? (
            <p>Loading...</p>
          ) : rentRecords.length === 0 ? (
            <p>No records found</p>
          ) : (

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
                      {typeof rent.residentId === "object"
                        ? rent.residentId.name
                        : rent.residentId}
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

          )}

        </div>

      </div>
    </>
  );
}

export default AdminRentManagement;
