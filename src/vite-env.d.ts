/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOG_API_ENDPOINT: string
  readonly VITE_AI_API_ENDPOINT: string
  readonly VITE_AI_API_KEY: string
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // diğer env değişkenleri buraya eklenebilir
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
