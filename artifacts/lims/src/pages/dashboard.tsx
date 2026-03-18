import { useGetDashboardStats } from "@workspace/api-client-react";
import { Card } from "@/components/ui";
import { FlaskConical, AlertTriangle, Activity, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { generateBarcode, formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  if (isLoading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading telemetry...</div>;
  if (!stats) return <div className="p-8 text-center text-destructive">Failed to load stats.</div>;

  const chartData = [
    { name: "Active", value: stats.activeSamples, color: "hsl(189 94% 43%)" },
    { name: "Pending", value: stats.pendingTests, color: "hsl(35 92% 65%)" },
    { name: "Completed", value: stats.completedTests, color: "hsl(150 84% 40%)" },
    { name: "Workflows", value: stats.activeWorkflows, color: "hsl(250 100% 75%)" },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-primary hover:bg-white/[0.02] transition-colors">
          <div className="p-3 rounded-xl bg-primary/10 text-primary"><FlaskConical className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Samples</p>
            <h3 className="text-2xl font-display font-bold text-white">{stats.totalSamples}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-amber-500 hover:bg-white/[0.02] transition-colors">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500"><Activity className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pending Tests</p>
            <h3 className="text-2xl font-display font-bold text-white">{stats.pendingTests}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-emerald-500 hover:bg-white/[0.02] transition-colors">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Completed</p>
            <h3 className="text-2xl font-display font-bold text-white">{stats.completedTests}</h3>
          </div>
        </Card>
        <Card className="p-6 flex items-center gap-4 border-l-4 border-l-destructive hover:bg-white/[0.02] transition-colors">
          <div className="p-3 rounded-xl bg-destructive/10 text-destructive"><AlertTriangle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Low Stock Alerts</p>
            <h3 className="text-2xl font-display font-bold text-white">{stats.lowStockItems}</h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-2 p-6 flex flex-col">
          <h3 className="text-lg font-display font-medium text-white mb-6">Activity Overview</h3>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0D131F', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 flex flex-col">
          <h3 className="text-lg font-display font-medium text-white mb-4">Recent Audit Activity</h3>
          <div className="space-y-4 flex-1 overflow-auto pr-2">
            {stats.recentAuditLogs.slice(0, 6).map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-primary flex-shrink-0 border glow-primary" />
                <div>
                  <p className="text-white">
                    <span className="font-mono text-xs text-primary mr-2">[{log.action}]</span>
                    {log.entityType} #{log.entityId}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{formatDate(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-display font-medium text-white mb-4">Latest Samples Logged</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.recentSamples.slice(0, 4).map(sample => (
            <div key={sample.id} className="p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-primary text-xs">{sample.barcode}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <p className="font-medium text-white">{sample.type}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatDate(sample.createdAt)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
