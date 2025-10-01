export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "";
export const N8N_BASE_URL = (import.meta as any).env?.VITE_N8N_BASE_URL || "";
export const N8N_API_KEY = (import.meta as any).env?.VITE_N8N_API_KEY || "";

// n8n Project and Folder IDs
export const N8N_PROJECT_ID = (import.meta as any).env?.VITE_N8N_PROJECT_ID || "rxQ8hI6Swqb7nEbu";
export const N8N_FOLDER_ID = (import.meta as any).env?.VITE_N8N_FOLDER_ID || "NVYJCuJItmlVruSj";

// Optional: default timeout for simulated requests
export const DEFAULT_DELAY_MS = 250;

// Webhook URLs configuration
export const WEBHOOK_URLS: Record<string, string> = {
  "1": (import.meta as any).env?.VITE_WEBHOOK_1 || "",
  "2": (import.meta as any).env?.VITE_WEBHOOK_2 || "",
  "3": (import.meta as any).env?.VITE_WEBHOOK_3 || "",
  "4": (import.meta as any).env?.VITE_WEBHOOK_4 || "",
  "5": (import.meta as any).env?.VITE_WEBHOOK_5 || "",
  "6": (import.meta as any).env?.VITE_WEBHOOK_6 || "",
  "7": (import.meta as any).env?.VITE_WEBHOOK_7 || "",
  "8": (import.meta as any).env?.VITE_WEBHOOK_8 || "",
  "9": (import.meta as any).env?.VITE_WEBHOOK_9 || "",
  "10": (import.meta as any).env?.VITE_WEBHOOK_10 || "",
  "11": (import.meta as any).env?.VITE_WEBHOOK_11 || "",
  "12": (import.meta as any).env?.VITE_WEBHOOK_12 || ""
};

// n8n API configuration
export const N8N_CONFIG = {
  baseUrl: N8N_BASE_URL,
  apiKey: N8N_API_KEY,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(N8N_API_KEY && {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Authorization': `Bearer ${N8N_API_KEY}`
    })
  }
};

