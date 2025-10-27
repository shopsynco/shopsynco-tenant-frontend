import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const PrivateRoute: React.FC = () => {
  // Get token from Redux or localStorage
  const accessToken =
    useAppSelector((state) => state.auth.accessToken) ||
    localStorage.getItem("accessToken");

  // If token exists, allow access to children
  if (accessToken) return <Outlet />;

  // Else redirect to login
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
