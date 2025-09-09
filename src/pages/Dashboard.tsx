import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, GitBranch, AlertTriangle, TrendingUp, Phone, Clock } from "lucide-react";

const stats = [
  {
    name: "Total Leads",
    value: "2,847",
    change: "+12%",
    changeType: "positive",
    icon: Users,
    color: "stats-calls",
  },
  {
    name: "Workflows Activos",
    value: "18",
    change: "+2",
    changeType: "positive",
    icon: GitBranch,
    color: "stats-success",
  },
  {
    name: "Llamadas Hoy",
    value: "156",
    change: "+8%",
    changeType: "positive",
    icon: Phone,
    color: "stats-duration",
  },
  {
    name: "Errores Pendientes",
    value: "3",
    change: "-2",
    changeType: "negative",
    icon: AlertTriangle,
    color: "stats-error",
  },
];

const recentActivity = [
  {
    id: 1,
    type: "lead_created",
    message: "Nuevo lead: María González - Toyota Corolla",
    time: "Hace 5 minutos",
    status: "success",
  },
  {
    id: 2,
    type: "workflow_completed",
    message: "Workflow completado para lead #2843",
    time: "Hace 12 minutos",
    status: "success",
  },
  {
    id: 3,
    type: "error",
    message: "Error en workflow de llamadas automáticas",
    time: "Hace 18 minutos",
    status: "error",
  },
  {
    id: 4,
    type: "lead_converted",
    message: "Lead convertido: Carlos Ruiz - Honda Civic",
    time: "Hace 25 minutos",
    status: "success",
  },
];

export default function Dashboard() {
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
        {stats.map((stat) => (
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
                    variant={stat.changeType === "positive" ? "default" : "destructive"}
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
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-card-foreground">
              Actividad Reciente
            </h3>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              En vivo
            </Badge>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                <div className={`mt-1 h-2 w-2 rounded-full ${
                  activity.status === "success" ? "bg-success" : "bg-error"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-card-foreground font-medium">
                    {activity.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <button className="w-full p-4 text-left rounded-lg border border-border hover:bg-primary/5 hover:border-primary/20 transition-smooth group">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-primary group-hover:text-primary-hover" />
                <div>
                  <p className="font-medium text-card-foreground">Ver Leads Nuevos</p>
                  <p className="text-xs text-muted-foreground">12 leads sin procesar</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left rounded-lg border border-border hover:bg-success/5 hover:border-success/20 transition-smooth group">
              <div className="flex items-center space-x-3">
                <GitBranch className="h-5 w-5 text-success group-hover:text-success/80" />
                <div>
                  <p className="font-medium text-card-foreground">Crear Workflow</p>
                  <p className="text-xs text-muted-foreground">Automatizar procesos</p>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 text-left rounded-lg border border-border hover:bg-warning/5 hover:border-warning/20 transition-smooth group">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-warning group-hover:text-warning/80" />
                <div>
                  <p className="font-medium text-card-foreground">Ver Estadísticas</p>
                  <p className="text-xs text-muted-foreground">Análisis de rendimiento</p>
                </div>
              </div>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}