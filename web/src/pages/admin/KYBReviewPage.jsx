import { useEffect, useState } from "react";
import api from "../../services/api";

export default function KYBReviewPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchQueue = async () => {
    try {
      const res = await api.get("/admin/kyb/pending");
      setQueue(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.put(`/admin/kyb/${id}/approve`);
      setSelectedMerchant(null);
      fetchQueue();
      alert("Merchant approuvé !");
    } catch (err) {
      alert("Erreur");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Raison requise");
    try {
      await api.put(`/admin/kyb/${selectedMerchant.id}/reject`, { reason: rejectionReason });
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedMerchant(null);
      fetchQueue();
      alert("Merchant rejeté.");
    } catch (err) {
      alert("Erreur");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-brand-primary mb-6">KYB Review Queue</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {queue.map(m => (
          <div key={m.id} className="bg-white p-4 rounded shadow cursor-pointer" onClick={() => setSelectedMerchant(m)}>
            <div className="font-bold">{m.businessName}</div>
            <div className="text-sm text-slate-500">Owner: {m.ownerName}</div>
          </div>
        ))}
      </div>

      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow-xl max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{selectedMerchant.businessName}</h2>
            <div className="mt-6 flex gap-2">
              <button onClick={() => handleApprove(selectedMerchant.id)} className="bg-green-600 text-white px-4 py-2 rounded">Approuver</button>
              <button onClick={() => setShowRejectModal(true)} className="bg-red-600 text-white px-4 py-2 rounded">Rejeter</button>
              <button onClick={() => setSelectedMerchant(null)} className="ml-auto border px-4 py-2 rounded">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
