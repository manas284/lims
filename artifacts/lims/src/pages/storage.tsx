import { useListStorage } from "@workspace/api-client-react";
import { Card, Badge, Button } from "@/components/ui";
import { Database, Plus, Box, ThermometerSnowflake, Layers } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Storage() {
  const { data: storage, isLoading } = useListStorage();

  const getIcon = (type: string) => {
    switch(type) {
      case 'freezer': return <ThermometerSnowflake className="w-5 h-5 text-cyan-400" />;
      case 'rack': return <Layers className="w-5 h-5 text-indigo-400" />;
      case 'box': return <Box className="w-5 h-5 text-amber-400" />;
      default: return <Database className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold text-white">Storage Locations</h1>
        <Button><Plus className="w-4 h-4 mr-2" /> Add Location</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full p-8 text-center text-muted-foreground animate-pulse">Loading locations...</div>
        ) : storage?.map(loc => (
          <Card key={loc.id} className="p-5 hover:border-white/20 transition-all cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  {getIcon(loc.type)}
                </div>
                <div>
                  <h3 className="font-medium text-white text-lg">{loc.name}</h3>
                  <Badge variant="default" className="mt-1 capitalize text-[10px] px-1.5 py-0">Type: {loc.type}</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              {loc.temperature !== null && loc.temperature !== undefined && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Temperature</span>
                  <span className="font-mono text-white">{loc.temperature}°C</span>
                </div>
              )}
              {loc.capacity !== null && loc.capacity !== undefined && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Capacity</span>
                  <span className="font-mono text-white">{loc.capacity} slots</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Created</span>
                <span>{formatDate(loc.createdAt).split(',')[0]}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
