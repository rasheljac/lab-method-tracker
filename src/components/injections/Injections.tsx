
import { useState } from 'react';
import { InjectionsTable } from './InjectionsTable';
import { InjectionForm } from './InjectionForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const Injections = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingInjection, setEditingInjection] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingInjection(null);
    setShowForm(true);
  };

  const handleEdit = (injection: any) => {
    setEditingInjection(injection);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting injection with ID:', id);
      
      // First, get the injection to find its batch_id and column_id
      const { data: injection, error: fetchError } = await supabase
        .from('injections')
        .select('batch_id, column_id')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      console.log('Injection to delete:', injection);
      
      // Delete the injection
      const { error: deleteError } = await supabase
        .from('injections')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      console.log('Injection deleted successfully');
      
      // Update column injection count by decrementing it
      if (injection.column_id) {
        console.log('Updating column injection count for column:', injection.column_id);
        
        // Get current column data
        const { data: columnData, error: columnFetchError } = await supabase
          .from('columns')
          .select('total_injections, name')
          .eq('id', injection.column_id)
          .single();
        
        if (columnFetchError) {
          console.error('Error fetching column data:', columnFetchError);
        } else if (columnData) {
          const newCount = Math.max(0, columnData.total_injections - 1);
          console.log(`Updating column ${columnData.name} from ${columnData.total_injections} to ${newCount} injections`);
          
          const { error: columnUpdateError } = await supabase
            .from('columns')
            .update({ 
              total_injections: newCount,
              updated_at: new Date().toISOString()
            })
            .eq('id', injection.column_id);
          
          if (columnUpdateError) {
            console.error('Error updating column injection count:', columnUpdateError);
          } else {
            console.log(`Successfully updated column ${columnData.name} injection count to ${newCount}`);
          }
        }
      }
      
      // Update batch_size for remaining injections in the same batch
      if (injection.batch_id) {
        console.log('Updating batch size for batch:', injection.batch_id);
        
        const { data: remainingInjections, error: countError } = await supabase
          .from('injections')
          .select('id')
          .eq('batch_id', injection.batch_id);
        
        if (countError) throw countError;
        
        const newBatchSize = remainingInjections.length;
        console.log(`Updating batch size to ${newBatchSize} for batch ${injection.batch_id}`);
        
        // Update batch_size for all remaining injections in the batch
        if (newBatchSize > 0) {
          const { error: updateError } = await supabase
            .from('injections')
            .update({ batch_size: newBatchSize })
            .eq('batch_id', injection.batch_id);
          
          if (updateError) throw updateError;
        }
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
        description: 'Injection deleted successfully!',
      });
    } catch (error: any) {
      console.error('Error deleting injection:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingInjection(null);
  };

  if (showForm) {
    return <InjectionForm injection={editingInjection} onClose={handleClose} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Injection Batches</h2>
        <p className="text-gray-600 mt-2">Track and manage your LCMS injection batches</p>
      </div>
      
      <InjectionsTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
};
