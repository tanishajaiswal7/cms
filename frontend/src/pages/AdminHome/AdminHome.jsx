import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./AdminHome.css";

function AdminHome() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="admin-home">
        <h1>Welcome to ResolveX 👋</h1>
        <p>Manage complaints and service providers efficiently</p>

        <div className="admin-actions">
          <div
            className="admin-card"
            onClick={() => navigate("/admin/complaints")}
          >
            <h3>📋 See All Complaints</h3>
            <p>View, update status, assign technicians</p>
          </div>

          <div
            className="admin-card"
            onClick={() => navigate("/admin/providers")}
          >
            <h3>🛠 Manage Service Providers</h3>
            <p>Add electricians, plumbers & maintenance staff</p>
          </div>

          <div
            className="admin-card analytics-card"
            onClick={() => navigate("/admin/analytics")}
          >
            <h3>📊 View Analytics</h3>
            <p>Track complaint trends & performance</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminHome;
