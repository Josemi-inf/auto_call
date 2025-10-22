import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LeadConcesionarioMarca } from "@/types";
import {
  ChevronDown,
  ChevronUp,
  Star,
  User,
  Calendar,
  Phone,
  MessageSquare,
  TrendingUp
} from "lucide-react";

interface BrandDealershipCardProps {
  intento: LeadConcesionarioMarca;
  leadId: string;
  isSelected: boolean;
  onSelect: () => void;
}

const estadoConfig = {
  nuevo: { label: "Nuevo", color: "bg-blue-500 text-white", icon: "🆕" },
  en_seguimiento: { label: "En seguimiento", color: "bg-yellow-500 text-white", icon: "🟡" },
  cita_agendada: { label: "Cita agendada", color: "bg-purple-500 text-white", icon: "📅" },
  convertido: { label: "Convertido", color: "bg-green-500 text-white", icon: "✅" },
  perdido: { label: "Perdido", color: "bg-red-500 text-white", icon: "🔴" },
};

const urgenciaConfig = {
  alta: { label: "Alta (menos de 1 mes)", color: "text-red-600", icon: "🔴" },
  media: { label: "Media (1-3 meses)", color: "text-yellow-600", icon: "🟡" },
  baja: { label: "Baja (más de 3 meses)", color: "text-green-600", icon: "🟢" },
};

export function BrandDealershipCard({ intento, leadId, isSelected, onSelect }: BrandDealershipCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const estado = intento.estado || "nuevo";
  const estadoInfo = estadoConfig[estado as keyof typeof estadoConfig] || estadoConfig.nuevo;

  const urgencia = intento.urgencia || "media";
  const urgenciaInfo = urgenciaConfig[urgencia as keyof typeof urgenciaConfig];

  const prioridad = intento.prioridad || 3;
  const engagement = intento.engagement_score || 0;

  return (
    <Card className={`border-2 transition-all ${isSelected ? 'border-primary shadow-lg' : 'border-border'}`}>
      {/* Card Header */}
      <div
        className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onSelect}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h4 className="text-lg font-semibold text-card-foreground">
                {intento.marca} - {intento.concesionario}
              </h4>
              <Badge className={estadoInfo.color}>
                {estadoInfo.icon} {estadoInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
              <div>
                <p className="text-xs text-muted-foreground">Modelo de interés</p>
                <p className="text-sm font-medium text-card-foreground">{intento.modelo}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Presupuesto</p>
                <p className="text-sm font-medium text-card-foreground">
                  {intento.presupuesto_min}€ - {intento.presupuesto_max}€
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Urgencia</p>
                <p className={`text-sm font-medium ${urgenciaInfo.color}`}>
                  {urgenciaInfo.icon} {urgenciaInfo.label}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Prioridad</p>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < prioridad ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-2">Detalles del vehículo</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Combustible</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {intento.combustible_preferido || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Transmisión</p>
                    <p className="text-sm font-medium text-card-foreground">
                      {intento.transmision || "No especificado"}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-2">Comercial asignado</p>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-card-foreground">
                    {intento.comercial_nombre || "Sin asignar"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Asignado</p>
                  <p className="text-sm font-medium text-card-foreground">
                    {intento.fecha_asignacion
                      ? new Date(intento.fecha_asignacion).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Próxima acción</p>
                  <p className="text-sm font-medium text-card-foreground">
                    {intento.fecha_proxima_accion
                      ? new Date(intento.fecha_proxima_accion).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              {intento.estado === "perdido" && intento.motivo_perdida && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Motivo de pérdida</p>
                  <p className="text-sm text-red-600">{intento.motivo_perdida}</p>
                </div>
              )}
            </div>

            {/* Right Column - Contact Summary */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-3">Resumen de contactos</p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Llamadas</span>
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      {intento.total_llamadas || 0} ({intento.llamadas_exitosas || 0} exitosas, {intento.llamadas_fallidas || 0} fallidas)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">WhatsApps</span>
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      {intento.total_whatsapps || 0} ({intento.whatsapps_respondidos || 0} respondidos)
                    </span>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Engagement</span>
                      </div>
                      <span className="text-sm font-semibold text-card-foreground">
                        {engagement}/100
                      </span>
                    </div>
                    <Progress value={engagement} className="h-2" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2 mt-4 pt-4 border-t border-border">
            <Button variant="outline" size="sm" onClick={onSelect}>
              Ver Historial Completo
            </Button>
            <Button variant="outline" size="sm">
              Registrar Acción
            </Button>
            <Button variant="outline" size="sm">
              Cambiar Estado
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
