import { Navigate } from "react-router-dom";
import { useAdminAccess } from "../hooks/useAdminAccess";

export default function AdminRoute({ children }) {
  const { loggedIn } = useAdminAccess();

  if (!loggedIn) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
