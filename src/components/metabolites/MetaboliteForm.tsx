
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';

interface MetaboliteFormProps {
  metabolite?: any;
  onClose: () => void;
}

export const MetaboliteForm = ({ metabolite, onClose }: MetaboliteFormProps) => {
  const [formData, setFormData] = useState({
    name: metabolite?.name || '',
    formula: metabolite?.formula || '',
    molecular_weight: metabolite?.molecular_weight || '',
    cas_number: metabolite?.cas_number || '',
    ionization_preference: metabolite?.ionization_preference || '',
    retention_time_range: metabolite?.retention_time_range || '',
    notes: metabolite?.notes || '',
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const submitData = {
        ...formData,
        user_id: user.id,
        molecular_weight: formData.molecular_weight ? parseFloat(formData.molecular_weight) : null,
        ionization_preference: formData.ionization_preference || null,
      };

      if (metabolite) {
        const { error } = await supabase
          .from('metabolites')
          .update(submitData)
          .eq('id', metabolite.id);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Metabolite updated successfully!',
        });
      } else {
        const { error } = await supabase
          .from('metabolites')
          .insert(submitData);
        
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Metabolite created successfully!',
        });
      }

      await queryClient.invalidateQueries({ queryKey: ['metabolites'] });
      onClose();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Metabolites
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{metabolite ? 'Edit Metabolite' : 'Add New Metabolite'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Metabolite Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="formula">Chemical Formula</Label>
                <Input
                  id="formula"
                  value={formData.formula}
                  onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="molecular_weight">Molecular Weight (g/mol)</Label>
                <Input
                  id="molecular_weight"
                  type="number"
                  step="0.01"
                  value={formData.molecular_weight}
                  onChange={(e) => setFormData({ ...formData, molecular_weight: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="cas_number">CAS Number</Label>
                <Input
                  id="cas_number"
                  value={formData.cas_number}
                  onChange={(e) => setFormData({ ...formData, cas_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="ionization_preference">Ionization Preference</Label>
                <Select value={formData.ionization_preference} onValueChange={(value) => setFormData({ ...formData, ionization_preference: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select ionization mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="retention_time_range">Retention Time Range (min)</Label>
                <Input
                  id="retention_time_range"
                  value={formData.retention_time_range}
                  onChange={(e) => setFormData({ ...formData, retention_time_range: e.target.value })}
                  placeholder="e.g., 5.2-5.8"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : metabolite ? 'Update Metabolite' : 'Create Metabolite'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
