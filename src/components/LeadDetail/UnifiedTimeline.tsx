import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TimelineEvent } from "@/types";
import { getLeadTimeline } from "@/services/api";
import {
  Phone,
  MessageSquare,
  Mail,
  StickyNote,
  RefreshCw,
  UserPlus,
  Sparkles,
  Calendar as CalendarIcon,
} from "lucide-react";

interface UnifiedTimelineProps {
  leadId: string;
}

const eventTypeConfig = {
  llamada: {
    icon: Phone,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  whatsapp: {
    icon: MessageSquare,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  email: {
    icon: Mail,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  nota: {
    icon: StickyNote,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
  },
  cambio_estado: {
    icon: RefreshCw,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  asignacion: {
    icon: UserPlus,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
  },
  lead_creado: {
    icon: Sparkles,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
  },
};

export function UnifiedTimeline({ leadId }: UnifiedTimelineProps) {
  const [showAll, setShowAll] = useState(false);

  const { data: events, isLoading } = useQuery({
    queryKey: ["timeline", leadId],
    queryFn: () => getLeadTimeline(leadId),
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-3">
                <div className="h-10 w-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!events || events.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Línea de Tiempo Completa</span>
        </h3>
        <p className="text-sm text-muted-foreground">
          No hay eventos registrados en la línea de tiempo
        </p>
      </Card>
    );
  }

  const displayedEvents = showAll ? events : events.slice(0, 15);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center space-x-2">
          <CalendarIcon className="h-5 w-5" />
          <span>Línea de Tiempo Completa (Todas las Marcas)</span>
          <Badge variant="outline">{events.length}</Badge>
        </h3>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border"></div>

        {/* Timeline Events */}
        <div className="space-y-4">
          {displayedEvents.map((event, index) => {
            const config = eventTypeConfig[event.tipo as keyof typeof eventTypeConfig];
            const Icon = config?.icon || CalendarIcon;

            return (
              <div key={event.id} className="relative flex items-start space-x-4 pb-2">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full ${
                    config?.bgColor || "bg-gray-100"
                  }`}
                >
                  <Icon className={`h-5 w-5 ${config?.color || "text-gray-600"}`} />
                </div>

                {/* Event Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {event.marca && (
                          <Badge variant="outline" className="text-xs">
                            {event.marca}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(event.fecha).toLocaleDateString()}{" "}
                          {new Date(event.fecha).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-card-foreground">
                        {event.icono && <span className="mr-2">{event.icono}</span>}
                        {event.descripcion}
                      </p>
                      {event.agente && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Agente: {event.agente}
                        </p>
                      )}
                      {event.concesionario && (
                        <p className="text-xs text-muted-foreground">
                          Concesionario: {event.concesionario}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {events.length > 15 && (
        <div className="mt-6 text-center pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll
              ? "Mostrar menos"
              : `Cargar más eventos (${events.length - 15} restantes)`}
          </Button>
        </div>
      )}
    </Card>
  );
}
