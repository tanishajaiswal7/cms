import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./ProtectedRoute.css";

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="route-loading-shell">
        <div className="route-loading-card">
          <div className="route-loading-spinner" />
          <p className="route-loading-label">Preparing your workspace</p>
          <span className="route-loading-copy">
            Loading the latest complaints, residents, and payment context.
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return children;
}

export default ProtectedRoute;
