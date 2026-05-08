import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function ClientRegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    nationalId: "",
    email: "",
    password: "",
    occupation: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/client/register", form);
      navigate("/client/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-12 max-w-lg rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold text-brand-primary">Client Registration</h1>
      <form onSubmit={submit} className="mt-5 grid gap-3">
        {[
          ["fullName", "Full name"],
          ["phone", "Phone"],
          ["nationalId", "CIN"],
          ["email", "Email"],
          ["occupation", "Occupation"],
        ].map(([k, label]) => (
          <input
            key={k}
            className="rounded border p-2"
            placeholder={label}
            value={form[k]}
            onChange={(e) => setForm((p) => ({ ...p, [k]: e.target.value }))}
          />
        ))}
        <input
          type="password"
          className="rounded border p-2"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="rounded bg-brand-primary px-4 py-2 text-white">
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/client/login" className="text-brand-primary underline">
          Login
        </Link>
      </p>
    </div>
  );
}
