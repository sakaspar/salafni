import { rateLimit } from "express-rate-limit";

export const authRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 5, // Limit each IP to 5 requests per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req) => req.hostname === "localhost" || req.hostname === "127.0.0.1",
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many attempts, please try again in 10 minutes",
    },
  },
});
