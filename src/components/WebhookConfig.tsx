import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getWorkflows, createWorkflow, updateWorkflow as updateWorkflowApi, deleteWorkflow as deleteWorkflowApi, testWebhook as apiTestWebhook } from "@/services/api";
import type { WorkflowConfig as ApiWorkflowConfig } from "@/types";
import {
  Settings,
  Plus,
  Trash2,
  Edit,
  Globe,
  Copy,
  TestTube,
  Check,
  AlertCircle
} from "lucide-react";

type WebhookConfig = ApiWorkflowConfig;

export default function WebhookConfig() {
  const queryClient = useQueryClient();
  const {
    data: webhooks = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ["workflows"],
    queryFn: getWorkflows,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const { toast } = useToast();

  const createMut = useMutation({
    mutationFn: (data: Omit<WebhookConfig, 'id'>) => createWorkflow(data),
    onSuccess: (created) => {
      queryClient.setQueryData<WebhookConfig[]>(["workflows"], (old) => ([...(old || []), created]));
    },
    onError: (error) => {
      console.error("Create webhook error:", error);
      toast({ title: "Error", description: "No se pudo crear el webhook.", variant: "destructive" });
    }
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WebhookConfig> }) => updateWorkflowApi(id, data),
    onSuccess: (updated) => {
      queryClient.setQueryData<WebhookConfig[]>(["workflows"], (old) => (old || []).map(w => w.id === updated.id ? { ...w, ...updated } : w));
    },
    onError: (error) => {
      console.error("Update webhook error:", error);
      // Refresh the data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    }
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteWorkflowApi(id),
    onSuccess: ({ id }) => {
      queryClient.setQueryData<WebhookConfig[]>(["workflows"], (old) => (old || []).filter(w => w.id !== id));
    },
    onError: (error) => {
      console.error("Delete webhook error:", error);
      toast({ title: "Error", description: "No se pudo eliminar el webhook.", variant: "destructive" });
      // Refresh the data to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    }
  });

  // API-based helpers using React Query cache
  const addWebhookApi = async (data: Omit<WebhookConfig, 'id'>) => {
    await createMut.mutateAsync(data);
    setShowAddForm(false);
    toast({ title: "Webhook agregado", description: "La configuración del webhook se ha guardado exitosamente." });
  };

  const updateWebhookApiLocal = async (id: string, data: Partial<WebhookConfig>) => {
    try {
      await updateMut.mutateAsync({ id, data });
      setEditingWebhook(null);
      toast({ title: "Webhook actualizado", description: "La configuración se ha actualizado correctamente." });
    } catch (error) {
      console.error("Error updating webhook:", error);
      toast({ title: "Error", description: "No se pudo actualizar el webhook.", variant: "destructive" });
    }
  };

  const deleteWebhookApiLocal = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast({ title: "Webhook eliminado", description: "La configuración del webhook se ha eliminado." });
    } catch (error) {
      console.error("Error deleting webhook:", error);
      toast({ title: "Error", description: "No se pudo eliminar el webhook.", variant: "destructive" });
    }
  };

  // Centralized webhook test function
  const testWebhook = async (webhook: WebhookConfig) => {
    console.log("🚀 =================================");
    console.log("🚀 WEBHOOK TEST FUNCTION CALLED");
    console.log("🚀 =================================");

    if (testingWebhook) {
      console.log("❌ Test already in progress, skipping");
      console.log("❌ Current testing webhook ID:", testingWebhook);
      return; // Prevent concurrent tests
    }

    console.log("✅ Starting webhook test for:", webhook.name);
    console.log("✅ Webhook URL:", webhook.url);
    console.log("✅ Webhook ID:", webhook.id);

    console.log("🔄 Setting testing state to:", webhook.id);
    setTestingWebhook(webhook.id);

    // Show immediate toast to confirm test started
    toast({
      title: "🔄 Iniciando prueba",
      description: `Probando webhook: ${webhook.name}`,
    });

    try {
      console.log("Calling apiTestWebhook...");
      const result = await apiTestWebhook(webhook.url);
      console.log("apiTestWebhook result:", result);

      // Update cache optimistically
      const updatedData = {
        lastTested: new Date(),
        testStatus: result.ok ? 'success' as const : 'error' as const
      };

      console.log("Updating cache with:", updatedData);
      queryClient.setQueryData<WebhookConfig[]>(["workflows"], (old) =>
        (old || []).map(w => w.id === webhook.id ? { ...w, ...updatedData } : w)
      );

      // Persist to backend
      try {
        await updateMut.mutateAsync({ id: webhook.id, data: updatedData });
        console.log("Backend update successful");
      } catch (updateError) {
        console.warn("Backend update failed, but continuing:", updateError);
      }

      const toastMessage = result.message || (result.ok
        ? "Webhook probado exitosamente. La solicitud fue enviada a tu endpoint."
        : "El webhook no respondió correctamente. Verifica la URL.");

      console.log("Showing toast:", toastMessage);
      toast({
        title: result.ok ? "✅ Test exitoso" : "❌ Test falló",
        description: toastMessage,
        variant: result.ok ? undefined : "destructive",
      });

    } catch (error) {
      console.error("Error during webhook test:", error);

      const errorData = {
        lastTested: new Date(),
        testStatus: 'error' as const
      };

      queryClient.setQueryData<WebhookConfig[]>(["workflows"], (old) =>
        (old || []).map(w => w.id === webhook.id ? { ...w, ...errorData } : w)
      );

      toast({
        title: "❌ Error en el test",
        description: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive",
      });
    } finally {
      console.log("Webhook test finished, clearing testing state");
      setTestingWebhook(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "URL copiada al portapapeles.",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6 border border-border shadow-custom-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando webhooks...</p>
          </div>
        </div>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="p-6 border border-border shadow-custom-sm">
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              Error al cargar webhooks
            </h3>
            <p className="text-muted-foreground mb-4">
              No se pudieron cargar los webhooks. Verifica tu conexión.
            </p>
            <Button
              onClick={() => queryClient.invalidateQueries({ queryKey: ["workflows"] })}
              variant="outline"
            >
              Reintentar
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border border-border shadow-custom-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <Settings className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-card-foreground">
              Configuración de Webhooks
            </h2>
            <p className="text-sm text-muted-foreground">
              Gestiona las URLs de webhook para integraciones externas
            </p>
          </div>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-primary hover:bg-primary-hover"
          disabled={isLoading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Webhook
        </Button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingWebhook) && (
          <WebhookForm
            webhook={editingWebhook}
            onSave={editingWebhook 
            ? (data) => updateWebhookApiLocal(editingWebhook.id, data)
            : addWebhookApi
          }
          onCancel={() => {
            setShowAddForm(false);
            setEditingWebhook(null);
          }}
        />
      )}

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.length === 0 ? (
          <div className="text-center py-8">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              No hay webhooks configurados
            </h3>
            <p className="text-muted-foreground">
              Agrega tu primer webhook para comenzar a recibir notificaciones
            </p>
          </div>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id} className="p-4 border border-border">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="font-semibold text-card-foreground">
                      {webhook.name}
                    </h3>
                    <Badge 
                      className={
                        webhook.isActive 
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {webhook.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                    {webhook.testStatus && (
                      <Badge 
                        variant="outline"
                        className={
                          webhook.testStatus === 'success'
                            ? "border-success text-success"
                            : "border-error text-error"
                        }
                      >
                        {webhook.testStatus === 'success' ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <TestTube className="h-3 w-3 mr-1" />
                        )}
                        {webhook.testStatus === 'success' ? 'Probado' : 'Error'}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded text-muted-foreground font-mono">
                      {webhook.url}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => copyToClipboard(webhook.url)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  {webhook.description && (
                    <p className="text-sm text-muted-foreground">
                      {webhook.description}
                    </p>
                  )}
                  
                  {webhook.lastTested && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Última prueba: {new Date(webhook.lastTested as string | number | Date).toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("🔥 BUTTON CLICKED - Starting webhook test");
                      console.log("Webhook data:", webhook);
                      testWebhook(webhook);
                    }}
                    disabled={testingWebhook === webhook.id}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    {testingWebhook === webhook.id ? "🔄 Probando..." : "🚀 Probar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditingWebhook(webhook)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteWebhookApiLocal(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </Card>
  );
}

interface WebhookFormProps {
  webhook?: WebhookConfig | null;
  onSave: (webhook: Omit<WebhookConfig, 'id'>) => void;
  onCancel: () => void;
}

function WebhookForm({ webhook, onSave, onCancel }: WebhookFormProps) {
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    description: webhook?.description || '',
    isActive: webhook?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      return;
    }
    onSave(formData);
  };

  return (
    <Card className="p-4 mb-4 border border-primary/20 bg-primary/5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nombre del Webhook</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="ej. Notificaciones Zapier"
              required
            />
          </div>
          <div>
            <Label htmlFor="url">URL del Webhook</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              required
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe para qué usarás este webhook..."
            rows={2}
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border-border"
          />
          <Label htmlFor="isActive">Webhook activo</Label>
        </div>
        
        <div className="flex space-x-2">
          <Button type="submit" className="bg-gradient-primary hover:bg-primary-hover">
            {webhook ? 'Actualizar' : 'Agregar'} Webhook
          </Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}

