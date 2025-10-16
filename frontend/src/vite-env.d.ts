/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 백엔드 API 베이스 URL (예: http://localhost:5000) */
  readonly VITE_API_BASE?: string; // 선택값이면 ? 로 선언
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
