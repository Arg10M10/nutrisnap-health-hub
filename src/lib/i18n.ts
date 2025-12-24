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
    fallbackLng: "en", // El idioma por defecto si no se detecta nada
    supportedLngs: ['en', 'es'],
    detection: {
      // Eliminamos 'navigator' para que no detecte el idioma del navegador por defecto.
      // Ahora, si no hay nada en localStorage, usará el fallbackLng ('en').
      order: ['localStorage'],
      caches: ['localStorage'], // Guarda la elección del usuario
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;