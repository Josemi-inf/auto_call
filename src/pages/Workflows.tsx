import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Square, 
  Edit, 
  Trash2, 
  Plus,
  GitBranch,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  PlayCircle
} from "lucide-react";

const mockWorkflows = [
  {
    id: 1,
    name: "Seguimiento Automático Toyota",
    description: "Workflow para seguimiento automático de leads interesados en vehículos Toyota",
    status: "active",
    leadsCount: 45,
    successRate: 78,
    lastExecution: "2024-01-15T14:30:00Z",
    steps: [
      { id: 1, name: "Captura de Lead", type: "trigger", status: "completed" },
      { id: 2, name: "Envío WhatsApp Inicial", type: "action", status: "completed" },
      { id: 3, name: "Esperar 2 horas", type: "delay", status: "active" },
      { id: 4, name: "Llamada Automática", type: "action", status: "pending" },
      { id: 5, name: "Envío Email Oferta", type: "action", status: "pending" }
    ]
  },
  {
    id: 2,
    name: "Recuperación de Leads Fríos",
    description: "Reactivación de leads que no han respondido en 7 días",
    status: "paused",
    leadsCount: 23,
    successRate: 45,
    lastExecution: "2024-01-14T09:15:00Z",
    steps: [
      { id: 1, name: "Filtrar Leads Inactivos", type: "trigger", status: "completed" },
      { id: 2, name: "Envío SMS Promocional", type: "action", status: "error" },
      { id: 3, name: "Llamada de Seguimiento", type: "action", status: "pending" }
    ]
  },
  {
    id: 3,
    name: "Onboarding Nuevos Leads BMW",
    description: "Proceso de bienvenida para leads de BMW con información personalizada",
    status: "active",
    leadsCount: 12,
    successRate: 89,
    lastExecution: "2024-01-15T16:45:00Z",
    steps: [
      { id: 1, name: "Lead BMW Detectado", type: "trigger", status: "completed" },
      { id: 2, name: "Envío Catálogo Digital", type: "action", status: "completed" },
      { id: 3, name: "Agendar Test Drive", type: "action", status: "active" },
      { id: 4, name: "Seguimiento Post-Visita", type: "action", status: "pending" }
    ]
  }
];

const statusColors = {
  active: "bg-success text-success-foreground",
  paused: "bg-warning text-warning-foreground",
  error: "bg-error text-error-foreground",
  stopped: "bg-muted text-muted-foreground"
};

const stepStatusColors = {
  completed: "bg-success",
  active: "bg-primary",
  pending: "bg-muted",
  error: "bg-error"
};

export default function Workflows() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(mockWorkflows[0]);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y monitoriza tus flujos de trabajo automatizados
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <Plus className="h-4 w-4 mr-2" />
          Crear Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflows List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Workflows Activos</h2>
          {mockWorkflows.map((workflow) => (
            <Card 
              key={workflow.id} 
              className={`p-4 cursor-pointer border transition-smooth hover:shadow-custom-md ${
                selectedWorkflow.id === workflow.id 
                  ? "border-primary shadow-custom-md bg-primary/5" 
                  : "border-border"
              }`}
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-card-foreground text-sm">
                    {workflow.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {workflow.description}
                  </p>
                </div>
                <Badge className={`text-xs ml-2 ${statusColors[workflow.status as keyof typeof statusColors]}`}>
                  {workflow.status}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <span>{workflow.leadsCount} leads</span>
                </span>
                <span className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{workflow.successRate}%</span>
                </span>
              </div>
            </Card>
          ))}
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          <Card className="p-6 border border-border shadow-custom-sm">
            {/* Workflow Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-gradient-primary">
                  <GitBranch className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-card-foreground">
                    {selectedWorkflow.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkflow.description}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                {selectedWorkflow.status === "active" ? (
                  <Button variant="outline" size="sm">
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar
                  </Button>
                ) : (
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Activar
                  </Button>
                )}
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>

            {/* Workflow Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-card-foreground">
                  {selectedWorkflow.leadsCount}
                </p>
                <p className="text-xs text-muted-foreground">Leads Activos</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <p className="text-2xl font-bold text-card-foreground">
                  {selectedWorkflow.successRate}%
                </p>
                <p className="text-xs text-muted-foreground">Tasa de Éxito</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <p className="text-2xl font-bold text-card-foreground">2.5h</p>
                <p className="text-xs text-muted-foreground">Duración Media</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-center mb-2">
                  <PlayCircle className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-card-foreground">24</p>
                <p className="text-xs text-muted-foreground">Ejecuciones Hoy</p>
              </div>
            </div>

            {/* Workflow Steps */}
            <div>
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Flujo de Trabajo
              </h3>
              <div className="space-y-3">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4 p-4 rounded-lg border border-border hover:bg-muted/20 transition-smooth">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${stepStatusColors[step.status as keyof typeof stepStatusColors]}`} />
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-card-foreground">{step.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {step.type}
                        </Badge>
                        <Badge 
                          className={`text-xs ${stepStatusColors[step.status as keyof typeof stepStatusColors]} text-white`}
                        >
                          {step.status}
                        </Badge>
                      </div>
                    </div>

                    {step.status === "error" && (
                      <AlertCircle className="h-5 w-5 text-error" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Última ejecución: {new Date(selectedWorkflow.lastExecution).toLocaleString()}
                </p>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Ejecutar Ahora
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Logs
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}