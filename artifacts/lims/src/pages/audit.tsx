import { useListAuditLogs } from "@workspace/api-client-react";
import { Card, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@/components/ui";
import { History } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AuditLogs() {
  const { data: logs, isLoading } = useListAuditLogs();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
          <History className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-white">Audit Trail</h1>
          <p className="text-muted-foreground text-sm">System-wide immutable log of all actions.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading audit logs...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Timestamp</Th>
                <Th>Action</Th>
                <Th>Entity</Th>
                <Th>Changes</Th>
                <Th>User ID</Th>
              </Tr>
            </Thead>
            <Tbody>
              {logs?.map(log => (
                <Tr key={log.id}>
                  <Td className="text-muted-foreground whitespace-nowrap text-xs">{formatDate(log.timestamp)}</Td>
                  <Td><Badge variant="default" className="font-mono text-[10px] uppercase tracking-wider">{log.action}</Badge></Td>
                  <Td className="text-white text-sm">
                    {log.entityType} <span className="text-muted-foreground ml-1">#{log.entityId}</span>
                  </Td>
                  <Td className="text-sm">
                    {log.oldValue && log.newValue ? (
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="text-destructive max-w-[100px] truncate">{log.oldValue}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="text-emerald-400 max-w-[100px] truncate">{log.newValue}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Creation / Deletion event</span>
                    )}
                  </Td>
                  <Td className="font-mono text-primary text-xs">{log.userId ? `USR-${log.userId}` : 'SYSTEM'}</Td>
                </Tr>
              ))}
              {logs?.length === 0 && (
                <Tr><Td colSpan={5} className="text-center py-8 text-muted-foreground">No audit logs found.</Td></Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
