import { API_BASE_URL, DEFAULT_DELAY_MS } from "@/services/config";
import {
  CallDailyStats,
  ErrorEntry,
  TotalCallStats,
  WorkflowConfig,
  WorkflowStatsEntry,
  Lead,
} from "@/types";
import {
  mockCallsData,
  mockErrors,
  mockLeads,
  mockTotalStats,
  mockWorkflows,
  mockWorkflowStats,
} from "@/services/mock";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function maybeFetch<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  if (!API_BASE_URL) {
    // Simulate latency and return fallback
    await delay(DEFAULT_DELAY_MS);
    if (fallback === undefined) throw new Error("No API configured and no fallback provided");
    return fallback;
  }
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return (await res.json()) as T;
}

// Leads
export async function getLeads(): Promise<Lead[]> {
  return maybeFetch<Lead[]>("/leads", undefined, mockLeads);
}

// Workflows (webhooks)
export async function getWorkflows(): Promise<WorkflowConfig[]> {
  return maybeFetch<WorkflowConfig[]>("/workflows", undefined, mockWorkflows);
}

// Create workflow
export async function createWorkflow(data: Omit<WorkflowConfig, "id">): Promise<WorkflowConfig> {
  if (!API_BASE_URL) {
    return { ...data, id: Date.now().toString() };
  }
  const res = await fetch(`${API_BASE_URL}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Create failed: ${res.status}`);
  return (await res.json()) as WorkflowConfig;
}

// Update workflow
export async function updateWorkflow(id: string, patch: Partial<WorkflowConfig>): Promise<WorkflowConfig> {
  if (!API_BASE_URL) {
    // In fallback, return merged object with the provided id
    return { id, name: "", url: "", isActive: true, ...patch } as WorkflowConfig;
  }
  const res = await fetch(`${API_BASE_URL}/workflows/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return (await res.json()) as WorkflowConfig;
}

// Delete workflow
export async function deleteWorkflow(id: string): Promise<{ id: string }> {
  if (!API_BASE_URL) {
    return { id };
  }
  const res = await fetch(`${API_BASE_URL}/workflows/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
  return { id };
}

// Statistics
export async function getCallTimeseries(params?: { from?: string; to?: string; workflow?: string }): Promise<CallDailyStats[]> {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  return maybeFetch<CallDailyStats[]>(`/stats/calls${query}`, undefined, mockCallsData);
}

export async function getWorkflowStats(): Promise<WorkflowStatsEntry[]> {
  return maybeFetch<WorkflowStatsEntry[]>(`/stats/workflows`, undefined, mockWorkflowStats);
}

export async function getTotalCallStats(): Promise<TotalCallStats> {
  return maybeFetch<TotalCallStats>(`/stats/total`, undefined, mockTotalStats);
}

// Errors
export async function getErrors(params?: { type?: string; severity?: string; status?: string; q?: string }): Promise<ErrorEntry[]> {
  const query = params ? `?${new URLSearchParams(params as any).toString()}` : "";
  return maybeFetch<ErrorEntry[]>(`/errors${query}`, undefined, mockErrors);
}

// Utilities
export async function testWebhook(url: string): Promise<{ ok: boolean }> {
  try {
    // If API_BASE_URL provided, prefer a backend proxy endpoint
    if (API_BASE_URL) {
      const res = await fetch(`${API_BASE_URL}/webhooks/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      return { ok: res.ok };
    }
    // Fallback: best-effort direct call with no-cors
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      mode: "no-cors",
      body: JSON.stringify({ test: true, source: "LeadFlow" }),
    });
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
