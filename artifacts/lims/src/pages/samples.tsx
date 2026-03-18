import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListSamples, useCreateSample, useUpdateSample, getListSamplesQueryKey, SampleStatus, SamplePriority, type Sample } from "@workspace/api-client-react";
import { Card, Button, Input, Select, Badge, Dialog, Table, Thead, Tbody, Tr, Th, Td } from "@/components/ui";
import { Plus, Search, Edit2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";

const createSchema = z.object({
  type: z.string().min(1, "Type is required"),
  status: z.nativeEnum(SampleStatus),
  priority: z.nativeEnum(SamplePriority),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof createSchema>;

export default function Samples() {
  const queryClient = useQueryClient();
  const { data: samples, isLoading } = useListSamples();
  const { mutateAsync: createSample } = useCreateSample();
  const { mutateAsync: updateSample } = useUpdateSample();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(createSchema),
    defaultValues: { status: "received", priority: "normal" }
  });

  const filteredSamples = samples?.filter(s => 
    s.barcode.toLowerCase().includes(search.toLowerCase()) || 
    s.type.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (sample?: Sample) => {
    if (sample) {
      setEditingSample(sample);
      reset({ type: sample.type, status: sample.status, priority: sample.priority, notes: sample.notes || "" });
    } else {
      setEditingSample(null);
      reset({ type: "", status: "received", priority: "normal", notes: "" });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingSample) {
        await updateSample({ id: editingSample.id, data });
        toast.success("Sample updated successfully");
      } else {
        await createSample({ data });
        toast.success("Sample created successfully");
      }
      queryClient.invalidateQueries({ queryKey: getListSamplesQueryKey() });
      setIsModalOpen(false);
    } catch (e) {
      toast.error("An error occurred");
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'received': return 'info';
      case 'testing': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by barcode or type..." 
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Register Sample
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading samples...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Barcode</Th>
                <Th>Type</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Registered</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredSamples?.map(sample => (
                <Tr key={sample.id}>
                  <Td className="font-mono text-primary">{sample.barcode}</Td>
                  <Td className="font-medium">{sample.type}</Td>
                  <Td><Badge variant={getStatusColor(sample.status)} className="capitalize">{sample.status}</Badge></Td>
                  <Td>
                    <span className={cn(
                      "text-xs font-semibold uppercase tracking-wider",
                      sample.priority === 'urgent' ? "text-destructive" :
                      sample.priority === 'high' ? "text-amber-500" : "text-muted-foreground"
                    )}>
                      {sample.priority}
                    </span>
                  </Td>
                  <Td className="text-muted-foreground">{formatDate(sample.createdAt)}</Td>
                  <Td className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openModal(sample)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  </Td>
                </Tr>
              ))}
              {filteredSamples?.length === 0 && (
                <Tr><Td colSpan={6} className="text-center py-8 text-muted-foreground">No samples found.</Td></Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Card>

      <Dialog 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingSample ? "Edit Sample" : "Register Sample"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Sample Type</label>
            <Input {...register("type")} placeholder="e.g. Blood, Water, Soil..." />
            {errors.type && <span className="text-xs text-destructive mt-1">{errors.type.message}</span>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Status</label>
              <Select {...register("status")}>
                {Object.values(SampleStatus).map(s => (
                  <option key={s} value={s} className="bg-card capitalize">{s}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Priority</label>
              <Select {...register("priority")}>
                {Object.values(SamplePriority).map(p => (
                  <option key={p} value={p} className="bg-card capitalize">{p}</option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Notes</label>
            <textarea 
              {...register("notes")} 
              className="flex min-h-[80px] w-full rounded-lg glass-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              placeholder="Optional notes..."
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Sample"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
