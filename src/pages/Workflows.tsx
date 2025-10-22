import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkflowGrid from "@/components/WorkflowGrid";
import N8nConfig from "@/components/N8nConfig";
import WebhookConfig from "@/components/WebhookConfig";
import {
  Settings,
  Activity,
  Globe
} from "lucide-react";

export default function Workflows() {
  return (
    <div>
      <Tabs defaultValue="workflows" className="w-full">
        <div className="border-b">
          <div className="px-8 pt-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="workflows" className="flex items-center space-x-2">
                <Activity className="h-4 w-4" />
                <span>Workflows n8n</span>
              </TabsTrigger>
              <TabsTrigger value="config" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Configuración</span>
              </TabsTrigger>
              <TabsTrigger value="webhooks" className="flex items-center space-x-2">
                <Globe className="h-4 w-4" />
                <span>Webhooks</span>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <TabsContent value="workflows" className="mt-0">
          <WorkflowGrid />
        </TabsContent>

        <TabsContent value="config" className="mt-0">
          <N8nConfig />
        </TabsContent>

        <TabsContent value="webhooks" className="mt-0">
          <div className="p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">Configuración Webhooks</h1>
              <p className="text-muted-foreground mt-2">
                Gestiona webhooks personalizados para integraciones externas
              </p>
            </div>
            <WebhookConfig />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
