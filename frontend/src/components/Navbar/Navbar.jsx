import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LEFT */}
      <div className="navbar-left">
        <h2 className="logo">ResolveX</h2>

        {/* ADMIN LINKS */}
        {user?.role === "admin" && (
          <div className="nav-links">
            <Link to="/admin">Home</Link>
            <Link to="/admin/complaints">Complaints</Link>
            <Link to="/admin/providers">Providers</Link>
            <Link to="/admin/rent">Rent Management</Link>
            <Link to="/admin/analytics">Analytics</Link>
          </div>
        )}

        {/* RESIDENT LINKS */}
        {user?.role === "resident" && (
          <div className="nav-links">
  
            <Link to="/dashboard">My Complaints</Link>
            <Link to="/complaints/new">Raise Complaint</Link>
            <Link to="/pay-rent">Pay Your Rent</Link>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="navbar-right">
        {user && (
          <>
            <span className="user-name">Hi, {user.name}</span>
            <Link to="/profile" className="profile-link">
              Profile
            </Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
