
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface InjectionsTableProps {
  onEdit: (injection: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const InjectionsTable = ({ onEdit, onDelete, onAdd }: InjectionsTableProps) => {
  const { data: injections, isLoading, error } = useQuery({
    queryKey: ['injections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('injections')
        .select(`
          *,
          methods:method_id (name),
          columns:column_id (name)
        `)
        .eq('user_id', user.id)
        .order('injection_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Injection #</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Column</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>Error loading injections: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Injection History</h3>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Injection
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Injection #</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Column</TableHead>
              <TableHead>Sample ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {injections?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No injections found. Add your first injection to get started.
                </TableCell>
              </TableRow>
            ) : (
              injections?.map((injection) => (
                <TableRow key={injection.id}>
                  <TableCell className="font-medium">{injection.injection_number}</TableCell>
                  <TableCell>{injection.methods?.name || 'Unknown'}</TableCell>
                  <TableCell>{injection.columns?.name || 'Unknown'}</TableCell>
                  <TableCell>{injection.sample_id}</TableCell>
                  <TableCell>
                    {new Date(injection.injection_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={injection.run_successful ? 'default' : 'destructive'}>
                      {injection.run_successful ? 'Success' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(injection)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(injection.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
