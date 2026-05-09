import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  findById,
  findWhere,
  insertOne,
  readCollection,
  updateOne,
  writeCollection,
} from "../db/dataLake.js";
import { buildLoan, buildRepaymentSchedule } from "../services/loanService.js";
import { createNotification } from "../services/notificationService.js";
import { recalculateScore } from "../services/creditEngine.js";
import { nowIso, apiSuccess, apiError } from "../utils.js";
import { CREDIT_TIER_CONFIG, TIER_ORDER } from "../constants.js";

const router = express.Router();

const tierLimitForUser = (user) => {
  const totalLoans = findWhere("loans.json", (l) => l.userId === user.id).length;
  if (totalLoans === 0) return 300;

  let maxAllowed = CREDIT_TIER_CONFIG[user.creditTier].maxLoan;

  // JOBLESS users capped at TRUSTED (600 DT max ever)
  if (user.occupation === "JOBLESS" && maxAllowed > 600) {
    maxAllowed = 600;
  }

  return maxAllowed;
};

router.post("/apply", requireAuth, requireRole("CLIENT"), (req, res) => {
  const { merchantId, amount } = req.body;
  const user = findById("users.json", req.user.sub);
  if (!user) return res.status(404).json(apiError("USER_NOT_FOUND", "User not found"));

  if (user.status === "FROZEN") {
    return res.status(403).json(apiError("USER_FROZEN", `Votre compte est temporairement gelé. Raison: ${user.frozenReason}. Contactez le support.`));
  }

  if (user.status !== "VERIFIED") {
    return res.status(403).json(apiError("USER_NOT_VERIFIED", "User is not verified"));
  }

  const merchant = findById("merchants.json", merchantId);
  if (!merchant || merchant.status !== "ACTIVE") {
    return res.status(400).json(apiError("MERCHANT_NOT_ACTIVE", "Merchant is not active"));
  }
  const numericAmount = Number(amount);
  const maxAllowed = tierLimitForUser(user);
  if (!numericAmount || numericAmount <= 0 || numericAmount > maxAllowed) {
    return res.status(400).json(apiError("INVALID_AMOUNT", `Amount exceeds limit ${maxAllowed} DT`));
  }
  const loan = buildLoan({ userId: user.id, merchantId, amount: numericAmount });
  insertOne("loans.json", loan);
  return res.status(201).json(apiSuccess({ loan }));
});

router.get("/my", requireAuth, requireRole("CLIENT"), (req, res) => {
  const loans = findWhere("loans.json", (loan) => loan.userId === req.user.sub);
  return res.json(apiSuccess({ loans }));
});

router.get("/:id", requireAuth, (req, res) => {
  const loan = findById("loans.json", req.params.id);
  if (!loan) return res.status(404).json(apiError("LOAN_NOT_FOUND", "Loan not found"));
  if (req.user.role === "CLIENT" && loan.userId !== req.user.sub) {
    return res.status(403).json(apiError("FORBIDDEN", "Forbidden"));
  }
  const repayments = findWhere("repayments.json", (r) => r.loanId === loan.id);
  return res.json(apiSuccess({ loan, repayments }));
});

router.post("/:id/repay", requireAuth, requireRole("CLIENT"), (req, res) => {
  const loan = findById("loans.json", req.params.id);
  if (!loan || loan.userId !== req.user.sub) return res.status(404).json(apiError("LOAN_NOT_FOUND", "Loan not found"));
  if (!["ACTIVE", "APPROVED"].includes(loan.status)) {
    return res.status(400).json(apiError("LOAN_NOT_REPAYABLE", "Loan is not repayable"));
  }
  const repayments = readCollection("repayments.json");
  const due = repayments.find(
    (r) => r.loanId === loan.id && ["PENDING", "LATE", "MISSED"].includes(r.status)
  );
  if (!due) return res.status(400).json(apiError("NO_DUE_REPAYMENT", "No due repayment found"));
  due.status = "PAID";
  due.paidAt = nowIso();
  writeCollection("repayments.json", repayments);

  const schedule = repayments.filter((r) => r.loanId === loan.id);
  if (schedule.length && schedule.every((r) => r.status === "PAID")) {
    updateOne("loans.json", loan.id, { status: "COMPLETED", completedAt: nowIso() });
    const user = findById("users.json", req.user.sub);
    updateOne("users.json", req.user.sub, {
      cleanRepaymentsCount: (user.cleanRepaymentsCount || 0) + 1,
      updatedAt: nowIso(),
    });
  }
  recalculateScore(req.user.sub);
  createNotification({
    userId: req.user.sub,
    title: "Paiement reçu",
    body: `Votre paiement hebdomadaire pour le prêt ${loan.id} a été confirmé.`,
    type: "REPAYMENT",
  });
  return res.json(apiSuccess({ message: "Repayment processed", repayment: due }));
});

router.get("/:id/repayments", requireAuth, (req, res) => {
  const loan = findById("loans.json", req.params.id);
  if (!loan) return res.status(404).json(apiError("LOAN_NOT_FOUND", "Loan not found"));
  if (req.user.role === "CLIENT" && loan.userId !== req.user.sub) {
    return res.status(403).json(apiError("FORBIDDEN", "Forbidden"));
  }
  return res.json(apiSuccess({
    repayments: findWhere("repayments.json", (r) => r.loanId === loan.id),
  }));
});

export function approveLoanAndGenerateSchedule(loanId, adminId) {
  const loan = findById("loans.json", loanId);
  if (!loan) return null;
  const approvedAt = new Date();
  const dueDate = new Date(approvedAt);
  dueDate.setDate(dueDate.getDate() + 28);
  const updated = updateOne("loans.json", loanId, {
    status: "ACTIVE",
    disbursedAt: approvedAt.toISOString(),
    dueDate: dueDate.toISOString(),
    approvedBy: adminId,
  });
  const repayments = buildRepaymentSchedule({
    loanId: loan.id,
    userId: loan.userId,
    weeklyPayment: loan.weeklyPayment,
    dueDateBase: approvedAt.toISOString(),
  });
  repayments.forEach((r) => insertOne("repayments.json", r));
  return updated;
}

export default router;
