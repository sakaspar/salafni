import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  lng: "fr",
  fallbackLng: "fr",
  resources: {
    fr: { translation: { dashboard: "Tableau de bord" } },
    ar: { translation: { dashboard: "لوحة التحكم" } },
  },
  interpolation: { escapeValue: false },
});

export default i18n;
