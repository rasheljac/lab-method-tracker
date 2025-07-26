
import { useState } from 'react';
import { MaintenanceTable } from './MaintenanceTable';
import { MaintenanceForm } from './MaintenanceForm';
import { CustomFieldsManager } from './CustomFieldsManager';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type ViewMode = 'table' | 'form' | 'custom-fields';

export const Maintenance = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [editingMaintenance, setEditingMaintenance] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingMaintenance(null);
    setViewMode('form');
  };

  const handleEdit = (maintenance: any) => {
    setEditingMaintenance(maintenance);
    setViewMode('form');
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
    setViewMode('table');
    setEditingMaintenance(null);
  };

  const handleManageCustomFields = () => {
    setViewMode('custom-fields');
  };

  if (viewMode === 'form') {
    return <MaintenanceForm maintenance={editingMaintenance} onClose={handleClose} />;
  }

  if (viewMode === 'custom-fields') {
    return <CustomFieldsManager onClose={handleClose} />;
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
        onManageCustomFields={handleManageCustomFields}
      />
    </div>
  );
};
