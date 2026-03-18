import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListUsers, useCreateUser, getListUsersQueryKey, UserRole } from "@workspace/api-client-react";
import { Card, Table, Thead, Tbody, Tr, Th, Td, Badge, Button, Dialog, Input, Select } from "@/components/ui";
import { Users as UsersIcon, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(1, "Name required"),
  email: z.string().email("Invalid email"),
  role: z.nativeEnum(UserRole)
});

export default function Users() {
  const queryClient = useQueryClient();
  const { data: users, isLoading } = useListUsers();
  const { mutateAsync: createUser } = useCreateUser();
  const [isOpen, setIsOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'technician' }
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await createUser({ data });
      toast.success("User provisioned");
      queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      setIsOpen(false);
      reset();
    } catch {
      toast.error("Failed to provision user");
    }
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return 'danger';
      case 'reviewer': return 'warning';
      case 'technician': return 'info';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary">
            <UsersIcon className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-white">Personnel Directory</h1>
        </div>
        <Button onClick={() => setIsOpen(true)}><Plus className="w-4 h-4 mr-2" /> Provision Access</Button>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Loading directory...</div>
        ) : (
          <Table>
            <Thead>
              <Tr>
                <Th>Personnel</Th>
                <Th>Access Role</Th>
                <Th>System ID</Th>
                <Th>Provisioned</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users?.map(user => (
                <Tr key={user.id}>
                  <Td>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </Td>
                  <Td><Badge variant={getRoleBadge(user.role)} className="uppercase tracking-wider">{user.role}</Badge></Td>
                  <Td className="font-mono text-primary text-xs">USR-{user.id.toString().padStart(4, '0')}</Td>
                  <Td className="text-muted-foreground">{formatDate(user.createdAt)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Card>

      <Dialog isOpen={isOpen} onClose={() => setIsOpen(false)} title="Provision New Personnel">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Full Name</label>
            <Input {...register("name")} placeholder="Dr. Jane Doe" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Contact Email</label>
            <Input type="email" {...register("email")} placeholder="jane.doe@lab.local" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">Access Role</label>
            <Select {...register("role")}>
              {Object.values(UserRole).map(r => (
                <option key={r} value={r} className="bg-card capitalize">{r}</option>
              ))}
            </Select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Provision</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
