import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, RotateCcw, Shield } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ColumnDetailsDialog } from './ColumnDetailsDialog';
import { GuardColumnTracker } from './GuardColumnTracker';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ColumnsTableProps {
  onEdit: (column: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const ColumnsTable = ({ onEdit, onDelete, onAdd }: ColumnsTableProps) => {
  const [selectedColumn, setSelectedColumn] = useState<any>(null);
  const [showColumnDetails, setShowColumnDetails] = useState(false);
  const [showGuardColumnTracker, setShowGuardColumnTracker] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: columns, isLoading, error } = useQuery({
    queryKey: ['columns'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('columns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleColumnClick = (column: any) => {
    setSelectedColumn(column);
    setShowColumnDetails(true);
  };

  const handleGuardColumnClick = (column: any) => {
    setShowGuardColumnTracker(column);
  };

  const handleResetInjectionCount = async (column: any) => {
    if (!confirm(`Are you sure you want to reset the injection count for "${column.name}"? This will set the count back to 0.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('columns')
        .update({ 
          total_injections: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', column.id);

      if (error) throw error;

      // Invalidate queries to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ['columns'] });
      await queryClient.invalidateQueries({ queryKey: ['column-lifetime'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });

      toast({
        title: 'Success',
        description: `Injection count reset for "${column.name}"`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (showGuardColumnTracker) {
    return (
      <GuardColumnTracker
        columnId={showGuardColumnTracker.id}
        columnName={showGuardColumnTracker.name}
        totalInjections={showGuardColumnTracker.total_injections}
      />
    );
  }

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
                <TableHead>Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
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
        <p>Error loading columns: {error.message}</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Column Inventory</h3>
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No columns found. Add your first column to get started.
                  </TableCell>
                </TableRow>
              ) : (
                columns?.map((column) => {
                  const usagePercent = (column.total_injections / column.estimated_lifetime_injections) * 100;
                  return (
                    <TableRow key={column.id}>
                      <TableCell className="font-medium">
                        <button
                          onClick={() => handleColumnClick(column)}
                          className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                        >
                          {column.name}
                        </button>
                      </TableCell>
                      <TableCell>{column.manufacturer}</TableCell>
                      <TableCell>{column.dimensions}</TableCell>
                      <TableCell>
                        <Badge variant={column.status === 'active' ? 'default' : 'secondary'}>
                          {column.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{column.total_injections} / {column.estimated_lifetime_injections}</div>
                          <div className="text-gray-500">({usagePercent.toFixed(1)}%)</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleGuardColumnClick(column)}
                            title="Guard column tracking"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetInjectionCount(column)}
                            title="Reset injection count"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(column)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(column.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ColumnDetailsDialog
        column={selectedColumn}
        open={showColumnDetails}
        onOpenChange={setShowColumnDetails}
      />
    </>
  );
};
