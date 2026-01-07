import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // role-based protection
  if (role && user.role !== role) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

export default ProtectedRoute;
