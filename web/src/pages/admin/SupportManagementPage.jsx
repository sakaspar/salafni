import { useEffect, useState } from "react";
import api from "../../services/api";

export default function SupportManagementPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reply, setReply] = useState("");
  const [filters, setFilters] = useState({ status: "", priority: "", category: "" });

  const fetchTickets = async () => {
    const params = new URLSearchParams(filters).toString();
    try {
      const res = await api.get(`/support/admin/tickets?${params}`);
      setTickets(res.data.data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  const handleSendReply = async () => {
    if (!reply) return;
    try {
      await api.post(`/support/tickets/${selectedTicket.id}/message`, { message: reply });
      setReply("");
      const res = await api.get(`/support/tickets/${selectedTicket.id}`);
      setSelectedTicket(res.data.data.ticket);
      fetchTickets();
    } catch (err) {
      alert("Erreur");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-brand-primary mb-6">Support Management</h1>
      <table className="w-full bg-white rounded shadow overflow-hidden">
        <thead>
          <tr className="bg-slate-100 text-left">
            <th className="p-2">Sujet</th><th className="p-2">Catégorie</th><th className="p-2">Statut</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(t => (
            <tr key={t.id} className="border-t cursor-pointer" onClick={() => setSelectedTicket(t)}>
              <td className="p-2">{t.subject}</td><td className="p-2">{t.category}</td><td className="p-2">{t.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow-xl max-w-4xl w-full h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">{selectedTicket.subject}</h2>
            <div className="flex-1 overflow-y-auto border-y py-4">
              {selectedTicket.messages?.map((m, i) => (
                <div key={i} className={`mb-2 ${m.senderRole === "ADMIN" ? "text-right" : ""}`}>
                  <div className={`inline-block p-2 rounded ${m.senderRole === "ADMIN" ? "bg-blue-600 text-white" : "bg-slate-100"}`}>
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input value={reply} onChange={e => setReply(e.target.value)} className="flex-1 border p-2 rounded" />
              <button onClick={handleSendReply} className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
              <button onClick={() => setSelectedTicket(null)} className="border px-4 py-2 rounded">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
