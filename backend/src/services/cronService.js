import cron from "node-cron";
import { readCollection, writeCollection, updateOne, findById } from "../db/dataLake.js";
import { nowIso } from "../utils.js";
import { recalculateScore } from "./creditEngine.js";

export function startRepaymentCron() {
  cron.schedule("0 8 * * 1", () => {
    const repayments = readCollection("repayments.json");
    const loans = readCollection("loans.json");
    const now = new Date();
    let changed = false;

    repayments.forEach((r) => {
      if (r.status === "PAID") return;
      const due = new Date(r.dueDate);
      const daysLate = Math.floor((now.getTime() - due.getTime()) / 86400000);
      if (daysLate > 7) {
        r.status = "MISSED";
        changed = true;
      } else if (daysLate > 0) {
        r.status = "LATE";
        r.latePenalty = Number((r.latePenalty || 0) + 10);
        changed = true;
      }
    });

    if (changed) {
      writeCollection("repayments.json", repayments);
      const missedByLoan = {};
      repayments.forEach((r) => {
        if (r.status === "MISSED") {
          missedByLoan[r.loanId] = (missedByLoan[r.loanId] || 0) + 1;
        }
      });
      Object.entries(missedByLoan).forEach(([loanId, missedCount]) => {
        if (missedCount >= 2) {
          const loan = findById("loans.json", loanId);
          if (loan) {
            updateOne("loans.json", loanId, { status: "DEFAULTED", completedAt: nowIso() });
            updateOne("users.json", loan.userId, { status: "SUSPENDED", updatedAt: nowIso() });
            recalculateScore(loan.userId);
          }
        }
      });
    }
  });
}
