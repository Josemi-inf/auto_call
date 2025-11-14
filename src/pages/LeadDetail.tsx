import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getLeadById, updateLead, deleteLead, exportLeadData } from "@/services/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MessageSquare, MoreVertical, Mail, MapPin, Star, Flame, Car, History, StickyNote, Download, Edit, Ban, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandDealershipCard } from "@/components/LeadDetail/BrandDealershipCard";
import { CallHistory } from "@/components/LeadDetail/CallHistory";
import { WhatsAppConversation } from "@/components/LeadDetail/WhatsAppConversation";
import { NotesSection } from "@/components/LeadDetail/NotesSection";
import { UnifiedTimeline } from "@/components/LeadDetail/UnifiedTimeline";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

const qualityConfig = {
  frio: { label: "Frío", color: "bg-slate-500", icon: "❄️" },
  tibio: { label: "Tibio", color: "bg-yellow-500", icon: "☀️" },
  caliente: { label: "Caliente", color: "bg-orange-500", icon: "🔥" },
  muy_caliente: { label: "Muy Caliente", color: "bg-red-500", icon: "🔥🔥" }
};

const statusColors = {
  activo: "bg-green-500 text-white",
  inactivo: "bg-gray-500 text-white",
  opt_out: "bg-red-500 text-white"
};

export default function LeadDetail() {
  const { leadId } = useParams<{ leadId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOptOutDialog, setShowOptOutDialog] = useState(false);

  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: () => getLeadById(leadId!),
    enabled: !!leadId
  });

  // Mutation for updating lead
  const updateLeadMutation = useMutation({
    mutationFn: (data: Partial<typeof lead>) => updateLead(leadId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast({
        title: "Lead actualizado",
        description: "Los cambios se han guardado correctamente.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el lead.",
        variant: "destructive",
      });
    }
  });

  // Mutation for deleting lead
  const deleteLeadMutation = useMutation({
    mutationFn: () => deleteLead(leadId!),
    onSuccess: () => {
      toast({
        title: "Lead eliminado",
        description: "El lead se ha eliminado correctamente.",
      });
      navigate("/leads");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el lead.",
        variant: "destructive",
      });
    }
  });

  // Handler functions
  const handleEditLead = () => {
    // For now, show a toast. In the future, navigate to edit page
    toast({
      title: "Función en desarrollo",
      description: "La edición de leads estará disponible próximamente.",
    });
  };

  const handleExportData = async () => {
    try {
      const blob = await exportLeadData(leadId!);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lead_${leadId}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Datos exportados",
        description: "Los datos del lead se han descargado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo exportar los datos del lead.",
        variant: "destructive",
      });
    }
  };

  const handleMarkOptOut = () => {
    updateLeadMutation.mutate({ estado_actual: "opt_out" });
    setShowOptOutDialog(false);
  };

  const handleDeleteLead = () => {
    deleteLeadMutation.mutate();
    setShowDeleteDialog(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando lead...</p>
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h3 className="text-lg font-medium text-card-foreground mb-2">Lead no encontrado</h3>
          <p className="text-sm text-muted-foreground mb-4">
            No se pudo encontrar el lead solicitado
          </p>
          <Button onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Leads
          </Button>
        </div>
      </div>
    );
  }

  const quality = lead.calidad_lead || "frio";
  const qualityInfo = qualityConfig[quality as keyof typeof qualityConfig];

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header Bar */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/leads")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Lista
            </Button>
            <div className="h-6 w-px bg-border"></div>
            <h1 className="text-xl font-semibold text-card-foreground">
              LEAD #{lead.lead_id.slice(0, 8).toUpperCase()}
            </h1>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Acciones
                <MoreVertical className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="shadow-xl">
              <DropdownMenuItem
                onClick={handleEditLead}
                className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300"
              >
                <Edit className="h-4 w-4" />
                Editar lead
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleExportData}
                className="hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950 dark:hover:text-green-300"
              >
                <Download className="h-4 w-4" />
                Exportar datos
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setShowOptOutDialog(true)}
                className="hover:bg-orange-50 hover:text-orange-700 dark:hover:bg-orange-950 dark:hover:text-orange-300"
              >
                <Ban className="h-4 w-4" />
                Marcar como opt-out
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar lead
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Lead Header Card */}
          <Card className="p-6 border border-border shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-2xl font-bold text-white">
                  {lead.nombre[0]}{lead.apellidos[0]}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground">
                    {lead.nombre} {lead.apellidos}
                  </h2>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{lead.telefono}</span>
                      {lead.telefono_validado && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          ✓ Validado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{lead.email}</span>
                    </div>
                  </div>
                  {(lead.ciudad || lead.provincia) && (
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {lead.ciudad}{lead.provincia && `, ${lead.provincia}`}
                        {lead.codigo_postal && ` (CP: ${lead.codigo_postal})`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <Badge className={statusColors[lead.estado_actual as keyof typeof statusColors] || "bg-gray-500"}>
                {lead.estado_actual}
              </Badge>
            </div>

            {/* Quality & Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Flame className={`h-5 w-5 ${qualityInfo.color.replace('bg-', 'text-')}`} />
                  <div>
                    <p className="text-xs text-muted-foreground">Calidad</p>
                    <p className="text-sm font-semibold text-card-foreground">
                      {qualityInfo.icon} {qualityInfo.label}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Score</p>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-green-500"
                      style={{ width: `${lead.lead_score || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-card-foreground">
                    {lead.lead_score || 0}/100
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Lead desde</p>
                <p className="text-sm font-semibold text-card-foreground">
                  {new Date(lead.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Último contacto</p>
                <p className="text-sm font-semibold text-card-foreground">
                  {new Date(lead.last_contact_at).toLocaleDateString()}
                </p>
              </div>
            </div>

          </Card>

          {/* Tabs Navigation */}
          <Tabs defaultValue="intereses" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
              <TabsTrigger value="intereses" className="flex items-center space-x-2">
                <Car className="h-4 w-4" />
                <span>Intereses</span>
              </TabsTrigger>
              <TabsTrigger value="llamadas" className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>Llamadas</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger value="notas" className="flex items-center space-x-2">
                <StickyNote className="h-4 w-4" />
                <span>Notas</span>
              </TabsTrigger>
            </TabsList>

            {/* Intereses Tab */}
            <TabsContent value="intereses" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
                  <span>🚗</span>
                  <span>Intereses por Marca/Concesionario</span>
                </h3>
                {lead.intentos_compra && lead.intentos_compra.length > 0 && (
                  <Badge variant="outline" className="bg-primary/5">
                    {lead.intentos_compra.length} {lead.intentos_compra.length === 1 ? 'interés' : 'intereses'}
                  </Badge>
                )}
              </div>
              {lead.intentos_compra && lead.intentos_compra.length > 0 ? (
                <div className="space-y-4">
                  {lead.intentos_compra.map((intento) => (
                    <BrandDealershipCard
                      key={intento.lead_concesionario_marca_id}
                      intento={intento}
                      leadId={lead.lead_id}
                      isSelected={selectedBrand === intento.lead_concesionario_marca_id}
                      onSelect={() => setSelectedBrand(
                        selectedBrand === intento.lead_concesionario_marca_id
                          ? null
                          : intento.lead_concesionario_marca_id
                      )}
                    />
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center border-dashed">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Car className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-lg font-medium">
                      No hay intereses registrados
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Este lead aún no ha mostrado interés en ninguna marca o concesionario
                    </p>
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Llamadas Tab */}
            <TabsContent value="llamadas" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Historial de Llamadas</span>
                </h3>
                <div className="flex items-center space-x-2">
                  {selectedBrand && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBrand(null)}
                    >
                      Ver todas
                    </Button>
                  )}
                </div>
              </div>
              <CallHistory
                leadId={lead.lead_id}
                brandDealershipId={selectedBrand || undefined}
              />
            </TabsContent>

            {/* WhatsApp Tab */}
            <TabsContent value="whatsapp" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Conversaciones WhatsApp</span>
                </h3>
                <div className="flex items-center space-x-2">
                  {selectedBrand && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBrand(null)}
                    >
                      Ver todas
                    </Button>
                  )}
                </div>
              </div>
              <WhatsAppConversation
                leadId={lead.lead_id}
                brandDealershipId={selectedBrand || undefined}
              />
            </TabsContent>

            {/* Notas Tab */}
            <TabsContent value="notas" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
                  <StickyNote className="h-5 w-5" />
                  <span>Notas del Lead</span>
                </h3>
                <div className="flex items-center space-x-2">
                  {selectedBrand && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedBrand(null)}
                    >
                      Ver todas
                    </Button>
                  )}
                </div>
              </div>
              <NotesSection
                leadId={lead.lead_id}
                brandDealershipId={selectedBrand || undefined}
              />
            </TabsContent>
          </Tabs>

          {/* Unified Timeline */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2 mb-6">
              <History className="h-5 w-5" />
              <span>Timeline Unificado</span>
            </h3>
            <UnifiedTimeline leadId={lead.lead_id} />
          </Card>
        </div>
      </div>

      {/* Opt-Out Confirmation Dialog */}
      <AlertDialog open={showOptOutDialog} onOpenChange={setShowOptOutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Marcar lead como opt-out?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará al lead como no interesado. El lead dejará de recibir comunicaciones automáticas.
              Puedes revertir esta acción más tarde si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkOptOut}>
              Confirmar opt-out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lead permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el lead y todos sus datos asociados,
              incluyendo historial de llamadas, mensajes y notas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteLead}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
