export const CREDIT_TIERS = {
  STARTER: {
    maxLoan: 300,
    unlockCondition: "signup",
  },
  TRUSTED: {
    maxLoan: 600,
    unlockCondition: "2 clean repayments",
  },
  ESTABLISHED: {
    maxLoan: 1000,
    unlockCondition: "4 clean repayments",
  },
  PREMIUM: {
    maxLoan: 1500,
    unlockCondition: "6 clean repayments and zero late payments",
  },
};

export const TIER_ORDER = ["STARTER", "TRUSTED", "ESTABLISHED", "PREMIUM"];
