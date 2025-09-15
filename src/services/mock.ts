import { CallDailyStats, ErrorEntry, TotalCallStats, WorkflowConfig, WorkflowStatsEntry, Lead } from "@/types";

export const mockLeads: Lead[] = [
  {
    id: 1,
    name: "María González",
    email: "maria.gonzalez@email.com",
    phone: "+34 612 345 678",
    concesionario: "Toyota Madrid Norte",
    marca: "Toyota",
    modelo: "Corolla Hybrid",
    status: "nuevo",
    lastContact: "2024-01-15T10:30:00Z",
    messages: [
      {
        id: 1,
        type: "whatsapp",
        content: "Hola, me interesa el Toyota Corolla Hybrid. ¿Podrían enviarme más información?",
        timestamp: "2024-01-15T10:30:00Z",
        sender: "lead",
      },
      {
        id: 2,
        type: "system",
        content: "Mensaje automático enviado con información del vehículo",
        timestamp: "2024-01-15T10:32:00Z",
        sender: "system",
      },
    ],
    actions: [
      { type: "created", date: "2024-01-15T10:30:00Z", description: "Lead creado desde formulario web" },
      { type: "message", date: "2024-01-15T10:32:00Z", description: "Mensaje automático enviado" },
    ],
  },
];

export const mockWorkflows: WorkflowConfig[] = [
  {
    id: "w1",
    name: "Seguimiento Automático Toyota",
    url: "https://example.com/webhook",
    description: "Webhook principal de Toyota",
    isActive: true,
    lastTested: "2024-01-14T16:30:00Z",
    testStatus: "success",
  },
];

export const mockCallsData: CallDailyStats[] = [
  { date: "2024-01-08", total: 145, successful: 89, failed: 56, duration: 2340, cost: 234.5 },
  { date: "2024-01-09", total: 167, successful: 98, failed: 69, duration: 2890, cost: 289.2 },
  { date: "2024-01-10", total: 134, successful: 76, failed: 58, duration: 1980, cost: 198.3 },
  { date: "2024-01-11", total: 189, successful: 125, failed: 64, duration: 3120, cost: 312.1 },
  { date: "2024-01-12", total: 156, successful: 94, failed: 62, duration: 2680, cost: 268.4 },
  { date: "2024-01-13", total: 178, successful: 112, failed: 66, duration: 2950, cost: 295.8 },
  { date: "2024-01-14", total: 165, successful: 101, failed: 64, duration: 2750, cost: 275.6 },
];

export const mockWorkflowStats: WorkflowStatsEntry[] = [
  { name: "Toyota", calls: 456, successful: 342, failed: 114, percentage: 75 },
  { name: "Honda", calls: 287, successful: 201, failed: 86, percentage: 70 },
  { name: "BMW", calls: 189, successful: 156, failed: 33, percentage: 83 },
  { name: "Mercedes", calls: 123, successful: 89, failed: 34, percentage: 72 },
];

export const mockTotalStats: TotalCallStats = {
  totalCalls: 1200,
  successfulCalls: 788,
  failedCalls: 267,
  noAnswerCalls: 145,
  totalDuration: 18420,
  totalCost: 1842.5,
  avgDuration: 15.35,
  avgLatency: 2.8,
  successRate: 65.7,
  costPerCall: 1.54,
};

export const mockErrors: ErrorEntry[] = [
  {
    id: 1,
    title: "Error de conexión API n8n",
    description: "Fallo al conectar con el endpoint de workflows. La API no responde correctamente.",
    type: "connection",
    severity: "critical",
    status: "pending",
    workflow: "Seguimiento Automático Toyota",
    timestamp: "2024-01-15T14:30:00Z",
    affectedLeads: 12,
    details: {
      error: "Connection timeout after 30 seconds",
      endpoint: "https://n8n.example.com/api/workflows/1/execute",
      lastAttempt: "2024-01-15T14:35:00Z",
      retryCount: 3,
    },
    actions: [
      { type: "retry", label: "Reintentar conexión" },
      { type: "config", label: "Revisar configuración" },
      { type: "details", label: "Ver detalles completos" },
    ],
  },
];

