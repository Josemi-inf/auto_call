import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Settings,
  Clock,
  GitBranch,
  Zap,
  Database,
  Wifi
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getErrors } from "@/services/api";
import type { ErrorEntry } from "@/types";

/* const mockErrors = [
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
      retryCount: 3
    },
    actions: [
      { type: "retry", label: "Reintentar conexión", icon: RefreshCw },
      { type: "config", label: "Revisar configuración", icon: Settings },
      { type: "details", label: "Ver detalles completos", icon: Eye }
    ]
  },
  {
    id: 2,
    title: "Datos faltantes en lead",
    description: "El lead #2847 no tiene número de teléfono configurado, imposible ejecutar llamada automática.",
    type: "data",
    severity: "warning",
    status: "pending",
    workflow: "Llamadas BMW Premium",
    timestamp: "2024-01-15T12:15:00Z",
    affectedLeads: 1,
    details: {
      error: "Missing required field: phone_number",
      leadId: "2847",
      leadName: "Ana Martín",
      missingFields: ["phone_number"]
    },
    actions: [
      { type: "edit", label: "Editar lead", icon: Settings },
      { type: "skip", label: "Omitir lead", icon: XCircle },
      { type: "details", label: "Ver detalles", icon: Eye }
    ]
  },
  {
    id: 3,
    title: "Límite de API alcanzado",
    description: "Se ha alcanzado el límite diario de la API de WhatsApp Business. Mensajes pausados hasta mañana.",
    type: "limit",
    severity: "warning",
    status: "resolved",
    workflow: "Múltiples workflows",
    timestamp: "2024-01-14T18:45:00Z",
    affectedLeads: 45,
    details: {
      error: "API rate limit exceeded (1000/1000 messages)",
      provider: "WhatsApp Business API",
      resetTime: "2024-01-15T00:00:00Z",
      currentUsage: "1000/1000"
    },
    actions: [
      { type: "upgrade", label: "Actualizar plan", icon: Zap },
      { type: "schedule", label: "Reprogramar", icon: Clock },
      { type: "details", label: "Ver detalles", icon: Eye }
    ]
  },
  {
    id: 4,
    title: "Workflow pausado por error",
    description: "El workflow 'Recuperación Leads Fríos' se pausó automáticamente tras 5 errores consecutivos.",
    type: "workflow",
    severity: "error",
    status: "resolved",
    workflow: "Recuperación Leads Fríos",
    timestamp: "2024-01-14T09:30:00Z",
    affectedLeads: 23,
    details: {
      error: "Workflow auto-paused due to consecutive failures",
      errorCount: 5,
      lastError: "SMS provider authentication failed",
      pausedAt: "2024-01-14T09:30:00Z"
    },
    actions: [
      { type: "resume", label: "Reanudar workflow", icon: RefreshCw },
      { type: "config", label: "Revisar configuración", icon: Settings },
      { type: "details", label: "Ver logs", icon: Eye }
    ]
  }
]; */

const severityColors = {
  critical: "bg-error text-error-foreground",
  error: "bg-error/80 text-error-foreground",
  warning: "bg-warning text-warning-foreground",
  minor: "bg-muted text-muted-foreground"
};

const statusColors = {
  pending: "bg-warning text-warning-foreground",
  resolved: "bg-success text-success-foreground",
  investigating: "bg-primary text-primary-foreground"
};

const typeIcons = {
  connection: Wifi,
  data: Database,
  limit: Zap,
  workflow: GitBranch,
  technical: Settings
};

export default function Errors() {
  const [selectedError, setSelectedError] = useState<ErrorEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: errors } = useQuery({
    queryKey: ["errors", { q: searchTerm, severity: filterSeverity, status: filterStatus }],
    queryFn: () =>
      getErrors({
        q: searchTerm || undefined,
        severity: filterSeverity !== "all" ? filterSeverity : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
      }),
  });

  useEffect(() => {
    if (!selectedError && errors && errors.length > 0) {
      setSelectedError(errors[0]);
    }
  }, [errors, selectedError]);

  const filteredErrors = errors || [];

  const errorCounts = {
    total: filteredErrors.length,
    critical: filteredErrors.filter(e => e.severity === "critical").length,
    pending: filteredErrors.filter(e => e.status === "pending").length,
    resolved: filteredErrors.filter(e => e.status === "resolved").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Panel de Errores</h1>
          <p className="text-muted-foreground mt-2">
            Monitoriza y resuelve errores de los workflows automatizados
          </p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-hover">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Error Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border border-border shadow-custom-sm">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold text-card-foreground">{errorCounts.total}</p>
              <p className="text-sm text-muted-foreground">Total Errores</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border shadow-custom-sm">
          <div className="flex items-center space-x-3">
            <XCircle className="h-8 w-8 text-error" />
            <div>
              <p className="text-2xl font-bold text-card-foreground">{errorCounts.critical}</p>
              <p className="text-sm text-muted-foreground">Críticos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border shadow-custom-sm">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-8 w-8 text-warning" />
            <div>
              <p className="text-2xl font-bold text-card-foreground">{errorCounts.pending}</p>
              <p className="text-sm text-muted-foreground">Pendientes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 border border-border shadow-custom-sm">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-success" />
            <div>
              <p className="text-2xl font-bold text-card-foreground">{errorCounts.resolved}</p>
              <p className="text-sm text-muted-foreground">Resueltos</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Errors List */}
        <div className="space-y-4">
          {/* Filters */}
          <Card className="p-4 border border-border">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar errores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select 
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
              >
                <option value="all">Todas las severidades</option>
                <option value="critical">Crítico</option>
                <option value="error">Error</option>
                <option value="warning">Advertencia</option>
              </select>

              <select 
                className="px-3 py-2 border border-border rounded-md bg-background text-foreground"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="resolved">Resuelto</option>
                <option value="investigating">Investigando</option>
              </select>
            </div>
          </Card>

          {/* Errors List */}
          <div className="space-y-3">
            {filteredErrors.map((error) => {
              const TypeIcon = typeIcons[error.type as keyof typeof typeIcons];
              return (
                <Card 
                  key={error.id}
                  className={`p-4 cursor-pointer border transition-smooth hover:shadow-custom-md ${
                    selectedError?.id === error.id 
                      ? "border-primary shadow-custom-md bg-primary/5" 
                      : "border-border"
                  }`}
                  onClick={() => setSelectedError(error)}
                >
                  <div className="flex items-start space-x-3">
                    <TypeIcon className="h-5 w-5 text-muted-foreground mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium text-card-foreground text-sm">
                          {error.title}
                        </h3>
                        <Badge className={`text-xs ${severityColors[error.severity as keyof typeof severityColors]}`}>
                          {error.severity}
                        </Badge>
                        <Badge className={`text-xs ${statusColors[error.status as keyof typeof statusColors]}`}>
                          {error.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {error.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{error.workflow}</span>
                        <span>{error.affectedLeads} leads afectados</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Error Details */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start space-x-3">
              {selectedError && (() => {
                const TypeIcon = typeIcons[selectedError.type as keyof typeof typeIcons];
                return <TypeIcon className="h-6 w-6 text-muted-foreground mt-1" />;
              })()}
              <div>
                <h2 className="text-lg font-bold text-card-foreground mb-1">
                  {selectedError?.title}
                </h2>
                <div className="flex items-center space-x-2 mb-2">
                  <Badge className={`text-xs ${selectedError ? severityColors[selectedError.severity as keyof typeof severityColors] : ''}`}>
                    {selectedError?.severity}
                  </Badge>
                  <Badge className={`text-xs ${selectedError ? statusColors[selectedError.status as keyof typeof statusColors] : ''}`}>
                    {selectedError?.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedError?.description}
                </p>
              </div>
            </div>
          </div>

          {/* Error Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Workflow Afectado</label>
              <p className="text-sm text-card-foreground">{selectedError?.workflow}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Leads Afectados</label>
              <p className="text-sm text-card-foreground">{selectedError?.affectedLeads}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Fecha y Hora</label>
              <p className="text-sm text-card-foreground">
                {selectedError ? new Date(selectedError.timestamp).toLocaleString() : ''}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Tipo de Error</label>
              <p className="text-sm text-card-foreground capitalize">{selectedError?.type}</p>
            </div>
          </div>

          {/* Error Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-card-foreground mb-3">Detalles Técnicos</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <pre className="text-xs text-card-foreground whitespace-pre-wrap font-mono">
                {JSON.stringify(selectedError?.details ?? {}, null, 2)}
              </pre>
            </div>
          </div>

          {/* Actions */}
          <div>
            <h3 className="font-semibold text-card-foreground mb-3">Acciones Recomendadas</h3>
            <div className="space-y-2">
              {selectedError?.actions.map((action, index) => (
                <Button 
                  key={index}
                  variant={index === 0 ? "default" : "outline"}
                  className={`w-full justify-start ${index === 0 ? "bg-gradient-primary hover:bg-primary-hover" : ""}`}
                >
                  <action.icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
