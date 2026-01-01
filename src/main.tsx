import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { I18nextProvider } from 'react-i18next';
import i18n from './lib/i18n';
import SplashScreen from "./pages/SplashScreen.tsx";
import ErrorBoundary from "./components/ErrorBoundary.tsx";
import { ThemeProvider } from "./components/ThemeProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <React.Suspense fallback={
    <ThemeProvider attribute="class" defaultTheme="system" storageKey="vite-ui-theme">
      <SplashScreen />
    </ThemeProvider>
  }>
    <ErrorBoundary>
      <I18nextProvider i18n={i18n}>
        <App />
      </I18nextProvider>
    </ErrorBoundary>
  </React.Suspense>
);