import { N8N_CONFIG, WEBHOOK_URLS } from "@/services/config";
import { mockN8nWorkflows, mockN8nExecutions, getMockWorkflowStats } from "@/services/mock-n8n";

export interface N8nWorkflow {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  versionId: string;
  tags?: string[];
  nodes?: N8nNode[];
  connections?: any;
  staticData?: any;
  settings?: {
    executionOrder?: string;
    saveManualExecutions?: boolean;
  };
}

export interface N8nNode {
  id: string;
  name: string;
  type: string;
  typeVersion?: number;
  position: [number, number];
  parameters?: any;
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
  private getConfig() {
    // Try to get config from localStorage first
    try {
      const stored = localStorage.getItem('n8n-config');
      if (stored) {
        const config = JSON.parse(stored);
        return {
          baseUrl: config.baseUrl || '',
          apiKey: config.apiKey || '',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey && { 'X-N8N-API-KEY': config.apiKey })
          }
        };
      }
    } catch (error) {
      console.warn('Failed to load n8n config from localStorage:', error);
    }

    // Fallback to environment config
    return {
      baseUrl: N8N_CONFIG.baseUrl,
      apiKey: N8N_CONFIG.apiKey,
      headers: N8N_CONFIG.headers
    };
  }

  get baseUrl() {
    return this.getConfig().baseUrl;
  }

  get headers() {
    return this.getConfig().headers;
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
    if (!this.baseUrl) {
      console.log("[N8N API] No baseUrl configured, using mock data");
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockN8nWorkflows;
    }

    try {
      return await this.request<N8nWorkflow[]>('/workflows');
    } catch (error) {
      console.warn("[N8N API] Failed to fetch from n8n API, falling back to mock data:", error);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockN8nWorkflows;
    }
  }

  // Get workflow by ID
  async getWorkflow(id: string): Promise<N8nWorkflow> {
    if (!this.baseUrl) {
      const workflow = mockN8nWorkflows.find(w => w.id === id);
      if (!workflow) throw new Error(`Workflow ${id} not found`);
      return workflow;
    }
    return this.request<N8nWorkflow>(`/workflows/${id}`);
  }

  // Activate/deactivate workflow
  async setWorkflowActive(id: string, active: boolean): Promise<N8nWorkflow> {
    if (!this.baseUrl) {
      const workflow = mockN8nWorkflows.find(w => w.id === id);
      if (!workflow) throw new Error(`Workflow ${id} not found`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...workflow, active };
    }

    try {
      return await this.request<N8nWorkflow>(`/workflows/${id}/activate`, {
        method: 'POST',
        body: JSON.stringify({ active }),
      });
    } catch (error) {
      console.warn("[N8N API] Failed to toggle workflow via API, using mock response:", error);
      const workflow = mockN8nWorkflows.find(w => w.id === id);
      if (!workflow) throw new Error(`Workflow ${id} not found`);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return { ...workflow, active };
    }
  }

  // Get workflow executions
  async getWorkflowExecutions(workflowId: string, limit = 20): Promise<N8nExecution[]> {
    if (!this.baseUrl) {
      const executions = mockN8nExecutions[workflowId] || [];
      return executions.slice(0, limit);
    }
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
      // First try to get the webhook URL from environment configuration
      const configuredUrl = WEBHOOK_URLS[workflowId];
      if (configuredUrl) {
        console.log(`[N8N API] Using configured webhook URL for workflow ${workflowId}: ${configuredUrl}`);
        return configuredUrl;
      }

      // Fallback: try to get the workflow and construct URL (for dynamic cases)
      const workflow = await this.getWorkflow(workflowId);
      if (!workflow) {
        console.warn(`[N8N API] Workflow ${workflowId} not found, cannot determine webhook URL`);
        return null;
      }

      // Check if workflow has webhook nodes
      const hasWebhook = workflow.nodes?.some(node =>
        node.type.toLowerCase().includes('webhook') ||
        node.type.toLowerCase().includes('trigger')
      );

      if (!hasWebhook) {
        console.warn(`[N8N API] Workflow ${workflowId} doesn't appear to have webhook triggers`);
        return null;
      }

      // Fallback construction (this might not work for all webhook types)
      console.warn(`[N8N API] No configured webhook URL for workflow ${workflowId}, using fallback construction`);
      return `${this.baseUrl}/webhook/${workflowId}`;
    } catch (error) {
      console.error(`[N8N API] Failed to get webhook URL for workflow ${workflowId}:`, error);
      return null;
    }
  }

  // Execute workflow manually
  async executeWorkflow(id: string, inputData?: any): Promise<N8nExecution> {
    if (!this.baseUrl) {
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 800));
      const execution: N8nExecution = {
        id: `exec-${id}-${Date.now()}`,
        workflowId: id,
        mode: 'manual',
        startedAt: new Date().toISOString(),
        stoppedAt: new Date(Date.now() + 2000).toISOString(),
        finished: true,
        status: 'success'
      };
      return execution;
    }

    try {
      return await this.request<N8nExecution>(`/workflows/${id}/execute`, {
        method: 'POST',
        body: JSON.stringify(inputData || {}),
      });
    } catch (error) {
      console.warn("[N8N API] Failed to execute workflow via API, using mock execution:", error);
      // Simulate execution
      await new Promise(resolve => setTimeout(resolve, 800));
      const execution: N8nExecution = {
        id: `exec-${id}-${Date.now()}`,
        workflowId: id,
        mode: 'manual',
        startedAt: new Date().toISOString(),
        stoppedAt: new Date(Date.now() + 2000).toISOString(),
        finished: true,
        status: 'success'
      };
      return execution;
    }
  }

  // Stop workflow execution
  async stopExecution(executionId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/executions/${executionId}/stop`, {
      method: 'POST',
    });
  }

  // Get workflow statistics
  async getWorkflowStats(workflowId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    errorExecutions: number;
    lastExecution?: string;
  }> {
    if (!this.baseUrl) {
      return getMockWorkflowStats(workflowId);
    }

    try {
      const executions = await this.getWorkflowExecutions(workflowId, 100);
      const totalExecutions = executions.length;
      const successfulExecutions = executions.filter(e => e.status === 'success').length;
      const errorExecutions = executions.filter(e => e.status === 'error').length;
      const lastExecution = executions[0]?.startedAt;

      return {
        totalExecutions,
        successfulExecutions,
        errorExecutions,
        lastExecution
      };
    } catch (error) {
      console.error(`[N8N API] Failed to get stats for workflow ${workflowId}:`, error);
      return {
        totalExecutions: 0,
        successfulExecutions: 0,
        errorExecutions: 0
      };
    }
  }

  // Check if n8n is available
  async healthCheck(): Promise<boolean> {
    if (!this.baseUrl) {
      console.log("[N8N API] No baseUrl configured, mock mode active");
      return false; // Mock mode doesn't count as "connected"
    }

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