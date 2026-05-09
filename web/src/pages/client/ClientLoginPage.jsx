import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("ahmed@salafni.tn");
  const [password, setPassword] = useState("Client123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/client/login", { email, password });
      const { accessToken } = res.data.data;
      localStorage.setItem("salafni_token", accessToken);
      localStorage.setItem("salafni_role", "CLIENT");
      navigate("/client/dashboard");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold text-brand-primary">Client Login</h1>
      <form className="mt-5 grid gap-3" onSubmit={submit}>
        <input className="rounded border p-2" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          className="rounded border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-brand-primary px-4 py-2 text-white">
          {loading ? "Loading..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        New here?{" "}
        <Link to="/client/register" className="text-brand-primary underline">
          Register
        </Link>
      </p>
    </div>
  );
}
