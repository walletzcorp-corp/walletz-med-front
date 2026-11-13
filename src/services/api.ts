// URL base da API. Pode ser sobrescrita via VITE_API_URL no .env do front.
export const API_URL: string =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000";
