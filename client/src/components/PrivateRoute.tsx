import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useAuth();

  if (!token) {
    // return <Navigate to="/login" replace />;
    return <><button>Login</button></>
  }

  return <>{children}</>;
}

