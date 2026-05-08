import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../../services/api";

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loans, setLoans] = useState([]);
  const [clients, setClients] = useState([]);
  const [kycQueue, setKycQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const [d, l, c, k] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/admin/loans"),
          api.get("/admin/clients"),
          api.get("/admin/kyc/queue"),
        ]);
        setDashboard(d.data);
        setLoans(l.data.loans || []);
        setClients(c.data.clients || []);
        setKycQueue(k.data.documents || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed loading dashboard");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const loansPerDay = useMemo(() => {
    const map = {};
    loans.forEach((loan) => {
      const day = (loan.createdAt || "").slice(5, 10);
      map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([day, count]) => ({ day, count }));
  }, [loans]);

  const revenueByWeek = useMemo(() => {
    const map = {};
    loans.forEach((loan) => {
      const week = `${new Date(loan.createdAt).getFullYear()}-W${Math.ceil(new Date(loan.createdAt).getDate() / 7)}`;
      if (!map[week]) map[week] = { week, fees: 0, penalties: 0 };
      map[week].fees += Number(loan.originationFee || 0);
    });
    return Object.values(map);
  }, [loans]);

  if (loading) return <div className="p-6">Loading admin dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold text-brand-primary">Admin Dashboard</h1>
      <div className="mt-4 grid gap-3 md:grid-cols-5">
        <Card label="Total users" value={clients.length} />
        <Card label="Active loans" value={dashboard.activeLoans} />
        <Card label="Total fees" value={`${dashboard.revenue} DT`} />
        <Card label="Defaults" value={dashboard.defaults} />
        <Card label="New users today" value={dashboard.newUsersToday} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Loans issued (last days)">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={loansPerDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#1B4FD8" />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Revenue by week">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByWeek}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="fees" fill="#1B4FD8" />
              <Bar dataKey="penalties" fill="#F59E0B" />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Client management">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Name</th><th>Tier</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 8).map((c) => (
                <tr key={c.id} className="border-t">
                  <td>{c.fullName}</td><td>{c.creditTier}</td><td>{c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <Panel title="KYC review queue">
          <ul className="space-y-2 text-sm">
            {kycQueue.length === 0 && <li>No pending docs.</li>}
            {kycQueue.map((d) => (
              <li key={d.id} className="rounded border p-2">
                {d.type} - user {d.userId}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded bg-white p-3 shadow">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}
