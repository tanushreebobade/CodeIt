import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router";
import PageLoader from "./PageLoader";

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    const redirectTo = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
