import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../utils.js";
import { findById } from "../db/dataLake.js";

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const token = auth.slice(7);
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    if (decoded.role === "CLIENT") {
      const user = findById("users.json", decoded.sub);
      if (user && user.status === "DELETED") {
        return res.status(403).json({
          success: false,
          error: { code: "ACCOUNT_DELETED", message: "This account has been deleted" },
        });
      }
    }

    req.user = decoded;
    return next();
  } catch (_e) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}
