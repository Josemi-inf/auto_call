import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/DateRangePicker";
import {
  getStatsOverview,
  getStatsByMarca,
  getStatsAdvanced,
  getStatsRanking,
} from "@/services/api";
import {
  BarChart3,
  TrendingUp,
  Phone,
  CheckCircle2,
  Clock,
  Award,
} from "lucide-react";
import { DateRange } from "react-day-picker";

export default function Statistics() {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();

  // Convert DateRange to API format - only include if both dates are selected
  const dateRange = selectedDateRange?.from && selectedDateRange?.to ? {
    start_date: selectedDateRange.from.toISOString().split('T')[0],
    end_date: selectedDateRange.to.toISOString().split('T')[0],
  } : {};

  // Fetch all statistics data
  const { data: overview, isLoading: loadingOverview, error: errorOverview } = useQuery({
    queryKey: ["stats-overview", dateRange],
    queryFn: () => getStatsOverview(dateRange),
  });

  const { data: byMarca, isLoading: loadingByMarca } = useQuery({
    queryKey: ["stats-by-marca", dateRange],
    queryFn: () => getStatsByMarca(dateRange),
  });

  const { data: advanced, isLoading: loadingAdvanced } = useQuery({
    queryKey: ["stats-advanced", dateRange],
    queryFn: () => getStatsAdvanced(dateRange),
  });

  const { data: ranking, isLoading: loadingRanking } = useQuery({
    queryKey: ["stats-ranking", dateRange],
    queryFn: () => getStatsRanking({ ...dateRange, limit: 10 }),
  });

  const isLoading = loadingOverview || loadingByMarca || loadingAdvanced || loadingRanking;

  if (loadingOverview) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (errorOverview) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error cargando estadísticas: {String(errorOverview)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-3">
            <BarChart3 className="h-8 w-8" />
            <span>Estadísticas de Leads</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Análisis detallado de rendimiento por marca y concesionario
          </p>
          {selectedDateRange?.from && selectedDateRange?.to && (
            <p className="text-sm text-muted-foreground mt-2">
              Mostrando estadísticas del período seleccionado
            </p>
          )}
        </div>

        {/* Date Range Filter - Top Right */}
        <div className="flex-shrink-0">
          <DateRangePicker
            dateRange={selectedDateRange}
            onDateRangeChange={setSelectedDateRange}
          />
        </div>
      </div>

      {/* KPI Cards */}
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {overview.total_leads || 0}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Phone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Llamadas</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {overview.total_llamadas || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {parseFloat((overview.intentos_medio || 0).toString()).toFixed(1)} intentos/lead
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Leads Exitosos</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {overview.leads_exitosos || 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {parseFloat((overview.porcentaje_exito || 0).toString()).toFixed(1)}% tasa de éxito
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Duración Promedio</p>
                <p className="text-3xl font-bold text-foreground mt-2">
                  {Math.floor(parseFloat((overview.duracion_promedio || 0).toString()) / 60)}:{(parseFloat((overview.duracion_promedio || 0).toString()) % 60).toFixed(0).padStart(2, '0')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">minutos</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Resumen General</TabsTrigger>
          <TabsTrigger value="advanced">Análisis Avanzado</TabsTrigger>
          <TabsTrigger value="ranking">Rankings</TabsTrigger>
        </TabsList>

        {/* Tab: Resumen General */}
        <TabsContent value="general">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Resumen por Marca</span>
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            ) : byMarca && byMarca.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Marca</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Leads</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Llamadas</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Exitosos</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">% Éxito</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">No Interesados</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">No Conectaron</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Buzón Voz</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Rellamadas</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Intentos Medio</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Duración (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byMarca.map((marca) => (
                      <tr key={marca.marca_id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium text-foreground">{marca.marca}</td>
                        <td className="text-right py-3 px-4 text-foreground">{marca.total_leads}</td>
                        <td className="text-right py-3 px-4 text-foreground">{marca.total_llamadas}</td>
                        <td className="text-right py-3 px-4 text-green-600 font-medium">{marca.leads_exitosos}</td>
                        <td className="text-right py-3 px-4">
                          <Badge className={parseFloat(marca.porcentaje_exito.toString()) >= 50 ? "bg-green-500" : "bg-yellow-500"}>
                            {parseFloat(marca.porcentaje_exito.toString()).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4 text-foreground">{marca.leads_no_interesados}</td>
                        <td className="text-right py-3 px-4 text-foreground">{marca.no_conectaron}</td>
                        <td className="text-right py-3 px-4 text-foreground">{marca.buzon_voz}</td>
                        <td className="text-right py-3 px-4 text-foreground">{marca.rellamadas}</td>
                        <td className="text-right py-3 px-4 text-foreground">{parseFloat(marca.intentos_medio.toString()).toFixed(1)}</td>
                        <td className="text-right py-3 px-4 text-foreground">{Math.floor(parseFloat(marca.duracion_promedio.toString()) / 60)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay datos disponibles</p>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Análisis Avanzado */}
        <TabsContent value="advanced">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Análisis Avanzado de Conversión</span>
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            ) : advanced && advanced.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Marca</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Tasa Éxito</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Tasa Rechazo</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Tasa Contacto</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Eficiencia Llamadas</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Llamadas/Lead</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">% No Contesta</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">% Buzón</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Incontactables</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Evaluación</th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Prioridad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {advanced.map((marca) => (
                      <tr key={marca.marca_id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium text-foreground">{marca.marca}</td>
                        <td className="text-right py-3 px-4">
                          <Badge className="bg-green-500">
                            {parseFloat(marca.tasa_exito.toString()).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge className="bg-red-500">
                            {parseFloat(marca.tasa_rechazo.toString()).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge className="bg-blue-500">
                            {parseFloat(marca.tasa_contacto.toString()).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge className={parseFloat(marca.eficiencia_llamadas.toString()) >= 50 ? "bg-green-500" : "bg-yellow-500"}>
                            {parseFloat(marca.eficiencia_llamadas.toString()).toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4 text-foreground">
                          {parseFloat(marca.llamadas_por_lead.toString()).toFixed(1)}
                        </td>
                        <td className="text-right py-3 px-4 text-foreground">
                          {parseFloat(marca.porcentaje_no_contesta.toString()).toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-4 text-foreground">
                          {parseFloat(marca.porcentaje_buzon.toString()).toFixed(1)}%
                        </td>
                        <td className="text-right py-3 px-4 text-foreground">{marca.total_incontactables}</td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            className={
                              marca.evaluacion === "Excelente"
                                ? "bg-green-500"
                                : marca.evaluacion === "Regular"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }
                          >
                            {marca.evaluacion}
                          </Badge>
                        </td>
                        <td className="text-center py-3 px-4">
                          <Badge
                            variant={
                              marca.prioridad_recontacto === "ALTA"
                                ? "destructive"
                                : marca.prioridad_recontacto === "MEDIA"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {marca.prioridad_recontacto}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay datos disponibles</p>
            )}
          </Card>
        </TabsContent>

        {/* Tab: Rankings */}
        <TabsContent value="ranking">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Top 10 Marcas por Rendimiento</span>
            </h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded"></div>
                <div className="h-12 bg-muted rounded"></div>
              </div>
            ) : ranking && ranking.length > 0 ? (
              <div className="space-y-3">
                {ranking.map((marca, index) => (
                  <div
                    key={marca.marca_id}
                    className={`flex items-center justify-between p-4 rounded-lg border border-border ${
                      index === 0
                        ? "bg-yellow-50 border-yellow-300"
                        : index === 1
                        ? "bg-gray-50 border-gray-300"
                        : index === 2
                        ? "bg-orange-50 border-orange-300"
                        : "bg-card"
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg ${
                          index === 0
                            ? "bg-yellow-500 text-white"
                            : index === 1
                            ? "bg-gray-400 text-white"
                            : index === 2
                            ? "bg-orange-500 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {marca.posicion}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-lg">{marca.marca}</p>
                        <p className="text-sm text-muted-foreground">
                          {marca.total_leads} leads • {marca.total_llamadas} llamadas
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {parseFloat(marca.tasa_exito.toString()).toFixed(1)}%
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {marca.leads_exitosos} exitosos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No hay datos disponibles</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
