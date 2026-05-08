import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { findById, findWhere, insertOne, updateOne } from "../db/dataLake.js";
import { CREDIT_TIER_CONFIG, KYC_TYPES } from "../constants.js";
import { createId, nowIso } from "../utils.js";

const router = express.Router();
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir });

router.get("/me", requireAuth, requireRole("CLIENT"), (req, res) => {
  const user = findById("users.json", req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user, tierConfig: CREDIT_TIER_CONFIG[user.creditTier] });
});

router.put("/profile", requireAuth, requireRole("CLIENT"), (req, res) => {
  const allowed = ["fullName", "occupation", "phone", "email"];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });
  updates.updatedAt = nowIso();
  const updated = updateOne("users.json", req.user.sub, updates);
  if (!updated) return res.status(404).json({ message: "User not found" });
  return res.json({ user: updated });
});

router.post(
  "/kyc/upload",
  requireAuth,
  requireRole("CLIENT"),
  upload.array("documents", 4),
  (req, res) => {
    const files = req.files || [];
    const docs = files.map((file, idx) => {
      const type = req.body.types?.[idx] || KYC_TYPES[idx] || "PROOF_OF_OCCUPATION";
      return insertOne("kyc_documents.json", {
        id: createId(),
        userId: req.user.sub,
        type,
        fileUrl: `/uploads/${path.basename(file.path)}`,
        status: "PENDING",
        reviewedBy: null,
        createdAt: nowIso(),
      });
    });
    return res.status(201).json({ documents: docs });
  }
);

router.get("/kyc/status", requireAuth, requireRole("CLIENT"), (req, res) => {
  const docs = findWhere("kyc_documents.json", (doc) => doc.userId === req.user.sub);
  return res.json({ documents: docs });
});

export default router;
