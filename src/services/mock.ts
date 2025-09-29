import type { Lead, LeadConcesionarioMarca, WorkflowConfig, CallDailyStats, WorkflowStatsEntry, TotalCallStats, ErrorEntry } from "@/types";

// Datos de ejemplo para leads
const mockLeadConcesionarios: LeadConcesionarioMarca[] = [
  {
    lead_concesionario_marca_id: "101",
    lead_id: "1",
    concesionario_marca_id: "201",
    estado: "interesado",
    modelo: "SUV-2024",
    fecha_entrada: "2024-01-15T10:00:00Z",
    presupuesto_min: 25000,
    presupuesto_max: 35000,
    concesionario: "AutoMax Madrid",
    marca: "Toyota"
  },
  {
    lead_concesionario_marca_id: "102",
    lead_id: "2",
    concesionario_marca_id: "202",
    estado: "negociacion",
    modelo: "Sedan-2024",
    fecha_entrada: "2024-01-14T15:30:00Z",
    presupuesto_min: 20000,
    presupuesto_max: 30000,
    concesionario: "CarPro Barcelona",
    marca: "Honda"
  }
];

export const mockLeads: Lead[] = [
  {
    lead_id: "1",
    nombre: "María",
    apellidos: "González",
    email: "maria.gonzalez@email.com",
    telefono: "600123456",
    telefono_e164: "+34600123456",
    estado_actual: "nuevo",
    created_at: "2024-01-15T10:00:00Z",
    last_contact_at: "2024-01-15T10:00:00Z",
    source: "web",
    campana: "verano2024",
    concesionario: "AutoMax Madrid",
    marca: "Toyota",
    modelo: "SUV-2024",
    intentos_compra: mockLeadConcesionarios.filter(item => item.lead_id === "1")
  },
  {
    lead_id: "2",
    nombre: "Juan",
    apellidos: "Pérez",
    email: "juan.perez@email.com",
    telefono: "600789012",
    telefono_e164: "+34600789012",
    estado_actual: "en_seguimiento",
    created_at: "2024-01-14T15:30:00Z",
    last_contact_at: "2024-01-15T09:00:00Z",
    source: "facebook",
    campana: "invierno2024",
    concesionario: "CarPro Barcelona",
    marca: "Honda",
    modelo: "Sedan-2024",
    intentos_compra: mockLeadConcesionarios.filter(item => item.lead_id === "2")
  }
];

// Función para obtener todos los leads
export const getLeads = async (): Promise<Lead[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(mockLeads), 500);
  });
};

// Función para obtener el historial de un lead específico
export const getLeadHistory = async (leadId: string): Promise<LeadConcesionarioMarca[]> => {
  return new Promise((resolve) => {
    const history = mockLeadConcesionarios.filter(item => item.lead_id === leadId);
    setTimeout(() => resolve(history), 500);
  });
};

