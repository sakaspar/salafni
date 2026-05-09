import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function ClientDashboardPage() {
  const [me, setMe] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, loansRes] = await Promise.all([api.get("/client/me"), api.get("/loans/my")]);
        setMe(profileRes.data.data.user);
        setLoans(loansRes.data.data.loans || []);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load client dashboard");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Loading client portal...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold text-brand-primary">Client Portal</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Card label="Name" value={me.fullName} />
        <Card label="Tier" value={me.creditTier} />
        <Card label="Score" value={me.creditScore} />
        <Card label="Status" value={me.status} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link to="/client/kyc" className="rounded bg-brand-primary px-4 py-2 text-sm text-white">
          KYC verification
        </Link>
        <Link to="/client/register" className="rounded border px-4 py-2 text-sm">
          Open public signup page
        </Link>
      </div>

      <div className="mt-6 rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">My loans</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Loan</th><th>Amount</th><th>Status</th><th>Weekly</th><th>Due date</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr key={loan.id} className="border-t">
                <td>{loan.id}</td>
                <td>{loan.amount} DT</td>
                <td>{loan.status}</td>
                <td>{loan.weeklyPayment} DT</td>
                <td>{loan.dueDate ? new Date(loan.dueDate).toLocaleDateString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded bg-white p-3 shadow">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
