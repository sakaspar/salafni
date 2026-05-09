import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createId,
  nowIso,
  REFRESH_TOKEN_SECRET,
  signAccessToken,
  signRefreshToken,
  apiSuccess,
  apiError
} from "../utils.js";
import { insertOne, readCollection, findWhere } from "../db/dataLake.js";
import { body } from "express-validator";
import { validate } from "../middleware/validation.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

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

const registerValidation = [
  body("fullName").notEmpty().withMessage("Nom complet requis"),
  body("phone").matches(/^[259]\d{7}$/).withMessage("Format téléphone tunisien invalide"),
  body("nationalId").isLength({ min: 8, max: 8 }).withMessage("CIN doit être de 8 chiffres"),
  body("email").isEmail().withMessage("Email invalide"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe doit faire au moins 8 caractères")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage("Le mot de passe doit contenir au moins une majuscule et un chiffre"),
];

router.post("/client/register", validate(registerValidation), (req, res) => {
  const { fullName, phone, nationalId, email, password, occupation } = req.body;
  if (findWhere("users.json", (u) => u.email === email || u.phone === phone).length) {
    return res.status(409).json(apiError("USER_EXISTS", "User already exists"));
  }
  const createdAt = nowIso();
  const user = insertOne("users.json", {
    id: createId(),
    fullName,
    phone,
    nationalId,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    occupation: occupation || "JOBLESS",
    status: "PENDING",
    kycStatus: "NOT_SUBMITTED",
    creditTier: "STARTER",
    creditScore: 50,
    cleanRepaymentsCount: 0,
    latePaymentsCount: 0,
    tierUpgradeFrozen: false,
    createdAt,
    updatedAt: createdAt,
  });
  return res.status(201).json(apiSuccess({ user }));
});

router.post("/client/login", authRateLimiter, (req, res) => {
  const data = loginFor("users.json", req.body.email, req.body.password, "CLIENT");
  if (!data) return res.status(401).json(apiError("INVALID_CREDENTIALS", "Invalid credentials"));
  if (data.user.status === "DELETED") {
    return res.status(403).json(apiError("ACCOUNT_DELETED", "This account has been deleted"));
  }
  return res.json(apiSuccess(data));
});

router.post("/merchant/register", validate(registerValidation), (req, res) => {
  const { businessName, ownerName, phone, email, password, category } = req.body;
  if (!businessName) return res.status(400).json(apiError("MISSING_FIELDS", "Business name is required"));

  if (findWhere("merchants.json", (m) => m.email === email || m.phone === phone).length) {
    return res.status(409).json(apiError("MERCHANT_EXISTS", "Merchant already exists"));
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
    kybStatus: "NOT_SUBMITTED",
    totalTransactions: 0,
    totalVolume: 0,
    createdAt: nowIso(),
  });
  return res.status(201).json(apiSuccess({ merchant }));
});

router.post("/merchant/login", authRateLimiter, (req, res) => {
  const data = loginFor("merchants.json", req.body.email, req.body.password, "MERCHANT");
  if (!data) return res.status(401).json(apiError("INVALID_CREDENTIALS", "Invalid credentials"));
  if (data.user.status !== "ACTIVE") {
    return res.status(403).json(apiError("MERCHANT_INACTIVE", "Merchant not active"));
  }
  return res.json(apiSuccess(data));
});

router.post("/admin/login", authRateLimiter, (req, res) => {
  const data = loginFor("admins.json", req.body.email, req.body.password, "ADMIN");
  if (!data) return res.status(401).json(apiError("INVALID_CREDENTIALS", "Invalid credentials"));
  return res.json(apiSuccess(data));
});

router.post("/refresh-token", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json(apiError("MISSING_TOKEN", "Missing refresh token"));
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    return res.json(apiSuccess({
      accessToken: signAccessToken({ sub: decoded.sub, role: decoded.role, email: decoded.email }),
    }));
  } catch (_e) {
    return res.status(401).json(apiError("INVALID_TOKEN", "Invalid refresh token"));
  }
});

export default router;
