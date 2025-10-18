
import { useState } from 'react';
import { MetabolitesTable } from './MetabolitesTable';
import { MetaboliteForm } from './MetaboliteForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export const Metabolites = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingMetabolite, setEditingMetabolite] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleAdd = () => {
    setEditingMetabolite(null);
    setShowForm(true);
  };

  const handleEdit = (metabolite: any) => {
    setEditingMetabolite(metabolite);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this metabolite?')) return;

    try {
      const { error } = await supabase
        .from('metabolites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      await queryClient.invalidateQueries({ queryKey: ['metabolites'] });
      toast({
        title: 'Success',
        description: 'Metabolite deleted successfully!',
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
    setEditingMetabolite(null);
  };

  if (showForm) {
    return <MetaboliteForm metabolite={editingMetabolite} onClose={handleClose} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Metabolites</h2>
        <p className="text-gray-600 mt-2">Manage your compound library and metabolite database</p>
      </div>
      
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search metabolites by name, formula, or CAS..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <MetabolitesTable
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        searchQuery={searchQuery}
      />
    </div>
  );
};
