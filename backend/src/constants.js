export const USER_STATUSES = ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED", "DELETED", "FROZEN"];
export const USER_TIERS = ["STARTER", "TRUSTED", "ESTABLISHED", "PREMIUM"];
export const MERCHANT_STATUSES = ["PENDING", "ACTIVE", "SUSPENDED"];
export const MERCHANT_CATEGORIES = [
  "ELECTRONICS",
  "HEALTH",
  "EDUCATION",
  "CLOTHING",
  "FOOD",
  "OTHER",
];
export const LOAN_STATUSES = [
  "PENDING",
  "APPROVED",
  "ACTIVE",
  "COMPLETED",
  "DEFAULTED",
  "REJECTED",
];
export const REPAYMENT_STATUSES = ["PENDING", "PAID", "LATE", "MISSED"];
export const KYC_TYPES = [
  "NATIONAL_ID_FRONT",
  "NATIONAL_ID_BACK",
  "SELFIE",
  "PROOF_OF_OCCUPATION",
];
export const KYC_STATUSES = ["PENDING", "APPROVED", "REJECTED"];

export const USER_KYC_STATUSES = ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED", "MORE_INFO_REQUIRED"];

export const KYB_STATUSES = ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"];
export const KYB_TYPES = ["TRADE_REGISTER", "TAX_ID", "BUSINESS_ADDRESS_PROOF", "OWNER_ID", "BANK_RIB"];

export const OCCUPATIONS = [
  "EMPLOYED_PUBLIC",
  "EMPLOYED_PRIVATE",
  "FREELANCER",
  "INFORMAL",
  "STUDENT",
  "JOBLESS",
];

export const SUPPORT_TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
export const SUPPORT_TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
export const SUPPORT_TICKET_CATEGORIES = ["LOAN_ISSUE", "REPAYMENT_ISSUE", "ACCOUNT_ISSUE", "KYC_ISSUE", "OTHER"];

export const CREDIT_TIER_CONFIG = {
  STARTER: { maxLoan: 300, unlockCondition: "signup" },
  TRUSTED: { maxLoan: 600, unlockCondition: "2 clean repayments" },
  ESTABLISHED: { maxLoan: 1000, unlockCondition: "4 clean repayments" },
  PREMIUM: {
    maxLoan: 1500,
    unlockCondition: "6+ clean repayments and zero late payments",
  },
};

export const TIER_ORDER = ["STARTER", "TRUSTED", "ESTABLISHED", "PREMIUM"];
