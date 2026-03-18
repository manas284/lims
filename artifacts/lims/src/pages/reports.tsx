import { useListReports } from "@workspace/api-client-react";
import { Card, Table, Thead, Tbody, Tr, Th, Td, Badge, Button } from "@/components/ui";
import { FileText, Download, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function Reports() {
  const { data: reports, isLoading } = useListReports();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold text-white">Reports Library</h1>
        <Button><Plus className="w-4 h-4 mr-2" /> Generate Report</Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reports...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Title</Th>
                <Th>Type</Th>
                <Th>Reference</Th>
                <Th>Generated Date</Th>
                <Th className="text-right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {reports?.map(report => (
                <Tr key={report.id}>
                  <Td className="font-medium text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    {report.title}
                  </Td>
                  <Td><Badge variant="default" className="capitalize">{report.reportType.replace('_', ' ')}</Badge></Td>
                  <Td className="text-muted-foreground font-mono text-xs">
                    {report.sampleId ? `SMP-${report.sampleId}` : '-'}
                  </Td>
                  <Td className="text-muted-foreground">{formatDate(report.createdAt)}</Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                  </Td>
                </Tr>
              ))}
              {reports?.length === 0 && (
                <Tr><Td colSpan={5} className="text-center py-8 text-muted-foreground">No reports generated yet.</Td></Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Card>
    </div>
  );
}
