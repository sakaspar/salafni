import { Link, Navigate, Route, Routes } from "react-router-dom";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import KYCReviewPage from "./pages/admin/KYCReviewPage";
import KYBReviewPage from "./pages/admin/KYBReviewPage";
import SupportManagementPage from "./pages/admin/SupportManagementPage";
import MerchantLoginPage from "./pages/merchant/MerchantLoginPage";
import MerchantDashboardPage from "./pages/merchant/MerchantDashboardPage";
import KYBSubmissionPage from "./pages/merchant/KYBSubmissionPage";
import KYBStatusPage from "./pages/merchant/KYBStatusPage";
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
      <Route
        path="/admin/kyc"
        element={
          <Protected role="ADMIN">
            <KYCReviewPage />
          </Protected>
        }
      />
      <Route
        path="/admin/kyb"
        element={
          <Protected role="ADMIN">
            <KYBReviewPage />
          </Protected>
        }
      />
      <Route
        path="/admin/support"
        element={
          <Protected role="ADMIN">
            <SupportManagementPage />
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
      <Route
        path="/merchant/kyb/upload"
        element={
          <Protected role="MERCHANT">
            <KYBSubmissionPage />
          </Protected>
        }
      />
      <Route
        path="/merchant/kyb/status"
        element={
          <Protected role="MERCHANT">
            <KYBStatusPage />
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
