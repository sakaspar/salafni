import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function KYBSubmissionPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: "", registrationNumber: "", businessAddress: "", businessPhone: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/merchant/kyb/upload", form);
      navigate("/merchant/kyb/status");
    } catch (err) {
      alert("Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">KYB Submission</h1>
        <input placeholder="Business Name" value={form.businessName} onChange={e => setForm({...form, businessName: e.target.value})} className="w-full border mb-2 p-2" required />
        <input placeholder="Registration Number" value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})} className="w-full border mb-2 p-2" required />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded">Soumettre</button>
      </form>
    </div>
  );
}
