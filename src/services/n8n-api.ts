import { N8N_CONFIG } from "@/services/config";

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  versionId: string;
  tags?: string[];
}

export interface N8nExecution {
  id: string;
  workflowId: string;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  finished: boolean;
  status: 'running' | 'success' | 'error' | 'waiting' | 'canceled';
}

export interface N8nWebhookTestResult {
  success: boolean;
  message: string;
  executionId?: string;
}

class N8nApiService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = N8N_CONFIG.baseUrl;
    this.headers = N8N_CONFIG.headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.baseUrl) {
      throw new Error("N8N_BASE_URL no está configurada");
    }

    const url = `${this.baseUrl}/api/v1${endpoint}`;
    console.log(`[N8N API] ${options?.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[N8N API] Error: ${response.status} - ${errorText}`);
      throw new Error(`N8N API Error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  // Get all workflows
  async getWorkflows(): Promise<N8nWorkflow[]> {
    return this.request<N8nWorkflow[]>('/workflows');
  }

  // Get workflow by ID
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(`/workflows/${id}`);
  }

  // Activate/deactivate workflow
  async setWorkflowActive(id: string, active: boolean): Promise<N8nWorkflow> {
    return this.request<N8nWorkflow>(`/workflows/${id}/activate`, {
      method: 'POST',
      body: JSON.stringify({ active }),
    });
  }

  // Get workflow executions
  async getWorkflowExecutions(workflowId: string, limit = 20): Promise<N8nExecution[]> {
    return this.request<N8nExecution[]>(`/executions?workflowId=${workflowId}&limit=${limit}`);
  }

  // Test webhook by triggering it
  async testWebhook(webhookUrl: string, testData?: Record<string, any>): Promise<N8nWebhookTestResult> {
    console.log(`[N8N API] Testing webhook: ${webhookUrl}`);

    const payload = {
      test: true,
      timestamp: new Date().toISOString(),
      source: "LeadFlow Webhook Test",
      data: testData || {
        lead_id: "test-lead-123",
        email: "test@example.com",
        name: "Test Lead",
        campaign: "webhook-test"
      }
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const success = response.ok;
      const message = success
        ? "Webhook ejecutado correctamente"
        : `Error HTTP ${response.status}: ${response.statusText}`;

      console.log(`[N8N API] Webhook test result: ${success ? 'SUCCESS' : 'FAILED'}`);

      return {
        success,
        message,
        executionId: response.headers.get('x-n8n-execution-id') || undefined
      };
    } catch (error) {
      console.error(`[N8N API] Webhook test failed:`, error);
      return {
        success: false,
        message: `Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  // Get webhook URL for a workflow (if it has webhook triggers)
  async getWorkflowWebhookUrl(workflowId: string): Promise<string | null> {
    try {
      const workflow = await this.getWorkflow(workflowId);
      // Note: This would need the full workflow definition to extract webhook URLs
      // For now, return a constructed URL based on n8n conventions
      return `${this.baseUrl}/webhook/${workflowId}`;
    } catch (error) {
      console.error(`[N8N API] Failed to get webhook URL for workflow ${workflowId}:`, error);
      return null;
    }
  }

  // Check if n8n is available
  async healthCheck(): Promise<boolean> {
    try {
      await this.request('/workflows?limit=1');
      return true;
    } catch (error) {
      console.error('[N8N API] Health check failed:', error);
      return false;
    }
  }
}

export const n8nApi = new N8nApiService();

// Export utility functions
export async function testN8nWebhook(url: string, data?: Record<string, any>): Promise<N8nWebhookTestResult> {
  return n8nApi.testWebhook(url, data);
}

export async function getN8nWorkflows(): Promise<N8nWorkflow[]> {
  return n8nApi.getWorkflows();
}

export async function isN8nAvailable(): Promise<boolean> {
  return n8nApi.healthCheck();
}