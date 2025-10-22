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

// Enhanced types for call history
export interface CallRecord {
  llamada_id: UUID;
  lead_id: UUID;
  lead_concesionario_marca_id?: UUID;
  numero_origen?: string;
  numero_destino: string;
  estado: 'successful' | 'failed' | 'no_answer' | 'busy' | 'rejected';
  duracion?: number; // seconds
  costo?: number;
  latencia?: number; // ms
  proveedor?: string;
  call_sid?: string;
  fecha_llamada: string;
  metadata?: {
    recording_url?: string;
    transcription?: string;
    agent_name?: string;
    notas?: string;
  };
  created_at: string;
  // Aggregated fields
  agente_nombre?: string;
  marca?: string;
  concesionario?: string;
}

// WhatsApp messages with read status
export interface WhatsAppMessage {
  message_id: UUID;
  conversacion_id?: UUID;
  lead_id: UUID;
  lead_concesionario_marca_id?: UUID;
  contenido: string;
  sender: 'lead' | 'agent' | 'system';
  timestamp_mensaje: string;
  metadata?: {
    enviado?: boolean;
    leido?: boolean;
    respondido?: boolean;
    agente_nombre?: string;
    tipo_automatico?: boolean;
  };
  created_at: string;
  // Aggregated fields
  marca?: string;
  concesionario?: string;
}

// Notes and observations
export interface LeadNote {
  nota_id: UUID;
  lead_id: UUID;
  lead_concesionario_marca_id?: UUID;
  usuario_id?: UUID;
  contenido: string;
  created_at: string;
  updated_at: string;
  // Aggregated fields
  usuario_nombre?: string;
  marca?: string;
  concesionario?: string;
}

// Timeline unified event
export interface TimelineEvent {
  id: UUID;
  tipo: 'llamada' | 'whatsapp' | 'email' | 'nota' | 'cambio_estado' | 'asignacion' | 'lead_creado';
  fecha: string;
  descripcion: string;
  marca?: string;
  concesionario?: string;
  agente?: string;
  metadata?: any;
  icono?: string;
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
  prioridad?: number; // 1-5 stars
  combustible_preferido?: string;
  transmision?: string;
  urgencia?: string; // alta, media, baja
  proxima_accion?: string;
  fecha_proxima_accion?: string;
  // Campos calculados/agregados
  concesionario?: string;
  marca?: string;
  comercial_nombre?: string;
  total_llamadas?: number;
  llamadas_exitosas?: number;
  llamadas_fallidas?: number;
  total_whatsapps?: number;
  whatsapps_respondidos?: number;
  engagement_score?: number;
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
  // Additional fields for enhanced detail view
  ciudad?: string;
  provincia?: string;
  codigo_postal?: string;
  telefono_validado?: boolean;
  calidad_lead?: string; // frio, tibio, caliente, muy_caliente
  lead_score?: number; // 0-100
  opt_out?: boolean;
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

