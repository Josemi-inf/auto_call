export interface LeadMessage {
  id: number | string;
  type: 'whatsapp' | 'email' | 'call' | 'system';
  content: string;
  timestamp: string;
  sender: 'lead' | 'agent' | 'system';
}

export interface LeadAction {
  type: string;
  date: string;
  description: string;
}

export interface Lead {
  id: number | string;
  name: string;
  email: string;
  phone: string;
  concesionario: string;
  marca: string;
  modelo: string;
  status: 'nuevo' | 'contactado' | 'convertido' | 'perdido' | string;
  lastContact: string;
  messages: LeadMessage[];
  actions: LeadAction[];
}

export interface WorkflowConfig {
  id: string;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
  lastTested?: string | Date;
  testStatus?: 'success' | 'error' | 'pending';
}

export interface CallDailyStats {
  date: string; // YYYY-MM-DD
  total: number;
  successful: number;
  failed: number;
  duration: number; // minutes
  cost: number; // currency units
}

export interface WorkflowStatsEntry {
  name: string;
  calls: number;
  successful: number;
  failed: number;
  percentage: number; // success rate
}

export interface PieEntry {
  name: string;
  value: number;
  color?: string;
}

export interface TotalCallStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  noAnswerCalls: number;
  totalDuration: number; // minutes
  totalCost: number;
  avgDuration: number; // minutes
  avgLatency: number; // seconds
  successRate: number; // percentage
  costPerCall: number;
}

export interface ErrorDetailsMap {
  [key: string]: any;
}

export interface ErrorEntry {
  id: number | string;
  title: string;
  description: string;
  type: 'connection' | 'data' | 'limit' | 'workflow' | string;
  severity: 'critical' | 'error' | 'warning' | 'minor' | string;
  status: 'pending' | 'resolved' | 'investigating' | string;
  workflow: string;
  timestamp: string;
  affectedLeads: number;
  details: ErrorDetailsMap;
  actions: Array<{ type: string; label: string }>;
}

