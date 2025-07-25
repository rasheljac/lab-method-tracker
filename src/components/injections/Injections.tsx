
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
      // First, get the injection to find its batch_id
      const { data: injection, error: fetchError } = await supabase
        .from('injections')
        .select('batch_id')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Delete the injection
      const { error: deleteError } = await supabase
        .from('injections')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // Update batch_size for remaining injections in the same batch
      if (injection.batch_id) {
        const { data: remainingInjections, error: countError } = await supabase
          .from('injections')
          .select('id')
          .eq('batch_id', injection.batch_id);
        
        if (countError) throw countError;
        
        const newBatchSize = remainingInjections.length;
        
        // Update batch_size for all remaining injections in the batch
        if (newBatchSize > 0) {
          const { error: updateError } = await supabase
            .from('injections')
            .update({ batch_size: newBatchSize })
            .eq('batch_id', injection.batch_id);
          
          if (updateError) throw updateError;
        }
      }
      
      await queryClient.invalidateQueries({ queryKey: ['injections'] });
      toast({
        title: 'Success',
        description: 'Injection deleted successfully!',
      });
    } catch (error: any) {
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
