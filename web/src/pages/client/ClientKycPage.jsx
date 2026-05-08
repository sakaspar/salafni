import { useEffect, useState } from "react";
import api from "../../services/api";

export default function ClientKycPage() {
  const [documents, setDocuments] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadStatus = async () => {
    try {
      const { data } = await api.get("/client/kyc/status");
      setDocuments(data.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed loading KYC status");
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!files.length) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append("documents", f));
      await api.post("/client/kyc/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("KYC uploaded successfully.");
      await loadStatus();
    } catch (err) {
      setError(err.response?.data?.message || "KYC upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-2xl font-semibold text-brand-primary">KYC Verification</h1>
      <p className="mt-2 text-sm text-slate-600">
        Upload CIN front/back, selfie, and proof of occupation.
      </p>

      <form onSubmit={submit} className="mt-5 rounded bg-white p-4 shadow">
        <input type="file" multiple onChange={(e) => setFiles(e.target.files)} />
        <button
          type="submit"
          disabled={loading}
          className="ml-3 rounded bg-brand-primary px-4 py-2 text-white"
        >
          {loading ? "Uploading..." : "Upload documents"}
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-700">{success}</p>}

      <div className="mt-6 rounded bg-white p-4 shadow">
        <h2 className="mb-3 text-lg font-semibold">KYC status</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th>Type</th><th>Status</th><th>Reviewed by</th><th>Created</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((d) => (
              <tr key={d.id} className="border-t">
                <td>{d.type}</td>
                <td>{d.status}</td>
                <td>{d.reviewedBy || "-"}</td>
                <td>{new Date(d.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
