import { Route, Routes } from "react-router-dom";

import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import LandingPage from "./pages/Landing";

import ProtectedRoute from "./components/protected-route";
import DefaultLayout from "./layouts/default";
import AuthLayout from "./layouts/auth";
import RegisterPage from "./pages/Register";
import ProfilePage from "./pages/Profile";
import { useSelector } from "react-redux";

export default function App() {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<LandingPage />} />
      </Route>
      <Route element={<ProtectedRoute condition={!isAuthenticated} target="/" />}>
        <Route
          path="login"
          element={
            <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="register"
          element={
            <AuthLayout title="Create an account" description="Enter your details below to create your account">
              <RegisterPage />
            </AuthLayout>
          }
        />
      </Route>
      <Route element={<ProtectedRoute condition={isAuthenticated} target="/" />}>
        <Route element={<DefaultLayout />}>
          <Route path="profile" element={<ProfilePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
        </Route>
      </Route>
      <Route path="*" element={<DefaultLayout />}>
        <Route path="*" element={<h1>404</h1>} />
      </Route>
    </Routes>
  );
}
