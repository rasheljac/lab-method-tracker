
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Trash2, Plus, FlaskConical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { MethodDetailsDialog } from './MethodDetailsDialog';

interface MethodsTableProps {
  onEdit: (method: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onManageMetabolites: (method: any) => void;
}

export const MethodsTable = ({ onEdit, onDelete, onAdd, onManageMetabolites }: MethodsTableProps) => {
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [showMethodDetails, setShowMethodDetails] = useState(false);

  const { data: methods, isLoading } = useQuery({
    queryKey: ['methods'],
    queryFn: async () => {
      // Get all methods with column_id
      const { data: methodsData, error: methodsError } = await supabase
        .from('methods')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (methodsError) throw methodsError;
      
      // Get all columns
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('id, name, dimensions, manufacturer');
      
      if (columnsError) throw columnsError;
      
      // Join the data manually
      const methodsWithColumns = methodsData?.map(method => ({
        ...method,
        column: method.column_id ? columnsData?.find(col => col.id === method.column_id) : null
      }));
      
      return methodsWithColumns;
    },
  });

  const handleMethodClick = (method: any) => {
    setSelectedMethod(method);
    setShowMethodDetails(true);
  };

  const getIonizationBadge = (mode: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-800',
      negative: 'bg-red-100 text-red-800',
      both: 'bg-blue-100 text-blue-800',
    };
    return colors[mode as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Methods</CardTitle>
          <Button onClick={onAdd} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Method</span>
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Column</TableHead>
                <TableHead>Ionization Mode</TableHead>
                <TableHead>Sample Type</TableHead>
                <TableHead>Flow Rate</TableHead>
                <TableHead>Run Time</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {methods?.map((method) => (
                <TableRow key={method.id}>
                  <TableCell className="font-medium">
                    <button
                      onClick={() => handleMethodClick(method)}
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {method.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    {method.column ? (
                      <div className="text-sm">
                        <div className="font-medium">{method.column.name}</div>
                        <div className="text-gray-500">{method.column.dimensions}</div>
                      </div>
                    ) : (
                      <Badge variant="outline">No Column</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getIonizationBadge(method.ionization_mode)}>
                      {method.ionization_mode}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{method.sample_type || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{method.flow_rate ? `${method.flow_rate} mL/min` : 'N/A'}</TableCell>
                  <TableCell>{method.run_time ? `${method.run_time} min` : 'N/A'}</TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(method.created_at), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onManageMetabolites(method)}
                        title="Manage Metabolites"
                      >
                        <FlaskConical className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(method)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(method.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <MethodDetailsDialog
        method={selectedMethod}
        open={showMethodDetails}
        onOpenChange={setShowMethodDetails}
      />
    </>
  );
};
