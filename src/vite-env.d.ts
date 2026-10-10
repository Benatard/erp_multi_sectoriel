/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_TAGLINE?: string;
  readonly VITE_FORGE_URL?: string;
  readonly VITE_FORGE_PROJECT_KEY?: string;
  readonly VITE_FORGE_API_KEY?: string;
  readonly VITE_FORGE_ENABLED?: string;
  readonly VITE_FORGE_AUTH_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}