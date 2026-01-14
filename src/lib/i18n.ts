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
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "es", // Español como fallback principal
    lng: "es", // Forzar inicio en español si no se detecta nada
    supportedLngs: ['es', 'en'],
    detection: {
      // Orden: Primero localstorage, luego navegador
      order: ['localStorage', 'navigator'], 
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;