import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLeads } from "@/services/api";
import type { Lead } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Search,
  Filter,
  User,
  Car,
  Building,
  ExternalLink
} from "lucide-react";

// Datos obtenidos desde la API (con fallback a mocks en services)
/* const mockLeads = [
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
        sender: "lead"
      },
      {
        id: 2,
        type: "system",
        content: "Mensaje automático enviado con información del vehículo",
        timestamp: "2024-01-15T10:32:00Z",
        sender: "system"
      }
    ],
    actions: [
      { type: "created", date: "2024-01-15T10:30:00Z", description: "Lead creado desde formulario web" },
      { type: "message", date: "2024-01-15T10:32:00Z", description: "Mensaje automático enviado" }
    ]
  },
  {
    id: 2,
    name: "Carlos Ruiz",
    email: "carlos.ruiz@email.com",
    phone: "+34 687 654 321",
    concesionario: "Honda Centro",
    marca: "Honda",
    modelo: "Civic Type R",
    status: "contactado",
    lastContact: "2024-01-14T15:45:00Z",
    messages: [
      {
        id: 1,
        type: "call",
        content: "Llamada realizada - Interesado en financiación",
        timestamp: "2024-01-14T15:45:00Z",
        sender: "agent"
      }
    ],
    actions: [
      { type: "created", date: "2024-01-14T09:15:00Z", description: "Lead creado desde campaña Facebook" },
      { type: "call", date: "2024-01-14T15:45:00Z", description: "Primera llamada realizada" }
    ]
  },
  {
    id: 3,
    name: "Ana Martín",
    email: "ana.martin@email.com",
    phone: "+34 645 987 123",
    concesionario: "BMW Premium",
    marca: "BMW",
    modelo: "X3 xDrive",
    status: "convertido",
    lastContact: "2024-01-13T11:20:00Z",
    messages: [
      {
        id: 1,
        type: "email",
        content: "Oferta personalizada enviada",
        timestamp: "2024-01-13T11:20:00Z",
        sender: "agent"
      }
    ],
    actions: [
      { type: "created", date: "2024-01-10T14:30:00Z", description: "Lead creado desde landing page" },
      { type: "converted", date: "2024-01-13T11:20:00Z", description: "Venta cerrada" }
    ]
  }
]; */

const statusColors = {
  "nuevo": "bg-primary text-primary-foreground",
  "en_seguimiento": "bg-warning text-warning-foreground",
  "convertido": "bg-success text-success-foreground",
  "perdido": "bg-error text-error-foreground"
};

export default function Leads() {
  const navigate = useNavigate();
  const { data: leads } = useQuery({ queryKey: ["leads"], queryFn: getLeads });
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!selectedLead && leads && leads.length > 0) {
      setSelectedLead(leads[0]);
    }
  }, [leads, selectedLead]);

  const filteredLeads = (leads || []).filter(lead => {
    const searchTermLower = searchTerm.toLowerCase();
    return (lead.nombre + " " + lead.apellidos).toLowerCase().includes(searchTermLower) ||
           lead.email.toLowerCase().includes(searchTermLower) ||
           lead.telefono.toLowerCase().includes(searchTermLower) ||
           lead.concesionario?.toLowerCase().includes(searchTermLower) ||
           lead.marca?.toLowerCase().includes(searchTermLower);
  });

  return (
    <div className="flex h-screen">
      {/* Leads List */}
      <div className="w-80 border-r border-border bg-card flex-shrink-0">
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-card-foreground mb-4">Leads</h2>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          {filteredLeads.map((lead) => (
            <div
              key={lead.lead_id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-smooth ${
                selectedLead?.lead_id === lead.lead_id ? "bg-primary/5 border-r-2 border-r-primary" : ""
              }`}
              onClick={() => setSelectedLead(lead)}
            >
              <div className="space-y-2">
                <h3 className="font-medium text-card-foreground">
                  {lead.nombre} {lead.apellidos}
                </h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3" />
                    <span className="truncate">{lead.telefono}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{lead.email}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lead Details */}
      <div className="flex-1 flex flex-col">
        {selectedLead ? (
          <>
            {/* Header */}
            <div className="p-6 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center">
                    <User className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-card-foreground">
                      {selectedLead.nombre} {selectedLead.apellidos}
                    </h1>
                    <span>{selectedLead.email}</span>
                    <span>{selectedLead.telefono}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/leads/${selectedLead.lead_id}`)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Detalle Completo
                  </Button>
                  <Button className="bg-gradient-primary hover:bg-primary-hover">
                    <Phone className="h-4 w-4 mr-2" />
                    Llamar
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto bg-background">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lead Info */}
            <Card className="p-6 border border-border shadow-custom-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Información del Lead
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Estado</label>
                    <Badge className={`${statusColors[selectedLead.estado_actual as keyof typeof statusColors]}`}>
                      {selectedLead.estado_actual}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Último contacto</label>
                    <p className="text-sm text-card-foreground">
                      {new Date(selectedLead.last_contact_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vehicle & Dealership Info */}
            <Card className="p-6 border border-border shadow-custom-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4 flex items-center space-x-2">
                <Car className="h-5 w-5" />
                <span>Vehículo de Interés</span>
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marca</label>
                    <p className="text-sm text-card-foreground font-medium">{selectedLead.marca}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Modelo</label>
                    <p className="text-sm text-card-foreground font-medium">{selectedLead.modelo}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center space-x-2">
                    <Building className="h-4 w-4" />
                    <span>Concesionario</span>
                  </label>
                  <p className="text-sm text-card-foreground font-medium mt-1">{selectedLead.concesionario}</p>
                </div>
              </div>
            </Card>

            {/* Actions History */}
            <Card className="p-6 border border-border shadow-custom-sm">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Historial de Acciones
              </h3>
              <div className="space-y-3">
                {selectedLead.intentos_compra.map((intento, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                    <div className="mt-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">
                        Intento de compra: {intento.modelo} en {intento.concesionario}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Estado: {intento.estado}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(intento.fecha_entrada).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Presupuesto: {intento.presupuesto_min}€ - {intento.presupuesto_max}€
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Source Info */}
            <Card className="p-6 border border-border shadow-custom-sm lg:col-span-2">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Información de Origen
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de creación</label>
                  <p className="text-sm text-card-foreground">
                    {new Date(selectedLead.created_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Último contacto</label>
                  <p className="text-sm text-card-foreground">
                    {new Date(selectedLead.last_contact_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Selecciona un lead
              </h3>
              <p className="text-sm text-muted-foreground">
                Elige un lead de la lista para ver sus detalles
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
