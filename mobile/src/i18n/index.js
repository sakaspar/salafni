import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  fr: {
    translation: {
      welcomeAr: "اشتري الآن، ادفع لاحقاً",
      welcomeFr: "Achetez maintenant, payez plus tard",
      register: "Inscription",
      login: "Connexion",
      continue: "Continuer",
      home: "Accueil",
      applyLoan: "Demander un pret",
      repayments: "Mes remboursements",
      creditScore: "Score credit",
      profile: "Profil",
      pendingVerification: "Verification en attente",
    },
  },
  ar: {
    translation: {
      welcomeAr: "اشتري الآن، ادفع لاحقاً",
      welcomeFr: "اشتر الآن وادفع لاحقا",
      register: "تسجيل",
      login: "دخول",
      continue: "متابعة",
      home: "الرئيسية",
      applyLoan: "طلب قرض",
      repayments: "دفعاتي",
      creditScore: "نقاط الثقة",
      profile: "الملف الشخصي",
      pendingVerification: "التحقق قيد الانتظار",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "fr",
  fallbackLng: "fr",
  interpolation: { escapeValue: false },
});

export default i18n;
