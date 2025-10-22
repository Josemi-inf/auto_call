import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { n8nApi, type N8nWorkflow } from "@/services/n8n-api";
import { WEBHOOK_URLS } from "@/services/config";
import {
  Play,
  Square,
  Settings,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  RotateCcw,
  Zap,
  Globe,
  Calendar,
  Users,
  AlertTriangle,
  ExternalLink,
  Edit,
  Copy,
  Trash2
} from "lucide-react";

interface WorkflowStats {
  totalExecutions: number;
  successfulExecutions: number;
  errorExecutions: number;
  lastExecution?: string;
}

interface WorkflowCardProps {
  workflow: N8nWorkflow;
  stats?: WorkflowStats;
  onToggleActive: (id: string, active: boolean) => void;
  onExecute: (id: string) => void;
  isExecuting?: boolean;
}

function WorkflowCard({ workflow, stats, onToggleActive, onExecute, isExecuting }: WorkflowCardProps) {
  const { toast } = useToast();
  const nodeCount = workflow.nodes?.length || 0;
  const hasWebhook = workflow.nodes?.some(node => node.type.includes('webhook')) || false;
  const configuredWebhookUrl = WEBHOOK_URLS[workflow.id];

  // Get webhook URL from workflow nodes
  const getWebhookUrl = () => {
    if (configuredWebhookUrl) return configuredWebhookUrl;

    const webhookNode = workflow.nodes?.find(node => node.type.includes('webhook'));
    if (webhookNode && webhookNode.parameters) {
      const path = webhookNode.parameters.path || workflow.id;
      return `${import.meta.env.VITE_N8N_BASE_URL}/webhook/${path}`;
    }
    return null;
  };

  const webhookUrl = getWebhookUrl();

  const handleWebhookTrigger = async () => {
    if (!webhookUrl) return;

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'n8n-lead-sync',
          timestamp: new Date().toISOString(),
          manual: true
        })
      });

      if (response.ok) {
        toast({
          title: "✅ Workflow ejecutado",
          description: `${workflow.name} ha sido disparado correctamente`,
        });
      } else {
        toast({
          title: "⚠️ Advertencia",
          description: "El webhook fue llamado pero respondió con error",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo ejecutar el workflow",
        variant: "destructive",
      });
    }
  };

  const getNodeTypes = () => {
    if (!workflow.nodes) return [];
    const types = workflow.nodes.map(node => node.type);
    const uniqueTypes = [...new Set(types)];
    return uniqueTypes.slice(0, 3); // Mostrar solo los primeros 3 tipos
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-300 border-gray-200 bg-white hover:bg-gray-50/50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-3">
            <div className="p-1.5 rounded-md bg-gray-100">
              <Activity className="h-4 w-4 text-gray-700" />
            </div>
            <h3 className="font-semibold text-sm text-gray-900 truncate flex-1">
              {workflow.name}
            </h3>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {workflow.tags?.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-200 text-gray-600 bg-gray-50">
                {typeof tag === 'string' ? tag : tag.name}
              </Badge>
            ))}
            {hasWebhook && (
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-700 bg-white">
                <Globe className="h-3 w-3 mr-1" />
                Webhook
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant={workflow.active ? "default" : "outline"}
              onClick={() => onToggleActive(workflow.id, !workflow.active)}
              className={`h-6 px-2 text-xs transition-all duration-300 ${
                workflow.active
                  ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10"
                  : "border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-400"
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                workflow.active ? "bg-white" : "bg-gray-400"
              }`} />
              {workflow.active ? "Activo" : "Inactivo"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-full bg-gray-200">
              <Activity className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {nodeCount}
          </p>
          <p className="text-xs text-gray-500 font-medium">Nodos</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <div className="p-2 rounded-full bg-gray-200">
              <CheckCircle className="h-4 w-4 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {stats?.totalExecutions || 0}
          </p>
          <p className="text-xs text-gray-500 font-medium">Ejecuciones</p>
        </div>
      </div>

      {/* Node Types */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2 font-medium">Tipos de nodos:</p>
        <div className="flex flex-wrap gap-1">
          {getNodeTypes().map((type, index) => (
            <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-0">
              {type.replace('n8n-nodes-base.', '')}
            </Badge>
          ))}
        </div>
      </div>

      {/* Webhook Status */}
      {(hasWebhook || configuredWebhookUrl) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <Globe className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Webhook</span>
            <Badge
              variant={configuredWebhookUrl ? "default" : "secondary"}
              className={`text-xs ${
                configuredWebhookUrl
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {configuredWebhookUrl ? "Configurado" : "Detectado"}
            </Badge>
          </div>
          {configuredWebhookUrl && (
            <div className="mt-2 text-xs text-gray-500 break-all">
              {configuredWebhookUrl}
            </div>
          )}
        </div>
      )}

      {/* Execution Stats */}
      {stats && (
        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-gray-900">Estadísticas de Ejecución</span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-gray-200">
              <div className="p-1 rounded-full bg-gray-100">
                <CheckCircle className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <span className="font-medium text-gray-900">{stats.successfulExecutions}</span>
                <span className="text-xs text-gray-500 ml-1">exitosas</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 p-2 rounded-lg bg-white border border-gray-200">
              <div className="p-1 rounded-full bg-gray-100">
                <XCircle className="h-3 w-3 text-gray-600" />
              </div>
              <div>
                <span className="font-medium text-gray-900">{stats.errorExecutions}</span>
                <span className="text-xs text-gray-500 ml-1">errores</span>
              </div>
            </div>
          </div>
          {stats.lastExecution && (
            <div className="flex items-center space-x-2 mt-3 p-2 rounded-lg bg-white border border-gray-200">
              <div className="p-1 rounded-full bg-gray-100">
                <Clock className="h-3 w-3 text-gray-600" />
              </div>
              <span className="text-xs text-gray-500">
                Última: {formatDate(stats.lastExecution)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Dates */}
      <div className="text-xs text-gray-500 mb-4 space-y-1">
        <div className="flex items-center space-x-1">
          <Calendar className="h-3 w-3" />
          <span>Creado: {formatDate(workflow.createdAt)}</span>
        </div>
        <div className="flex items-center space-x-1">
          <RotateCcw className="h-3 w-3" />
          <span>Actualizado: {formatDate(workflow.updatedAt)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-2 pt-2 border-t border-gray-200">
        {webhookUrl ? (
          <>
            <Button
              size="sm"
              onClick={handleWebhookTrigger}
              disabled={!workflow.active}
              className={`flex-1 ${
                workflow.active
                  ? "bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              } transition-all duration-200`}
            >
              <Zap className="h-3 w-3 mr-2" />
              Ejecutar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`${import.meta.env.VITE_N8N_BASE_URL}/workflow/${workflow.id}`, '_blank')}
              className="border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <ExternalLink className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.open(`${import.meta.env.VITE_N8N_BASE_URL}/workflow/${workflow.id}`, '_blank')}
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Abrir en n8n
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function WorkflowGrid() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [executingWorkflows, setExecutingWorkflows] = useState<Set<string>>(new Set());

  // Fetch workflows from configured project/folder
  const {
    data: workflows = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["n8n-workflows"],
    queryFn: () => n8nApi.getWorkflows(),
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2
  });

  // Fetch stats for each workflow
  const { data: workflowStats = {} } = useQuery({
    queryKey: ["workflow-stats", workflows?.map(w => w.id) ?? []],
    queryFn: async () => {
      const stats: Record<string, WorkflowStats> = {};
      if (!workflows || !Array.isArray(workflows)) return stats;

      await Promise.all(
        workflows.map(async (workflow) => {
          try {
            stats[workflow.id] = await n8nApi.getWorkflowStats(workflow.id);
          } catch (error) {
            console.error(`Failed to get stats for workflow ${workflow.id}:`, error);
            stats[workflow.id] = {
              totalExecutions: 0,
              successfulExecutions: 0,
              errorExecutions: 0
            };
          }
        })
      );
      return stats;
    },
    enabled: !!workflows && Array.isArray(workflows) && workflows.length > 0,
    refetchInterval: 60000, // Refetch every minute
  });

  // Toggle workflow active/inactive
  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      n8nApi.setWorkflowActive(id, active),
    onSuccess: (updatedWorkflow) => {
      queryClient.setQueryData<N8nWorkflow[]>(["n8n-workflows"], (old) =>
        (old || []).map(w => w.id === updatedWorkflow.id ? updatedWorkflow : w)
      );
      toast({
        title: updatedWorkflow.active ? "✅ Workflow activado" : "⏸️ Workflow pausado",
        description: `${updatedWorkflow.name} ahora está ${updatedWorkflow.active ? 'activo' : 'pausado'}`,
      });
    },
    onError: (error) => {
      console.error("Error toggling workflow:", error);
      toast({
        title: "❌ Error",
        description: "No se pudo cambiar el estado del workflow",
        variant: "destructive",
      });
    }
  });

  // Execute workflow
  const executeMutation = useMutation({
    mutationFn: (id: string) => n8nApi.executeWorkflow(id),
    onSuccess: (execution, workflowId) => {
      const workflow = workflows.find(w => w.id === workflowId);
      setExecutingWorkflows(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflowId);
        return newSet;
      });

      toast({
        title: "🚀 Workflow ejecutado",
        description: `${workflow?.name || 'Workflow'} se está ejecutando`,
      });

      // Refetch stats after execution
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["workflow-stats"] });
      }, 2000);
    },
    onError: (error, workflowId) => {
      console.error("Error executing workflow:", error);
      setExecutingWorkflows(prev => {
        const newSet = new Set(prev);
        newSet.delete(workflowId);
        return newSet;
      });

      toast({
        title: "❌ Error de ejecución",
        description: "No se pudo ejecutar el workflow",
        variant: "destructive",
      });
    }
  });

  const handleToggleActive = (id: string, active: boolean) => {
    toggleActiveMutation.mutate({ id, active });
  };

  const handleExecute = (id: string) => {
    setExecutingWorkflows(prev => new Set(prev).add(id));
    executeMutation.mutate(id);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando workflows de n8n...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              Error al conectar con n8n
            </h3>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <Button onClick={() => refetch()} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check: ensure workflows is an array
  const safeWorkflows = Array.isArray(workflows) ? workflows : [];
  const activeWorkflows = safeWorkflows.filter(w => w.active);
  const inactiveWorkflows = safeWorkflows.filter(w => !w.active);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workflows n8n</h1>
          <p className="text-muted-foreground mt-2">
            Gestiona y monitorea tus flujos de trabajo automatizados ({workflows.length} workflows)
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            <Settings className="h-4 w-4 mr-2" />
            Configurar n8n
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{safeWorkflows.length}</p>
              <p className="text-sm text-muted-foreground">Total Workflows</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Play className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeWorkflows.length}</p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Pause className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inactiveWorkflows.length}</p>
              <p className="text-sm text-muted-foreground">Pausados</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {Object.values(workflowStats).reduce((sum, stats) => sum + stats.totalExecutions, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Ejecuciones</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Workflows Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto max-w-md">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              Todos ({workflows.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs sm:text-sm">
              Activos ({activeWorkflows.length})
            </TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs sm:text-sm">
              Pausados ({inactiveWorkflows.length})
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground mt-2 sm:mt-0">
            <span className="hidden sm:inline">Diseño: </span>3 columnas elegantes
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {safeWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                stats={workflowStats[workflow.id]}
                onToggleActive={handleToggleActive}
                onExecute={handleExecute}
                isExecuting={executingWorkflows.has(workflow.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                stats={workflowStats[workflow.id]}
                onToggleActive={handleToggleActive}
                onExecute={handleExecute}
                isExecuting={executingWorkflows.has(workflow.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inactive" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {inactiveWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                stats={workflowStats[workflow.id]}
                onToggleActive={handleToggleActive}
                onExecute={handleExecute}
                isExecuting={executingWorkflows.has(workflow.id)}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {workflows.length === 0 && (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-card-foreground mb-2">
            No hay workflows disponibles
          </h3>
          <p className="text-muted-foreground mb-4">
            Asegúrate de tener workflows creados en tu instancia de n8n y que la conexión esté configurada correctamente.
          </p>
          <Button onClick={() => refetch()} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Verificar conexión
          </Button>
        </div>
      )}
    </div>
  );
}