import { Navigate, useLocation } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const token = localStorage.getItem("token"); // temporal

  if (!token) return <Navigate to="/" replace state={{ from: location }} />;

  return children;
};
