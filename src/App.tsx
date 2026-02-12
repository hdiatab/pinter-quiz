import { Route, Routes, useLocation } from "react-router-dom";

import LoginPage from "./pages/Login";
import HomePage from "./pages/Home";
import LandingPage from "./pages/Landing";

import ProtectedRoute from "./components/protected-route";
import DefaultLayout from "./layouts/default";
import AuthLayout from "./layouts/auth";
import RegisterPage from "./pages/Register";
import AccountPage from "./pages/Account";
import { useSelector } from "react-redux";
import DashboardLayout from "./layouts/dashboard";
import QuizPage from "./pages/Quiz";
import ResultPage from "./pages/QuizResult";
import Leaderboard from "./pages/Leaderboard";
import StartQuizPage from "./pages/StartQuiz";
import NotFoundSection from "./pages/NotFound";
import SettingPage from "./pages/Setting";

export default function App() {
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const location = useLocation();

  const breadcrumbs = location.pathname
    .split("?")[0]
    .split("#")[0]
    .split("/")
    .filter(Boolean)
    .map((seg, idx, arr) => {
      const href = "/" + arr.slice(0, idx + 1).join("/");
      const label = decodeURIComponent(seg)
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label, href };
    });
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
        <Route element={<DashboardLayout breadcrumbs={breadcrumbs} />}>
          <Route path="account" element={<AccountPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="quiz/result" element={<ResultPage />} />
          <Route path="leaderboards" element={<Leaderboard />} />
          <Route path="start-quiz" element={<StartQuizPage />} />
          <Route path="settings" element={<SettingPage />} />
        </Route>
      </Route>
      <Route path="*" element={<DefaultLayout />}>
        <Route path="*" element={<NotFoundSection />} />
      </Route>
    </Routes>
  );
}
