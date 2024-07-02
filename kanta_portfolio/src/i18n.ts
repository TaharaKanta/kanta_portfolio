import ja from "@/constants/ja";
import en from "@/constants/en";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: en
  },
  ja: {
    translation: ja
  }
}

i18n
.use(initReactI18next)
.init
({
  resources,
  lng: "ja",
  fallbackLng: "ja",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;