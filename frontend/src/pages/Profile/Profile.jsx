import { useEffect, useState } from "react";
import api from "../../api/axios";
import "./Profile.css";
import Navbar from "../../components/Navbar/Navbar";
import toast from "react-hot-toast";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    buildingName: "",
    roomNo: "",
    role: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError(null);
        const res = await api.get("/api/users/me");
        setForm(res.data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || "Failed to load profile";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    try {
      // Validation
      if (form.phone && form.phone.length !== 10) {
        toast.error("Phone number must be 10 digits");
        return;
      }

      if (form.phone && !/^\d+$/.test(form.phone)) {
        toast.error("Phone number must contain only digits");
        return;
      }

      // Save profile
      await api.put("/api/users/me", {
        phone: form.phone,
        address: form.address,
        buildingName: form.buildingName,
        roomNo: form.roomNo,
      });

      toast.success("Profile updated successfully");
      setEditMode(false);
      setError(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <p style={{ padding: "2rem" }}>Loading profile...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="profile-container">
        <div className="page-intro profile-intro">
          <span className="page-kicker">Account Details</span>
          <h2 className="page-title">Keep your resident profile accurate.</h2>
          <p className="page-subtitle">
            Your building and room details are used across complaints, resident management, and rent workflows.
          </p>
        </div>

        {error && <p style={{ color: "red", padding: "1rem", marginBottom: "1rem" }}>{error}</p>}

        <div className="profile-card">
          <div className="profile-row">
            <label>Name</label>
            <input value={form.name} disabled />
          </div>

          <div className="profile-row">
            <label>Email</label>
            <input value={form.email} disabled />
          </div>

          <div className="profile-row">
            <label>Role</label>
            <input value={form.role} disabled />
          </div>

          <div className="profile-row">
            <label>Phone</label>
            <input
              value={form.phone || ""}
              disabled={!editMode}
              placeholder="10 digit number"
              maxLength={10}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          <div className="profile-row">
            <label>Address</label>
            <textarea
              value={form.address || ""}
              disabled={!editMode}
              placeholder="Enter address"
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>

          <div className="profile-row">
            <label>Building Name</label>
            <input
              value={form.buildingName || ""}
              disabled={!editMode}
              placeholder="e.g. Block A, Tower 2"
              onChange={(e) =>
                setForm({ ...form, buildingName: e.target.value })
              }
            />
          </div>

          <div className="profile-row">
            <label>Room / Flat No</label>
            <input
              value={form.roomNo || ""}
              disabled={!editMode}
              placeholder="e.g. 101, 4B"
              onChange={(e) =>
                setForm({ ...form, roomNo: e.target.value })
              }
            />
          </div>

          {!editMode ? (
            <button onClick={() => setEditMode(true)}>
              Edit Profile
            </button>
          ) : (
            <div className="profile-actions">
              <button className="save-btn" onClick={saveProfile}>
                Save Changes
              </button>
              <button
                className="cancel-btn"
                onClick={() => setEditMode(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default Profile;
