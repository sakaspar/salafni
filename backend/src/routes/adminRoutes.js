import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  findById,
  findWhere,
  readCollection,
  updateOne,
  writeCollection,
} from "../db/dataLake.js";
import { approveLoanAndGenerateSchedule } from "./loanRoutes.js";
import { nowIso } from "../utils.js";

const router = express.Router();
router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", (_req, res) => {
  const loans = readCollection("loans.json");
  const users = readCollection("users.json");
  const repayments = readCollection("repayments.json");
  const today = new Date().toISOString().slice(0, 10);
  const revenue = loans.reduce((sum, l) => sum + Number(l.originationFee || 0), 0);
  const penalties = repayments.reduce((sum, r) => sum + Number(r.latePenalty || 0), 0);

  return res.json({
    totalLoans: loans.length,
    activeLoans: loans.filter((l) => l.status === "ACTIVE").length,
    defaults: loans.filter((l) => l.status === "DEFAULTED").length,
    revenue: Number((revenue + penalties).toFixed(2)),
    newUsersToday: users.filter((u) => (u.createdAt || "").startsWith(today)).length,
  });
});

router.get("/clients", (req, res) => {
  const { tier, status, q } = req.query;
  let users = readCollection("users.json");
  if (tier) users = users.filter((u) => u.creditTier === tier);
  if (status) users = users.filter((u) => u.status === status);
  if (q) {
    const query = String(q).toLowerCase();
    users = users.filter((u) => u.fullName.toLowerCase().includes(query) || u.phone.includes(query));
  }
  res.json({ clients: users });
});

router.get("/clients/:id", (req, res) => {
  const user = findById("users.json", req.params.id);
  if (!user) return res.status(404).json({ message: "Client not found" });
  res.json({
    profile: user,
    loans: findWhere("loans.json", (l) => l.userId === user.id),
    kycDocs: findWhere("kyc_documents.json", (d) => d.userId === user.id),
  });
});

router.put("/clients/:id/verify", (req, res) =>
  res.json({ user: updateOne("users.json", req.params.id, { status: "VERIFIED", updatedAt: nowIso() }) })
);
router.put("/clients/:id/reject", (req, res) =>
  res.json({ user: updateOne("users.json", req.params.id, { status: "REJECTED", updatedAt: nowIso() }) })
);
router.put("/clients/:id/suspend", (req, res) =>
  res.json({ user: updateOne("users.json", req.params.id, { status: "SUSPENDED", updatedAt: nowIso() }) })
);

router.get("/loans", (req, res) => {
  let loans = readCollection("loans.json");
  if (req.query.status) loans = loans.filter((l) => l.status === req.query.status);
  res.json({ loans });
});

router.put("/loans/:id/approve", (req, res) => {
  const loan = approveLoanAndGenerateSchedule(req.params.id, req.user.sub);
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  return res.json({ loan });
});

router.put("/loans/:id/reject", (req, res) => {
  const loan = updateOne("loans.json", req.params.id, { status: "REJECTED", reviewedBy: req.user.sub });
  if (!loan) return res.status(404).json({ message: "Loan not found" });
  return res.json({ loan });
});

router.get("/merchants", (_req, res) => {
  res.json({ merchants: readCollection("merchants.json") });
});

router.put("/merchants/:id/approve", (req, res) => {
  const merchant = updateOne("merchants.json", req.params.id, { status: "ACTIVE" });
  if (!merchant) return res.status(404).json({ message: "Merchant not found" });
  res.json({ merchant });
});

router.get("/revenue", (_req, res) => {
  const loans = readCollection("loans.json");
  const repayments = readCollection("repayments.json");
  const feeTotal = loans.reduce((sum, l) => sum + Number(l.originationFee || 0), 0);
  const penaltyTotal = repayments.reduce((sum, r) => sum + Number(r.latePenalty || 0), 0);
  res.json({
    totalFees: feeTotal,
    totalPenalties: penaltyTotal,
    byDay: {},
    byWeek: {},
    byMonth: {},
  });
});

router.get("/kyc/queue", (_req, res) => {
  res.json({ documents: findWhere("kyc_documents.json", (doc) => doc.status === "PENDING") });
});

router.put("/kyc/:id/approve", (req, res) => {
  const doc = updateOne("kyc_documents.json", req.params.id, { status: "APPROVED", reviewedBy: req.user.sub });
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json({ document: doc });
});

router.put("/kyc/:id/reject", (req, res) => {
  const doc = updateOne("kyc_documents.json", req.params.id, { status: "REJECTED", reviewedBy: req.user.sub });
  if (!doc) return res.status(404).json({ message: "Document not found" });
  res.json({ document: doc });
});

export default router;
