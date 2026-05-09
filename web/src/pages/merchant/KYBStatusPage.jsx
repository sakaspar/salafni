import { useEffect, useState } from "react";
import api from "../../services/api";

export default function KYBStatusPage() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/merchant/kyb/status").then(res => setStatus(res.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">KYB Status</h1>
      <div className="inline-block px-4 py-2 rounded bg-white shadow font-bold text-blue-600">
        {status?.kybStatus}
      </div>
    </div>
  );
}
