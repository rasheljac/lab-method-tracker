
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
      const { error } = await supabase
        .from('injections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
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
