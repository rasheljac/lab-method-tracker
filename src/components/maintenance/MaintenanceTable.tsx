
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Wrench } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface MaintenanceTableProps {
  onEdit: (maintenance: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const MaintenanceTable = ({ onEdit, onDelete, onAdd }: MaintenanceTableProps) => {
  const { data: maintenanceLogs, isLoading, error } = useQuery({
    queryKey: ['maintenance-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select('*')
        .order('maintenance_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const getMaintenanceTypeBadge = (type: string) => {
    const variants = {
      routine: 'bg-green-100 text-green-800',
      repair: 'bg-red-100 text-red-800',
      calibration: 'bg-blue-100 text-blue-800',
      cleaning: 'bg-yellow-100 text-yellow-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return variants[type as keyof typeof variants] || variants.other;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading maintenance logs: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Wrench className="h-5 w-5 text-gray-600" />
          <span className="text-sm text-gray-600">
            {maintenanceLogs?.length || 0} maintenance logs
          </span>
        </div>
        <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Maintenance Log
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Performed By</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Next Maintenance</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenanceLogs?.map((maintenance) => (
              <TableRow key={maintenance.id}>
                <TableCell className="font-medium">
                  {maintenance.title}
                  {maintenance.description && (
                    <div className="text-sm text-gray-500 mt-1">
                      {maintenance.description.substring(0, 100)}
                      {maintenance.description.length > 100 && '...'}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={getMaintenanceTypeBadge(maintenance.maintenance_type)}>
                    {maintenance.maintenance_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(maintenance.maintenance_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>{maintenance.performed_by || 'N/A'}</TableCell>
                <TableCell>
                  {maintenance.cost ? `$${maintenance.cost}` : 'N/A'}
                </TableCell>
                <TableCell>
                  {maintenance.next_maintenance_date 
                    ? format(new Date(maintenance.next_maintenance_date), 'MMM d, yyyy')
                    : 'N/A'
                  }
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(maintenance)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(maintenance.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
