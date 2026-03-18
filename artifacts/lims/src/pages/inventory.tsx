import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListInventory, useCreateInventoryItem, useUpdateInventoryItem, getListInventoryQueryKey, type InventoryItem } from "@workspace/api-client-react";
import { Card, Button, Input, Dialog, Table, Thead, Tbody, Tr, Th, Td, Badge } from "@/components/ui";
import { Plus, Edit2, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  category: z.string().min(1, "Category required"),
  quantity: z.coerce.number().min(0),
  unit: z.string().min(1),
  threshold: z.coerce.number().min(0),
  location: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function Inventory() {
  const queryClient = useQueryClient();
  const { data: inventory, isLoading } = useListInventory();
  const { mutateAsync: createItem } = useCreateInventoryItem();
  const { mutateAsync: updateItem } = useUpdateInventoryItem();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const openModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      reset({ name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, threshold: item.threshold, location: item.location || "" });
    } else {
      setEditingItem(null);
      reset({ name: "", category: "Reagent", quantity: 0, unit: "ml", threshold: 10, location: "" });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    try {
      if (editingItem) {
        await updateItem({ id: editingItem.id, data });
        toast.success("Inventory updated");
      } else {
        await createItem({ data });
        toast.success("Item added to inventory");
      }
      queryClient.invalidateQueries({ queryKey: getListInventoryQueryKey() });
      setIsModalOpen(false);
    } catch (e) {
      toast.error("Operation failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-display font-semibold text-white">Inventory Management</h1>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading inventory...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Item Name</Th>
                <Th>Category</Th>
                <Th>Location</Th>
                <Th className="text-right">Stock</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {inventory?.map(item => {
                const isLow = item.quantity <= item.threshold;
                return (
                  <Tr key={item.id} className={isLow ? "bg-destructive/5" : ""}>
                    <Td className="font-medium text-white">{item.name}</Td>
                    <Td>{item.category}</Td>
                    <Td className="text-muted-foreground">{item.location || '-'}</Td>
                    <Td className="text-right font-mono text-white">
                      {item.quantity} {item.unit}
                    </Td>
                    <Td>
                      {isLow ? (
                        <Badge variant="danger" className="flex w-fit items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="success">Optimal</Badge>
                      )}
                    </Td>
                    <Td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openModal(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Td>
                  </Tr>
                );
              })}
              {inventory?.length === 0 && (
                <Tr><Td colSpan={6} className="text-center py-8 text-muted-foreground">Inventory is empty.</Td></Tr>
              )}
            </Tbody>
          </Table>
        )}
      </Card>

      <Dialog isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Item" : "Add Inventory Item"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-1">Item Name</label>
              <Input {...register("name")} placeholder="Item name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Category</label>
              <Input {...register("category")} placeholder="e.g. Reagent, Tool" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Location</label>
              <Input {...register("location")} placeholder="e.g. Room A, Cabinet 2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Quantity</label>
              <Input type="number" step="0.01" {...register("quantity")} />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">Unit</label>
              <Input {...register("unit")} placeholder="e.g. ml, mg, pcs" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-white/80 mb-1">Low Stock Threshold</label>
              <Input type="number" step="0.01" {...register("threshold")} placeholder="Alert me when below..." />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
