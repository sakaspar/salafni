import { findById, findWhere, updateOne } from "../db/dataLake.js";
import { TIER_ORDER } from "../constants.js";
import { clampScore } from "../utils.js";

export function checkTierUpgrade(userId) {
  const user = findById("users.json", userId);
  if (!user) return null;
  let nextTier = user.creditTier;

  const clean = user.cleanRepaymentsCount || 0;
  const late = user.latePaymentsCount || 0;
  const freeze = user.tierUpgradeFrozen || false;

  if (freeze) return user;
  if (clean >= 6 && late === 0) nextTier = "PREMIUM";
  else if (clean >= 4) nextTier = "ESTABLISHED";
  else if (clean >= 2) nextTier = "TRUSTED";
  else nextTier = "STARTER";

  // JOBLESS users capped at TRUSTED (600 DT max ever)
  if (user.occupation === "JOBLESS") {
    const trustedIdx = TIER_ORDER.indexOf("TRUSTED");
    const nextIdx = TIER_ORDER.indexOf(nextTier);
    if (nextIdx > trustedIdx) {
      nextTier = "TRUSTED";
    }
  }

  const currIdx = TIER_ORDER.indexOf(user.creditTier);
  const nextIdx = TIER_ORDER.indexOf(nextTier);
  if (nextIdx > currIdx) {
    return updateOne("users.json", userId, { creditTier: nextTier, updatedAt: new Date().toISOString() });
  }
  return user;
}

export function recalculateScore(userId) {
  const user = findById("users.json", userId);
  if (!user) return null;
  const repayments = findWhere("repayments.json", (r) => r.userId === userId);
  const completedLoans = findWhere(
    "loans.json",
    (l) => l.userId === userId && l.status === "COMPLETED"
  ).length;

  let score = 50;
  let lateCount = 0;
  let missedCount = 0;
  repayments.forEach((r) => {
    if (r.status === "PAID") score += 10;
    if (r.status === "LATE") {
      score -= 15;
      lateCount += 1;
    }
    if (r.status === "MISSED") {
      score -= 25;
      missedCount += 1;
    }
  });
  score += completedLoans * 5;
  score = clampScore(score);

  const updates = {
    creditScore: score,
    latePaymentsCount: lateCount,
    tierUpgradeFrozen: lateCount >= 1,
    updatedAt: new Date().toISOString(),
  };

  if (lateCount >= 2) {
    const idx = TIER_ORDER.indexOf(user.creditTier);
    const downgraded = TIER_ORDER[Math.max(0, idx - 1)];
    updates.creditTier = downgraded;
  }
  if (missedCount >= 2) updates.status = "SUSPENDED";

  const updated = updateOne("users.json", userId, updates);
  return checkTierUpgrade(updated.id);
}
