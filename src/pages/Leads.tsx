import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getLeads } from "@/services/api";
import type { Lead } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Phone,
  Search,
  Users,
  UserCheck,
  TrendingUp,
  Eye,
  Star,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const statusColors = {
  "nuevo": "bg-primary text-primary-foreground",
  "en_seguimiento": "bg-warning text-warning-foreground",
  "convertido": "bg-success text-success-foreground",
  "perdido": "bg-error text-error-foreground"
};

const statusLabels = {
  "nuevo": "Nuevo",
  "en_seguimiento": "En Seguimiento",
  "convertido": "Convertido",
  "perdido": "Perdido"
};

export default function Leads() {
  const navigate = useNavigate();
  const { data: leads, isLoading } = useQuery({ queryKey: ["leads"], queryFn: getLeads });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 10;

  const filteredLeads = (leads || []).filter(lead => {
    const searchTermLower = searchTerm.toLowerCase();
    return (lead.nombre + " " + lead.apellidos).toLowerCase().includes(searchTermLower) ||
           lead.email.toLowerCase().includes(searchTermLower) ||
           lead.telefono.toLowerCase().includes(searchTermLower) ||
           lead.concesionario?.toLowerCase().includes(searchTermLower) ||
           lead.marca?.toLowerCase().includes(searchTermLower);
  });

  // Calcular estadísticas
  const stats = useMemo(() => {
    const total = leads?.length || 0;
    const activos = leads?.filter(l => l.estado_actual === 'nuevo' || l.estado_actual === 'en_seguimiento').length || 0;
    const convertidos = leads?.filter(l => l.estado_actual === 'convertido').length || 0;
    const perdidos = leads?.filter(l => l.estado_actual === 'perdido').length || 0;

    // Calcular calidad media (si existe lead_score)
    const leadsConScore = leads?.filter(l => l.lead_score !== undefined && l.lead_score !== null) || [];
    const calidadMedia = leadsConScore.length > 0
      ? leadsConScore.reduce((sum, l) => sum + (l.lead_score || 0), 0) / leadsConScore.length
      : 0;

    return {
      total,
      activos,
      convertidos,
      perdidos,
      calidadMedia: calidadMedia.toFixed(1),
      tasaConversion: total > 0 ? ((convertidos / total) * 100).toFixed(1) : '0'
    };
  }, [leads]);

  // Calcular paginación
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const endIndex = startIndex + leadsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

  // Resetear a la primera página cuando cambia el filtro de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const statsData = [
    {
      name: "Total Leads",
      value: stats.total.toString(),
      change: `${stats.tasaConversion}% convertidos`,
      changeType: parseFloat(stats.tasaConversion) >= 20 ? "positive" : "neutral",
      icon: Users,
      color: "stats-calls",
    },
    {
      name: "Leads Activos",
      value: stats.activos.toString(),
      change: "En seguimiento",
      changeType: "neutral",
      icon: UserCheck,
      color: "stats-success",
    },
    {
      name: "Convertidos",
      value: stats.convertidos.toString(),
      change: `${stats.tasaConversion}% tasa éxito`,
      changeType: "positive",
      icon: TrendingUp,
      color: "stats-success",
    },
    {
      name: "Calidad Media",
      value: stats.calidadMedia,
      change: "Score promedio",
      changeType: "neutral",
      icon: Star,
      color: "stats-duration",
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Gestión de Leads</h1>
        <p className="text-muted-foreground mt-2">
          Administra y da seguimiento a todos tus leads
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 border border-border shadow-custom-sm animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-20"></div>
                  <div className="h-8 bg-muted rounded w-16"></div>
                  <div className="h-4 bg-muted rounded w-24"></div>
                </div>
                <div className="h-12 w-12 bg-muted rounded-lg"></div>
              </div>
            </Card>
          ))
        ) : (
          statsData.map((stat) => (
            <Card key={stat.name} className="p-6 border border-border shadow-custom-sm hover:shadow-custom-md transition-smooth">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-card-foreground">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <Badge
                      variant={stat.changeType === "positive" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {stat.change}
                    </Badge>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-primary/10`}>
                  <stat.icon className={`h-6 w-6 text-primary`} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Search Bar */}
      <Card className="p-6 border border-border shadow-custom-sm mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email, teléfono, concesionario o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
          <Button className="h-12">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </Card>

      {/* Leads List */}
      <Card className="border border-border shadow-custom-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Nombre</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Teléfono</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Concesionario</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Marca/Modelo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Calidad</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Estado</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-card-foreground">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-28"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-36"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-muted rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-8 bg-muted rounded w-20 mx-auto"></div></td>
                  </tr>
                ))
              ) : paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-card-foreground mb-2">
                      No se encontraron leads
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Intenta con otros términos de búsqueda" : "Aún no hay leads en el sistema"}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => (
                  <tr
                    key={lead.lead_id}
                    className="border-b border-border hover:bg-muted/30 transition-smooth cursor-pointer"
                    onClick={() => navigate(`/leads/${lead.lead_id}`)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-card-foreground">
                        {lead.nombre} {lead.apellidos}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{lead.telefono}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-card-foreground">
                        {lead.concesionario || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="font-medium text-card-foreground">{lead.marca || '-'}</p>
                        <p className="text-muted-foreground">{lead.modelo || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead.lead_score !== undefined && lead.lead_score !== null ? (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm font-medium text-card-foreground">
                            {lead.lead_score}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`${statusColors[lead.estado_actual as keyof typeof statusColors]}`}>
                        {statusLabels[lead.estado_actual as keyof typeof statusLabels] || lead.estado_actual}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/leads/${lead.lead_id}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando <span className="font-medium text-card-foreground">{startIndex + 1}</span> a{" "}
                <span className="font-medium text-card-foreground">{Math.min(endIndex, filteredLeads.length)}</span> de{" "}
                <span className="font-medium text-card-foreground">{filteredLeads.length}</span> leads
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    // Mostrar solo algunas páginas para no saturar
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="min-w-[36px]"
                        >
                          {page}
                        </Button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 text-muted-foreground">...</span>;
                    }
                    return null;
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
