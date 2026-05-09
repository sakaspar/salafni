import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const nowIso = () => new Date().toISOString();
export const createId = () => uuidv4();
export const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || "salafni-dev-access-secret";
export const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || "salafni-dev-refresh-secret";

export const signAccessToken = (payload) =>
  jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "1h" });

export const signRefreshToken = (payload) =>
  jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

export const calcLoanNumbers = (amount) => {
  const originationFee = Number((amount * 0.05).toFixed(2));
  const totalRepayable = Number((amount + originationFee).toFixed(2));
  const weeklyPayment = Number((totalRepayable / 4).toFixed(2));
  return { originationFee, totalRepayable, weeklyPayment };
};

export const clampScore = (value) => Math.max(0, Math.min(100, value));

export const apiSuccess = (data) => ({
  success: true,
  data,
});

export const apiError = (code, message) => ({
  success: false,
  error: { code, message },
});

export const paginate = (items, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  return {
    items: items.slice(startIndex, endIndex),
    pagination: {
      total: items.length,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(items.length / limit),
    },
  };
};
