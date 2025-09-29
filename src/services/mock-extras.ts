import type {
  WorkflowConfig,
  CallDailyStats,
  WorkflowStatsEntry,
  TotalCallStats,
  ErrorEntry,
} from "@/types";

export const mockWorkflows: WorkflowConfig[] = [
  {
    id: "wf-1",
    name: "Webhook Leads Web",
    url: "https://example.com/webhooks/leads",
    description: "Recibe leads del formulario web y los inserta en DB",
    isActive: true,
    lastTested: new Date().toISOString(),
    testStatus: "success",
  },
  {
    id: "wf-2",
    name: "Sincronización Facebook Ads",
    url: "https://example.com/webhooks/fb-ads",
    description: "Importa leads de campañas de Facebook",
    isActive: false,
    lastTested: new Date().toISOString(),
    testStatus: "error",
  },
];

export const mockCallsData: CallDailyStats[] = [
  { date: "2024-01-10", total: 40, successful: 22, failed: 18, duration: 190, cost: 18.4 },
  { date: "2024-01-11", total: 52, successful: 30, failed: 22, duration: 240, cost: 22.1 },
  { date: "2024-01-12", total: 47, successful: 29, failed: 18, duration: 210, cost: 19.3 },
  { date: "2024-01-13", total: 36, successful: 21, failed: 15, duration: 165, cost: 15.9 },
  { date: "2024-01-14", total: 60, successful: 35, failed: 25, duration: 285, cost: 26.7 },
  { date: "2024-01-15", total: 55, successful: 33, failed: 22, duration: 260, cost: 24.8 },
];

export const mockWorkflowStats: WorkflowStatsEntry[] = [
  { name: "Webhook Leads Web", calls: 120, successful: 78, failed: 42, percentage: Math.round((78/120)*100) },
  { name: "Facebook Ads", calls: 95, successful: 63, failed: 32, percentage: Math.round((63/95)*100) },
  { name: "Retargeting", calls: 48, successful: 28, failed: 20, percentage: Math.round((28/48)*100) },
];

export const mockTotalStats: TotalCallStats = {
  totalCalls: 385,
  successfulCalls: 236,
  failedCalls: 149,
  noAnswerCalls: 61,
  totalDuration: 1350,
  totalCost: 128.75,
  avgDuration: Number((1350 / 385).toFixed(2)),
  avgLatency: 4.6,
  successRate: Number(((236 / 385) * 100).toFixed(1)),
  costPerCall: Number((128.75 / 385).toFixed(3)),
};

export const mockErrors: ErrorEntry[] = [
  {
    id: 1,
    title: "Fallo de conexión a n8n",
    description: "Timeout al llamar al webhook /webhooks/leads",
    type: "connection",
    severity: "error",
    status: "investigating",
    workflow: "Webhook Leads Web",
    timestamp: new Date().toISOString(),
    affectedLeads: 3,
    details: { code: "ETIMEDOUT", retryAfter: 60 },
    actions: [
      { type: "retry", label: "Reintentar" },
      { type: "view", label: "Ver detalles" },
    ],
  },
  {
    id: 2,
    title: "Datos incompletos del lead",
    description: "Falta el campo email en el payload",
    type: "data",
    severity: "warning",
    status: "pending",
    workflow: "Sincronización Facebook Ads",
    timestamp: new Date().toISOString(),
    affectedLeads: 5,
    details: { field: "email", rule: "required" },
    actions: [
      { type: "map", label: "Revisar mapeo" },
    ],
  },
];

