import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { findById, findWhere } from "../db/dataLake.js";

const router = express.Router();

router.get("/list", (_req, res) => {
  const active = findWhere("merchants.json", (m) => m.status === "ACTIVE");
  return res.json({ merchants: active });
});

router.get("/me", requireAuth, requireRole("MERCHANT"), (req, res) => {
  const merchant = findById("merchants.json", req.user.sub);
  if (!merchant) return res.status(404).json({ message: "Merchant not found" });
  return res.json({ merchant });
});

router.get("/transactions", requireAuth, requireRole("MERCHANT"), (req, res) => {
  const loans = findWhere("loans.json", (loan) => loan.merchantId === req.user.sub);
  return res.json({ transactions: loans });
});

router.get("/stats", requireAuth, requireRole("MERCHANT"), (req, res) => {
  const loans = findWhere("loans.json", (loan) => loan.merchantId === req.user.sub);
  const totalVolume = loans.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const clients = new Set(loans.map((l) => l.userId)).size;
  return res.json({
    totalVolume,
    totalTransactions: loans.length,
    totalClients: clients,
    pendingLoans: loans.filter((l) => l.status === "PENDING").length,
    activeLoans: loans.filter((l) => l.status === "ACTIVE").length,
  });
});

export default router;
