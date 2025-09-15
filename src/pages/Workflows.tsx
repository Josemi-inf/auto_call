import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WebhookConfig from "@/components/WebhookConfig";
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
  PlayCircle,
  Settings,
  Globe
} from "lucide-react";

import { useQuery } from "@tanstack/react-query";
import { getWorkflows } from "@/services/api";
import type { WorkflowConfig as ApiWorkflowConfig } from "@/types";

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
  const { data: webhooks } = useQuery({ queryKey: ["workflows"], queryFn: getWorkflows });
  const [selectedWebhook, setSelectedWebhook] = useState<ApiWorkflowConfig | null>(null);

  useEffect(() => {
    if (!selectedWebhook && webhooks && webhooks.length > 0) {
      setSelectedWebhook(webhooks[0]);
    }
  }, [webhooks, selectedWebhook]);

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

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuración Webhooks</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="workflows" className="mt-6">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Webhooks List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Webhooks Configurados</h2>
          {!webhooks || webhooks.length === 0 ? (
            <Card className="p-6 text-center border-dashed border-2 border-muted">
              <Globe className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                No hay webhooks configurados
              </p>
              <p className="text-xs text-muted-foreground">
                Ve a la pestaña "Configuración Webhooks" para agregar tu primer webhook
              </p>
            </Card>
          ) : (
            webhooks.map((webhook) => (
              <Card 
                key={webhook.id} 
                className={`p-4 cursor-pointer border transition-smooth hover:shadow-custom-md ${
                  selectedWebhook?.id === webhook.id 
                    ? "border-primary shadow-custom-md bg-primary/5" 
                    : "border-border"
                }`}
                onClick={() => setSelectedWebhook(webhook)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-card-foreground text-sm">
                      {webhook.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {webhook.description || "Sin descripción"}
                    </p>
                  </div>
                  <Badge className={`text-xs ml-2 ${webhook.isActive ? statusColors.active : statusColors.paused}`}>
                    {webhook.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <Globe className="h-3 w-3" />
                    <span className="truncate max-w-[100px]">{new URL(webhook.url).hostname}</span>
                  </span>
                  {webhook.testStatus && (
                    <span className="flex items-center space-x-1">
                      <CheckCircle className={`h-3 w-3 ${webhook.testStatus === 'success' ? 'text-success' : 'text-error'}`} />
                      <span>{webhook.testStatus === 'success' ? 'OK' : 'Error'}</span>
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Webhook Details */}
        <div className="lg:col-span-2">
          {selectedWebhook ? (
            <Card className="p-6 border border-border shadow-custom-sm">
              {/* Webhook Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-gradient-primary">
                    <Globe className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-card-foreground">
                      {selectedWebhook.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedWebhook.description || "Webhook configurado para recibir notificaciones"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className={selectedWebhook.isActive ? "text-warning" : "text-success"}
                  >
                    {selectedWebhook.isActive ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Activar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Webhook Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center mb-2">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {selectedWebhook.isActive ? "Activo" : "Inactivo"}
                  </p>
                  <p className="text-xs text-muted-foreground">Estado</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center mb-2">
                    <PlayCircle className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {selectedWebhook.testStatus === 'success' ? 'OK' : selectedWebhook.testStatus === 'error' ? 'Error' : 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Último Test</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-warning" />
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">
                    {selectedWebhook.lastTested 
                      ? new Date(selectedWebhook.lastTested).toLocaleDateString()
                      : 'Nunca'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Última Prueba</p>
                </div>
                
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-center mb-2">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-xl font-bold text-card-foreground">
                    {new URL(selectedWebhook.url).hostname}
                  </p>
                  <p className="text-xs text-muted-foreground">Dominio</p>
                </div>
              </div>

              {/* Webhook Details */}
              <div>
                <h3 className="text-lg font-semibold text-card-foreground mb-4">
                  Configuración del Webhook
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-border hover:bg-muted/20 transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-card-foreground">URL del Endpoint</h4>
                        <p className="text-sm text-muted-foreground mt-1 font-mono break-all">
                          {selectedWebhook.url}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Copiar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-border">
                    <h4 className="font-medium text-card-foreground mb-2">Estado de Conexión</h4>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        selectedWebhook.testStatus === 'success' 
                          ? 'bg-success' 
                          : selectedWebhook.testStatus === 'error' 
                          ? 'bg-error' 
                          : 'bg-muted'
                      }`} />
                      <span className="text-sm text-muted-foreground">
                        {selectedWebhook.testStatus === 'success' 
                          ? 'Conexión exitosa' 
                          : selectedWebhook.testStatus === 'error' 
                          ? 'Error de conexión' 
                          : 'Sin probar'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {selectedWebhook.lastTested 
                      ? `Última prueba: ${new Date(selectedWebhook.lastTested).toLocaleString()}`
                      : 'Este webhook nunca ha sido probado'
                    }
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Probar Webhook
                    </Button>
                    <Button variant="outline" size="sm">
                      Ver Historial
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center border-dashed border-2 border-muted">
              <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-card-foreground mb-2">
                Selecciona un webhook
              </h3>
              <p className="text-muted-foreground">
                Elige un webhook de la lista para ver sus detalles y configuración
              </p>
            </Card>
          )}
        </div>
      </div>
        </TabsContent>
        
        <TabsContent value="webhooks" className="mt-6">
          <WebhookConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
}
