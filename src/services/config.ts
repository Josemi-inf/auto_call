export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";
export const N8N_BASE_URL = (import.meta as any).env?.VITE_N8N_BASE_URL || "";
export const N8N_API_KEY = (import.meta as any).env?.VITE_N8N_API_KEY || "";

// Optional: default timeout for simulated requests
export const DEFAULT_DELAY_MS = 250;

// n8n API configuration
export const N8N_CONFIG = {
  baseUrl: N8N_BASE_URL,
  apiKey: N8N_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    ...(N8N_API_KEY && { 'X-N8N-API-KEY': N8N_API_KEY })
  }
};

