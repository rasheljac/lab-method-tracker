
import { useState } from 'react';
import { ColumnsTable } from './ColumnsTable';
import { ColumnForm } from './ColumnForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const Columns = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingColumn, setEditingColumn] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingColumn(null);
    setShowForm(true);
  };

  const handleEdit = (column: any) => {
    setEditingColumn(column);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this column?')) return;

    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      toast({
        title: 'Success',
        description: 'Column deleted successfully!',
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
    setEditingColumn(null);
  };

  if (showForm) {
    return <ColumnForm column={editingColumn} onClose={handleClose} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Columns</h2>
        <p className="text-gray-600 mt-2">Manage your LCMS columns and track their usage</p>
      </div>
      
      <ColumnsTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
};
