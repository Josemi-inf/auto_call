import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Phone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Filter,
  Download
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useCallTimeseries, useTotalCallStats, useWorkflowStats } from "@/hooks/use-stats";

export default function Statistics() {
  const { data: timeseries } = useCallTimeseries();
  const { data: totals } = useTotalCallStats();
  const { data: workflows } = useWorkflowStats();

  const pieData = totals
    ? [
        { name: 'Exitosas', value: totals.successfulCalls, color: 'hsl(var(--success))' },
        { name: 'Fallidas', value: totals.failedCalls, color: 'hsl(var(--error))' },
        { name: 'Sin respuesta', value: totals.noAnswerCalls, color: 'hsl(var(--warning))' }
      ]
    : [];
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estadísticas de Llamadas</h1>
          <p className="text-muted-foreground mt-2">
            Análisis detallado del rendimiento de los workflows de llamadas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border border-border shadow-custom-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Llamadas</p>
              <p className="text-3xl font-bold text-card-foreground">{totals ? totals.totalCalls.toLocaleString() : '-'}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-success mr-1" />
                <span className="text-sm text-success">+12.5%</span>
                <span className="text-xs text-muted-foreground ml-1">vs mes anterior</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <Phone className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-custom-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Llamadas Exitosas</p>
              <p className="text-3xl font-bold text-card-foreground">{totals ? totals.successfulCalls : '-'}</p>
              <div className="flex items-center mt-2">
                <Badge className="bg-success text-success-foreground text-xs">
                  {totals ? `${totals.successRate}%` : '-'}
                </Badge>
                <span className="text-xs text-muted-foreground ml-2">tasa de éxito</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-custom-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Duración Total</p>
              <p className="text-3xl font-bold text-card-foreground">
                {totals ? `${Math.floor(totals.totalDuration / 60)}h ${totals.totalDuration % 60}m` : '-'}
              </p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-warning">{totals ? `${totals.avgDuration}m` : '-'}</span>
                <span className="text-xs text-muted-foreground ml-1">promedio</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <Clock className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="p-6 border border-border shadow-custom-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gasto Total</p>
              <p className="text-3xl font-bold text-card-foreground">{totals ? `€${totals.totalCost.toLocaleString()}` : '-'}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-warning">{totals ? `€${totals.costPerCall}` : '-'}</span>
                <span className="text-xs text-muted-foreground ml-1">por llamada</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <DollarSign className="h-6 w-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Calls Trend Chart */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Tendencia de Llamadas (7 días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timeseries || []}>
              <defs>
                <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--stats-calls))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--stats-calls))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="successGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
              <YAxis />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="hsl(var(--stats-calls))"
                fillOpacity={1}
                fill="url(#totalGradient)"
                name="Total"
              />
              <Area
                type="monotone"
                dataKey="successful"
                stroke="hsl(var(--success))"
                fillOpacity={1}
                fill="url(#successGradient)"
                name="Exitosas"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Call Distribution */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Distribución de Resultados
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Workflow Performance */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Rendimiento por Workflow
          </h3>
          <div className="space-y-4">
            {(workflows || []).map((workflow) => (
              <div key={workflow.name} className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-card-foreground">{workflow.name}</h4>
                  <Badge className="bg-primary text-primary-foreground">
                    {workflow.percentage}%
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-semibold text-card-foreground">{workflow.calls}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Exitosas</p>
                    <p className="font-semibold text-success">{workflow.successful}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fallidas</p>
                    <p className="font-semibold text-error">{workflow.failed}</p>
                  </div>
                </div>
                <div className="mt-2 w-full bg-border rounded-full h-2">
                  <div 
                    className="bg-success h-2 rounded-full transition-smooth" 
                    style={{ width: `${workflow.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Additional Metrics */}
        <Card className="p-6 border border-border shadow-custom-sm">
          <h3 className="text-lg font-semibold text-card-foreground mb-4">
            Métricas Adicionales
          </h3>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <Activity className="h-8 w-8 text-stats-duration mx-auto mb-2" />
                <p className="text-2xl font-bold text-card-foreground">{totals ? `${totals.avgLatency}s` : '-'}</p>
                <p className="text-sm text-muted-foreground">Latencia Promedio</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-muted/30">
                <XCircle className="h-8 w-8 text-error mx-auto mb-2" />
                <p className="text-2xl font-bold text-card-foreground">{totals ? totals.failedCalls : '-'}</p>
                <p className="text-sm text-muted-foreground">Llamadas Fallidas</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-card-foreground">Resumen Semanal</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mejor día:</span>
                  <span className="font-medium text-card-foreground">Jueves (189 llamadas)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Peor día:</span>
                  <span className="font-medium text-card-foreground">Miércoles (134 llamadas)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hora pico:</span>
                  <span className="font-medium text-card-foreground">14:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duración media:</span>
                  <span className="font-medium text-card-foreground">{totals ? `${totals.avgDuration} min` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
