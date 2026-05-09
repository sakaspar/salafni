import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [modal, setModal] = useState({ type: null, data: null }); // type: 'DELETE' | 'FREEZE'
  const [freezeReason, setFreezeReason] = useState("");

  const fetchData = async () => {
    try {
      const [d, l, c] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/loans"),
        api.get(`/admin/clients?showDeleted=${showDeleted}`),
      ]);
      setDashboard(d.data.data);
      setLoans(l.data.data.items || []);
      setClients(c.data.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed loading dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [showDeleted]);

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

  const handleDelete = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce compte ? Cette action est irréversible.")) return;
    try {
      await api.delete(`/admin/clients/${selectedClient.id}`);
      setSelectedClient(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Failed to delete client");
    }
  };

  const handleFreeze = async () => {
    if (!freezeReason) return alert("Reason required");
    try {
      await api.put(`/admin/clients/${selectedClient.id}/freeze`, { reason: freezeReason });
      setModal({ type: null, data: null });
      setFreezeReason("");
      setSelectedClient(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Failed to freeze client");
    }
  };

  const handleUnfreeze = async () => {
    try {
      await api.put(`/admin/clients/${selectedClient.id}/unfreeze`);
      setSelectedClient(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error?.message || "Failed to unfreeze client");
    }
  };

  if (loading) return <div className="p-6">Loading admin dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-brand-primary">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Link to="/admin/kyc" className="px-4 py-2 bg-white shadow rounded text-sm font-medium">KYC Review</Link>
          <Link to="/admin/kyb" className="px-4 py-2 bg-white shadow rounded text-sm font-medium">KYB Review</Link>
          <Link to="/admin/support" className="px-4 py-2 bg-white shadow rounded text-sm font-medium">Support</Link>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-6">
        <Card label="Total users" value={clients.length} />
        <Card label="Active loans" value={dashboard.activeLoans} />
        <Card label="Total fees" value={`${dashboard.revenue} DT`} />
        <Card label="Defaults" value={dashboard.defaults} />
        <Card label="New users today" value={dashboard.newUsersToday} />
        <Link to="/admin/support">
          <Card label="Tickets ouverts" value={dashboard.openTickets} highlight />
        </Link>
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

      <div className="mt-8">
        <Panel title={
          <div className="flex justify-between items-center w-full">
            <span>Client Management</span>
            <label className="flex items-center gap-2 text-sm font-normal cursor-pointer">
              <input type="checkbox" checked={showDeleted} onChange={e => setShowDeleted(e.target.checked)} />
              Afficher les supprimés
            </label>
          </div>
        }>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-slate-50">
                  <th className="p-2">Name</th>
                  <th className="p-2">Tier</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-slate-50 cursor-pointer" onClick={() => setSelectedClient(c)}>
                    <td className="p-2 font-medium">{c.fullName}</td>
                    <td className="p-2">{c.creditTier}</td>
                    <td className="p-2">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="p-2">
                       <button className="text-brand-primary font-medium">Détails</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {/* Client Detail Modal */}
      {selectedClient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selectedClient.fullName}</h2>
                <p className="text-slate-500 text-sm">{selectedClient.email} | {selectedClient.phone}</p>
              </div>
              <button onClick={() => setSelectedClient(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
               <div>
                 <p className="text-xs text-slate-500 uppercase">Occupation</p>
                 <p className="font-medium">{selectedClient.occupation}</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 uppercase">Credit Score</p>
                 <p className="font-medium text-brand-primary">{selectedClient.creditScore}/100</p>
               </div>
               <div>
                 <p className="text-xs text-slate-500 uppercase">Status</p>
                 <StatusBadge status={selectedClient.status} />
               </div>
               {selectedClient.status === "FROZEN" && (
                 <div>
                   <p className="text-xs text-slate-500 uppercase">Reason for freeze</p>
                   <p className="text-sm text-blue-600 italic">"{selectedClient.frozenReason}"</p>
                 </div>
               )}
            </div>

            <div className="mt-8 flex gap-3">
              {selectedClient.status !== "DELETED" && (
                <>
                  <button
                    onClick={handleDelete}
                    className="flex-1 bg-red-600 text-white py-2 rounded font-medium hover:bg-red-700 transition"
                  >
                    Supprimer
                  </button>
                  {selectedClient.status === "FROZEN" ? (
                    <button
                      onClick={handleUnfreeze}
                      className="flex-1 bg-blue-100 text-blue-700 py-2 rounded font-medium hover:bg-blue-200 transition"
                    >
                      Dégeler
                    </button>
                  ) : (
                    <button
                      onClick={() => setModal({ type: "FREEZE", data: selectedClient })}
                      className="flex-1 bg-blue-500 text-white py-2 rounded font-medium hover:bg-blue-600 transition"
                    >
                      Geler le compte
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modal.type === "FREEZE" && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold">Geler le compte</h3>
            <p className="text-sm text-slate-600 mt-1">Veuillez indiquer la raison du gel.</p>
            <textarea
              className="w-full mt-4 border rounded p-2 text-sm"
              rows={3}
              placeholder="Raison..."
              value={freezeReason}
              onChange={e => setFreezeReason(e.target.value)}
            />
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setModal({ type: null, data: null })}
                className="flex-1 border py-2 rounded font-medium hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleFreeze}
                className="flex-1 bg-brand-primary text-white py-2 rounded font-medium hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    VERIFIED: "bg-green-100 text-green-700",
    PENDING: "bg-orange-100 text-orange-700",
    REJECTED: "bg-red-100 text-red-700",
    SUSPENDED: "bg-slate-100 text-slate-700",
    DELETED: "bg-red-600 text-white",
    FROZEN: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${styles[status] || "bg-slate-100"}`}>
      {status === "DELETED" ? "SUPPRIMÉ" : status === "FROZEN" ? "GELÉ" : status}
    </span>
  );
}

function Card({ label, value, highlight }) {
  return (
    <div className={`rounded bg-white p-3 shadow border-t-4 ${highlight ? "border-brand-primary" : "border-slate-200"}`}>
      <div className="text-xs text-slate-500 uppercase tracking-wider">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <div className="rounded bg-white p-4 shadow overflow-hidden">
      <h2 className="mb-4 text-lg font-bold text-slate-800">{title}</h2>
      {children}
    </div>
  );
}
