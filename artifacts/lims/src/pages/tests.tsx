import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListTests, useCreateTest, useUpdateTest, getListTestsQueryKey, useListSamples, TestStatus, type Test } from "@workspace/api-client-react";
import { Card, Button, Input, Select, Badge, Dialog, Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui";
import { Plus, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

const createSchema = z.object({
  sampleId: z.coerce.number().min(1, "Sample is required"),
  testName: z.string().min(1, "Test name is required"),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  status: z.nativeEnum(TestStatus),
  result: z.string().optional(),
  notes: z.string().optional(),
});

type CreateData = z.infer<typeof createSchema>;
type UpdateData = z.infer<typeof updateSchema>;

export default function Tests() {
  const queryClient = useQueryClient();
  const { data: tests, isLoading: loadingTests } = useListTests();
  const { data: samples, isLoading: loadingSamples } = useListSamples();
  const { mutateAsync: createTest } = useCreateTest();
  const { mutateAsync: updateTest } = useUpdateTest();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  const { register: regCreate, handleSubmit: handleCreate, reset: resetCreate, formState: { isSubmitting: isSubmittingCreate } } = useForm<CreateData>({
    resolver: zodResolver(createSchema)
  });

  const { register: regUpdate, handleSubmit: handleUpdate, reset: resetUpdate, formState: { isSubmitting: isSubmittingUpdate } } = useForm<UpdateData>({
    resolver: zodResolver(updateSchema)
  });

  const openCreateModal = () => {
    resetCreate({ sampleId: samples?.[0]?.id || 0, testName: "", notes: "" });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (test: Test) => {
    setEditingTest(test);
    resetUpdate({ status: test.status, result: test.result || "", notes: test.notes || "" });
  };

  const onSubmitCreate = async (data: CreateData) => {
    try {
      await createTest({ data });
      toast.success("Test scheduled successfully");
      queryClient.invalidateQueries({ queryKey: getListTestsQueryKey() });
      setIsCreateModalOpen(false);
    } catch (e) {
      toast.error("Failed to schedule test");
    }
  };

  const onSubmitUpdate = async (data: UpdateData) => {
    if (!editingTest) return;
    try {
      await updateTest({ id: editingTest.id, data });
      toast.success("Test updated successfully");
      queryClient.invalidateQueries({ queryKey: getListTestsQueryKey() });
      setEditingTest(null);
    } catch (e) {
      toast.error("Failed to update test");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in_progress': return 'warning';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      default: return 'default';
    }
  };

  const getSampleBarcode = (id: number) => samples?.find(s => s.id === id)?.barcode || `ID: ${id}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold text-white">Laboratory Tests</h1>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" /> Schedule Test
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loadingTests || loadingSamples ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading tests...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Sample</Th>
                <Th>Test Name</Th>
                <Th>Status</Th>
                <Th>Result</Th>
                <Th>Last Updated</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {tests?.map(test => (
                <Tr key={test.id}>
                  <Td className="text-muted-foreground font-mono">#{test.id}</Td>
                  <Td className="font-mono text-primary">{getSampleBarcode(test.sampleId)}</Td>
                  <Td className="font-medium">{test.testName}</Td>
                  <Td><Badge variant={getStatusColor(test.status)} className="capitalize">{test.status.replace('_', ' ')}</Badge></Td>
                  <Td>
                    {test.result ? (
                      <span className="text-white truncate max-w-[150px] inline-block">{test.result}</span>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Awaiting</span>
                    )}
                  </Td>
                  <Td className="text-muted-foreground">{formatDate(test.updatedAt)}</Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(test)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Td>
                </Tr>
              ))}
              {tests?.length === 0 && (
                <Tr><Td colSpan={7} className="text-center py-8 text-muted-foreground">No tests scheduled.</Td></Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Card>

      {/* Create Modal */}
      <Dialog isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Schedule Test">
        <form onSubmit={handleCreate(onSubmitCreate)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Target Sample</label>
            <Select {...regCreate("sampleId")}>
              {samples?.map(s => (
                <option key={s.id} value={s.id} className="bg-card">{s.barcode} - {s.type}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Test Name/Protocol</label>
            <Input {...regCreate("testName")} placeholder="e.g. PCR, Chromatography..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Notes</label>
            <textarea 
              {...regCreate("notes")} 
              className="flex min-h-[80px] w-full rounded-lg glass-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              placeholder="Instructions..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmittingCreate}>Schedule</Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog isOpen={!!editingTest} onClose={() => setEditingTest(null)} title="Update Test Results">
        <form onSubmit={handleUpdate(onSubmitUpdate)} className="space-y-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 mb-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Test Details</p>
            <p className="font-medium text-white">{editingTest?.testName}</p>
            <p className="font-mono text-primary text-sm mt-1">{editingTest && getSampleBarcode(editingTest.sampleId)}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Status</label>
            <Select {...regUpdate("status")}>
              {Object.values(TestStatus).map(s => (
                <option key={s} value={s} className="bg-card capitalize">{s.replace('_', ' ')}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Result / Measurements</label>
            <textarea 
              {...regUpdate("result")} 
              className="flex min-h-[100px] w-full rounded-lg glass-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              placeholder="Enter final results, values, or findings..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setEditingTest(null)}>Cancel</Button>
            <Button type="submit" disabled={isSubmittingUpdate}>Save Results</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
