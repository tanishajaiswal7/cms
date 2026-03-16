import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axios";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    buildingName: "",
    roomNo: "",
    role: "resident",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        ...form,
        role: form.role.toLowerCase(),
      });

      // ✅ store token
      localStorage.setItem("accessToken", res.data.accessToken);

      // ✅ set logged-in user
      login(res.data.user);

      // ✅ redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="auth-brand-block">
        <span className="auth-kicker">Resident Registration</span>
        <h1 className="brand-title">ResolveX</h1>
        <p className="auth-subtitle">Create your resident account to raise complaints and track rent records.</p>
      </div>

      <div className="register-card">
        <h2>Create Account</h2>
        <p>Register to access your complaint dashboard and payment portal.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="buildingName"
            placeholder="Building Name (e.g. Block A, Tower 2)"
            value={form.buildingName}
            onChange={handleChange}
          />

          <input
            type="text"
            name="roomNo"
            placeholder="Room / Flat No (e.g. 101, 4B)"
            value={form.roomNo}
            onChange={handleChange}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        {/* 👇 NEW LOGIN LINK */}
        <p className="login-link">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
