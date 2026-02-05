import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import LandingPage from "./pages/Landing";

import ProtectedRoute from "./components/protected-route";

export default function App() {
  return (
    <Routes>
      {/* landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* public */}
      <Route path="/login" element={<LoginPage />} />

      {/* protected */}
      <Route path="/dashboard" element={<DashboardPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
