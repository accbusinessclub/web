import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { AdminLogin } from "./admin/AdminLogin";
import { AdminApp } from "./admin/AdminApp";
import { HomePage } from "./HomePage";
import { AlumniPage } from "./AlumniPage";
import { NotFoundPage } from "./NotFoundPage";
import { TeachersPage } from "./TeachersPage";
import { AdvisorsPage } from "./AdvisorsPage";

function AdminGuard() {
  const token = sessionStorage.getItem("admin_token");
  return token ? <AdminApp /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/alumni" element={<AlumniPage />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/advisors" element={<AdvisorsPage />} />
        <Route path="/admin" element={<AdminGuard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
