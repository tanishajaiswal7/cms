import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import "./ForgotPassword.css";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !newPassword || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await api.post(
        "/api/auth/reset-password",
        {
          email: email.trim().toLowerCase(),
          newPassword,
          confirmPassword,
        },
        {
          headers: { Authorization: "" }, // ❌ no token
        }
      );

      alert("Password updated successfully. Please login.");
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-container">
      <h1>ResolveX</h1>

      <form className="forgot-card" onSubmit={handleResetPassword}>
        <h2>Reset Password</h2>
        <p>Enter your email and new password</p>

        {error && <div className="error">{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/")}
        >
          Back to Login
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword;
