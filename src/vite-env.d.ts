/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_API_KEY: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN: string;
  readonly VITE_FIREBASE_PROJECT_ID: string;
  readonly VITE_FIREBASE_APP_ID: string;
  readonly VITE_USE_EMULATORS: string;
  /** Backend base URL, e.g. http://localhost:8080. Empty = same origin. */
  readonly VITE_API_URL?: string;
  /** `true` serves the in-memory APIs in mock/ (pueblos, admin login, usuarios, admin salas) from Vite. */
  readonly VITE_API_MOCK?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
