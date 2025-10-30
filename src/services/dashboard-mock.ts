// Re-export stats functions from API
export { getStatsOverview, getStatsByMarca, getWeeklyLeadsData } from "./api";

// Mock service para el dashboard mientras configuramos la conexión correcta
export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  convertedLeads: number;
  activeWorkflows: number;
  pendingErrors: number;
  todayCalls: number;
  weeklyGrowth: number;
}

export interface RecentActivity {
  id: string;
  type: 'lead_created' | 'workflow_completed' | 'error' | 'lead_converted' | 'call_completed';
  message: string;
  time: string;
  status: 'success' | 'error' | 'warning';
  created_at: Date;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Simular delay de API
  await new Promise(resolve => setTimeout(resolve, 1000));

  return {
    totalLeads: 2847,
    activeLeads: 1234,
    convertedLeads: 567,
    activeWorkflows: 8,
    pendingErrors: 3,
    todayCalls: 156,
    weeklyGrowth: 12.5
  };
};

export const getRecentActivity = async (): Promise<RecentActivity[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));

  return [
    {
      id: "1",
      type: "lead_created",
      message: "Nuevo lead: María González - Toyota Corolla",
      time: "Hace 5 minutos",
      status: "success",
      created_at: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      id: "2",
      type: "workflow_completed",
      message: "Workflow completado para lead #2843",
      time: "Hace 12 minutos",
      status: "success",
      created_at: new Date(Date.now() - 12 * 60 * 1000)
    },
    {
      id: "3",
      type: "error",
      message: "Error en workflow de llamadas automáticas",
      time: "Hace 18 minutos",
      status: "error",
      created_at: new Date(Date.now() - 18 * 60 * 1000)
    },
    {
      id: "4",
      type: "lead_converted",
      message: "Lead convertido: Carlos Ruiz - Honda Civic",
      time: "Hace 25 minutos",
      status: "success",
      created_at: new Date(Date.now() - 25 * 60 * 1000)
    },
    {
      id: "5",
      type: "call_completed",
      message: "Llamada exitosa a +34 666 123 456",
      time: "Hace 32 minutos",
      status: "success",
      created_at: new Date(Date.now() - 32 * 60 * 1000)
    }
  ];
};

export const getWorkflowPerformance = async () => {
  await new Promise(resolve => setTimeout(resolve, 700));

  return [
    {
      name: "WhatsApp Follow-up",
      totalExecutions: 245,
      successful: 221,
      failed: 24,
      successRate: 90
    },
    {
      name: "Email Campaign Welcome",
      totalExecutions: 189,
      successful: 156,
      failed: 33,
      successRate: 83
    },
    {
      name: "Lead Qualification",
      totalExecutions: 156,
      successful: 134,
      failed: 22,
      successRate: 86
    },
    {
      name: "SMS Reminder",
      totalExecutions: 78,
      successful: 45,
      failed: 33,
      successRate: 58
    },
    {
      name: "Cold Call Campaign",
      totalExecutions: 167,
      successful: 123,
      failed: 44,
      successRate: 74
    }
  ];
};