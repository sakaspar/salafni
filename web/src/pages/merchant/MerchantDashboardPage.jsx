import { useEffect, useState } from "react";
import api from "../../services/api";

export default function MerchantDashboardPage() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const [s, t, p] = await Promise.all([
          api.get("/merchant/stats"),
          api.get("/merchant/transactions"),
          api.get("/merchant/me"),
        ]);
        setStats(s.data);
        setTransactions(t.data.transactions || []);
        setProfile(p.data.merchant);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed loading merchant data");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) return <div className="p-6">Loading merchant dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-brand-accent">Merchant Dashboard</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <Stat label="Total sales" value={`${stats.totalVolume} DT`} />
        <Stat label="Transactions" value={stats.totalTransactions} />
        <Stat label="Pending loans" value={stats.pendingLoans} />
        <Stat label="Active loans" value={stats.activeLoans} />
      </div>

      <div className="mt-6 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-semibold">Transactions</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Client ID</th><th>Amount</th><th>Status</th><th>Date</th><th>Weekly</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr className="border-t" key={tx.id}>
                <td>{tx.userId}</td>
                <td>{tx.amount} DT</td>
                <td>{tx.status}</td>
                <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                <td>{tx.weeklyPayment} DT</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded bg-white p-4 shadow">
        <h2 className="mb-2 text-lg font-semibold">Profile & settings</h2>
        <p><strong>{profile.businessName}</strong> - {profile.category}</p>
        <p>{profile.email}</p>
        <p>{profile.phone}</p>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded bg-white p-3 shadow">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
