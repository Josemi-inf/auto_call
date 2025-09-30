import type { N8nWorkflow, N8nExecution } from "./n8n-api";

// Mock workflows removed - app now uses real n8n data
export const mockN8nWorkflows: N8nWorkflow[] = [];

// Mock executions removed - app now uses real n8n data
export const mockN8nExecutions: Record<string, N8nExecution[]> = {};

export function getMockWorkflowStats(workflowId: string) {
  const executions = mockN8nExecutions[workflowId] || [];
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
}