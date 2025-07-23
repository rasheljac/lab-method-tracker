
import { useState } from 'react';
import { MethodsTable } from './MethodsTable';
import { MethodForm } from './MethodForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const Methods = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingMethod(null);
    setShowForm(true);
  };

  const handleEdit = (method: any) => {
    setEditingMethod(method);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this method?')) return;

    try {
      const { error } = await supabase
        .from('methods')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['methods'] });
      toast({
        title: 'Success',
        description: 'Method deleted successfully!',
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
    setEditingMethod(null);
  };

  if (showForm) {
    return <MethodForm method={editingMethod} onClose={handleClose} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Methods</h2>
        <p className="text-gray-600 mt-2">Manage your LCMS methods and specifications</p>
      </div>
      
      <MethodsTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
};
