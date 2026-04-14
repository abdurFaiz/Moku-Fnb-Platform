import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import AppRoutes from "@/routes/AppRoutes";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/index.css";
import { setupServiceWorkerUpdater } from "@/utils/serviceWorkerUpdater";
import { ModalRefreshToken } from "./components/ModalRefreshToken";
import "@fontsource/rubik/400.css"; // Regular
import "@fontsource/rubik/500.css"; // Medium

Sentry.init({
  release: `spinofy-frontend@${__APP_VERSION__}`,
  dsn: "https://130f5d868aedd80e9c8823a3da5ab8f9@o4510424714903552.ingest.us.sentry.io/4510424734957568",
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: false,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
    }),
  ],
  // Tracing
  tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
  tracePropagationTargets: ["localhost", /^https:\/\/api\.app\.spinofy\.id\/api/, /^https:\/\/my\.spinofy\.id/],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  enableLogs: true,
  denyUrls: [
    /extensions\//i,
    /^chrome:\/\//i,
    /googleads/i,
  ],
  ignoreErrors: [
    "ResizeObserver loop limit exceeded", // Error umum browser, tidak fatal
    "Network Error", // Seringkali karena internet user putus
    "Non-Error promise rejection captured",
  ],
  beforeSend(event) {
    if (event.request?.url) {
      const url = new URL(event.request.url);
      if (url.searchParams.has("token")) {
        url.searchParams.set("token", "[REDACTED]");
        event.request.url = url.toString();
      }
    }

    if (event.request?.headers) {
      if (event.request.headers["Authorization"]) {
        event.request.headers["Authorization"] = "[REDACTED]";
      }
    }

    if (event.request?.data && typeof event.request.data === 'string') {
      try {
        const data = JSON.parse(event.request.data);
        const sensitiveKeys = ["password", "password_confirmation", "pin", "token", "access_token", "refresh_token"];

        sensitiveKeys.forEach((key) => {
          if (key in data) {
            data[key] = "[REDACTED]";
          }
        });

        event.request.data = JSON.stringify(data);
      } catch (e) {
      }
    }

    return event;
  },
});

// Setup Service Worker auto-update
if ('serviceWorker' in navigator) {
  // Development mode utilities
  if (import.meta.env.DEV) {
    // Utility untuk manual clear di console
    import("@/utils/clearServiceWorker").then(({ clearServiceWorker }) => {
      (globalThis as any).clearSW = clearServiceWorker;
    });
  }

  setupServiceWorkerUpdater({
    autoUpdate: import.meta.env.DEV, // Auto update di dev, manual di production
    clearCacheOnUpdate: false, // Set true jika ingin clear cache saat update
    onUpdateFound: () => {
      console.log('🔄 Checking for updates...');
    },
    onUpdateReady: () => {
      if (!import.meta.env.DEV) {
        // Di production, tampilkan notifikasi ke user
        // Bisa tambahkan toast notification di sini jika ada
      }
    },
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <AppRoutes />
        <ModalRefreshToken />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
);