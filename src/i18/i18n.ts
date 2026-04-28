import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/enTranslate.json";
import ua from "../locales/uaTranslate.json";

const savedLanguage =
  localStorage.getItem("language") ||
  navigator.language.slice(0, 2) ||
  "ua";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ua: { translation: ua },
    },
    lng: savedLanguage,
    fallbackLng: "ua",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
