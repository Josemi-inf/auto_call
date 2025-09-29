import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { n8nApi } from "@/services/n8n-api";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import {
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Shield,
  Globe,
  Key,
  AlertTriangle,
  RefreshCw
} from "lucide-react";

interface N8nConnectionStatus {
  connected: boolean;
  baseUrl?: string;
  hasApiKey?: boolean;
  error?: string;
}

export default function N8nConfig() {
  const { toast } = useToast();
  const { config, updateConfig, isConfigValid, hasApiKey, isInitialized } = useN8nConfig();
  const [connectionStatus, setConnectionStatus] = useState<N8nConnectionStatus>({
    connected: false
  });

  // Test connection mutation
  const testConnectionMutation = useMutation({
    mutationFn: async () => {
      if (!config.baseUrl) {
        throw new Error("URL de n8n es requerida");
      }

      // Simulate a basic connection test
      const testUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl;

      try {
        // Simple fetch test to see if the endpoint is reachable
        const response = await fetch(`${testUrl}/api/v1/workflows?limit=1`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey && { 'X-N8N-API-KEY': config.apiKey })
          },
        });

        return response.ok;
      } catch (error) {
        console.log("Connection test failed:", error);
        return false;
      }
    },
    onSuccess: (isConnected) => {
      setConnectionStatus({
        connected: isConnected,
        baseUrl: config.baseUrl,
        hasApiKey: !!config.apiKey
      });

      if (isConnected) {
        toast({
          title: "✅ Conexión exitosa",
          description: "n8n está respondiendo correctamente"
        });
      } else {
        toast({
          title: "❌ Sin conexión",
          description: "No se pudo conectar a n8n. Verifica la URL y API key",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error("Connection test error:", error);
      setConnectionStatus({
        connected: false,
        baseUrl: config.baseUrl,
        hasApiKey: !!config.apiKey,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });

      toast({
        title: "❌ Error de conexión",
        description: "No se pudo conectar a n8n. Verifica la configuración.",
        variant: "destructive"
      });
    }
  });

  // Save configuration mutation
  const saveConfigMutation = useMutation({
    mutationFn: async (newConfig: { baseUrl: string; apiKey: string }) => {
      console.log("Saving config:", newConfig);

      // Update the config using the hook (this will persist to localStorage)
      updateConfig(newConfig);

      // Test the connection with the new config
      if (newConfig.baseUrl) {
        try {
          const testUrl = newConfig.baseUrl.endsWith('/') ? newConfig.baseUrl.slice(0, -1) : newConfig.baseUrl;
          const response = await fetch(`${testUrl}/api/v1/workflows?limit=1`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(newConfig.apiKey && { 'X-N8N-API-KEY': newConfig.apiKey })
            },
          });

          setConnectionStatus({
            connected: response.ok,
            baseUrl: newConfig.baseUrl,
            hasApiKey: !!newConfig.apiKey,
            error: response.ok ? undefined : `HTTP ${response.status}`
          });
        } catch (error) {
          setConnectionStatus({
            connected: false,
            baseUrl: newConfig.baseUrl,
            hasApiKey: !!newConfig.apiKey,
            error: error instanceof Error ? error.message : 'Error de conexión'
          });
        }
      }

      return newConfig;
    },
    onSuccess: () => {
      toast({
        title: "✅ Configuración guardada",
        description: "La configuración de n8n ha sido guardada y probada",
      });
    },
    onError: (error) => {
      toast({
        title: "❌ Error al guardar",
        description: "No se pudo guardar la configuración",
        variant: "destructive"
      });
    }
  });

  // Test connection on component mount if config exists
  useEffect(() => {
    if (config.baseUrl) {
      testConnectionMutation.mutate();
    }
  }, []);

  const handleSaveConfig = () => {
    if (!config.baseUrl.trim()) {
      toast({
        title: "❌ URL requerida",
        description: "Por favor ingresa la URL de tu instancia de n8n",
        variant: "destructive"
      });
      return;
    }

    saveConfigMutation.mutate({
      baseUrl: config.baseUrl.trim(),
      apiKey: config.apiKey.trim()
    });
  };

  const getStatusColor = () => {
    if (testConnectionMutation.isPending) return "text-warning";
    return connectionStatus.connected ? "text-success" : "text-error";
  };

  const getStatusIcon = () => {
    if (testConnectionMutation.isPending) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    return connectionStatus.connected ?
      <CheckCircle className="h-4 w-4" /> :
      <XCircle className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (testConnectionMutation.isPending) return "Probando conexión...";
    if (connectionStatus.connected) return "Conectado";
    return connectionStatus.error || "Sin conexión";
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración n8n</h1>
          <p className="text-muted-foreground mt-2">
            Configura la conexión a tu instancia de n8n
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Form */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-primary">
              <Settings className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Configuración de Conexión</h2>
              <p className="text-sm text-muted-foreground">
                Configura los datos de tu instancia de n8n
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="baseUrl">URL de n8n</Label>
              <div className="flex space-x-2">
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="https://tu-n8n.com"
                  value={config.baseUrl}
                  onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => config.baseUrl && window.open(config.baseUrl, '_blank')}
                  disabled={!config.baseUrl}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                URL base de tu instancia de n8n (sin /api/v1)
              </p>
            </div>

            <div>
              <Label htmlFor="apiKey">API Key (opcional)</Label>
              <div className="flex space-x-2">
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="n8n_api_key_..."
                  value={config.apiKey}
                  onChange={(e) => updateConfig({ apiKey: e.target.value })}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                API Key para autenticación (requerida para instancias con autenticación)
              </p>
            </div>

            <Separator />

            <div className="flex space-x-3">
              <Button
                onClick={handleSaveConfig}
                disabled={saveConfigMutation.isPending}
                className="flex-1"
              >
                {saveConfigMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Guardar Configuración
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => testConnectionMutation.mutate()}
                disabled={testConnectionMutation.isPending || !config.baseUrl}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Connection Status */}
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Estado de Conexión</h2>
              <p className="text-sm text-muted-foreground">
                Estado actual de la conexión con n8n
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className={getStatusColor()}>
                  {getStatusIcon()}
                </div>
                <div>
                  <p className="font-medium">Conexión</p>
                  <p className="text-sm text-muted-foreground">
                    {getStatusText()}
                  </p>
                </div>
              </div>
              <Badge
                variant={connectionStatus.connected ? "default" : "destructive"}
                className={connectionStatus.connected ? "bg-success text-success-foreground" : ""}
              >
                {connectionStatus.connected ? "Conectado" : "Sin conexión"}
              </Badge>
            </div>

            {/* Configuration Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">URL Base</span>
                </div>
                <span className="text-sm font-mono">
                  {config.baseUrl || 'No configurada'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">API Key</span>
                </div>
                <Badge variant={config.apiKey ? "default" : "secondary"}>
                  {config.apiKey ? "Configurada" : "No configurada"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Autenticación</span>
                </div>
                <Badge variant={config.apiKey ? "default" : "outline"}>
                  {config.apiKey ? "Habilitada" : "Deshabilitada"}
                </Badge>
              </div>
            </div>

            {/* Connection Error */}
            {connectionStatus.error && (
              <div className="p-4 rounded-lg bg-error/10 border border-error/20">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-error mt-0.5" />
                  <div>
                    <p className="font-medium text-error mb-1">Error de Conexión</p>
                    <p className="text-sm text-muted-foreground">
                      {connectionStatus.error}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="p-6 mt-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <AlertTriangle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Guía de Configuración</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Obtener URL de n8n</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Para n8n Cloud: https://[tu-instancia].app.n8n.cloud</li>
              <li>• Para n8n auto-hospedado: https://tu-dominio.com</li>
              <li>• Para desarrollo local: http://localhost:5678</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Obtener API Key</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>1. Ve a Settings → API Keys en n8n</li>
              <li>2. Haz clic en "Create API Key"</li>
              <li>3. Copia el token generado</li>
              <li>4. Pégalo en el campo "API Key"</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 p-3 bg-warning/10 rounded-lg">
          <p className="text-sm text-warning-foreground">
            <strong>Nota:</strong> Para instancias públicas, es altamente recomendable usar API Key para mayor seguridad.
          </p>
        </div>
      </Card>
    </div>
  );
}