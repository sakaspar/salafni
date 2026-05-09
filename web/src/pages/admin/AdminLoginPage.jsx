import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@salafni.tn");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/admin/login", { email, password });
      // Standardized response shape is { success: true, data: { accessToken, ... } }
      const { accessToken } = res.data.data;
      localStorage.setItem("salafni_token", accessToken);
      localStorage.setItem("salafni_role", "ADMIN");
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-md rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold text-brand-primary">Admin Login</h1>
      <form className="mt-6 space-y-4" onSubmit={submit}>
        <input className="w-full rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          className="w-full rounded border p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-brand-primary p-2 text-white" disabled={loading}>
          {loading ? "Loading..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
