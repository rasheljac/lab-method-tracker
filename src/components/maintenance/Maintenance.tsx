
import { useState } from 'react';
import { MaintenanceTable } from './MaintenanceTable';
import { MaintenanceForm } from './MaintenanceForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

export const Maintenance = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingMaintenance(null);
    setShowForm(true);
  };

  const handleEdit = (maintenance: any) => {
    setEditingMaintenance(maintenance);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('maintenance_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['maintenance-logs'] });
      await queryClient.invalidateQueries({ queryKey: ['recent-activity'] });

      toast({
        title: 'Success',
        description: 'Maintenance log deleted successfully!',
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
    setEditingMaintenance(null);
  };

  if (showForm) {
    return <MaintenanceForm maintenance={editingMaintenance} onClose={handleClose} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Maintenance Logs</h2>
        <p className="text-gray-600 mt-2">Track maintenance activities for your mass spectrometer</p>
      </div>
      
      <MaintenanceTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />
    </div>
  );
};
