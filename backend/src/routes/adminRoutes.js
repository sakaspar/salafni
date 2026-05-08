import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  findById,
  findWhere,
  readCollection,
  updateOne,
} from "../db/dataLake.js";
import { approveLoanAndGenerateSchedule } from "./loanRoutes.js";
import { apiSuccess, apiError, nowIso, paginate } from "../utils.js";
import { createNotification } from "../services/notificationService.js";

const router = express.Router();
router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", (_req, res) => {
  const loans = readCollection("loans.json");
  const users = readCollection("users.json");
  const repayments = readCollection("repayments.json");
  const tickets = readCollection("support_tickets.json");
  const today = new Date().toISOString().slice(0, 10);
  const revenue = loans.reduce((sum, l) => sum + Number(l.originationFee || 0), 0);
  const penalties = repayments.reduce((sum, r) => sum + Number(r.latePenalty || 0), 0);

  return res.json(apiSuccess({
    totalLoans: loans.length,
    activeLoans: loans.filter((l) => l.status === "ACTIVE").length,
    defaults: loans.filter((l) => l.status === "DEFAULTED").length,
    revenue: Number((revenue + penalties).toFixed(2)),
    newUsersToday: users.filter((u) => (u.createdAt || "").startsWith(today)).length,
    openTickets: tickets.filter(t => t.status === "OPEN").length
  }));
});

router.get("/clients", (req, res) => {
  const { tier, status, q, showDeleted, page, limit } = req.query;
  let users = readCollection("users.json");

  if (showDeleted !== "true") {
    users = users.filter((u) => u.status !== "DELETED");
  }

  if (tier) users = users.filter((u) => u.creditTier === tier);
  if (status) users = users.filter((u) => u.status === status);
  if (q) {
    const query = String(q).toLowerCase();
    users = users.filter((u) => u.fullName.toLowerCase().includes(query) || u.phone.includes(query));
  }

  res.json(apiSuccess(paginate(users, page, limit)));
});

router.get("/clients/:id", (req, res) => {
  const user = findById("users.json", req.params.id);
  if (!user) return res.status(404).json(apiError("CLIENT_NOT_FOUND", "Client not found"));
  res.json(apiSuccess({
    profile: user,
    loans: findWhere("loans.json", (l) => l.userId === user.id),
    kycDocs: findWhere("kyc_documents.json", (d) => d.userId === user.id),
  }));
});

router.delete("/clients/:id", (req, res) => {
  const user = updateOne("users.json", req.params.id, {
    status: "DELETED",
    deletedAt: nowIso(),
    updatedAt: nowIso()
  });
  if (!user) return res.status(404).json(apiError("CLIENT_NOT_FOUND", "Client not found"));
  res.json(apiSuccess({ user }));
});

router.put("/clients/:id/freeze", (req, res) => {
  const { reason } = req.body;
  if (!reason) return res.status(400).json(apiError("MISSING_REASON", "Freeze reason is required"));

  const user = updateOne("users.json", req.params.id, {
    status: "FROZEN",
    frozenReason: reason,
    frozenAt: nowIso(),
    updatedAt: nowIso()
  });
  if (!user) return res.status(404).json(apiError("CLIENT_NOT_FOUND", "Client not found"));
  res.json(apiSuccess({ user }));
});

router.put("/clients/:id/unfreeze", (req, res) => {
  const user = updateOne("users.json", req.params.id, {
    status: "VERIFIED",
    frozenReason: null,
    frozenAt: null,
    updatedAt: nowIso()
  });
  if (!user) return res.status(404).json(apiError("CLIENT_NOT_FOUND", "Client not found"));
  res.json(apiSuccess({ user }));
});

router.put("/clients/:id/verify", (req, res) =>
  res.json(apiSuccess({ user: updateOne("users.json", req.params.id, { status: "VERIFIED", updatedAt: nowIso() }) }))
);
router.put("/clients/:id/reject", (req, res) =>
  res.json(apiSuccess({ user: updateOne("users.json", req.params.id, { status: "REJECTED", updatedAt: nowIso() }) }))
);
router.put("/clients/:id/suspend", (req, res) =>
  res.json(apiSuccess({ user: updateOne("users.json", req.params.id, { status: "SUSPENDED", updatedAt: nowIso() }) }))
);

router.get("/loans", (req, res) => {
  let loans = readCollection("loans.json");
  if (req.query.status) loans = loans.filter((l) => l.status === req.query.status);
  res.json(apiSuccess(paginate(loans, req.query.page, req.query.limit)));
});

router.put("/loans/:id/approve", (req, res) => {
  const loan = approveLoanAndGenerateSchedule(req.params.id, req.user.sub);
  if (!loan) return res.status(404).json(apiError("LOAN_NOT_FOUND", "Loan not found"));
  return res.json(apiSuccess({ loan }));
});

router.put("/loans/:id/reject", (req, res) => {
  const loan = updateOne("loans.json", req.params.id, { status: "REJECTED", reviewedBy: req.user.sub });
  if (!loan) return res.status(404).json(apiError("LOAN_NOT_FOUND", "Loan not found"));
  return res.json(apiSuccess({ loan }));
});

router.get("/merchants", (req, res) => {
  const merchants = readCollection("merchants.json");
  res.json(apiSuccess(paginate(merchants, req.query.page, req.query.limit)));
});

router.put("/merchants/:id/approve", (req, res) => {
  const merchant = updateOne("merchants.json", req.params.id, { status: "ACTIVE", kybStatus: "APPROVED" });
  if (!merchant) return res.status(404).json(apiError("MERCHANT_NOT_FOUND", "Merchant not found"));

  createNotification({
    userId: req.params.id,
    title: "Compte activé",
    body: "Votre compte marchand est activé",
    type: "KYB"
  });

  res.json(apiSuccess({ merchant }));
});

router.get("/kyc/pending", (_req, res) => {
  const pendingUsers = findWhere("users.json", u => u.kycStatus === "PENDING");
  const data = pendingUsers.map(u => ({
    ...u,
    documents: findWhere("kyc_documents.json", d => d.userId === u.id)
  }));
  res.json(apiSuccess(data));
});

router.put("/kyc/:userId/approve", (req, res) => {
  const { userId } = req.params;
  const user = updateOne("users.json", userId, { kycStatus: "APPROVED", status: "VERIFIED", updatedAt: nowIso() });
  if (!user) return res.status(404).json(apiError("USER_NOT_FOUND", "User not found"));

  const docs = findWhere("kyc_documents.json", d => d.userId === userId);
  docs.forEach(d => updateOne("kyc_documents.json", d.id, { status: "APPROVED", reviewedBy: req.user.sub }));

  createNotification({
    userId,
    title: "Compte vérifié",
    body: "Votre compte est vérifié, vous pouvez maintenant demander un prêt",
    type: "KYC"
  });

  res.json(apiSuccess({ user }));
});

router.put("/kyc/:userId/reject", (req, res) => {
  const { userId } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json(apiError("MISSING_REASON", "Rejection reason is required"));

  const user = updateOne("users.json", userId, {
    kycStatus: "REJECTED",
    status: "REJECTED",
    kycRejectionReason: reason,
    updatedAt: nowIso()
  });
  if (!user) return res.status(404).json(apiError("USER_NOT_FOUND", "User not found"));

  const docs = findWhere("kyc_documents.json", d => d.userId === userId);
  docs.forEach(d => updateOne("kyc_documents.json", d.id, { status: "REJECTED", reviewedBy: req.user.sub }));

  createNotification({
    userId,
    title: "KYC Refusé",
    body: `Votre vérification KYC a été refusée. Raison: ${reason}`,
    type: "KYC"
  });

  res.json(apiSuccess({ user }));
});

router.put("/kyc/:userId/request-more", (req, res) => {
  const { userId } = req.params;
  const { note } = req.body;
  if (!note) return res.status(400).json(apiError("MISSING_NOTE", "Admin note is required"));

  const user = updateOne("users.json", userId, {
    kycStatus: "MORE_INFO_REQUIRED",
    kycAdminNote: note,
    updatedAt: nowIso()
  });
  if (!user) return res.status(404).json(apiError("USER_NOT_FOUND", "User not found"));

  res.json(apiSuccess({ user }));
});

router.get("/kyb/pending", (_req, res) => {
  const pendingMerchants = findWhere("merchants.json", m => m.kybStatus === "PENDING");
  res.json(apiSuccess(pendingMerchants));
});

router.put("/kyb/:merchantId/approve", (req, res) => {
  const { merchantId } = req.params;
  const merchant = updateOne("merchants.json", merchantId, {
    kybStatus: "APPROVED",
    status: "ACTIVE",
    updatedAt: nowIso()
  });
  if (!merchant) return res.status(404).json(apiError("MERCHANT_NOT_FOUND", "Merchant not found"));

  createNotification({
    userId: merchantId,
    title: "Compte activé",
    body: "Votre compte marchand est activé",
    type: "KYB"
  });

  res.json(apiSuccess({ merchant }));
});

router.put("/kyb/:merchantId/reject", (req, res) => {
  const { merchantId } = req.params;
  const { reason } = req.body;
  if (!reason) return res.status(400).json(apiError("MISSING_REASON", "Rejection reason is required"));

  const merchant = updateOne("merchants.json", merchantId, {
    kybStatus: "REJECTED",
    kybRejectionReason: reason,
    updatedAt: nowIso()
  });
  if (!merchant) return res.status(404).json(apiError("MERCHANT_NOT_FOUND", "Merchant not found"));

  createNotification({
    userId: merchantId,
    title: "KYB Refusé",
    body: `Votre vérification KYB a été refusée. Raison: ${reason}`,
    type: "KYB"
  });

  res.json(apiSuccess({ merchant }));
});

export default router;
