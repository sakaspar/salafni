import path from "path";
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import merchantRoutes from "./routes/merchantRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { initializeDataLake } from "./db/dataLake.js";
import { startRepaymentCron } from "./services/cronService.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

initializeDataLake([
  "users.json",
  "merchants.json",
  "loans.json",
  "repayments.json",
  "kyc_documents.json",
  "admins.json",
  "notifications.json",
  "support_tickets.json",
]);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "Salafni API" });
});

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/loans", loanRoutes);
app.use("/api/merchant", merchantRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/support", supportRoutes);

app.use(notFound);
app.use(errorHandler);

startRepaymentCron();

app.listen(PORT, () => {
  console.log(`Salafni backend listening on port ${PORT}`);
});
