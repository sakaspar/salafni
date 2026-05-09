import express from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { findById, findWhere, updateOne } from "../db/dataLake.js";
import { apiSuccess, apiError, nowIso } from "../utils.js";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

router.get("/list", (_req, res) => {
  const active = findWhere("merchants.json", (m) => m.status === "ACTIVE");
  return res.json(apiSuccess({ merchants: active }));
});

router.get("/me", requireAuth, requireRole("MERCHANT"), (req, res) => {
  const merchant = findById("merchants.json", req.user.sub);
  if (!merchant) return res.status(404).json(apiError("MERCHANT_NOT_FOUND", "Merchant not found"));
  return res.json(apiSuccess({ merchant }));
});

router.get("/transactions", requireAuth, requireRole("MERCHANT"), (req, res) => {
  const loans = findWhere("loans.json", (loan) => loan.merchantId === req.user.sub);
  return res.json(apiSuccess({ transactions: loans }));
});

router.get("/stats", requireAuth, requireRole("MERCHANT"), (req, res) => {
  const loans = findWhere("loans.json", (loan) => loan.merchantId === req.user.sub);
  const totalVolume = loans.reduce((sum, l) => sum + Number(l.amount || 0), 0);
  const clients = new Set(loans.map((l) => l.userId)).size;
  return res.json(apiSuccess({
    totalVolume,
    totalTransactions: loans.length,
    totalClients: clients,
    pendingLoans: loans.filter((l) => l.status === "PENDING").length,
    activeLoans: loans.filter((l) => l.status === "ACTIVE").length,
  }));
});

router.post("/kyb/upload", requireAuth, requireRole("MERCHANT"), upload.array("documents"), (req, res) => {
  const { businessName, registrationNumber, businessAddress, businessPhone } = req.body;

  const documents = (req.files || []).map((file, idx) => ({
    id: `kyb-doc-${Date.now()}-${idx}`,
    merchantId: req.user.sub,
    type: req.body[`type_${idx}`] || "OTHER",
    fileUrl: `/uploads/${file.filename}`,
    status: "PENDING",
    createdAt: nowIso()
  }));

  const updates = {
    businessName: businessName || undefined,
    registrationNumber,
    businessAddress,
    businessPhone,
    kybStatus: "PENDING",
    kybDocuments: documents,
    updatedAt: nowIso()
  };

  const merchant = updateOne("merchants.json", req.user.sub, updates);
  res.json(apiSuccess({ merchant }));
});

router.get("/kyb/status", requireAuth, requireRole("MERCHANT"), (req, res) => {
  const merchant = findById("merchants.json", req.user.sub);
  if (!merchant) return res.status(404).json(apiError("MERCHANT_NOT_FOUND", "Merchant not found"));
  res.json(apiSuccess({
    kybStatus: merchant.kybStatus || "NOT_SUBMITTED",
    kybRejectionReason: merchant.kybRejectionReason || null,
    kybDocuments: merchant.kybDocuments || []
  }));
});

export default router;
