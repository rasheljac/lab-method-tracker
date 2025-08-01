
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { InjectionBatchDetailsDialog } from './InjectionBatchDetailsDialog';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface InjectionsTableProps {
  onEdit: (injection: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const InjectionsTable = ({ onEdit, onDelete, onAdd }: InjectionsTableProps) => {
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: injectionBatches, isLoading, error } = useQuery({
    queryKey: ['injections'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      // Get grouped injections by batch_id
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
      
      // Group injections by batch_id
      const batches = data.reduce((acc: any[], injection: any) => {
        const existingBatch = acc.find(batch => batch.batch_id === injection.batch_id);
        
        if (existingBatch) {
          existingBatch.injections.push(injection);
          // Update batch info if needed (use the first injection's data as representative)
          if (injection.injection_number < existingBatch.min_injection_number) {
            existingBatch.min_injection_number = injection.injection_number;
          }
          if (injection.injection_number > existingBatch.max_injection_number) {
            existingBatch.max_injection_number = injection.injection_number;
          }
        } else {
          acc.push({
            batch_id: injection.batch_id,
            sample_id: injection.sample_id,
            injection_date: injection.injection_date,
            method_name: injection.methods?.name || 'Unknown',
            column_name: injection.columns?.name || 'Unknown',
            column_id: injection.column_id,
            actual_batch_size: 1, // Count actual injections
            min_injection_number: injection.injection_number,
            max_injection_number: injection.injection_number,
            run_successful: injection.run_successful,
            injections: [injection]
          });
        }
        
        return acc;
      }, []);
      
      // Update actual batch sizes
      batches.forEach(batch => {
        batch.actual_batch_size = batch.injections.length;
      });
      
      // Sort batches by date
      return batches.sort((a, b) => new Date(b.injection_date).getTime() - new Date(a.injection_date).getTime());
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
                <TableHead>Injection Range</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Column</TableHead>
                <TableHead>Sample ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Batch Size</TableHead>
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
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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

  const handleDeleteBatch = async (batch: any) => {
    if (!confirm(`Are you sure you want to delete this batch of ${batch.actual_batch_size} injections?`)) return;
    
    try {
      console.log('Deleting batch:', batch.batch_id, 'with', batch.actual_batch_size, 'injections');
      
      // Get the column info before deleting
      const { data: columnData, error: columnFetchError } = await supabase
        .from('columns')
        .select('total_injections, name')
        .eq('id', batch.column_id)
        .single();
      
      if (columnFetchError) throw columnFetchError;
      
      // Delete all injections in the batch
      const { error: deleteError } = await supabase
        .from('injections')
        .delete()
        .eq('batch_id', batch.batch_id);
      
      if (deleteError) throw deleteError;
      
      console.log(`Deleted batch ${batch.batch_id} with ${batch.actual_batch_size} injections`);
      
      // Update column injection count by decrementing the batch size
      if (columnData) {
        const newCount = Math.max(0, columnData.total_injections - batch.actual_batch_size);
        console.log(`Updating column ${columnData.name} from ${columnData.total_injections} to ${newCount} injections`);
        
        const { error: columnUpdateError } = await supabase
          .from('columns')
          .update({ 
            total_injections: newCount,
            updated_at: new Date().toISOString()
          })
          .eq('id', batch.column_id);
        
        if (columnUpdateError) throw columnUpdateError;
        
        console.log(`Successfully updated column ${columnData.name} injection count to ${newCount}`);
      }
      
      // Invalidate all relevant queries to refresh the UI
      console.log('Invalidating queries to refresh UI');
      await queryClient.invalidateQueries({ queryKey: ['injections'] });
      await queryClient.invalidateQueries({ queryKey: ['column-lifetime'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      
      // Force refetch to ensure fresh data
      await queryClient.refetchQueries({ queryKey: ['column-lifetime'] });
      await queryClient.refetchQueries({ queryKey: ['dashboard-stats'] });
      
      toast({
        title: 'Success',
        description: `Injection batch with ${batch.actual_batch_size} injections deleted successfully!`,
      });
    } catch (error: any) {
      console.error('Error deleting injection batch:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditBatch = (batch: any) => {
    // Edit the first injection in the batch as representative
    onEdit(batch.injections[0]);
  };

  const handleViewDetails = (batch: any) => {
    setSelectedBatch(batch);
    setDetailsDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Injection Batches</h3>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Injection Batch
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Injection Range</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Column</TableHead>
                <TableHead>Sample ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Batch Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {injectionBatches?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No injection batches found. Add your first injection batch to get started.
                  </TableCell>
                </TableRow>
              ) : (
                injectionBatches?.map((batch) => (
                  <TableRow key={batch.batch_id}>
                    <TableCell className="font-medium">
                      {batch.min_injection_number === batch.max_injection_number 
                        ? `#${batch.min_injection_number}`
                        : `#${batch.min_injection_number}-${batch.max_injection_number}`
                      }
                    </TableCell>
                    <TableCell>{batch.method_name}</TableCell>
                    <TableCell>{batch.column_name}</TableCell>
                    <TableCell>{batch.sample_id}</TableCell>
                    <TableCell>
                      {new Date(batch.injection_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{batch.actual_batch_size} injections</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={batch.run_successful ? 'default' : 'destructive'}>
                        {batch.run_successful ? 'Success' : 'Failed'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(batch)}
                          title="View details and solvent usage"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditBatch(batch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteBatch(batch)}
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

      <InjectionBatchDetailsDialog
        batch={selectedBatch}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </>
  );
};
