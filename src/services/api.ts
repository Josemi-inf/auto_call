import { API_BASE_URL, DEFAULT_DELAY_MS } from "@/services/config";
import {
  CallDailyStats,
  ErrorEntry,
  TotalCallStats,
  WorkflowConfig,
  WorkflowStatsEntry,
  Lead,
  CallRecord,
  WhatsAppMessage,
  LeadNote,
  TimelineEvent,
} from "@/types";
import { mockLeads } from "@/services/mock";
import {
  mockCallsData,
  mockErrors,
  mockTotalStats,
  mockWorkflows,
  mockWorkflowStats,
} from "@/services/mock-extras";

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
  const response = await maybeFetch<{ data: Lead[] }>("/leads", undefined, { data: mockLeads });
  return response.data || response as any; // Handle both { data: [] } and [] formats
}

export async function getLeadById(leadId: string): Promise<Lead> {
  const response = await maybeFetch<{ data: Lead }>(`/leads/${leadId}`, undefined, {
    data: mockLeads.find(l => l.lead_id === leadId) || mockLeads[0]
  });
  return response.data || response as any;
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
export async function testWebhook(url: string): Promise<{ ok: boolean; message?: string }> {
  console.log(`[API] Testing webhook: ${url}`);
  console.log(`[API] API_BASE_URL configured: ${!!API_BASE_URL}`);

  try {
    // If API_BASE_URL provided, prefer a backend proxy endpoint
    if (API_BASE_URL) {
      console.log(`[API] Using backend proxy at: ${API_BASE_URL}/webhooks/test`);
      const res = await fetch(`${API_BASE_URL}/webhooks/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      console.log(`[API] Backend response status: ${res.status}`);
      return { ok: res.ok, message: res.ok ? "Test exitoso via backend" : "Error en backend" };
    }

    // Direct webhook test with enhanced payload
    console.log(`[API] Testing webhook directly`);

    const testPayload = {
      test: true,
      source: "LeadFlow Webhook Test",
      timestamp: new Date().toISOString(),
      webhook_test: {
        trigger_time: new Date().toISOString(),
        test_id: `test_${Date.now()}`,
        app_name: "LeadFlow",
        version: "1.0.0"
      },
      sample_lead_data: {
        lead_id: "sample_lead_123",
        email: "test@leadflow.com",
        name: "Test Lead",
        phone: "+1234567890",
        campaign: "webhook_test",
        source: "manual_test",
        created_at: new Date().toISOString()
      }
    };

    console.log(`[API] Sending enhanced payload:`, testPayload);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "LeadFlow-WebhookTester/1.0"
      },
      body: JSON.stringify(testPayload),
    });

    const success = response.ok;
    console.log(`[API] Direct webhook test result: ${success ? 'SUCCESS' : 'FAILED'} (Status: ${response.status})`);

    return {
      ok: success,
      message: success
        ? "Webhook ejecutado correctamente"
        : `Error HTTP ${response.status}: ${response.statusText}`
    };

  } catch (error) {
    console.error(`[API] Webhook test failed:`, error);

    // If it's a CORS error, try no-cors mode as fallback
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.log(`[API] Trying no-cors fallback...`);
      try {
        await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            test: true,
            source: "LeadFlow (no-cors mode)",
            timestamp: new Date().toISOString()
          }),
        });
        return { ok: true, message: "Solicitud enviada (modo no-cors - verificar endpoint)" };
      } catch (noCorsError) {
        console.error(`[API] No-cors fallback also failed:`, noCorsError);
      }
    }

    return {
      ok: false,
      message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// Lead Detail Functions

export async function getCallHistory(leadId: string, brandDealershipId?: string): Promise<CallRecord[]> {
  const query = brandDealershipId ? `?brand_dealership_id=${brandDealershipId}` : "";
  return maybeFetch<CallRecord[]>(`/leads/${leadId}/calls${query}`, undefined, []);
}

export async function getWhatsAppMessages(leadId: string, brandDealershipId?: string): Promise<WhatsAppMessage[]> {
  const query = brandDealershipId ? `?brand_dealership_id=${brandDealershipId}` : "";
  return maybeFetch<WhatsAppMessage[]>(`/leads/${leadId}/whatsapp${query}`, undefined, []);
}

export async function getLeadNotes(leadId: string, brandDealershipId?: string): Promise<LeadNote[]> {
  const query = brandDealershipId ? `?brand_dealership_id=${brandDealershipId}` : "";
  return maybeFetch<LeadNote[]>(`/leads/${leadId}/notes${query}`, undefined, []);
}

export async function addLeadNote(leadId: string, brandDealershipId: string, content: string): Promise<LeadNote> {
  if (!API_BASE_URL) {
    await delay(DEFAULT_DELAY_MS);
    return {
      nota_id: `note_${Date.now()}`,
      lead_id: leadId,
      lead_concesionario_marca_id: brandDealershipId,
      contenido: content,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      usuario_nombre: "Usuario Demo"
    };
  }
  const res = await fetch(`${API_BASE_URL}/leads/${leadId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brand_dealership_id: brandDealershipId, content }),
  });
  if (!res.ok) throw new Error(`Create note failed: ${res.status}`);
  return (await res.json()) as LeadNote;
}

export async function getLeadTimeline(leadId: string): Promise<TimelineEvent[]> {
  return maybeFetch<TimelineEvent[]>(`/leads/${leadId}/timeline`, undefined, []);
}
