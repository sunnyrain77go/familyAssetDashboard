/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GS_API_KEY: string
  readonly VITE_GS_SHEET_ID: string
  readonly VITE_GS_RANGE: string
  readonly VITE_GOOGLE_CLIENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
