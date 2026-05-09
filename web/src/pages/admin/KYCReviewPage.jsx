import { useEffect, useState } from "react";
import api from "../../services/api";

export default function KYCReviewPage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [showModal, setShowModal] = useState(null); // 'REJECT' | 'MORE_INFO'

  const fetchQueue = async () => {
    try {
      const res = await api.get("/admin/kyc/pending");
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

  const handleApprove = async (userId) => {
    try {
      await api.put(`/admin/kyc/${userId}/approve`);
      setSelectedUser(null);
      fetchQueue();
      alert("KYC approuvé !");
    } catch (err) {
      alert("Erreur");
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) return alert("Raison requise");
    try {
      await api.put(`/admin/kyc/${selectedUser.id}/reject`, { reason: rejectionReason });
      setShowModal(null);
      setRejectionReason("");
      setSelectedUser(null);
      fetchQueue();
      alert("KYC rejeté.");
    } catch (err) {
      alert("Erreur");
    }
  };

  const handleRequestMore = async () => {
    if (!adminNote) return alert("Note requise");
    try {
      await api.put(`/admin/kyc/${selectedUser.id}/request-more`, { note: adminNote });
      setShowModal(null);
      setAdminNote("");
      setSelectedUser(null);
      fetchQueue();
      alert("Demande d'infos envoyée.");
    } catch (err) {
      alert("Erreur");
    }
  };

  const isEmployed = (occ) => occ === "EMPLOYED_PUBLIC" || occ === "EMPLOYED_PRIVATE";

  if (loading) return <div className="p-6">Chargement...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <h1 className="text-2xl font-bold text-brand-primary mb-6">KYC Review Queue</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {queue.map(u => (
          <div key={u.id} className="bg-white p-4 rounded shadow cursor-pointer" onClick={() => setSelectedUser(u)}>
            <div className="font-bold">{u.fullName}</div>
            <div className="text-sm text-slate-500">CIN: {u.nationalId}</div>
            <div className="text-sm">{u.occupation}</div>
          </div>
        ))}
      </div>

      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow-xl max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">{selectedUser.fullName}</h2>
            <div className="grid gap-4">
              {selectedUser.documents?.map(doc => (
                <div key={doc.id} className="border p-2 rounded">
                  <p className="text-xs font-bold uppercase">{doc.type}</p>
                  <img src={doc.fileUrl} alt="" className="w-20" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => handleApprove(selectedUser.id)} className="bg-green-600 text-white px-4 py-2 rounded">Approuver</button>
              <button onClick={() => setShowModal('REJECT')} className="bg-red-600 text-white px-4 py-2 rounded">Rejeter</button>
              <button onClick={() => setShowModal('MORE_INFO')} className="bg-orange-500 text-white px-4 py-2 rounded">Demander plus</button>
              <button onClick={() => setSelectedUser(null)} className="ml-auto border px-4 py-2 rounded">Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
