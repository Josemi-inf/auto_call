import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Settings,
  Plus,
  Trash2,
  Edit,
  Globe,
  Copy,
  TestTube,
  Check
} from "lucide-react";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  description?: string;
  isActive: boolean;
  lastTested?: Date;
  testStatus?: 'success' | 'error' | 'pending';
}

const STORAGE_KEY = 'leadflow_webhook_configs';

export default function WebhookConfig() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null);
  const { toast } = useToast();

  // Load webhooks from localStorage on component mount
  useEffect(() => {
    const savedWebhooks = localStorage.getItem(STORAGE_KEY);
    if (savedWebhooks) {
      try {
        const parsed = JSON.parse(savedWebhooks);
        setWebhooks(parsed);
      } catch (error) {
        console.error('Error loading webhook configs:', error);
      }
    }
  }, []);

  // Save webhooks to localStorage whenever webhooks change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(webhooks));
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('webhookConfigUpdate'));
  }, [webhooks]);

  const addWebhook = (webhookData: Omit<WebhookConfig, 'id'>) => {
    const newWebhook: WebhookConfig = {
      ...webhookData,
      id: Date.now().toString(),
    };
    setWebhooks(prev => [...prev, newWebhook]);
    setShowAddForm(false);
    toast({
      title: "Webhook agregado",
      description: "La configuración del webhook se ha guardado exitosamente.",
    });
  };

  const updateWebhook = (id: string, webhookData: Partial<WebhookConfig>) => {
    setWebhooks(prev => prev.map(webhook => 
      webhook.id === id ? { ...webhook, ...webhookData } : webhook
    ));
    setEditingWebhook(null);
    toast({
      title: "Webhook actualizado",
      description: "La configuración se ha actualizado correctamente.",
    });
  };

  const deleteWebhook = (id: string) => {
    setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
    toast({
      title: "Webhook eliminado",
      description: "La configuración del webhook se ha eliminado.",
    });
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    setTestingWebhook(webhook.id);
    
    try {
      const response = await fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: "LeadFlow Webhook Test",
        }),
      });

      updateWebhook(webhook.id, {
        lastTested: new Date(),
        testStatus: 'success'
      });

      toast({
        title: "Test enviado",
        description: "La solicitud de prueba se envió correctamente. Verifica tu endpoint.",
      });
    } catch (error) {
      updateWebhook(webhook.id, {
        lastTested: new Date(),
        testStatus: 'error'
      });

      toast({
        title: "Error en test",
        description: "No se pudo realizar la prueba del webhook.",
        variant: "destructive",
      });
    } finally {
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
            ? (data) => updateWebhook(editingWebhook.id, data)
            : addWebhook
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
                      Última prueba: {webhook.lastTested.toLocaleString()}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => testWebhook(webhook)}
                    disabled={testingWebhook === webhook.id}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    {testingWebhook === webhook.id ? "Probando..." : "Probar"}
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
                    onClick={() => deleteWebhook(webhook.id)}
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