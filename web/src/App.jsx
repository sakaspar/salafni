import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import MerchantLoginPage from "./pages/merchant/MerchantLoginPage";
import MerchantDashboardPage from "./pages/merchant/MerchantDashboardPage";
import ClientRegisterPage from "./pages/client/ClientRegisterPage";
import ClientLoginPage from "./pages/client/ClientLoginPage";
import ClientDashboardPage from "./pages/client/ClientDashboardPage";
import ClientPublicLandingPage from "./pages/client/ClientPublicLandingPage";
import ClientKycPage from "./pages/client/ClientKycPage";

const Protected = ({ role, children }) => {
  const token = localStorage.getItem("salafni_token");
  const currentRole = localStorage.getItem("salafni_role");
  if (!token || currentRole !== role) {
    const fallback = role === "ADMIN" ? "/admin" : role === "MERCHANT" ? "/merchant" : "/client/login";
    return <Navigate to={fallback} replace />;
  }
  return children;
};

function Landing() {
  return <ClientPublicLandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <Protected role="ADMIN">
            <AdminDashboardPage />
          </Protected>
        }
      />
      <Route path="/merchant" element={<MerchantLoginPage />} />
      <Route
        path="/merchant/dashboard"
        element={
          <Protected role="MERCHANT">
            <MerchantDashboardPage />
          </Protected>
        }
      />
      <Route path="/client/register" element={<ClientRegisterPage />} />
      <Route path="/client/login" element={<ClientLoginPage />} />
      <Route path="/client" element={<ClientPublicLandingPage />} />
      <Route
        path="/client/dashboard"
        element={
          <Protected role="CLIENT">
            <ClientDashboardPage />
          </Protected>
        }
      />
      <Route
        path="/client/kyc"
        element={
          <Protected role="CLIENT">
            <ClientKycPage />
          </Protected>
        }
      />
    </Routes>
  );
}
