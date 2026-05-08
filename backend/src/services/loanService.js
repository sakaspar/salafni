import { createId, nowIso, calcLoanNumbers } from "../utils.js";

export function buildLoan({ userId, merchantId, amount }) {
  const { originationFee, totalRepayable, weeklyPayment } = calcLoanNumbers(amount);
  return {
    id: createId(),
    userId,
    merchantId,
    amount,
    status: "PENDING",
    originationFee,
    totalRepayable,
    weeklyPayment,
    disbursedAt: null,
    completedAt: null,
    dueDate: null,
    createdAt: nowIso(),
  };
}

export function buildRepaymentSchedule({ loanId, userId, weeklyPayment, dueDateBase }) {
  const dueBase = new Date(dueDateBase);
  return [1, 2, 3, 4].map((week) => {
    const d = new Date(dueBase);
    d.setDate(d.getDate() + (week - 1) * 7);
    return {
      id: createId(),
      loanId,
      userId,
      weekNumber: week,
      amount: weeklyPayment,
      dueDate: d.toISOString(),
      paidAt: null,
      status: "PENDING",
      latePenalty: 0,
    };
  });
}
