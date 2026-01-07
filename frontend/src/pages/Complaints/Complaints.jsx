import { useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./Complaints.css";

function Complaints() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    societyName: "",
    block: "",
    roomNumber: "",
    title: "",
    description: "",
    category: "",
    otherCategoryReason: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState([]); // ✅ ARRAY

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();

      // ✅ append ALL text fields ONCE
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // ✅ append multiple images
      if (image.length > 0) {
        image.forEach((img) => {
          formData.append("images", img);
        });
      }

      await api.post("/api/complaints", formData);

      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data);
      setError(err.response?.data?.error || "Failed to raise complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="complaint-container">
        <h2>Raise a Complaint</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit} className="complaint-form">
          <input
            type="text"
            name="title"
            placeholder="Complaint title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="societyName"
            placeholder="Society / Colony Name"
            value={form.societyName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="block"
            placeholder="Apartment / Block Name (optional)"
            value={form.block}
            onChange={handleChange}
          />

          <input
            type="text"
            name="roomNumber"
            placeholder="Flat / Room Number"
            value={form.roomNumber}
            onChange={handleChange}
            required
          />

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Electricity">Electricity</option>
            <option value="Water">Water</option>
            <option value="Other">Other</option>
          </select>

          {form.category === "Other" && (
            <textarea
              name="otherCategoryReason"
              placeholder="Please describe the issue"
              value={form.otherCategoryReason}
              onChange={handleChange}
              required
            />
          )}

          <textarea
            name="description"
            placeholder="Describe your issue in detail"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImage([...e.target.files])}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </div>
    </>
  );
}

export default Complaints;
