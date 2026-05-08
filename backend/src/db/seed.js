import bcrypt from "bcryptjs";
import { writeCollection } from "./dataLake.js";
import { calcLoanNumbers } from "../utils.js";

const now = new Date();
const iso = (d) => d.toISOString();
const shift = (days) => new Date(now.getTime() + days * 86400000);

const ids = {
  admin: "admin-1",
  m1: "merchant-1",
  m2: "merchant-2",
  m3: "merchant-3",
  u1: "user-1",
  u2: "user-2",
  u3: "user-3",
  u4: "user-4",
  u5: "user-5",
};

const admins = [
  {
    id: ids.admin,
    name: "Super Admin",
    email: "admin@salafni.tn",
    passwordHash: bcrypt.hashSync("Admin123!", 10),
    role: "SUPER_ADMIN",
  },
];

const merchants = [
  {
    id: ids.m1,
    businessName: "TechStore Tunis",
    ownerName: "Karim Boussetta",
    phone: "20000111",
    email: "techstore@salafni.tn",
    passwordHash: bcrypt.hashSync("Merchant123!", 10),
    category: "ELECTRONICS",
    status: "ACTIVE",
    totalTransactions: 12,
    totalVolume: 5600,
    createdAt: iso(shift(-60)),
  },
  {
    id: ids.m2,
    businessName: "Clinique El Amal",
    ownerName: "Lina Marzouki",
    phone: "20000112",
    email: "clinique@salafni.tn",
    passwordHash: bcrypt.hashSync("Merchant123!", 10),
    category: "HEALTH",
    status: "ACTIVE",
    totalTransactions: 8,
    totalVolume: 4200,
    createdAt: iso(shift(-50)),
  },
  {
    id: ids.m3,
    businessName: "École Avenir",
    ownerName: "Sami Triki",
    phone: "20000113",
    email: "ecole@salafni.tn",
    passwordHash: bcrypt.hashSync("Merchant123!", 10),
    category: "EDUCATION",
    status: "ACTIVE",
    totalTransactions: 5,
    totalVolume: 3000,
    createdAt: iso(shift(-40)),
  },
];

const users = [
  {
    id: ids.u1,
    fullName: "Ahmed Ben Ali",
    phone: "22000111",
    nationalId: "12345678",
    email: "ahmed@salafni.tn",
    passwordHash: bcrypt.hashSync("Client123!", 10),
    occupation: "Technicien",
    status: "VERIFIED",
    creditTier: "STARTER",
    creditScore: 58,
    cleanRepaymentsCount: 0,
    latePaymentsCount: 1,
    createdAt: iso(shift(-45)),
    updatedAt: iso(shift(-5)),
  },
  {
    id: ids.u2,
    fullName: "Sarra Mansour",
    phone: "22000112",
    nationalId: "12345679",
    email: "sarra@salafni.tn",
    passwordHash: bcrypt.hashSync("Client123!", 10),
    occupation: "Infirmiere",
    status: "VERIFIED",
    creditTier: "TRUSTED",
    creditScore: 74,
    cleanRepaymentsCount: 2,
    latePaymentsCount: 0,
    createdAt: iso(shift(-70)),
    updatedAt: iso(shift(-7)),
  },
  {
    id: ids.u3,
    fullName: "Mohamed Trabelsi",
    phone: "22000113",
    nationalId: "12345680",
    email: "mohamed@salafni.tn",
    passwordHash: bcrypt.hashSync("Client123!", 10),
    occupation: "Professeur",
    status: "VERIFIED",
    creditTier: "ESTABLISHED",
    creditScore: 86,
    cleanRepaymentsCount: 4,
    latePaymentsCount: 0,
    createdAt: iso(shift(-120)),
    updatedAt: iso(shift(-8)),
  },
  {
    id: ids.u4,
    fullName: "Fatma Chaabane",
    phone: "22000114",
    nationalId: "12345681",
    email: "fatma@salafni.tn",
    passwordHash: bcrypt.hashSync("Client123!", 10),
    occupation: "Pharmacienne",
    status: "VERIFIED",
    creditTier: "PREMIUM",
    creditScore: 95,
    cleanRepaymentsCount: 6,
    latePaymentsCount: 0,
    createdAt: iso(shift(-200)),
    updatedAt: iso(shift(-10)),
  },
  {
    id: ids.u5,
    fullName: "Youssef Gharbi",
    phone: "22000115",
    nationalId: "12345682",
    email: "youssef@salafni.tn",
    passwordHash: bcrypt.hashSync("Client123!", 10),
    occupation: "Etudiant",
    status: "SUSPENDED",
    creditTier: "STARTER",
    creditScore: 28,
    cleanRepaymentsCount: 0,
    latePaymentsCount: 2,
    createdAt: iso(shift(-90)),
    updatedAt: iso(shift(-3)),
  },
];

let loanCounter = 0;
const mkLoan = (userId, merchantId, amount, status, createdOffsetDays) => {
  loanCounter += 1;
  const id = `loan-${loanCounter}`;
  const numbers = calcLoanNumbers(amount);
  return {
    id,
    userId,
    merchantId,
    amount,
    status,
    ...numbers,
    disbursedAt: status === "PENDING" ? null : iso(shift(createdOffsetDays + 1)),
    completedAt: status === "COMPLETED" || status === "DEFAULTED" ? iso(shift(createdOffsetDays + 29)) : null,
    dueDate: status === "PENDING" ? null : iso(shift(createdOffsetDays + 29)),
    createdAt: iso(shift(createdOffsetDays)),
  };
};

const loans = [
  mkLoan(ids.u1, ids.m1, 300, "ACTIVE", -20),
  mkLoan(ids.u2, ids.m2, 400, "COMPLETED", -70),
  mkLoan(ids.u2, ids.m1, 500, "COMPLETED", -45),
  mkLoan(ids.u3, ids.m3, 700, "COMPLETED", -120),
  mkLoan(ids.u3, ids.m1, 800, "COMPLETED", -90),
  mkLoan(ids.u3, ids.m2, 900, "COMPLETED", -60),
  mkLoan(ids.u3, ids.m1, 1000, "COMPLETED", -30),
  mkLoan(ids.u4, ids.m1, 1200, "COMPLETED", -180),
  mkLoan(ids.u4, ids.m2, 1300, "COMPLETED", -150),
  mkLoan(ids.u4, ids.m3, 1400, "COMPLETED", -120),
  mkLoan(ids.u4, ids.m1, 1000, "COMPLETED", -90),
  mkLoan(ids.u4, ids.m2, 1500, "COMPLETED", -60),
  mkLoan(ids.u4, ids.m3, 1200, "COMPLETED", -30),
  mkLoan(ids.u5, ids.m1, 300, "DEFAULTED", -35),
];

const repayments = [];
loans.forEach((loan) => {
  [1, 2, 3, 4].forEach((week) => {
    let status = "PAID";
    if (loan.status === "ACTIVE" && week >= 3) status = "PENDING";
    if (loan.status === "DEFAULTED" && week >= 3) status = week === 3 ? "LATE" : "MISSED";
    const latePenalty = status === "LATE" ? 10 : 0;
    repayments.push({
      id: `${loan.id}-r${week}`,
      loanId: loan.id,
      userId: loan.userId,
      weekNumber: week,
      amount: loan.weeklyPayment,
      dueDate: iso(shift(-28 + week * 7)),
      paidAt: status === "PAID" ? iso(shift(-28 + week * 7 - 1)) : null,
      status,
      latePenalty,
    });
  });
});

const kyc = users.map((user, idx) => ({
  id: `kyc-${idx + 1}`,
  userId: user.id,
  type: "NATIONAL_ID_FRONT",
  fileUrl: `/uploads/${user.id}-id-front.jpg`,
  status: user.status === "VERIFIED" ? "APPROVED" : "PENDING",
  reviewedBy: user.status === "VERIFIED" ? ids.admin : null,
  createdAt: user.createdAt,
}));

const notifications = [
  {
    id: "notif-1",
    userId: ids.u1,
    title: "Paiement à venir",
    body: "Votre prochaine échéance est dans 2 jours.",
    type: "REPAYMENT",
    read: false,
    createdAt: iso(shift(-1)),
  },
];

writeCollection("admins.json", admins);
writeCollection("merchants.json", merchants);
writeCollection("users.json", users);
writeCollection("loans.json", loans);
writeCollection("repayments.json", repayments);
writeCollection("kyc_documents.json", kyc);
writeCollection("notifications.json", notifications);

console.log("Seed complete.");
