import { Navigate, Outlet } from "react-router";

function ProtectedRoute({ condition, target }: { condition: boolean; target: string }) {
  return condition ? <Outlet /> : <Navigate to={target} replace />;
}

export default ProtectedRoute;
