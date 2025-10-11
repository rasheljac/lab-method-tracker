import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

interface ColumnHistoryDialogProps {
  column: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ColumnHistoryDialog = ({ column, open, onOpenChange }: ColumnHistoryDialogProps) => {
  const { data: history, isLoading } = useQuery({
    queryKey: ['column-history', column?.id],
    queryFn: async () => {
      if (!column?.id) return [];
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('column_history')
        .select('*')
        .eq('column_id', column.id)
        .eq('user_id', user.id)
        .order('replacement_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!column?.id && open,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Column Replacement History: {column?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Status</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Current Injections: <span className="font-medium">{column?.total_injections}</span></div>
              <div>Status: <Badge variant={column?.status === 'active' ? 'default' : 'secondary'}>{column?.status}</Badge></div>
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Replacement Date</TableHead>
                    <TableHead>Injections</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Part Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {format(new Date(record.replacement_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {record.total_injections_at_replacement} injections
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {record.replacement_reason || '-'}
                      </TableCell>
                      <TableCell>{record.part_number || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No replacement history found. This column has not been replaced yet.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};