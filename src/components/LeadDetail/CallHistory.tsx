import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CallRecord } from "@/types";
import { getCallHistory } from "@/services/api";
import {
  Phone,
  PhoneOff,
  PhoneMissed,
  Headphones,
  FileText,
  Download,
  Clock,
  User
} from "lucide-react";

interface CallHistoryProps {
  leadId: string;
  brandDealershipId: string;
}

const callStatusConfig = {
  successful: { label: "Exitosa", color: "bg-green-500 text-white", icon: Phone },
  failed: { label: "Fallida", color: "bg-red-500 text-white", icon: PhoneOff },
  no_answer: { label: "No contesta", color: "bg-yellow-500 text-white", icon: PhoneMissed },
  busy: { label: "Ocupado", color: "bg-orange-500 text-white", icon: PhoneOff },
  rejected: { label: "Rechazada", color: "bg-red-600 text-white", icon: PhoneOff },
};

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function CallHistory({ leadId, brandDealershipId }: CallHistoryProps) {
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const { data: calls, isLoading } = useQuery({
    queryKey: ["calls", leadId, brandDealershipId],
    queryFn: () => getCallHistory(leadId, brandDealershipId),
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="h-20 bg-muted rounded"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (!calls || calls.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>Historial de Llamadas</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          No hay llamadas registradas para esta marca/concesionario
        </p>
      </Card>
    );
  }

  const displayedCalls = showAll ? calls : calls.slice(0, 5);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <Phone className="h-5 w-5" />
          <span>Historial de Llamadas</span>
          <Badge variant="outline">{calls.length}</Badge>
        </h3>
      </div>

      <div className="space-y-3">
        {displayedCalls.map((call) => {
          const statusInfo = callStatusConfig[call.estado as keyof typeof callStatusConfig];
          const Icon = statusInfo?.icon || Phone;
          const isExpanded = expandedCall === call.llamada_id;

          return (
            <div
              key={call.llamada_id}
              className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* Call Summary */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className={`p-2 rounded-lg ${call.estado === 'successful' ? 'bg-green-100' : 'bg-red-100'}`}>
                      <Icon className={`h-5 w-5 ${call.estado === 'successful' ? 'text-green-600' : 'text-red-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className={statusInfo?.color || "bg-gray-500"}>
                          {statusInfo?.label || call.estado}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(call.fecha_llamada).toLocaleDateString()} {new Date(call.fecha_llamada).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {call.metadata?.agent_name && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>Agente: {call.metadata.agent_name}</span>
                          </div>
                        )}
                        {call.duracion !== undefined && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Duración: {formatDuration(call.duracion)}</span>
                          </div>
                        )}
                      </div>
                      {call.metadata?.notas && !isExpanded && (
                        <p className="text-sm text-card-foreground mt-2 line-clamp-1">
                          Notas: "{call.metadata.notas}"
                        </p>
                      )}
                    </div>
                  </div>
                  {(call.metadata?.recording_url || call.metadata?.transcription || call.metadata?.notas) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setExpandedCall(isExpanded ? null : call.llamada_id)}
                    >
                      {isExpanded ? 'Ocultar' : 'Ver detalles'}
                    </Button>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3">
                    {call.metadata?.notas && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Notas de la llamada</p>
                        <p className="text-sm text-card-foreground bg-muted/30 p-3 rounded-lg">
                          {call.metadata.notas}
                        </p>
                      </div>
                    )}

                    {call.metadata?.transcription && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">Transcripción (IA)</p>
                        <p className="text-sm text-card-foreground bg-muted/30 p-3 rounded-lg max-h-40 overflow-y-auto">
                          {call.metadata.transcription}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      {call.metadata?.recording_url && (
                        <>
                          <Button variant="outline" size="sm">
                            <Headphones className="h-4 w-4 mr-2" />
                            Escuchar grabación
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Descargar
                          </Button>
                        </>
                      )}
                      {call.metadata?.transcription && (
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Ver transcripción completa
                        </Button>
                      )}
                    </div>

                    {/* Technical Details */}
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                      {call.call_sid && (
                        <div>
                          <p className="text-xs text-muted-foreground">Call SID</p>
                          <p className="text-xs font-mono text-card-foreground">{call.call_sid}</p>
                        </div>
                      )}
                      {call.proveedor && (
                        <div>
                          <p className="text-xs text-muted-foreground">Proveedor</p>
                          <p className="text-xs text-card-foreground">{call.proveedor}</p>
                        </div>
                      )}
                      {call.costo !== undefined && (
                        <div>
                          <p className="text-xs text-muted-foreground">Costo</p>
                          <p className="text-xs text-card-foreground">{call.costo.toFixed(4)}€</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {calls.length > 5 && (
        <div className="mt-4 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Mostrar menos' : `Cargar más llamadas (${calls.length - 5} restantes)`}
          </Button>
        </div>
      )}
    </Card>
  );
}
