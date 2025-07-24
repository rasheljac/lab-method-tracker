
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MethodMetaboliteForm } from './MethodMetaboliteForm';

interface MethodMetaboliteManagerProps {
  methodId: string;
  methodName: string;
  onClose: () => void;
}

export const MethodMetaboliteManager = ({ methodId, methodName, onClose }: MethodMetaboliteManagerProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRelationship, setEditingRelationship] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: relationships, isLoading } = useQuery({
    queryKey: ['method-metabolites', methodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('method_metabolites')
        .select(`
          *,
          metabolites (
            name,
            formula,
            molecular_weight
          ),
          columns (
            name,
            dimensions
          )
        `)
        .eq('method_id', methodId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleAdd = () => {
    setEditingRelationship(null);
    setShowForm(true);
  };

  const handleEdit = (relationship: any) => {
    setEditingRelationship(relationship);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this metabolite from the method?')) return;

    try {
      const { error } = await supabase
        .from('method_metabolites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['method-metabolites', methodId] });
      toast({
        title: 'Success',
        description: 'Metabolite removed from method successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingRelationship(null);
  };

  if (showForm) {
    return (
      <MethodMetaboliteForm
        methodId={methodId}
        relationship={editingRelationship}
        onClose={handleCloseForm}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Method Metabolites</h3>
          <p className="text-sm text-gray-600">Managing metabolites for: {methodName}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onClose}>
            Back to Methods
          </Button>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Add Metabolite
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metabolite Detection Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Metabolite</TableHead>
                  <TableHead>Column</TableHead>
                  <TableHead>Retention Time</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Recovery</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relationships?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No metabolites added to this method yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  relationships?.map((rel) => (
                    <TableRow key={rel.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rel.metabolites.name}</div>
                          <div className="text-sm text-gray-500">{rel.metabolites.formula}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{rel.columns.name}</div>
                          <div className="text-gray-500">{rel.columns.dimensions}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {rel.retention_time ? `${rel.retention_time} min` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {rel.performance_rating ? (
                          <Badge variant="outline">
                            {rel.performance_rating}/5 ⭐
                          </Badge>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {rel.recovery_percent ? `${rel.recovery_percent}%` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(rel)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(rel.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
