import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import "./AdminHome.css";

function AdminHome() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar />

      <div className="admin-home">
        <section className="admin-hero-card">
          <div className="page-intro">
            <span className="page-kicker">Admin Command Center</span>
            <h1 className="page-title">Run your complaint management operations from one dashboard.</h1>
            <p className="page-subtitle">
              Track complaints, coordinate providers, maintain resident records, and oversee rent workflows with a consistent admin experience.
            </p>
          </div>

          <div className="insight-strip">
            <article className="insight-tile">
              <span className="insight-label">Operations</span>
              <strong className="insight-value">Complaints</strong>
            </article>
            <article className="insight-tile">
              <span className="insight-label">Coverage</span>
              <strong className="insight-value">Residents</strong>
            </article>
            <article className="insight-tile">
              <span className="insight-label">Finance</span>
              <strong className="insight-value">Rent Tracking</strong>
            </article>
          </div>
        </section>

        <div className="admin-actions">
          <div
            className="admin-card"
            onClick={() => navigate("/admin/complaints")}
          >
            <h3>Complaint Desk</h3>
            <p>Review tickets, assign technicians, and send resident updates.</p>
          </div>

          <div
            className="admin-card"
            onClick={() => navigate("/admin/providers")}
          >
            <h3>Provider Network</h3>
            <p>Maintain your active electricians, plumbers, and maintenance staff.</p>
          </div>

          <div
            className="admin-card"
            onClick={() => navigate("/admin/residents")}
          >
            <h3>Resident Directory</h3>
            <p>Control the active resident list used across complaints and rent records.</p>
          </div>

          <div
            className="admin-card"
            onClick={() => navigate("/admin/rent")}
          >
            <h3>Rent Operations</h3>
            <p>Create monthly rent records, add fines, and monitor payment status.</p>
          </div>

          <div
            className="admin-card analytics-card"
            onClick={() => navigate("/admin/analytics")}
          >
            <h3>Performance Analytics</h3>
            <p>Spot category trends, pending alerts, and resolution-time signals.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminHome;
