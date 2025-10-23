import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, GitBranch, AlertTriangle, TrendingUp, Phone, Clock, Plus, Settings, BarChart3, Eye, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStatsOverview, getStatsByMarca, getWeeklyLeadsData, getWorkflowPerformance } from "@/services/dashboard-mock";
import { getRecentActivity, type RecentActivity } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";



export default function Dashboard() {
  const navigate = useNavigate();

  // Queries para obtener datos reales desde la API de estadísticas
  const { data: overview, isLoading: statsLoading } = useQuery({
    queryKey: ['stats-overview'],
    queryFn: () => getStatsOverview({}),
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });

  const { data: byMarca } = useQuery({
    queryKey: ['stats-by-marca'],
    queryFn: () => getStatsByMarca({}),
    refetchInterval: 30000,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => getRecentActivity(10),
    refetchInterval: 30000,
  });

  const { data: weeklyData } = useQuery({
    queryKey: ['weekly-leads'],
    queryFn: getWeeklyLeadsData,
  });

  const { data: workflowPerformance } = useQuery({
    queryKey: ['workflow-performance'],
    queryFn: getWorkflowPerformance,
  });

  // Formatear datos para las estadísticas usando los datos reales
  const statsData = overview ? [
    {
      name: "Total Leads",
      value: overview.total_leads?.toString() || "0",
      change: `${parseFloat((overview.porcentaje_exito || 0).toString()).toFixed(1)}% éxito`,
      changeType: parseFloat((overview.porcentaje_exito || 0).toString()) >= 50 ? "positive" : "negative",
      icon: Users,
      color: "stats-calls",
    },
    {
      name: "Total Llamadas",
      value: overview.total_llamadas?.toString() || "0",
      change: `${parseFloat((overview.intentos_medio || 0).toString()).toFixed(1)} intentos/lead`,
      changeType: "neutral",
      icon: Phone,
      color: "stats-duration",
    },
    {
      name: "Leads Exitosos",
      value: overview.leads_exitosos?.toString() || "0",
      change: `${parseFloat((overview.porcentaje_exito || 0).toString()).toFixed(1)}% tasa de éxito`,
      changeType: "positive",
      icon: CheckCircle2,
      color: "stats-success",
    },
    {
      name: "Duración Promedio",
      value: `${Math.floor(parseFloat((overview.duracion_promedio || 0).toString()) / 60)}:${(parseFloat((overview.duracion_promedio || 0).toString()) % 60).toFixed(0).padStart(2, '0')}`,
      change: "minutos por llamada",
      changeType: "neutral",
      icon: Clock,
      color: "stats-calls",
    },
  ] : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen general de tu sistema de gestión de leads
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
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
                    variant={stat.changeType === "positive" ? "default" : stat.changeType === "negative" ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {stat.change}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">vs último mes</span>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Recent Activity */}
        <Card className="xl:col-span-1 p-6 border border-border shadow-custom-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Actividad Reciente
            </h3>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              En vivo
            </Badge>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {activityLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg animate-pulse">
                  <div className="mt-1 h-2 w-2 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : activity && activity.length > 0 ? (
              activity.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    item.status === "success" ? "bg-green-500" :
                    item.status === "warning" ? "bg-yellow-500" : "bg-red-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground font-medium">
                      {item.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay actividad reciente
              </p>
            )}
          </div>
        </Card>

        {/* Weekly Leads Chart */}
        <Card className="xl:col-span-2 p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Leads de la Última Semana
          </h3>
          <div className="h-64">
            {weeklyData && weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    formatter={(value) => [value, 'Leads']}
                  />
                  <Line
                    type="monotone"
                    dataKey="leads_count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Performance */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Rendimiento de Workflows
          </h3>
          <div className="space-y-4">
            {workflowPerformance && workflowPerformance.length > 0 ? (
              workflowPerformance.map((workflow, index) => (
                <div key={index} className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-card-foreground">{workflow.name}</h4>
                    <Badge variant={workflow.successRate >= 80 ? "default" : workflow.successRate >= 60 ? "secondary" : "destructive"}>
                      {workflow.successRate}% éxito
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {workflow.totalExecutions} ejecuciones • {workflow.successful} exitosas • {workflow.failed} fallidas
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${workflow.successRate}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay datos de workflows disponibles
              </p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-primary/5 hover:border-primary/20 group"
              onClick={() => navigate('/leads')}
            >
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary group-hover:text-primary/80" />
                <div className="text-left">
                  <p className="font-medium text-card-foreground">Ver Todos los Leads</p>
                  <p className="text-xs text-muted-foreground">{overview?.total_leads || 0} leads totales</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-green-500/5 hover:border-green-500/20 group"
              onClick={() => navigate('/stats')}
            >
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-green-600 group-hover:text-green-500" />
                <div className="text-left">
                  <p className="font-medium text-card-foreground">Ver Estadísticas</p>
                  <p className="text-xs text-muted-foreground">Análisis detallado por marca</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-blue-500/5 hover:border-blue-500/20 group"
              onClick={() => navigate('/workflows')}
            >
              <div className="flex items-center space-x-3">
                <GitBranch className="h-5 w-5 text-blue-600 group-hover:text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-card-foreground">Gestionar Workflows</p>
                  <p className="text-xs text-muted-foreground">Workflows de n8n</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start h-auto p-4 hover:bg-orange-500/5 hover:border-orange-500/20 group"
              onClick={() => navigate('/errors')}
            >
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 group-hover:text-orange-500" />
                <div className="text-left">
                  <p className="font-medium text-card-foreground">Monitor de Errores</p>
                  <p className="text-xs text-muted-foreground">Ver errores de workflows</p>
                </div>
              </div>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}