
import { useState } from 'react';
import { MethodsTable } from './MethodsTable';
import { MethodForm } from './MethodForm';
import { MethodMetaboliteManager } from './MethodMetaboliteManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FlaskConical } from 'lucide-react';

export const Methods = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<any>(null);
  const [managingMetabolites, setManagingMetabolites] = useState<any>(null);
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

  const handleManageMetabolites = (method: any) => {
    setManagingMetabolites(method);
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

  const handleCloseMetabolites = () => {
    setManagingMetabolites(null);
  };

  if (showForm) {
    return <MethodForm method={editingMethod} onClose={handleClose} />;
  }

  if (managingMetabolites) {
    return (
      <MethodMetaboliteManager
        methodId={managingMetabolites.id}
        methodName={managingMetabolites.name}
        onClose={handleCloseMetabolites}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Methods</h2>
          <p className="text-gray-600 mt-2">Manage your LCMS methods and specifications</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center space-x-2">
          <FlaskConical className="h-4 w-4" />
          <span>Add Method</span>
        </Button>
      </div>
      
      <MethodsTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onManageMetabolites={handleManageMetabolites}
      />
    </div>
  );
};
