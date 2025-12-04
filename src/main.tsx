import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';
import SplashScreen from "./pages/SplashScreen.tsx";

createRoot(document.getElementById("root")!).render(
  <React.Suspense fallback={<SplashScreen />}>
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </React.Suspense>
);