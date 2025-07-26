
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MetaboliteDetailsDialog } from './MetaboliteDetailsDialog';
import { MetaboliteCsvUpload } from './MetaboliteCsvUpload';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface MetabolitesTableProps {
  onEdit: (metabolite: any) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
}

export const MetabolitesTable = ({ onEdit, onDelete, onAdd }: MetabolitesTableProps) => {
  const [selectedMetabolite, setSelectedMetabolite] = useState<any>(null);
  const [showMetaboliteDetails, setShowMetaboliteDetails] = useState(false);
  const [showCsvUpload, setShowCsvUpload] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: metabolites, isLoading, error } = useQuery({
    queryKey: ['metabolites'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');
      
      const { data, error } = await supabase
        .from('metabolites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const handleMetaboliteClick = (metabolite: any) => {
    setSelectedMetabolite(metabolite);
    setShowMetaboliteDetails(true);
  };

  const handleCsvUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['metabolites'] });
    setShowCsvUpload(false);
    toast({
      title: 'Success',
      description: 'Metabolites imported successfully!',
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-32" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>MW</TableHead>
                <TableHead>RT Range</TableHead>
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
        <p>Error loading metabolites: {error.message}</p>
      </div>
    );
  }

  if (showCsvUpload) {
    return (
      <MetaboliteCsvUpload
        onSuccess={handleCsvUploadSuccess}
        onCancel={() => setShowCsvUpload(false)}
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Metabolite Database</h3>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowCsvUpload(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button onClick={onAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Metabolite
            </Button>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Formula</TableHead>
                <TableHead>Molecular Weight</TableHead>
                <TableHead>CAS Number</TableHead>
                <TableHead>RT Range</TableHead>
                <TableHead>Ionization</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {metabolites?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No metabolites found. Add your first metabolite or import from CSV to get started.
                  </TableCell>
                </TableRow>
              ) : (
                metabolites?.map((metabolite) => (
                  <TableRow key={metabolite.id}>
                    <TableCell className="font-medium">
                      <button
                        onClick={() => handleMetaboliteClick(metabolite)}
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {metabolite.name}
                      </button>
                    </TableCell>
                    <TableCell>{metabolite.formula || '-'}</TableCell>
                    <TableCell>{metabolite.molecular_weight || '-'}</TableCell>
                    <TableCell>{metabolite.cas_number || '-'}</TableCell>
                    <TableCell>{metabolite.retention_time_range || '-'}</TableCell>
                    <TableCell>
                      {metabolite.ionization_preference && (
                        <Badge variant="outline">
                          {metabolite.ionization_preference}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(metabolite)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(metabolite.id)}
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
        </div>
      </div>

      <MetaboliteDetailsDialog
        metabolite={selectedMetabolite}
        open={showMetaboliteDetails}
        onOpenChange={setShowMetaboliteDetails}
      />
    </>
  );
};
