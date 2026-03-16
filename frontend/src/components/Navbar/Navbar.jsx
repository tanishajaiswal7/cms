import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navLinkClassName = ({ isActive }) =>
    isActive ? "nav-link is-active" : "nav-link";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="brand-lockup" onClick={() => navigate(user?.role === "admin" ? "/admin" : "/dashboard") }>
          <div className="brand-mark">RX</div>
          <div className="brand-copy">
            <h2 className="logo">ResolveX</h2>
            <span className="brand-tagline">Complaint Management Suite</span>
          </div>
        </div>

        {user?.role === "admin" && (
          <div className="nav-links">
            <NavLink to="/admin" className={navLinkClassName} end>
              Home
            </NavLink>
            <NavLink to="/admin/complaints" className={navLinkClassName}>
              Complaints
            </NavLink>
            <NavLink to="/admin/providers" className={navLinkClassName}>
              Providers
            </NavLink>
            <NavLink to="/admin/residents" className={navLinkClassName}>
              Residents
            </NavLink>
            <NavLink to="/admin/rent" className={navLinkClassName}>
              Rent
            </NavLink>
            <NavLink to="/admin/analytics" className={navLinkClassName}>
              Analytics
            </NavLink>
          </div>
        )}

        {user?.role === "resident" && (
          <div className="nav-links">
            <NavLink to="/dashboard" className={navLinkClassName}>
              My Complaints
            </NavLink>
            <NavLink to="/complaints/new" className={navLinkClassName}>
              Raise Complaint
            </NavLink>
            <NavLink to="/pay-rent" className={navLinkClassName}>
              Rent Payments
            </NavLink>
          </div>
        )}
      </div>

      <div className="navbar-right">
        {user && (
          <>
            <span className="role-pill">
              {user.role === "admin" ? "Admin Desk" : "Resident Portal"}
            </span>
            <span className="user-name">Hi, {user.name}</span>
            <NavLink to="/profile" className="profile-link">
              Profile
            </NavLink>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
