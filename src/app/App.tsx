import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminApp } from "./admin/AdminApp";
import { HomePage } from "./HomePage";

function AdminGuard() {
  const token = sessionStorage.getItem("admin_token");
  return token ? <AdminApp /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminGuard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
      </Routes>
    </BrowserRouter>
  );
}
