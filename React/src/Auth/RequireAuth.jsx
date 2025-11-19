// src/Auth/RequireAuth.jsx
import React from "react";
import { Navigate } from "react-router-dom";

function getCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  if (!token || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  return children;   // ⭐ สำคัญมาก!!
}

export function RequireRole({ allowRoles, children }) {
  const token = localStorage.getItem("token");
  const user = getCurrentUser();

  if (!token || !user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  // บังคับเป็น string
  const role = String(user.role_id);

  // ไม่อนุญาต
  if (!allowRoles.includes(role)) {
    if (role === "1") return <Navigate to="/admin/dashboard" replace />;
    if (role === "2") return <Navigate to="/instructor/dashboard" replace />;
    if (role === "3") return <Navigate to="/student" replace />;
    return <Navigate to="/" replace />;
  }

  return children;   // ⭐ สำคัญที่สุด!!!!
}
