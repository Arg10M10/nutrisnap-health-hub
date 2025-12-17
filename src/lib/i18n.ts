import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from "@/locales/en.json";
import translationES from "@/locales/es.json";

const resources = {
  en: {
    translation: translationEN,
  },
  es: {
    translation: translationES,
  },
};

i18n
  .use(LanguageDetector) // Detects user language
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ['en', 'es'],
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'], // Saves the choice to storage
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;