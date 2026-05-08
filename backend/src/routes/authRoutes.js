import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createId,
  nowIso,
  REFRESH_TOKEN_SECRET,
  signAccessToken,
  signRefreshToken,
} from "../utils.js";
import { insertOne, readCollection, findWhere } from "../db/dataLake.js";

const router = express.Router();

const loginFor = (collection, email, password, role) => {
  const account = readCollection(collection).find((u) => u.email === email);
  if (!account) return null;
  const stored = account.passwordHash || "";
  const isHash = stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$");
  const validPassword = isHash ? bcrypt.compareSync(password, stored) : stored === password;
  if (!validPassword) return null;
  return {
    accessToken: signAccessToken({ sub: account.id, role, email: account.email }),
    refreshToken: signRefreshToken({ sub: account.id, role, email: account.email }),
    user: account,
  };
};

router.post("/client/register", (req, res) => {
  const { fullName, phone, nationalId, email, password, occupation } = req.body;
  if (!fullName || !phone || !nationalId || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (findWhere("users.json", (u) => u.email === email || u.phone === phone).length) {
    return res.status(409).json({ message: "User already exists" });
  }
  const createdAt = nowIso();
  const user = insertOne("users.json", {
    id: createId(),
    fullName,
    phone,
    nationalId,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    occupation: occupation || "",
    status: "PENDING",
    creditTier: "STARTER",
    creditScore: 50,
    cleanRepaymentsCount: 0,
    latePaymentsCount: 0,
    tierUpgradeFrozen: false,
    createdAt,
    updatedAt: createdAt,
  });
  return res.status(201).json({ user });
});

router.post("/client/login", (req, res) => {
  const data = loginFor("users.json", req.body.email, req.body.password, "CLIENT");
  if (!data) return res.status(401).json({ message: "Invalid credentials" });
  return res.json(data);
});

router.post("/merchant/register", (req, res) => {
  const { businessName, ownerName, phone, email, password, category } = req.body;
  if (!businessName || !ownerName || !phone || !email || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  if (findWhere("merchants.json", (m) => m.email === email || m.phone === phone).length) {
    return res.status(409).json({ message: "Merchant already exists" });
  }
  const merchant = insertOne("merchants.json", {
    id: createId(),
    businessName,
    ownerName,
    phone,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    category: category || "OTHER",
    status: "PENDING",
    totalTransactions: 0,
    totalVolume: 0,
    createdAt: nowIso(),
  });
  return res.status(201).json({ merchant });
});

router.post("/merchant/login", (req, res) => {
  const data = loginFor("merchants.json", req.body.email, req.body.password, "MERCHANT");
  if (!data) return res.status(401).json({ message: "Invalid credentials" });
  if (data.user.status !== "ACTIVE") {
    return res.status(403).json({ message: "Merchant not active" });
  }
  return res.json(data);
});

router.post("/admin/login", (req, res) => {
  const data = loginFor("admins.json", req.body.email, req.body.password, "ADMIN");
  if (!data) return res.status(401).json({ message: "Invalid credentials" });
  return res.json(data);
});

router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Missing refresh token" });
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    return res.json({
      accessToken: signAccessToken({ sub: decoded.sub, role: decoded.role, email: decoded.email }),
    });
  } catch (_e) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

export default router;
