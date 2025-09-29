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

export interface LeadConcesionarioMarca {
  lead_concesionario_marca_id: UUID;
  lead_id: UUID;
  concesionario_marca_id: UUID;
  estado: string;
  modelo: string;
  fecha_entrada: string;
  presupuesto_min: number;
  presupuesto_max: number;
  notas?: string;
  comercial_id?: UUID;
  fecha_asignacion?: string;
  fecha_cierre?: string;
  motivo_perdida?: string;
  // Campos calculados/agregados
  concesionario?: string;
  marca?: string;
}

// Tipo para UUIDs de PostgreSQL
type UUID = string;

export interface Lead {
  lead_id: UUID;
  nombre: string;
  apellidos: string;
  email: string;
  telefono: string;
  telefono_e164: string;
  estado_actual: string;
  created_at: string;
  last_contact_at: string;
  source: string;
  campana: string;
  // Campos calculados/agregados
  concesionario?: string;
  marca?: string;
  modelo?: string;
  intentos_compra: LeadConcesionarioMarca[];
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

